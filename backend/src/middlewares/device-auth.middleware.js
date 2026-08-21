const deviceService = require('../services/device.service');

async function authenticateDevice(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({
        status: 'error',
        message: 'Token de dispositivo requerido.',
      });
    }

    const device = await deviceService.authenticateToken(token);

    if (!device) {
      return res.status(401).json({
        status: 'error',
        message: 'Token de dispositivo inválido, expirado o dispositivo inactivo.',
      });
    }

    req.device = device;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { authenticateDevice };
