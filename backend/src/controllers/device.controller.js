const deviceService = require('../services/device.service');

class DeviceController {
  async register(req, res, next) {
    try {
      const { name } = req.body;

      const { device, apiKey } = await deviceService.register(req.user.id, name);

      return res.status(201).json({
        status: 'success',
        message: 'Dispositivo registrado. Guarda la API key, no volverá a mostrarse.',
        data: { device, apiKey },
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
}

module.exports = new DeviceController();
