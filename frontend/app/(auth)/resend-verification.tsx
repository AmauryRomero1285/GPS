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

export default function ResendVerificationScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const { resendVerification } = useAuth();

  const [email, setEmail] = useState(params.email ?? '');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSent(false);

    if (!email) {
      setError('Ingresa tu correo.');
      return;
    }

    setLoading(true);
    try {
      const result = await resendVerification(email);
      setSent(true);
      setDevToken(result.verificationToken ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={typography.title}>Reenviar verificación</Text>
        <Text style={typography.caption}>
          Si tu código anterior expiró, ingresa tu correo para recibir uno nuevo.
        </Text>
      </View>

      <TextField
        label="Correo"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoComplete="email"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {sent ? <Text style={styles.success}>Revisa tu correo, te enviamos un nuevo código.</Text> : null}

      <View style={styles.actions}>
        <Button title="Reenviar código" onPress={handleSubmit} loading={loading} />
      </View>

      {sent ? (
        <View style={styles.footer}>
          <TextLink
            label="Ya tengo el código"
            onPress={() =>
              router.replace({ pathname: '/verify-email', params: { email, devToken: devToken ?? '' } })
            }
          />
        </View>
      ) : null}

      <View style={styles.footer}>
        <TextLink label="Volver a iniciar sesión" onPress={() => router.replace('/')} />
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
  success: {
    ...typography.caption,
    color: colors.success,
    marginBottom: spacing.sm,
  },
  footer: {
    marginTop: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
});
