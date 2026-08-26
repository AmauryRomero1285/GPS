import { useColorScheme } from 'react-native';
import { darkColors, lightColors, ThemeColors } from '@/theme/colors';
import { ThemeMode, useThemeStore } from '@/store/themeStore';

export function useTheme(): {
  mode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  isDark: boolean;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
} {
  const systemScheme = useColorScheme();
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  const resolvedTheme: 'light' | 'dark' =
    mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;

  const isDark = resolvedTheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  async function toggleTheme() {
    if (mode === 'system') {
      await setMode(resolvedTheme === 'dark' ? 'light' : 'dark');
    } else if (mode === 'dark') {
      await setMode('light');
    } else {
      await setMode('dark');
    }
  }

  return {
    mode,
    resolvedTheme,
    isDark,
    colors,
    setThemeMode: setMode,
    toggleTheme,
  };
}
