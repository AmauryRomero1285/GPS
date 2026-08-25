import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ApiError } from '@/api/client';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { TextLink } from '@/components/TextLink';
import { useAuth } from '@/hooks/useAuth';
import { spacing, typography, useTheme } from '@/theme';

export default function ForgotPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const { forgotPassword } = useAuth();
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
      const result = await forgotPassword(email.trim());
      setSent(true);
      if (result.resetToken) {
        setDevToken(result.resetToken);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={[typography.title, { color: colors.text }]}>Recuperar contraseña</Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>
          Ingresa el correo electrónico asociado a tu cuenta para recibir un código de recuperación.
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
        <View style={styles.successBox}>
          <Text style={[typography.caption, { color: colors.success }]}>
            Se ha enviado un código a tu correo electrónico.
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
          title={sent ? 'Reenviar código' : 'Enviar código de recuperación'}
          onPress={handleSubmit}
          loading={loading}
        />
      </View>

      {sent ? (
        <View style={styles.footer}>
          <Button
            title="Ingresar código y nueva contraseña"
            variant="secondary"
            onPress={() =>
              router.push({
                pathname: '/reset-password',
                params: { email, token: devToken ?? '' },
              })
            }
          />
        </View>
      ) : null}

      <View style={styles.footer}>
        <TextLink label="¿Recordaste tu contraseña? Inicia sesión" onPress={() => router.replace('/')} />
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
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  footer: {
    marginTop: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
});
