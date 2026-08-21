import { TelemetryRepository } from '@/repositories/TelemetryRepository';
import { useTelemetryStore, type ConnectionStatus } from '@/store/telemetryStore';
import type { HistoryQuery, TelemetryPoint } from '@/types/telemetry';

export const TelemetryFacade = {
  async loadLatest(deviceId: string) {
    const { data } = await TelemetryRepository.latest(deviceId);
    if (data) useTelemetryStore.getState().setLatest(deviceId, data);
    return data;
  },

  async loadHistory(deviceId: string, query?: HistoryQuery) {
    const { data } = await TelemetryRepository.history(deviceId, query);
    useTelemetryStore.getState().setHistory(data);
    return data;
  },

  // Llamado por useGpsSocket en cada mensaje "telemetry:new".
  receiveSocketPoint(point: TelemetryPoint) {
    useTelemetryStore.getState().setLatest(point.deviceId, point);
  },

  setConnectionStatus(status: ConnectionStatus) {
    useTelemetryStore.getState().setConnectionStatus(status);
  },
};
