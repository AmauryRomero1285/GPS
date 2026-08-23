export const colors = {
  background: '#0B1120',
  surface: '#141B2D',
  surfaceAlt: '#1C2438',
  border: '#2A3350',
  text: '#F1F5F9',
  textMuted: '#94A3B8',
  primary: '#96ce73',
  primaryPressed: '#78c296',
  success: '#22C55E',
  danger: '#EF4444',
  warning: '#F59E0B',
} as const;

export type ColorToken = keyof typeof colors;
