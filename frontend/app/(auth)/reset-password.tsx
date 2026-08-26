import { useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
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

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string; email?: string }>();
  const { resetPassword } = useAuth();
  const { colors } = useTheme();

  const [token, setToken] = useState(params.token ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validation = useMemo(
    () => validatePassword(newPassword, confirmPassword),
    [newPassword, confirmPassword]
  );

  const canSubmit = validation.isValid && token.trim().length > 0 && !loading;

  async function handleSubmit() {
    setError(null);

    if (!token.trim()) {
      setError('Ingresa el código o token de recuperación.');
      return;
    }

    if (!validation.isValid) {
      setError('Por favor verifica que la contraseña cumpla con todos los requisitos.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token: token.trim(), newPassword });
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
          <Text style={[typography.title, { color: colors.text }]}>¡Contraseña actualizada!</Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
          </Text>
        </View>
        <Button title="Iniciar sesión" onPress={() => router.replace('/')} />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={[typography.title, { color: colors.text }]}>Nueva contraseña</Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>
          {params.email
            ? `Ingresa el código enviado a ${params.email} y define tu nueva contraseña.`
            : 'Ingresa el código de recuperación que recibiste y define tu nueva contraseña.'}
        </Text>
      </View>

      <TextField
        label="Código de recuperación"
        value={token}
        onChangeText={setToken}
        autoCapitalize="none"
        placeholder="Pega el código recibido por correo"
      />

      <TextField
        label="Nueva contraseña"
        value={newPassword}
        onChangeText={setNewPassword}
        isPassword
        placeholder="Mínimo 9 caracteres, mayúscula, número y símbolo"
      />

      <TextField
        label="Confirmar nueva contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        isPassword
        placeholder="Repite la contraseña exactamente igual"
      />

      <PasswordRequirements validation={validation} showMatch />

      {error ? (
        <Text style={[typography.caption, styles.error, { color: colors.danger }]}>
          {error}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Button
          title="Restablecer contraseña"
          onPress={handleSubmit}
          loading={loading}
          disabled={!canSubmit}
        />
      </View>

      <View style={styles.footer}>
        <TextLink label="Cancelar y volver al inicio" onPress={() => router.replace('/')} />
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
  },
});
