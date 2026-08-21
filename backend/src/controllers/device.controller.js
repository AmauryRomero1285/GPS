const deviceService = require('../services/device.service');
const deviceShareService = require('../services/device-share.service');

class DeviceController {
  async register(req, res, next) {
    try {
      const { id, name } = req.body;

      const { device, deviceToken } = await deviceService.register(req.user.id, { id, name });

      return res.status(201).json({
        status: 'success',
        message: 'Dispositivo registrado. Guarda el deviceToken, no volverá a mostrarse.',
        data: { device, deviceToken },
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const devices = await deviceService.listMine(req.user.id);

      return res.status(200).json({
        status: 'success',
        data: devices,
      });
    } catch (error) {
      next(error);
    }
  }

  async remove(req, res, next) {
    try {
      const { id } = req.params;

      await deviceService.remove(req.user.id, id);

      return res.status(200).json({
        status: 'success',
        message: 'Dispositivo eliminado correctamente.',
      });
    } catch (error) {
      next(error);
    }
  }

  async listSharedWithMe(req, res, next) {
    try {
      const devices = await deviceShareService.listSharedWithMe(req.user.id);

      return res.status(200).json({
        status: 'success',
        data: devices,
      });
    } catch (error) {
      next(error);
    }
  }

  async invite(req, res, next) {
    try {
      const { id } = req.params;
      const { email, permissionLevel } = req.body;

      const invitation = await deviceShareService.invite(req.user.id, id, { email, permissionLevel });

      return res.status(201).json({
        status: 'success',
        message: 'Invitación enviada por correo.',
        data: invitation,
      });
    } catch (error) {
      next(error);
    }
  }

  async acceptInvitation(req, res, next) {
    try {
      const { token } = req.params;

      const share = await deviceShareService.acceptInvitation(req.user.id, req.user.email, token);

      return res.status(200).json({
        status: 'success',
        message: 'Invitación aceptada, ahora tienes acceso al dispositivo.',
        data: share,
      });
    } catch (error) {
      next(error);
    }
  }

  async listShares(req, res, next) {
    try {
      const { id } = req.params;

      const shares = await deviceShareService.listForDevice(req.user.id, id);

      return res.status(200).json({
        status: 'success',
        data: shares,
      });
    } catch (error) {
      next(error);
    }
  }

  async revokeShare(req, res, next) {
    try {
      const { id, shareId } = req.params;

      await deviceShareService.revoke(req.user.id, id, shareId);

      return res.status(200).json({
        status: 'success',
        message: 'Compartición revocada correctamente.',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DeviceController();
