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

  async share(req, res, next) {
    try {
      const { id } = req.params;
      const { email, permissionLevel } = req.body;

      const share = await deviceShareService.share(req.user.id, id, { email, permissionLevel });

      return res.status(201).json({
        status: 'success',
        message: 'Dispositivo compartido correctamente.',
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
