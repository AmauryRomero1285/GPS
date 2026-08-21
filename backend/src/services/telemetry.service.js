const telemetryRepository = require('../repositories/mongo/telemetry.repository');
const deviceService = require('./device.service');
const { broadcastTelemetry } = require('../websocket/socket.server');

function isValidCoordinate(latitude, longitude) {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

class TelemetryService {
  async ingest(deviceId, { latitude, longitude, altitude, speed, satellites, recordedAt }) {
    if (!isValidCoordinate(latitude, longitude)) {
      const error = new Error('Coordenadas GPS inválidas.');
      error.statusCode = 400;
      throw error;
    }

    const point = await telemetryRepository.create({
      deviceId,
      latitude,
      longitude,
      altitude,
      speed,
      satellites,
      recordedAt,
    });

    broadcastTelemetry({ deviceId, ...point.toObject ? point.toObject() : point });

    return point;
  }

  async getLatest(userId, deviceId) {
    await deviceService.assertOwnership(userId, deviceId);
    return telemetryRepository.findLatestByDevice(deviceId);
  }

  async getHistory(userId, deviceId, { from, to, limit }) {
    await deviceService.assertOwnership(userId, deviceId);
    return telemetryRepository.findHistoryByDevice(deviceId, { from, to, limit });
  }
}

module.exports = new TelemetryService();
