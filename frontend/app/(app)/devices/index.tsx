import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useDevices } from '@/hooks/useDevices';
import { colors, radius, spacing, typography } from '@/theme';
import type { Device } from '@/types/device';

export default function DeviceListScreen() {
  const { devices, isLoadingDevices, loadDevices } = useDevices();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadDevices().catch(() => {});
    }, [])
  );

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await loadDevices();
    } finally {
      setRefreshing(false);
    }
  }

  function openDevice(device: Device) {
    router.push({
      pathname: '/devices/[id]',
      params: { id: device.id, name: device.name, ownerId: device.owner_id, isActive: String(device.is_active) },
    });
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={typography.title}>Mis dispositivos</Text>
        <View style={styles.headerActions}>
          <Button title="Compartidos conmigo" variant="secondary" onPress={() => router.push('/devices/shared-with-me')} />
          <Button title="Registrar dispositivo" onPress={() => router.push('/devices/register')} />
        </View>
      </View>

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={devices.length === 0 && styles.emptyContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.text} />}
        ListEmptyComponent={
          !isLoadingDevices ? (
            <Text style={typography.caption}>Aún no registras ningún dispositivo.</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => openDevice(item)}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <View style={styles.cardInfo}>
              <Text style={typography.subtitle}>{item.name}</Text>
              <Text style={typography.caption}>{item.id}</Text>
            </View>
            <Badge label={item.is_active ? 'Activo' : 'Inactivo'} tone={item.is_active ? 'success' : 'neutral'} />
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardPressed: {
    opacity: 0.8,
  },
  cardInfo: {
    gap: spacing.xs,
  },
});
