import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/hooks/useAuth';
import { radius, spacing, typography, useTheme } from '@/theme';
import type { ThemeMode } from '@/store/themeStore';

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'light', label: 'Claro', icon: 'sunny-outline' },
  { value: 'dark', label: 'Oscuro', icon: 'moon-outline' },
  { value: 'system', label: 'Sistema', icon: 'phone-portrait-outline' },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { colors, mode, setThemeMode, resolvedTheme } = useTheme();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await logout();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={[typography.title, { color: colors.text }]}>Mi cuenta</Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>Configuración y preferencias</Text>
      </View>

      {user ? (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[typography.subtitle, styles.cardTitle, { color: colors.text }]}>Información de perfil</Text>
          <Field label="Nombre" value={`${user.name} ${user.lastname}`} textColor={colors.text} mutedColor={colors.textMuted} />
          <Field label="Usuario" value={user.username} textColor={colors.text} mutedColor={colors.textMuted} />
          <Field label="Correo" value={user.email} textColor={colors.text} mutedColor={colors.textMuted} />
        </View>
      ) : null}

      {/* Theme Selector */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.themeHeader}>
          <Text style={[typography.subtitle, styles.cardTitle, { color: colors.text }]}>Apariencia</Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            Tema actual: {resolvedTheme === 'dark' ? 'Oscuro' : 'Claro'}
          </Text>
        </View>
        <View style={styles.themeRow}>
          {THEME_OPTIONS.map((opt) => {
            const isSelected = mode === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setThemeMode(opt.value)}
                style={[
                  styles.themeButton,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surfaceAlt,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={opt.icon}
                  size={18}
                  color={isSelected ? colors.primaryContrast : colors.text}
                />
                <Text
                  style={[
                    styles.themeButtonText,
                    {
                      color: isSelected ? colors.primaryContrast : colors.text,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.actions}>
        <Button title="Cerrar sesión" variant="danger" onPress={handleLogout} loading={loading} />
      </View>
    </Screen>
  );
}

function Field({
  label,
  value,
  textColor,
  mutedColor,
}: {
  label: string;
  value: string;
  textColor: string;
  mutedColor: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={[typography.caption, { color: mutedColor }]}>{label}</Text>
      <Text style={[typography.body, { color: textColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  card: {
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  cardTitle: {
    marginBottom: spacing.xs,
  },
  field: {
    gap: spacing.xs,
  },
  themeHeader: {
    gap: spacing.xs,
  },
  themeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  themeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  themeButtonText: {
    fontSize: 13,
  },
  actions: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
