import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme';

interface ScreenProps extends PropsWithChildren {
  scroll?: boolean;
  style?: ViewStyle;
}

// Layout mobile-first: SafeAreaView (notch/status bar) + padding flex, sin
// breakpoints fijos en px -- se adapta igual de bien a un teléfono o una tablet.
export function Screen({ children, scroll = false, style }: ScreenProps) {
  const Container = scroll ? ScrollView : View;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Container
        style={scroll ? styles.scroll : [styles.content, style]}
        contentContainerStyle={scroll ? [styles.content, style] : undefined}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
});
