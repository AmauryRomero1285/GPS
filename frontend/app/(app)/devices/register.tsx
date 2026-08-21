import { useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ApiError } from '@/api/client';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useDevices } from '@/hooks/useDevices';
import { colors, radius, spacing, typography } from '@/theme';

export default function RegisterDeviceScreen() {
  const { registerDevice } = useDevices();

  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deviceToken, setDeviceToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit() {
    setError(null);

    if (!id || !name) {
      setError('El id (MAC) y el nombre son obligatorios.');
      return;
    }

    setLoading(true);
    try {
      const result = await registerDevice({ id, name });
      setDeviceToken(result.deviceToken);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!deviceToken) return;
    await Clipboard.setStringAsync(deviceToken);
    setCopied(true);
  }

  if (deviceToken) {
    return (
      <Screen scroll>
        <View style={styles.header}>
          <Text style={typography.title}>Dispositivo registrado</Text>
          <Text style={typography.caption}>
            Guarda este token en el ESP32 -- no se volverá a mostrar.
          </Text>
        </View>

        <View style={styles.tokenBox}>
          <Text style={styles.tokenText} selectable>
            {deviceToken}
          </Text>
        </View>

        <View style={styles.actions}>
          <Button title={copied ? 'Copiado' : 'Copiar token'} onPress={handleCopy} variant="secondary" />
          <Button title="Listo" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={typography.title}>Registrar dispositivo</Text>
        <Text style={typography.caption}>Identifica al nodo ESP32 con su MAC o id único.</Text>
      </View>

      <TextField
        label="Id / MAC"
        value={id}
        onChangeText={setId}
        placeholder="AA:BB:CC:DD:EE:FF"
        autoCapitalize="characters"
      />
      <TextField label="Nombre" value={name} onChangeText={setName} placeholder="Rastreador de mochila" />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <Button title="Registrar" onPress={handleSubmit} loading={loading} />
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
    gap: spacing.sm,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  tokenBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  tokenText: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 13,
  },
});
