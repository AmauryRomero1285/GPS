import { clearTokens, getAccessToken, getRefreshToken, saveAccessToken } from '@/lib/tokenStorage';
import type { ApiSuccess } from '@/types/api';

// EXPO_PUBLIC_* env vars are inlined at build time (see docs/README.md "Configuración").
// localhost no resuelve al host de desarrollo desde un emulador/dispositivo físico:
// usa la IP de LAN de tu máquina, o 10.0.2.2 en el emulador de Android.
const API_URL = process.env.EXPO_PUBLIC_API_URL || '';

// El servidor monta el WebSocket en /ws sobre el mismo host:puerto HTTP
// (ver backend/src/websocket/socket.server.js), no en una ruta bajo /api.
export function getWebSocketUrl(): string {
  return API_URL.replace(/^http/, 'ws').replace(/\/api\/?$/, '/ws');
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  body?: unknown;
  headers?: Record<string, string>;
  /** Adjunta el access token guardado (default: true). */
  auth?: boolean;
  /** Uso interno: evita reintentar refresh infinitamente. */
  skipRefresh?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

// Deduplica llamadas concurrentes: si varias requests reciben 401 a la vez,
// solo una golpea /auth/refresh y las demás esperan esa misma promesa.
async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return null;

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      await clearTokens();
      return null;
    }

    const json = (await response.json()) as ApiSuccess<{ accessToken: string }>;
    await saveAccessToken(json.data.accessToken);
    return json.data.accessToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = true, skipRefresh = false, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (auth) {
    const accessToken = await getAccessToken();
    if (accessToken) finalHeaders.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && auth && !skipRefresh) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      return apiRequest<T>(path, { ...options, skipRefresh: true });
    }
  }

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const message = (json && 'message' in json && json.message) || `Error ${response.status}`;
    throw new ApiError(response.status, message);
  }

  return json as T;
}
