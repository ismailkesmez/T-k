export const COLORS = {
  PRIMARY: '#FF4757',
  PRIMARY_DARK: '#CC2E3C',
  SECONDARY: '#2ED573',
  GOLD: '#FFD700',
  PURPLE: '#A29BFE',
  CYAN: '#00D2FF',

  BG_DARK: '#0f0c29',
  BG_CARD: '#1e1b3e',
  BG_CARD2: '#252248',
  BG_ELEVATED: '#2D2A52',

  TEXT: '#FFFFFF',
  TEXT_SECONDARY: '#B2BECD',
  TEXT_MUTED: '#636E72',

  BORDER: '#3D3A6B',
  BUBBLE: '#FF6B35',
  BUBBLE_GLOW: 'rgba(255,107,53,0.4)',

  OVERLAY: 'rgba(0,0,0,0.7)',
};

export const FONTS = {
  TITLE: { fontSize: 32, fontWeight: '900' as const, color: COLORS.TEXT },
  HEADING: { fontSize: 22, fontWeight: '800' as const, color: COLORS.TEXT },
  SUBHEADING: { fontSize: 16, fontWeight: '700' as const, color: COLORS.TEXT },
  BODY: { fontSize: 14, fontWeight: '400' as const, color: COLORS.TEXT_SECONDARY },
  CAPTION: { fontSize: 12, fontWeight: '400' as const, color: COLORS.TEXT_MUTED },
  MONO: { fontSize: 18, fontWeight: '700' as const, color: COLORS.GOLD },
};

export const RADIUS = {
  SM: 8,
  MD: 14,
  LG: 20,
  XL: 30,
  FULL: 999,
};

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
};
