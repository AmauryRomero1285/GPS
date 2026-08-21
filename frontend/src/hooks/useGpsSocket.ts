import { useEffect } from 'react';
import { getWebSocketUrl } from '@/api/client';
import { TelemetryFacade } from '@/facades/TelemetryFacade';
import { useTelemetryStore } from '@/store/telemetryStore';

const RECONNECT_DELAY_MS = 3000;

// Custom Hook (ver frontend/docs/README.md "Patrón Custom Hook"): única
// responsabilidad es la conexión WebSocket -- abrir, reconectar
// automáticamente si se pierde la cobertura, y cerrar al desmontar.
// El servidor difunde CADA punto de telemetría a TODOS los clientes
// conectados (sin auth ni filtro por dispositivo, ver
// backend/src/websocket/socket.server.js), así que el filtrado por
// deviceId ocurre acá, del lado del cliente.
export function useGpsSocket(deviceId: string | null) {
  useEffect(() => {
    if (!deviceId) return;

    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let isUnmounted = false;

    function connect() {
      TelemetryFacade.setConnectionStatus('connecting');
      socket = new WebSocket(getWebSocketUrl());

      socket.onopen = () => {
        TelemetryFacade.setConnectionStatus('connected');
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.event === 'telemetry:new' && message.data?.deviceId === deviceId) {
            TelemetryFacade.receiveSocketPoint(message.data);
          }
        } catch {
          // mensaje no-JSON o inesperado: se ignora
        }
      };

      socket.onerror = () => {
        socket?.close();
      };

      socket.onclose = () => {
        if (isUnmounted) return;
        TelemetryFacade.setConnectionStatus('disconnected');
        reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
      };
    }

    connect();

    return () => {
      isUnmounted = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
      TelemetryFacade.setConnectionStatus('idle');
    };
  }, [deviceId]);

  const connectionStatus = useTelemetryStore((state) => state.connectionStatus);
  const latestPoint = useTelemetryStore((state) => (deviceId ? state.latestByDevice[deviceId] : undefined));

  return { connectionStatus, latestPoint };
}
