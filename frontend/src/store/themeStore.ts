import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type ThemeMode = 'system' | 'light' | 'dark';

const THEME_MODE_KEY = 'gps_theme_mode';

interface ThemeState {
  mode: ThemeMode;
  isHydrated: boolean;
  setMode: (mode: ThemeMode) => Promise<void>;
  hydrateTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'system',
  isHydrated: false,
  setMode: async (mode: ThemeMode) => {
    set({ mode });
    try {
      await SecureStore.setItemAsync(THEME_MODE_KEY, mode);
    } catch {
      // no-op en caso de error de almacenamiento
    }
  },
  hydrateTheme: async () => {
    try {
      const stored = await SecureStore.getItemAsync(THEME_MODE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        set({ mode: stored, isHydrated: true });
        return;
      }
    } catch {
      // no-op
    }
    set({ isHydrated: true });
  },
}));
