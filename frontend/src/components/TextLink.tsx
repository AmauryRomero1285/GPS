import { Pressable, StyleSheet, Text } from 'react-native';
import { minTouchTarget, useTheme } from '@/theme';

interface TextLinkProps {
  label: string;
  onPress: () => void;
}

export function TextLink({ label, onPress }: TextLinkProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.base, pressed && styles.pressed]}
      hitSlop={8}
    >
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
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
    opacity: 0.6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
