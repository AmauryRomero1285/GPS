import { useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ApiError } from '@/api/client';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useDevices } from '@/hooks/useDevices';
import { colors, spacing, typography } from '@/theme';

export default function AcceptInvitationScreen() {
  const { acceptInvitation } = useDevices();

  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);

    if (!token) {
      setError('Ingresa el código de invitación.');
      return;
    }

    setLoading(true);
    try {
      await acceptInvitation(token);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Screen>
        <View style={styles.header}>
          <Text style={typography.title}>Invitación aceptada</Text>
          <Text style={typography.caption}>Ya tienes acceso a ese dispositivo.</Text>
        </View>
        <Button title="Ver dispositivos compartidos" onPress={() => router.replace('/devices/shared-with-me')} />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={typography.title}>Aceptar invitación</Text>
        <Text style={typography.caption}>Pega el código de invitación que recibiste por correo.</Text>
      </View>

      <TextField label="Código de invitación" value={token} onChangeText={setToken} autoCapitalize="none" />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <Button title="Aceptar" onPress={handleSubmit} loading={loading} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  actions: {
    marginTop: spacing.sm,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
});
