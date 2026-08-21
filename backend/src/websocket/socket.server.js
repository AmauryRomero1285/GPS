const { WebSocketServer } = require('ws');
const jwt = require('jsonwebtoken');
const { URL } = require('url');
const deviceRepository = require('../repositories/sql/device.repository');
const deviceShareRepository = require('../repositories/sql/device-share.repository');

let wss = null;

function initWebSocket(httpServer) {
  wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (socket, req) => {
    // El access token viaja como query param (?token=...): el WebSocket
    // estándar no soporta headers custom desde el cliente.
    const { searchParams } = new URL(req.url, 'http://localhost');
    const token = searchParams.get('token');

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key');
    } catch (error) {
      socket.close(4001, 'Token de autenticación inválido o expirado.');
      return;
    }

    socket.userId = payload.id;

    socket.send(JSON.stringify({ event: 'connected', data: { message: 'Conectado al stream de telemetría.' } }));
    socket.on('error', (err) => console.error('WebSocket error:', err));
  });

  return wss;
}

async function canUserSeeDevice(userId, deviceId) {
  const device = await deviceRepository.findById(deviceId);
  if (!device) return false;
  if (device.owner_id === userId) return true;

  const share = await deviceShareRepository.findByDeviceAndUser(deviceId, userId);
  return !!share;
}

// Publica un nuevo punto de telemetría solo a los clientes autenticados que
// tengan acceso a ese dispositivo (dueño o alguien con quien se compartió),
// igual que ya se exige en las lecturas HTTP (telemetry.service.getLatest/getHistory).
//
// Nota: esto hace una consulta a Postgres por cliente conectado en cada punto
// ingerido -- razonable para pocos clientes concurrentes, pero no escala sin
// cachear el conjunto de usuarios autorizados por dispositivo.
function broadcastTelemetry(payload) {
  if (!wss) return;

  const message = JSON.stringify({ event: 'telemetry:new', data: payload });

  wss.clients.forEach((client) => {
    if (client.readyState !== client.OPEN || !client.userId) return;

    canUserSeeDevice(client.userId, payload.deviceId)
      .then((canSee) => {
        if (canSee && client.readyState === client.OPEN) {
          client.send(message);
        }
      })
      .catch((err) => console.error('Error verificando acceso al WebSocket:', err));
  });
}

module.exports = { initWebSocket, broadcastTelemetry };
