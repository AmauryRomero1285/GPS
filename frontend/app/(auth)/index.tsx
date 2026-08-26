import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ApiError } from '@/api/client';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { TextLink } from '@/components/TextLink';
import { useAuth } from '@/hooks/useAuth';
import { radius, spacing, typography, useTheme } from '@/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const { colors, isDark } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    setNeedsVerification(false);

    if (!email || !password) {
      setError('Ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setNeedsVerification(err.status === 403);
      } else {
        setError('No se pudo conectar con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Image
            source={
              isDark
                ? require('../../assets/splash-icon.png')
                : require('../../assets/icon.png')
            }
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={[typography.title, { color: colors.text }]}>Iniciar sesión</Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>GPS Tracker • Telemetría en vivo</Text>
      </View>

      <TextField
        label="Correo"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoComplete="email"
        placeholder="ejemplo@correo.com"
      />

      <TextField
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        isPassword
        placeholder="Ingresa tu contraseña"
      />

      <View style={styles.forgotPasswordContainer}>
        <TextLink
          label="¿Olvidaste tu contraseña?"
          onPress={() =>
            router.push({
              pathname: '/forgot-password',
              params: { email: email.trim() },
            })
          }
        />
      </View>

      {error ? (
        <Text style={[typography.caption, styles.error, { color: colors.danger }]}>
          {error}
        </Text>
      ) : null}

      {needsVerification ? (
        <View style={[styles.verificationBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[typography.caption, styles.verificationText, { color: colors.text }]}>
            Tu cuenta aún no está verificada.
          </Text>
          <TextLink
            label="Reenviar correo o validar código"
            onPress={() =>
              router.push({
                pathname: '/resend-verification',
                params: { email: email.trim() },
              })
            }
          />
        </View>
      ) : null}

      <View style={styles.actions}>
        <Button title="Ingresar" onPress={handleSubmit} loading={loading} />
      </View>

      <View style={styles.footer}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>¿No tienes cuenta?</Text>
        <TextLink label="Regístrate" onPress={() => router.push('/register')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  logo: {
    width: 48,
    height: 48,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: spacing.md,
    marginTop: -spacing.xs,
  },
  actions: {
    marginTop: spacing.sm,
  },
  error: {
    marginBottom: spacing.sm,
  },
  verificationBanner: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  verificationText: {
    fontWeight: '500',
  },
  footer: {
    marginTop: spacing.xl,
    alignItems: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.xl,
  },
});
