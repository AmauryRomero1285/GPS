import { TextStyle } from 'react-native';
import { colors } from './colors';

export const typography = {
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  } satisfies TextStyle,
  subtitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  } satisfies TextStyle,
  body: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.text,
  } satisfies TextStyle,
  caption: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textMuted,
  } satisfies TextStyle,
} as const;
