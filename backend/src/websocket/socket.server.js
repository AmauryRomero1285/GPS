const { WebSocketServer } = require('ws');

let wss = null;

function initWebSocket(httpServer) {
  wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (socket) => {
    socket.send(JSON.stringify({ event: 'connected', data: { message: 'Conectado al stream de telemetría.' } }));

    socket.on('error', (err) => console.error('WebSocket error:', err));
  });

  return wss;
}

// Publica un nuevo punto de telemetría a todos los clientes conectados (Observer/Pub-Sub).
function broadcastTelemetry(payload) {
  if (!wss) return;

  const message = JSON.stringify({ event: 'telemetry:new', data: payload });

  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  });
}

module.exports = { initWebSocket, broadcastTelemetry };
