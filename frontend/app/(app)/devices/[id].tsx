import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ApiError } from '@/api/client';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { TextLink } from '@/components/TextLink';
import { useAuth } from '@/hooks/useAuth';
import { useDevices } from '@/hooks/useDevices';
import { colors, radius, spacing, typography } from '@/theme';
import type { DeviceShare, PermissionLevel } from '@/types/device';

const PERMISSION_OPTIONS: { value: PermissionLevel; label: string }[] = [
  { value: 'READ_ONLY', label: 'Solo lectura' },
  { value: 'FULL_ACCESS', label: 'Acceso completo' },
];

export default function DeviceDetailScreen() {
  const params = useLocalSearchParams<{
    id: string;
    name?: string;
    ownerId?: string;
    isActive?: string;
    permissionLevel?: string;
  }>();
  const { user } = useAuth();
  const { removeDevice, invite, listShares, revokeShare } = useDevices();

  const isOwner = !!user && user.id === params.ownerId;

  const [shares, setShares] = useState<DeviceShare[]>([]);
  const [loadingShares, setLoadingShares] = useState(false);

  const [email, setEmail] = useState('');
  const [permissionLevel, setPermissionLevel] = useState<PermissionLevel>('READ_ONLY');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviting, setInviting] = useState(false);

  const loadShares = useCallback(async () => {
    if (!isOwner) return;
    setLoadingShares(true);
    try {
      const result = await listShares(params.id);
      setShares(result);
    } catch {
      // silencioso: la lista de comparticiones no es crítica para ver el dispositivo
    } finally {
      setLoadingShares(false);
    }
  }, [isOwner, params.id]);

  useFocusEffect(
    useCallback(() => {
      loadShares();
    }, [loadShares])
  );

  async function handleInvite() {
    setInviteError(null);
    setInviteSuccess(false);

    if (!email) {
      setInviteError('Ingresa el correo con quien compartir.');
      return;
    }

    setInviting(true);
    try {
      await invite(params.id, { email, permissionLevel });
      setInviteSuccess(true);
      setEmail('');
    } catch (err) {
      setInviteError(err instanceof ApiError ? err.message : 'No se pudo conectar con el servidor.');
    } finally {
      setInviting(false);
    }
  }

  function handleRevoke(share: DeviceShare) {
    Alert.alert('Revocar acceso', `¿Quitar el acceso de ${share.email}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Revocar',
        style: 'destructive',
        onPress: async () => {
          await revokeShare(params.id, share.id).catch(() => {});
          loadShares();
        },
      },
    ]);
  }

  function handleDelete() {
    Alert.alert('Eliminar dispositivo', `¿Eliminar "${params.name}"? Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await removeDevice(params.id).catch(() => {});
          router.back();
        },
      },
    ]);
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={typography.title}>{params.name}</Text>
        <Text style={typography.caption}>{params.id}</Text>
        <View style={styles.badgeRow}>
          {params.isActive ? (
            <Badge label={params.isActive === 'true' ? 'Activo' : 'Inactivo'} tone={params.isActive === 'true' ? 'success' : 'neutral'} />
          ) : null}
          {params.permissionLevel ? <Badge label={params.permissionLevel} tone="neutral" /> : null}
        </View>
        <TextLink
          label="Ver historial"
          onPress={() => router.push({ pathname: '/devices/history', params: { deviceId: params.id, name: params.name ?? '' } })}
        />
      </View>

      {isOwner ? (
        <>
          <View style={styles.section}>
            <Text style={typography.subtitle}>Compartir con otro usuario</Text>
            <TextField
              label="Correo"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoComplete="email"
            />
            <View style={styles.permissionRow}>
              {PERMISSION_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => setPermissionLevel(option.value)}
                  style={[styles.permissionChip, permissionLevel === option.value && styles.permissionChipActive]}
                >
                  <Text
                    style={[styles.permissionChipLabel, permissionLevel === option.value && styles.permissionChipLabelActive]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            {inviteError ? <Text style={styles.error}>{inviteError}</Text> : null}
            {inviteSuccess ? <Text style={styles.success}>Invitación enviada por correo.</Text> : null}
            <Button title="Invitar" onPress={handleInvite} loading={inviting} />
          </View>

          <View style={styles.section}>
            <Text style={typography.subtitle}>Compartido con</Text>
            {!loadingShares && shares.length === 0 ? (
              <Text style={typography.caption}>Nadie más tiene acceso todavía.</Text>
            ) : null}
            {shares.map((share) => (
              <View key={share.id} style={styles.shareRow}>
                <View>
                  <Text style={typography.body}>{share.email}</Text>
                  <Text style={typography.caption}>{share.permission_level}</Text>
                </View>
                <Pressable onPress={() => handleRevoke(share)} hitSlop={8}>
                  <Text style={styles.revokeLabel}>Revocar</Text>
                </Pressable>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Button title="Eliminar dispositivo" variant="danger" onPress={handleDelete} />
          </View>
        </>
      ) : (
        <Text style={typography.caption}>Este dispositivo fue compartido contigo. Solo el dueño puede administrarlo.</Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  permissionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  permissionChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  permissionChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  permissionChipLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  permissionChipLabelActive: {
    color: colors.text,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
  },
  success: {
    ...typography.caption,
    color: colors.success,
  },
  shareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  revokeLabel: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
});
