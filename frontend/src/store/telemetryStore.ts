import { create } from 'zustand';
import type { TelemetryPoint } from '@/types/telemetry';

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected';

interface TelemetryState {
  latestByDevice: Record<string, TelemetryPoint>;
  history: TelemetryPoint[];
  connectionStatus: ConnectionStatus;
  setLatest: (deviceId: string, point: TelemetryPoint) => void;
  setHistory: (points: TelemetryPoint[]) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
}

// Store Flux-style para telemetría: el WebSocket (useGpsSocket) y las
// lecturas HTTP (TelemetryFacade) escriben aquí; el mapa y el historial
// leen de aquí, sin conocerse entre sí.
export const useTelemetryStore = create<TelemetryState>((set) => ({
  latestByDevice: {},
  history: [],
  connectionStatus: 'idle',
  setLatest: (deviceId, point) =>
    set((state) => ({ latestByDevice: { ...state.latestByDevice, [deviceId]: point } })),
  setHistory: (history) => set({ history }),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
}));
