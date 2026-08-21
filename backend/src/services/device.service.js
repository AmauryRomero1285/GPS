const jwt = require('jsonwebtoken');
const deviceRepository = require('../repositories/sql/device.repository');
const deviceShareRepository = require('../repositories/sql/device-share.repository');

function signDeviceToken(device) {
  return jwt.sign(
    { deviceId: device.id, ownerId: device.owner_id },
    process.env.DEVICE_JWT_SECRET || process.env.JWT_SECRET || 'super_secret_key',
    { expiresIn: process.env.DEVICE_JWT_EXPIRES_IN || '365d' }
  );
}

class DeviceService {
  // Registra un dispositivo (ESP32) identificado por su propio id/MAC, y emite un
  // token JWT de larga duración que el nodo debe guardar; no se persiste ningún
  // secreto en la base de datos (revocable desactivando el dispositivo).
  async register(ownerId, { id, name }) {
    if (!id || !name) {
      const error = new Error('El id (MAC) y el nombre del dispositivo son obligatorios.');
      error.statusCode = 400;
      throw error;
    }

    const existing = await deviceRepository.findById(id);
    if (existing) {
      const error = new Error('Ya existe un dispositivo registrado con ese id.');
      error.statusCode = 409;
      throw error;
    }

    const device = await deviceRepository.create({ id, ownerId, name });
    const deviceToken = signDeviceToken(device);

    return { device, deviceToken };
  }

  async listMine(ownerId) {
    return deviceRepository.listByOwner(ownerId);
  }

  async remove(ownerId, deviceId) {
    await this.assertOwnership(ownerId, deviceId);
    await deviceRepository.delete(deviceId);
  }

  // Verifica el JWT del dispositivo y confirma que siga activo en BD
  // (permite revocar acceso desactivando el dispositivo, sin invalidar el JWT en sí).
  async authenticateToken(token) {
    let payload;
    try {
      payload = jwt.verify(token, process.env.DEVICE_JWT_SECRET || process.env.JWT_SECRET || 'super_secret_key');
    } catch (error) {
      return null;
    }

    const device = await deviceRepository.findById(payload.deviceId);
    if (!device || !device.is_active) {
      return null;
    }

    return device;
  }

  async assertOwnership(ownerId, deviceId) {
    const device = await deviceRepository.findById(deviceId);

    if (!device) {
      const error = new Error('Dispositivo no encontrado.');
      error.statusCode = 404;
      throw error;
    }

    if (device.owner_id !== ownerId) {
      const error = new Error('No tienes permiso sobre este dispositivo.');
      error.statusCode = 403;
      throw error;
    }

    return device;
  }

  // Acceso de lectura: el dueño siempre tiene acceso; un usuario con el que se
  // compartió el dispositivo (READ_ONLY o FULL_ACCESS) también puede leerlo.
  async assertReadAccess(userId, deviceId) {
    const device = await deviceRepository.findById(deviceId);

    if (!device) {
      const error = new Error('Dispositivo no encontrado.');
      error.statusCode = 404;
      throw error;
    }

    if (device.owner_id === userId) {
      return device;
    }

    const share = await deviceShareRepository.findByDeviceAndUser(deviceId, userId);
    if (!share) {
      const error = new Error('No tienes permiso sobre este dispositivo.');
      error.statusCode = 403;
      throw error;
    }

    return device;
  }
}

module.exports = new DeviceService();
