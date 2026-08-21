import { useCallback, useState } from 'react';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { TelemetryFacade } from '@/facades/TelemetryFacade';
import { useTelemetryStore } from '@/store/telemetryStore';
import { colors, radius, spacing, typography } from '@/theme';
import type { TelemetryPoint } from '@/types/telemetry';

export default function HistoryScreen() {
  const { deviceId, name } = useLocalSearchParams<{ deviceId: string; name?: string }>();
  const history = useTelemetryStore((state) => state.history);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await TelemetryFacade.loadHistory(deviceId);
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={typography.title}>Historial</Text>
        {name ? <Text style={typography.caption}>{name}</Text> : null}
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item._id}
        contentContainerStyle={history.length === 0 && styles.emptyContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.text} />}
        ListEmptyComponent={
          !loading ? <Text style={typography.caption}>Sin puntos de telemetría registrados todavía.</Text> : null
        }
        renderItem={({ item }: { item: TelemetryPoint }) => (
          <View style={styles.row}>
            <Text style={typography.body}>
              {item.location.coordinates[1].toFixed(5)}, {item.location.coordinates[0].toFixed(5)}
            </Text>
            <Text style={typography.caption}>{new Date(item.recordedAt).toLocaleString()}</Text>
            <Text style={typography.caption}>
              {item.speed != null ? `${item.speed} m/s` : 'sin velocidad'}
              {item.altitude != null ? ` · ${item.altitude} m` : ''}
            </Text>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
});
