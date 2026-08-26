export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  borderFocus: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryPressed: string;
  primaryContrast: string;
  secondary: string;
  secondaryPressed: string;
  secondaryText: string;
  card: string;
  cardBorder: string;
  success: string;
  successSurface: string;
  danger: string;
  dangerSurface: string;
  warning: string;
  warningSurface: string;
}

export const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F4F4F5',
  surfaceAlt: '#E4E4E7',
  border: '#E4E4E7',
  borderFocus: '#09090B',
  text: '#09090B',
  textMuted: '#71717A',
  primary: '#09090B',
  primaryPressed: '#27272A',
  primaryContrast: '#FFFFFF',
  secondary: '#F4F4F5',
  secondaryPressed: '#E4E4E7',
  secondaryText: '#09090B',
  card: '#FFFFFF',
  cardBorder: '#E4E4E7',
  success: '#16A34A',
  successSurface: '#DCFCE7',
  danger: '#DC2626',
  dangerSurface: '#FEE2E2',
  warning: '#D97706',
  warningSurface: '#FEF3C7',
};

export const darkColors: ThemeColors = {
  background: '#09090B',
  surface: '#121214',
  surfaceAlt: '#1E1E22',
  border: '#27272A',
  borderFocus: '#FAFAFA',
  text: '#FAFAFA',
  textMuted: '#A1A1AA',
  primary: '#FAFAFA',
  primaryPressed: '#D4D4D8',
  primaryContrast: '#09090B',
  secondary: '#18181B',
  secondaryPressed: '#27272A',
  secondaryText: '#FAFAFA',
  card: '#121214',
  cardBorder: '#27272A',
  success: '#22C55E',
  successSurface: '#0E2E1A',
  danger: '#EF4444',
  dangerSurface: '#3B1414',
  warning: '#F59E0B',
  warningSurface: '#422006',
};

// Default colors (dark mode as default OLED monochrome baseline)
export const colors = darkColors;

export type ColorToken = keyof ThemeColors;
