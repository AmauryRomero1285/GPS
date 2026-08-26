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
import { radius, spacing, typography, useTheme } from '@/theme';

export default function MapScreen() {
  const { devices, sharedDevices, loadDevices, loadSharedDevices } = useDevices();
  const { colors } = useTheme();
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
        <View>
          <Text style={[typography.title, { color: colors.text }]}>Mapa en vivo</Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>Seguimiento GPS</Text>
        </View>
        <ConnectionIndicator status={connectionStatus} />
      </View>

      {options.length === 0 ? (
        <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center' }]}>
            Registra o acepta acceso a un dispositivo para comenzar a rastrearlo en tiempo real.
          </Text>
        </View>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.picker}>
            {options.map((option) => {
              const isSelected = selectedId === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setSelectedId(option.id)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipLabel,
                      {
                        color: isSelected ? colors.primaryContrast : colors.textMuted,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {option.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {latestPoint ? (
            <>
              <View style={[styles.mapContainer, { borderColor: colors.border }]}>
                <MapAdapter
                  latitude={latestPoint.location.coordinates[1]}
                  longitude={latestPoint.location.coordinates[0]}
                  markerTitle={selectedName}
                />
              </View>
              <View style={styles.footerRow}>
                <Text style={[typography.caption, { color: colors.textMuted }]}>
                  Última actualización: {new Date(latestPoint.recordedAt).toLocaleTimeString()}
                </Text>
                {selectedId ? (
                  <TextLink
                    label="Ver historial completo"
                    onPress={() =>
                      router.push({
                        pathname: '/devices/history',
                        params: { deviceId: selectedId, name: selectedName ?? '' },
                      })
                    }
                  />
                ) : null}
              </View>
            </>
          ) : (
            <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center' }]}>
                Esperando primera señal de telemetría para este dispositivo...
              </Text>
            </View>
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
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
  },
  chipLabel: {
    fontSize: 13,
  },
  mapContainer: {
    flex: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  emptyBox: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
});
