import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { ChargingScreen } from '@/components/ChargingScreen';
import { AuthFacade } from '@/facades/AuthFacade';
import { useAuth } from '@/hooks/useAuth';
import { useTheme, useThemeStore } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { isAuthenticated, isHydrating } = useAuth();
  const { isDark, colors } = useTheme();
  const [chargingVisible, setChargingVisible] = useState(true);

  useEffect(() => {
    Promise.all([
      useThemeStore.getState().hydrateTheme(),
      AuthFacade.hydrate(),
    ]).finally(() => {
      SplashScreen.hideAsync().catch(() => {});
    });
  }, []);

  useEffect(() => {
    if (!isHydrating) {
      const timer = setTimeout(() => {
        setChargingVisible(false);
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [isHydrating]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>

      {/* Charging Page for app startup */}
      {chargingVisible && <ChargingScreen />}
    </>
  );
}
