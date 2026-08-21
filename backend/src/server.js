// server.js
require('dotenv').config({ quiet: true });
const http = require('http');
const app = require('./app');
const { connectMongo } = require('./config/db.mongo');
const { initWebSocket } = require('./websocket/socket.server');

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await connectMongo();
  } catch (error) {
    console.error('No se pudo conectar a MongoDB:', error.message);
  }

  const server = http.createServer(app);
  initWebSocket(server);

  server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
  });
}

start();
