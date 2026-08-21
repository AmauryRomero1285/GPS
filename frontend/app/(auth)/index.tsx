import { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/Button';
import { spacing, typography } from '@/theme';

// Placeholder: el formulario real (AuthFacade, validación, submit) llega en
// feat/frontend-auth. Este screen solo prueba que el split de rutas y los
// componentes base (Screen/TextField/Button) funcionan.
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={typography.title}>Iniciar sesión</Text>
        <Text style={typography.caption}>GPS Tracker</Text>
      </View>

      <TextField
        label="Correo"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoComplete="email"
      />
      <TextField label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />

      <Button title="Ingresar" onPress={() => {}} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
});
