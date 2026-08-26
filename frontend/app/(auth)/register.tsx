import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ApiError } from '@/api/client';
import { Button } from '@/components/Button';
import { PasswordRequirements } from '@/components/PasswordRequirements';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { TextLink } from '@/components/TextLink';
import { useAuth } from '@/hooks/useAuth';
import { validatePassword } from '@/lib/passwordValidation';
import { spacing, typography, useTheme } from '@/theme';

export default function RegisterScreen() {
  const { register } = useAuth();
  const { colors } = useTheme();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validation = useMemo(
    () => validatePassword(password, confirmPassword),
    [password, confirmPassword]
  );

  const hasRequiredFields =
    email.trim().length > 0 &&
    username.trim().length > 0 &&
    name.trim().length > 0 &&
    lastname.trim().length > 0;

  const canSubmit = hasRequiredFields && validation.isValid && !loading;

  async function handleSubmit() {
    setError(null);

    if (!email || !username || !password || !name || !lastname) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    if (!validation.isValid) {
      setError('Verifica que tu contraseña cumpla con todos los requisitos de seguridad.');
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        email: email.trim(),
        username: username.trim(),
        password,
        name: name.trim(),
        lastname: lastname.trim(),
      });
      router.replace({
        pathname: '/verify-email',
        params: { email: email.trim(), devToken: result.verificationToken ?? '' },
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={[typography.title, { color: colors.text }]}>Crear cuenta</Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>GPS Tracker • Registro de usuario</Text>
      </View>

      <TextField
        label="Correo"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoComplete="email"
        placeholder="ejemplo@correo.com"
      />
      <TextField label="Usuario" value={username} onChangeText={setUsername} autoComplete="username" placeholder="juanperez" />
      <TextField label="Nombre" value={name} onChangeText={setName} autoCapitalize="words" placeholder="Juan" />
      <TextField label="Apellido" value={lastname} onChangeText={setLastname} autoCapitalize="words" placeholder="Pérez" />

      <TextField
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        isPassword
        placeholder="Mínimo 9 caracteres, mayúscula, número y símbolo"
      />

      <TextField
        label="Confirmar contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        isPassword
        placeholder="Repite tu contraseña exactamente igual"
      />

      <PasswordRequirements validation={validation} showMatch />

      {error ? (
        <Text style={[typography.caption, styles.error, { color: colors.danger }]}>
          {error}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Button
          title="Registrarme"
          onPress={handleSubmit}
          loading={loading}
          disabled={!canSubmit}
        />
      </View>

      <View style={styles.footer}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>¿Ya tienes cuenta?</Text>
        <TextLink label="Inicia sesión" onPress={() => router.back()} />
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
  footer: {
    marginTop: spacing.xl,
    alignItems: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.xl,
  },
});
