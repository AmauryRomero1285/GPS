const deviceService = require('./device.service');
const deviceShareRepository = require('../repositories/sql/device-share.repository');
const userRepository = require('../repositories/sql/user.repository');

const VALID_PERMISSION_LEVELS = ['READ_ONLY', 'FULL_ACCESS'];

class DeviceShareService {
  async share(ownerId, deviceId, { email, permissionLevel = 'READ_ONLY' }) {
    if (!email) {
      const error = new Error('El correo del usuario con quien compartir es obligatorio.');
      error.statusCode = 400;
      throw error;
    }

    if (!VALID_PERMISSION_LEVELS.includes(permissionLevel)) {
      const error = new Error(`permissionLevel debe ser uno de: ${VALID_PERMISSION_LEVELS.join(', ')}.`);
      error.statusCode = 400;
      throw error;
    }

    await deviceService.assertOwnership(ownerId, deviceId);

    const targetUser = await userRepository.findByEmail(email);
    if (!targetUser) {
      const error = new Error('No existe un usuario con ese correo.');
      error.statusCode = 404;
      throw error;
    }

    if (targetUser.id === ownerId) {
      const error = new Error('No puedes compartir un dispositivo contigo mismo.');
      error.statusCode = 400;
      throw error;
    }

    const existing = await deviceShareRepository.findByDeviceAndUser(deviceId, targetUser.id);
    if (existing) {
      const error = new Error('El dispositivo ya está compartido con ese usuario.');
      error.statusCode = 409;
      throw error;
    }

    return deviceShareRepository.create({
      deviceId,
      sharedWithUserId: targetUser.id,
      permissionLevel,
    });
  }

  async listForDevice(ownerId, deviceId) {
    await deviceService.assertOwnership(ownerId, deviceId);
    return deviceShareRepository.listByDevice(deviceId);
  }

  async listSharedWithMe(userId) {
    return deviceShareRepository.listByUser(userId);
  }

  async revoke(ownerId, deviceId, shareId) {
    await deviceService.assertOwnership(ownerId, deviceId);

    const share = await deviceShareRepository.findById(shareId);
    if (!share || share.device_id !== deviceId) {
      const error = new Error('Registro de compartición no encontrado.');
      error.statusCode = 404;
      throw error;
    }

    await deviceShareRepository.delete(shareId);
  }
}

module.exports = new DeviceShareService();
