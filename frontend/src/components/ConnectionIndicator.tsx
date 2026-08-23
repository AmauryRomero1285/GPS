import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/theme';
import type { ConnectionStatus } from '@/store/telemetryStore';

const LABELS: Record<ConnectionStatus, string> = {
  idle: 'Sin conexión',
  connecting: 'Conectando...',
  connected: 'En vivo',
  disconnected: 'Reconectando...',
};

const DOT_COLORS: Record<ConnectionStatus, string> = {
  idle: colors.textMuted,
  connecting: colors.warning,
  connected: colors.success,
  disconnected: colors.danger,
};

export function ConnectionIndicator({ status }: { status: ConnectionStatus }) {
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: DOT_COLORS[status] }]} />
      <Text style={styles.label}>{LABELS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
