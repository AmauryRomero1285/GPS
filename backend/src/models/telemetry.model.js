const { mongoose } = require('../config/db.mongo');

const telemetrySchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      // [longitude, latitude], formato GeoJSON
      type: [Number],
      required: true,
    },
  },
  altitude: Number,
  speed: Number,
  satellites: Number,
  recordedAt: {
    type: Date,
    default: Date.now,
  },
  receivedAt: {
    type: Date,
    default: Date.now,
  },
});

telemetrySchema.index({ location: '2dsphere' });
telemetrySchema.index({ deviceId: 1, recordedAt: -1 });

module.exports = mongoose.model('Telemetry', telemetrySchema);
