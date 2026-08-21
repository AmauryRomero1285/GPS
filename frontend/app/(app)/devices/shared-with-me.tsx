import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Badge } from '@/components/Badge';
import { Screen } from '@/components/Screen';
import { TextLink } from '@/components/TextLink';
import { useDevices } from '@/hooks/useDevices';
import { colors, radius, spacing, typography } from '@/theme';
import type { SharedDevice } from '@/types/device';

export default function SharedWithMeScreen() {
  const { sharedDevices, isLoadingShared, loadSharedDevices } = useDevices();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadSharedDevices().catch(() => {});
    }, [])
  );

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await loadSharedDevices();
    } finally {
      setRefreshing(false);
    }
  }

  function openDevice(device: SharedDevice) {
    router.push({
      pathname: '/devices/[id]',
      params: {
        id: device.id,
        name: device.name,
        ownerId: device.owner_id,
        isActive: String(device.is_active),
        permissionLevel: device.permission_level,
      },
    });
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={typography.title}>Compartidos conmigo</Text>
        <TextLink label="Tengo un código de invitación" onPress={() => router.push('/devices/accept')} />
      </View>

      <FlatList
        data={sharedDevices}
        keyExtractor={(item) => item.share_id}
        contentContainerStyle={sharedDevices.length === 0 && styles.emptyContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.text} />}
        ListEmptyComponent={
          !isLoadingShared ? <Text style={typography.caption}>Nadie compartió un dispositivo contigo todavía.</Text> : null
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
            <Badge label={item.permission_level} />
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
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
