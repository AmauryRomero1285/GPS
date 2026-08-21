// db.mongo.js
const mongoose = require('mongoose');
require('dotenv').config({ quiet: true });

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

async function connectMongo() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/gps_telemetry';
  await mongoose.connect(uri);
}

module.exports = { connectMongo, mongoose };
