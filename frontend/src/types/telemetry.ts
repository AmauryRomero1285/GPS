// Forma que retorna el backend (ver backend/src/repositories/mongo/telemetry.repository.js
// y backend/src/websocket/socket.server.js -- el payload del evento telemetry:new es el
// mismo documento con deviceId al frente).
export interface TelemetryPoint {
  _id: string;
  deviceId: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  altitude?: number | null;
  speed?: number | null;
  satellites?: number | null;
  recordedAt: string;
  receivedAt: string;
}

export interface HistoryQuery {
  from?: string;
  to?: string;
  limit?: number;
}
