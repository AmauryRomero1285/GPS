import { Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { typography } from '@/theme';

// Placeholder: lista/registro/compartición de dispositivos llega en
// feat/frontend-devices.
export default function DevicesScreen() {
  return (
    <Screen>
      <Text style={typography.title}>Dispositivos</Text>
      <Text style={typography.caption}>Próximamente: tus dispositivos y los compartidos contigo.</Text>
    </Screen>
  );
}
