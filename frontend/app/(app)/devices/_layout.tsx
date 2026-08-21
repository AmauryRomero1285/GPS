import { Stack } from 'expo-router';
import { colors } from '@/theme';

// Stack propio de la tab "Dispositivos": permite navegar a
// registro/detalle/compartidos-conmigo/aceptar-invitación sin perder la tab bar.
export default function DevicesLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />;
}
