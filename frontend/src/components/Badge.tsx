import { StyleSheet, Text, View } from 'react-native';
import { radius, spacing, useTheme } from '@/theme';

type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'primary';

interface BadgeProps {
  label: string;
  tone?: Tone;
}

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const { colors, isDark } = useTheme();

  const toneConfig = {
    success: {
      bg: isDark ? 'rgba(34, 197, 94, 0.18)' : '#DCFCE7',
      text: isDark ? '#4ADE80' : '#15803D',
      border: isDark ? 'rgba(34, 197, 94, 0.35)' : '#BBF7D0',
    },
    warning: {
      bg: isDark ? 'rgba(245, 158, 11, 0.18)' : '#FEF3C7',
      text: isDark ? '#FBBF24' : '#B45309',
      border: isDark ? 'rgba(245, 158, 11, 0.35)' : '#FDE68A',
    },
    danger: {
      bg: isDark ? 'rgba(239, 68, 68, 0.18)' : '#FEE2E2',
      text: isDark ? '#F87171' : '#B91C1C',
      border: isDark ? 'rgba(239, 68, 68, 0.35)' : '#FECACA',
    },
    neutral: {
      bg: colors.surfaceAlt,
      text: colors.textMuted,
      border: colors.border,
    },
    primary: {
      bg: colors.primary,
      text: colors.primaryContrast,
      border: colors.primary,
    },
  };

  const current = toneConfig[tone] || toneConfig.neutral;

  return (
    <View style={[styles.base, { backgroundColor: current.bg, borderColor: current.border }]}>
      <Text style={[styles.label, { color: current.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
