export type Mode = 'dark' | 'light';

export type Palette = {
  background: string;
  backgroundAlt: string;
  foreground: string;
  foregroundMuted: string;
  accentPrimary: string;
  accentSecondary: string;
  border: string;
  overlay: string;
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  round: 999,
} as const;

export const palette: Record<Mode, Palette> = {
  dark: {
    background: '#050508',
    backgroundAlt: '#0C0C12',
    foreground: '#E4E5EA',
    foregroundMuted: '#8A8C96',
    accentPrimary: '#7DEFFF',
    accentSecondary: '#FF6B7A',
    border: '#404054',
    overlay: '#000000',
  },
  light: {
    background: '#F5F5F7',
    backgroundAlt: '#EAEAED',
    foreground: '#1F1F25',
    foregroundMuted: '#5D5D65',
    accentPrimary: '#6EC6FF',
    accentSecondary: '#FF7C8A',
    border: '#D0D0DC',
    overlay: '#000000',
  },
};

export function getTheme(mode: Mode = 'dark') {
  return {
    palette: palette[mode],
    spacing,
    radius,
  };
}
