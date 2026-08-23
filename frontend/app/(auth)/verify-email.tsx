import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ApiError } from '@/api/client';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { TextLink } from '@/components/TextLink';
import { useAuth } from '@/hooks/useAuth';
import { colors, spacing, typography } from '@/theme';

export default function VerifyEmailScreen() {
  const { email, devToken } = useLocalSearchParams<{ email?: string; devToken?: string }>();
  const { verifyEmail } = useAuth();

  const [token, setToken] = useState(devToken ?? '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);

    if (!token) {
      setError('Ingresa el código de verificación.');
      return;
    }

    setLoading(true);
    try {
      await verifyEmail(token);
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
          <Text style={typography.title}>Correo verificado</Text>
          <Text style={typography.caption}>Ya puedes iniciar sesión.</Text>
        </View>
        <Button title="Ir a iniciar sesión" onPress={() => router.replace('/')} />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={typography.title}>Verifica tu correo</Text>
        <Text style={typography.caption}>
          {email ? `Enviamos un código de verificación a ${email}.` : 'Revisa tu correo por el código de verificación.'}
        </Text>
      </View>

      <TextField label="Código de verificación" value={token} onChangeText={setToken} autoCapitalize="none" />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <Button title="Verificar" onPress={handleSubmit} loading={loading} />
      </View>

      <View style={styles.footer}>
        <Text style={typography.caption}>¿El código expiró?</Text>
        <TextLink
          label="Solicitar uno nuevo"
          onPress={() => router.push({ pathname: '/resend-verification', params: { email: email ?? '' } })}
        />
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
  footer: {
    marginTop: spacing.xl,
    alignItems: 'center',
    gap: spacing.xs,
  },
});
