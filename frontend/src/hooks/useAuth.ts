import { AuthFacade } from '@/facades/AuthFacade';
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);

  return {
    user,
    isAuthenticated: status === 'authenticated',
    isHydrating: status === 'idle' || status === 'hydrating',
    login: AuthFacade.login,
    register: AuthFacade.register,
    logout: AuthFacade.logout,
    resendVerification: AuthFacade.resendVerification,
    verifyEmail: AuthFacade.verifyEmail,
  };
}
