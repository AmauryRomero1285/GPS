import { ApiError } from '@/api/client';
import { AuthRepository } from '@/repositories/AuthRepository';
import { clearTokens, hasSession, saveTokens } from '@/lib/tokenStorage';
import { useAuthStore } from '@/store/authStore';
import type { LoginInput, RegisterInput } from '@/types/auth';

// Orquesta AuthRepository + SecureStore + authStore detrás de métodos simples
// que las screens/hooks pueden llamar sin conocer ninguno de esos tres.
export const AuthFacade = {
  // Se llama una vez al montar el root layout: decide si hay sesión válida.
  async hydrate() {
    useAuthStore.getState().setHydrating();

    const hasStoredSession = await hasSession();
    if (!hasStoredSession) {
      useAuthStore.getState().setUnauthenticated();
      return;
    }

    try {
      // apiRequest ya intenta un refresh-and-retry automático si el access
      // token expiró (ver api/client.ts), así que un 401 aquí significa que
      // tanto el access como el refresh token son inválidos.
      const { data: user } = await AuthRepository.me();
      useAuthStore.getState().setAuthenticated(user);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await clearTokens();
      }
      // Otros errores (red caída, 5xx) no deberían borrar una sesión válida;
      // simplemente no se puede confirmar en este arranque.
      useAuthStore.getState().setUnauthenticated();
    }
  },

  async register(input: RegisterInput) {
    const { data } = await AuthRepository.register(input);
    return data;
  },

  async login(input: LoginInput) {
    const { data } = await AuthRepository.login(input);
    await saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    useAuthStore.getState().setAuthenticated(data.user);
    return data.user;
  },

  async logout() {
    await clearTokens();
    useAuthStore.getState().setUnauthenticated();
  },

  async resendVerification(email: string) {
    const { data } = await AuthRepository.resendVerification(email);
    return data;
  },

  async verifyEmail(token: string) {
    const { data } = await AuthRepository.verifyEmail(token);
    return data;
  },
};
