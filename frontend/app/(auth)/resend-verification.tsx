import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ApiError } from '@/api/client';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { TextLink } from '@/components/TextLink';
import { useAuth } from '@/hooks/useAuth';
import { radius, spacing, typography, useTheme } from '@/theme';

export default function ResendVerificationScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const { resendVerification } = useAuth();
  const { colors } = useTheme();

  const [email, setEmail] = useState(params.email ?? '');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSent(false);

    if (!email.trim()) {
      setError('Ingresa tu correo electrónico.');
      return;
    }

    setLoading(true);
    try {
      const result = await resendVerification(email.trim());
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
        <Text style={[typography.title, { color: colors.text }]}>Validar o reenviar correo</Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>
          ¿Te registraste pero no te llegó el correo de confirmación o tu código expiró?
          Ingresa tu correo para recibir un nuevo enlace de activación.
        </Text>
      </View>

      <TextField
        label="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoComplete="email"
        placeholder="ejemplo@correo.com"
      />

      {error ? (
        <Text style={[typography.caption, styles.error, { color: colors.danger }]}>
          {error}
        </Text>
      ) : null}

      {sent ? (
        <View style={[styles.successBox, { backgroundColor: colors.surface, borderColor: colors.success }]}>
          <Text style={[typography.caption, { color: colors.success }]}>
            Se ha enviado un nuevo código de activación a tu correo electrónico.
          </Text>
          {devToken ? (
            <Text style={[typography.caption, { color: colors.textMuted, fontSize: 12 }]}>
              Código (modo desarrollo): {devToken}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.actions}>
        <Button
          title={sent ? 'Reenviar código de nuevo' : 'Reenviar correo de activación'}
          onPress={handleSubmit}
          loading={loading}
        />
      </View>

      <View style={styles.validateBox}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>¿Ya recibiste o tienes tu código de activación?</Text>
        <Button
          title="Validar cuenta con código"
          variant="secondary"
          onPress={() =>
            router.push({
              pathname: '/verify-email',
              params: { email: email.trim(), devToken: devToken ?? '' },
            })
          }
        />
      </View>

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
    marginBottom: spacing.sm,
  },
  successBox: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  validateBox: {
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  footer: {
    marginTop: spacing.xl,
    alignItems: 'center',
    gap: spacing.xs,
  },
});
