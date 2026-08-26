import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PasswordValidationResult } from '@/lib/passwordValidation';
import { radius, spacing, typography, useTheme } from '@/theme';

interface PasswordRequirementsProps {
  validation: PasswordValidationResult;
  showMatch?: boolean;
}

export function PasswordRequirements({ validation, showMatch = true }: PasswordRequirementsProps) {
  const { colors } = useTheme();

  const items = [
    { label: 'Más de 8 caracteres', met: validation.hasMinLength },
    { label: 'Al menos una letra mayúscula (A-Z)', met: validation.hasUppercase },
    { label: 'Al menos un número (0-9)', met: validation.hasNumber },
    { label: 'Al menos un símbolo o carácter especial (!@#$...)', met: validation.hasSymbol },
  ];

  if (showMatch) {
    items.push({ label: 'Las contraseñas coinciden', met: validation.matches });
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[typography.caption, styles.title, { color: colors.text }]}>Requisitos de la contraseña:</Text>
      {items.map((item, index) => (
        <View key={index} style={styles.itemRow}>
          <Ionicons
            name={item.met ? 'checkmark-circle' : 'ellipse-outline'}
            size={16}
            color={item.met ? colors.success : colors.textMuted}
          />
          <Text
            style={[
              typography.caption,
              styles.itemText,
              { color: item.met ? colors.success : colors.textMuted },
            ]}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  title: {
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  itemText: {
    fontSize: 12,
  },
});
