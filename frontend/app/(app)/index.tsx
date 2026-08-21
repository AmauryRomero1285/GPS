import { useCallback, useEffect, useMemo, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ConnectionIndicator } from '@/components/ConnectionIndicator';
import { MapAdapter } from '@/components/MapAdapter';
import { Screen } from '@/components/Screen';
import { TextLink } from '@/components/TextLink';
import { TelemetryFacade } from '@/facades/TelemetryFacade';
import { useDevices } from '@/hooks/useDevices';
import { useGpsSocket } from '@/hooks/useGpsSocket';
import { colors, radius, spacing, typography } from '@/theme';

export default function MapScreen() {
  const { devices, sharedDevices, loadDevices, loadSharedDevices } = useDevices();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const options = useMemo(
    () => [
      ...devices.map((d) => ({ id: d.id, name: d.name })),
      ...sharedDevices.map((d) => ({ id: d.id, name: d.name })),
    ],
    [devices, sharedDevices]
  );

  useFocusEffect(
    useCallback(() => {
      loadDevices().catch(() => {});
      loadSharedDevices().catch(() => {});
    }, [])
  );

  useEffect(() => {
    if (!selectedId && options.length > 0) {
      setSelectedId(options[0].id);
    }
  }, [options, selectedId]);

  useEffect(() => {
    if (selectedId) {
      TelemetryFacade.loadLatest(selectedId).catch(() => {});
    }
  }, [selectedId]);

  const { connectionStatus, latestPoint } = useGpsSocket(selectedId);
  const selectedName = options.find((o) => o.id === selectedId)?.name;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={typography.title}>Mapa en vivo</Text>
        <ConnectionIndicator status={connectionStatus} />
      </View>

      {options.length === 0 ? (
        <Text style={typography.caption}>Registra o acepta acceso a un dispositivo para verlo aquí.</Text>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.picker}>
            {options.map((option) => (
              <Pressable
                key={option.id}
                onPress={() => setSelectedId(option.id)}
                style={[styles.chip, selectedId === option.id && styles.chipActive]}
              >
                <Text style={[styles.chipLabel, selectedId === option.id && styles.chipLabelActive]}>
                  {option.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {latestPoint ? (
            <>
              <View style={styles.mapContainer}>
                <MapAdapter
                  latitude={latestPoint.location.coordinates[1]}
                  longitude={latestPoint.location.coordinates[0]}
                  markerTitle={selectedName}
                />
              </View>
              <Text style={typography.caption}>
                Última actualización: {new Date(latestPoint.recordedAt).toLocaleString()}
              </Text>
              {selectedId ? (
                <TextLink
                  label="Ver historial"
                  onPress={() =>
                    router.push({
                      pathname: '/devices/history',
                      params: { deviceId: selectedId, name: selectedName ?? '' },
                    })
                  }
                />
              ) : null}
            </>
          ) : (
            <Text style={typography.caption}>Sin datos de ubicación todavía para este dispositivo.</Text>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  picker: {
    marginBottom: spacing.md,
    flexGrow: 0,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  chipLabelActive: {
    color: colors.text,
  },
  mapContainer: {
    flex: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
});
