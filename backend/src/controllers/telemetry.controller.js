const telemetryService = require('../services/telemetry.service');

class TelemetryController {
  async ingest(req, res, next) {
    try {
      const { latitude, longitude, altitude, speed, satellites, recordedAt } = req.body;

      const point = await telemetryService.ingest(req.device.id, {
        latitude,
        longitude,
        altitude,
        speed,
        satellites,
        recordedAt,
      });

      return res.status(201).json({
        status: 'success',
        message: 'Telemetría registrada.',
        data: point,
      });
    } catch (error) {
      next(error);
    }
  }

  async latest(req, res, next) {
    try {
      const { deviceId } = req.params;

      const point = await telemetryService.getLatest(req.user.id, deviceId);

      return res.status(200).json({
        status: 'success',
        data: point,
      });
    } catch (error) {
      next(error);
    }
  }

  async history(req, res, next) {
    try {
      const { deviceId } = req.params;
      const { from, to, limit } = req.query;

      const points = await telemetryService.getHistory(req.user.id, deviceId, { from, to, limit });

      return res.status(200).json({
        status: 'success',
        data: points,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TelemetryController();
