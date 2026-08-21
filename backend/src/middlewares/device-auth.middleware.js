const deviceService = require('../services/device.service');

async function authenticateDevice(req, res, next) {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        status: 'error',
        message: 'API key del dispositivo requerida.',
      });
    }

    const device = await deviceService.authenticate(apiKey);

    if (!device) {
      return res.status(401).json({
        status: 'error',
        message: 'API key inválida o dispositivo inactivo.',
      });
    }

    req.device = device;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { authenticateDevice };
