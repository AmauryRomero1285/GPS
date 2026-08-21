const Telemetry = require('../../models/telemetry.model');

class TelemetryRepository {
  async create({ deviceId, latitude, longitude, altitude, speed, satellites, recordedAt }) {
    const point = await Telemetry.create({
      deviceId,
      location: { type: 'Point', coordinates: [longitude, latitude] },
      altitude,
      speed,
      satellites,
      recordedAt: recordedAt || new Date(),
    });
    return point;
  }

  async findLatestByDevice(deviceId) {
    return Telemetry.findOne({ deviceId }).sort({ recordedAt: -1 }).lean();
  }

  async findHistoryByDevice(deviceId, { from, to, limit } = {}) {
    const query = { deviceId };

    if (from || to) {
      query.recordedAt = {};
      if (from) query.recordedAt.$gte = new Date(from);
      if (to) query.recordedAt.$lte = new Date(to);
    }

    return Telemetry.find(query)
      .sort({ recordedAt: -1 })
      .limit(Math.min(Number(limit) || 100, 1000))
      .lean();
  }
}

module.exports = new TelemetryRepository();
