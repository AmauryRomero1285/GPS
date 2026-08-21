import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, minTouchTarget } from '@/theme';

interface TextLinkProps {
  label: string;
  onPress: () => void;
}

export function TextLink({ label, onPress }: TextLinkProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.base, pressed && styles.pressed]}
      hitSlop={8}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
