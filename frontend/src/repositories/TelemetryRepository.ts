import { apiRequest } from '@/api/client';
import type { ApiSuccess } from '@/types/api';
import type { HistoryQuery, TelemetryPoint } from '@/types/telemetry';

// La ingesta (POST /telemetry) la hace el propio ESP32 con su deviceToken --
// la app móvil solo lee, nunca escribe telemetría.
export const TelemetryRepository = {
  latest(deviceId: string) {
    return apiRequest<ApiSuccess<TelemetryPoint | null>>(`/telemetry/${deviceId}/latest`, {
      method: 'GET',
    });
  },

  history(deviceId: string, query: HistoryQuery = {}) {
    const params = new URLSearchParams();
    if (query.from) params.set('from', query.from);
    if (query.to) params.set('to', query.to);
    if (query.limit) params.set('limit', String(query.limit));
    const qs = params.toString();

    return apiRequest<ApiSuccess<TelemetryPoint[]>>(`/telemetry/${deviceId}/history${qs ? `?${qs}` : ''}`, {
      method: 'GET',
    });
  },
};
