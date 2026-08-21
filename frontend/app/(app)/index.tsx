import { Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { typography } from '@/theme';

// Placeholder: el mapa en vivo (react-native-maps, useGpsSocket) llega en
// feat/frontend-telemetry.
export default function MapScreen() {
  return (
    <Screen>
      <Text style={typography.title}>Mapa en vivo</Text>
      <Text style={typography.caption}>Próximamente: posición en tiempo real del dispositivo.</Text>
    </Screen>
  );
}
