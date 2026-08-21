import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';

type Tone = 'success' | 'warning' | 'danger' | 'neutral';

interface BadgeProps {
  label: string;
  tone?: Tone;
}

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  return (
    <View style={[styles.base, toneStyles[tone]]}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
});

const toneStyles = StyleSheet.create({
  success: { backgroundColor: colors.success },
  warning: { backgroundColor: colors.warning },
  danger: { backgroundColor: colors.danger },
  neutral: { backgroundColor: colors.surfaceAlt },
});
