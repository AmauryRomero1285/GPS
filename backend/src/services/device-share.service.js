const crypto = require('crypto');
const deviceService = require('./device.service');
const deviceShareRepository = require('../repositories/sql/device-share.repository');
const deviceShareInvitationRepository = require('../repositories/sql/device-share-invitation.repository');
const userRepository = require('../repositories/sql/user.repository');
const mailService = require('./mail.service');

const VALID_PERMISSION_LEVELS = ['READ_ONLY', 'FULL_ACCESS'];
const SHARE_INVITE_EXPIRES_HOURS = Number(process.env.SHARE_INVITE_EXPIRES_HOURS) || 72;

class DeviceShareService {
  // Compartir un dispositivo es un flujo de invitación por correo (no inmediato):
  // se crea un token de un solo uso (expira en SHARE_INVITE_EXPIRES_HOURS) y el
  // destinatario debe aceptarlo estando autenticado con esa misma cuenta.
  async invite(ownerId, deviceId, { email, permissionLevel = 'READ_ONLY' }) {
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

    const device = await deviceService.assertOwnership(ownerId, deviceId);

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

    const existingShare = await deviceShareRepository.findByDeviceAndUser(deviceId, targetUser.id);
    if (existingShare) {
      const error = new Error('El dispositivo ya está compartido con ese usuario.');
      error.statusCode = 409;
      throw error;
    }

    const pendingInvitation = await deviceShareInvitationRepository.findPending(deviceId, email);
    if (pendingInvitation) {
      const error = new Error('Ya existe una invitación pendiente para ese correo.');
      error.statusCode = 409;
      throw error;
    }

    const owner = await userRepository.findById(ownerId);
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SHARE_INVITE_EXPIRES_HOURS * 60 * 60 * 1000);

    const invitation = await deviceShareInvitationRepository.create({
      deviceId,
      invitedByUserId: ownerId,
      invitedEmail: email,
      permissionLevel,
      token,
      expiresAt,
    });

    await mailService.sendDeviceShareInvitation({
      toEmail: email,
      deviceName: device.name,
      inviterName: owner ? `${owner.name} ${owner.lastname}` : 'Un usuario',
      permissionLevel,
      token,
    });

    const { token: _token, ...safeInvitation } = invitation;
    return safeInvitation;
  }

  // El destinatario acepta la invitación estando autenticado con la cuenta invitada.
  async acceptInvitation(userId, userEmail, token) {
    const invitation = await deviceShareInvitationRepository.findByToken(token);
    if (!invitation) {
      const error = new Error('Invitación no encontrada.');
      error.statusCode = 404;
      throw error;
    }

    if (invitation.accepted_at) {
      const error = new Error('Esta invitación ya fue aceptada.');
      error.statusCode = 409;
      throw error;
    }

    if (new Date(invitation.expires_at) < new Date()) {
      const error = new Error('Esta invitación ha expirado.');
      error.statusCode = 400;
      throw error;
    }

    if (invitation.invited_email.toLowerCase() !== userEmail.toLowerCase()) {
      const error = new Error('Esta invitación no corresponde a tu cuenta.');
      error.statusCode = 403;
      throw error;
    }

    const share = await deviceShareRepository.create({
      deviceId: invitation.device_id,
      sharedWithUserId: userId,
      permissionLevel: invitation.permission_level,
    });

    await deviceShareInvitationRepository.markAccepted(invitation.id);

    return share;
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
