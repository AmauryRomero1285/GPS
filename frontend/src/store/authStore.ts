import { create } from 'zustand';
import type { SessionUser, UserProfile } from '@/types/auth';

export type AuthStatus = 'idle' | 'hydrating' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  user: SessionUser | UserProfile | null;
  setHydrating: () => void;
  setAuthenticated: (user: SessionUser | UserProfile) => void;
  setUnauthenticated: () => void;
}

// Store Flux-style: la capa de red (AuthFacade) escribe aquí, y cualquier
// pantalla suscrita (via useAuth) re-renderiza automáticamente.
export const useAuthStore = create<AuthState>((set) => ({
  status: 'idle',
  user: null,
  setHydrating: () => set({ status: 'hydrating' }),
  setAuthenticated: (user) => set({ status: 'authenticated', user }),
  setUnauthenticated: () => set({ status: 'unauthenticated', user: null }),
}));
