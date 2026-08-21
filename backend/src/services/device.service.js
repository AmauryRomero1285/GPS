const crypto = require('crypto');
const deviceRepository = require('../repositories/sql/device.repository');

function hashApiKey(apiKey) {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

class DeviceService {
  // Registra un nuevo dispositivo (ESP32) para un usuario y genera su API key.
  // La clave en texto plano solo se retorna una vez, aquí; solo se persiste su hash.
  async register(userId, name) {
    if (!name) {
      const error = new Error('El nombre del dispositivo es obligatorio.');
      error.statusCode = 400;
      throw error;
    }

    const apiKey = crypto.randomBytes(32).toString('hex');
    const apiKeyHash = hashApiKey(apiKey);

    const device = await deviceRepository.create({ userId, name, apiKeyHash });

    return { device, apiKey };
  }

  async listMine(userId) {
    return deviceRepository.listByUser(userId);
  }

  async remove(userId, deviceId) {
    const device = await deviceRepository.findById(deviceId);

    if (!device) {
      const error = new Error('Dispositivo no encontrado.');
      error.statusCode = 404;
      throw error;
    }

    if (device.user_id !== userId) {
      const error = new Error('No tienes permiso sobre este dispositivo.');
      error.statusCode = 403;
      throw error;
    }

    await deviceRepository.delete(deviceId);
  }

  async authenticate(apiKey) {
    const apiKeyHash = hashApiKey(apiKey);
    const device = await deviceRepository.findByApiKeyHash(apiKeyHash);

    if (!device || device.status !== 'active') {
      return null;
    }

    deviceRepository.touchLastSeen(device.id).catch((err) => console.error('No se pudo actualizar last_seen_at:', err));

    return device;
  }

  async assertOwnership(userId, deviceId) {
    const device = await deviceRepository.findById(deviceId);

    if (!device) {
      const error = new Error('Dispositivo no encontrado.');
      error.statusCode = 404;
      throw error;
    }

    if (device.user_id !== userId) {
      const error = new Error('No tienes permiso sobre este dispositivo.');
      error.statusCode = 403;
      throw error;
    }

    return device;
  }
}

module.exports = new DeviceService();
