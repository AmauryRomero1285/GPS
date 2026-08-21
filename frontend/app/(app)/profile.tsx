import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/hooks/useAuth';
import { colors, radius, spacing, typography } from '@/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await logout();
      // Stack.Protected en app/_layout.tsx reacciona solo al cambio de sesión.
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={typography.title}>Mi cuenta</Text>
      </View>

      {user ? (
        <View style={styles.card}>
          <Field label="Nombre" value={`${user.name} ${user.lastname}`} />
          <Field label="Usuario" value={user.username} />
          <Field label="Correo" value={user.email} />
        </View>
      ) : null}

      <View style={styles.actions}>
        <Button title="Cerrar sesión" variant="danger" onPress={handleLogout} loading={loading} />
      </View>
    </Screen>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={typography.caption}>{label}</Text>
      <Text style={typography.body}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  field: {
    gap: spacing.xs,
  },
  actions: {
    marginTop: spacing.sm,
  },
});
