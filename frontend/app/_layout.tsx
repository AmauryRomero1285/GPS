import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { hasSession } from '@/lib/tokenStorage';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Chequeo de sesión mínimo (solo "¿hay un refresh token guardado?"), suficiente
// para el split de rutas de este scaffold. feat/frontend-auth lo reemplaza por
// el authStore/useAuth real (validación, logout, hidratación completa).
export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    hasSession()
      .then((session) => {
        if (isMounted) setIsAuthenticated(session);
      })
      .finally(() => {
        if (isMounted) {
          setIsReady(true);
          SplashScreen.hideAsync().catch(() => {});
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isReady) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
