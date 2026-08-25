import { StyleSheet, Text, View } from 'react-native';
import { spacing, useTheme } from '@/theme';
import type { ConnectionStatus } from '@/store/telemetryStore';

const LABELS: Record<ConnectionStatus, string> = {
  idle: 'Sin conexión',
  connecting: 'Conectando...',
  connected: 'En vivo',
  disconnected: 'Reconectando...',
};

export function ConnectionIndicator({ status }: { status: ConnectionStatus }) {
  const { colors, isDark } = useTheme();

  const dotColors: Record<ConnectionStatus, string> = {
    idle: colors.textMuted,
    connecting: colors.warning,
    connected: isDark ? '#4ADE80' : '#16A34A',
    disconnected: colors.danger,
  };

  return (
    <View style={[styles.row, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
      <View style={[styles.dot, { backgroundColor: dotColors[status] }]} />
      <Text style={[styles.label, { color: colors.text }]}>{LABELS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
