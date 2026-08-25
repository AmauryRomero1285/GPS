import { useEffect } from 'react';
import { getWebSocketUrl } from '@/api/client';
import { TelemetryFacade } from '@/facades/TelemetryFacade';
import { AuthRepository } from '@/repositories/AuthRepository';
import { getAccessToken, getRefreshToken, saveAccessToken } from '@/lib/tokenStorage';
import { useTelemetryStore } from '@/store/telemetryStore';

const RECONNECT_DELAY_MS = 3000;
// Código con el que el backend cierra la conexión si el token es inválido/expiró
// (ver backend/src/websocket/socket.server.js).
const AUTH_FAILED_CLOSE_CODE = 4001;

// Custom Hook (ver frontend/docs/README.md "Patrón Custom Hook"): única
// responsabilidad es la conexión WebSocket -- abrir (con el access token como
// query param, ya que WebSocket no soporta headers custom desde el cliente),
// reconectar automáticamente si se pierde la cobertura, y cerrar al desmontar.
// El servidor ya filtra por dispositivo autorizado (dueño o compartido) antes
// de emitir cada evento; el filtro por deviceId acá abajo es sobre CUÁL de los
// dispositivos autorizados está seleccionado en esta pantalla, no de seguridad.
export function useGpsSocket(deviceId: string | null) {
  useEffect(() => {
    if (!deviceId) return;

    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let isUnmounted = false;

    async function connect() {
      TelemetryFacade.setConnectionStatus('connecting');

      const accessToken = await getAccessToken();
      if (isUnmounted || !accessToken) return;

      socket = new WebSocket(`${getWebSocketUrl()}?token=${encodeURIComponent(accessToken)}`);

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

      socket.onclose = (event) => {
        if (isUnmounted) return;
        TelemetryFacade.setConnectionStatus('disconnected');

        if (event.code === AUTH_FAILED_CLOSE_CODE) {
          refreshThenReconnect();
        } else {
          reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
        }
      };
    }

    // El access token expiró antes que el WS lo detectara (a diferencia de
    // apiRequest, no hay forma de "reintentar" una conexión ya cerrada) --
    // se intenta refrescarlo una vez antes del próximo intento de conexión.
    async function refreshThenReconnect() {
      try {
        const refreshToken = await getRefreshToken();
        if (refreshToken) {
          const { data } = await AuthRepository.refresh(refreshToken);
          await saveAccessToken(data.accessToken);
        }
      } catch {
        // si el refresh también falla, se reintenta igual tras el delay;
        // AuthFacade.hydrate() cerrará la sesión en el próximo arranque si
        // realmente ya no es válida.
      } finally {
        if (!isUnmounted) reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
      }
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
