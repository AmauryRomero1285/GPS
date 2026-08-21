import { useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ApiError } from '@/api/client';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { TextLink } from '@/components/TextLink';
import { useAuth } from '@/hooks/useAuth';
import { colors, spacing, typography } from '@/theme';

export default function RegisterScreen() {
  const { register } = useAuth();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);

    if (!email || !username || !password || !name || !lastname) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    setLoading(true);
    try {
      const result = await register({ email, username, password, name, lastname });
      router.replace({
        pathname: '/verify-email',
        params: { email, devToken: result.verificationToken ?? '' },
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
        <Text style={typography.title}>Crear cuenta</Text>
        <Text style={typography.caption}>GPS Tracker</Text>
      </View>

      <TextField
        label="Correo"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoComplete="email"
      />
      <TextField label="Usuario" value={username} onChangeText={setUsername} autoComplete="username" />
      <TextField label="Nombre" value={name} onChangeText={setName} autoCapitalize="words" />
      <TextField label="Apellido" value={lastname} onChangeText={setLastname} autoCapitalize="words" />
      <TextField label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <Button title="Registrarme" onPress={handleSubmit} loading={loading} />
      </View>

      <View style={styles.footer}>
        <Text style={typography.caption}>¿Ya tienes cuenta?</Text>
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
