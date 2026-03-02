export const colors = {
  // Base
  bg: '#FAFAF7' as const,
  bgWarm: '#F5F3EE' as const,
  card: '#FFFFFF' as const,
  cardAlt: '#F8F7F4' as const,
  cream: '#F0EDE6' as const,

  // Typography
  ink: '#1A1A1A' as const,
  inkSoft: '#3D3D3D' as const,
  inkMuted: '#8A8A82' as const,
  inkLight: '#B5B5AD' as const,

  // Accent
  accent: '#C4785C' as const,
  accentSoft: '#D4967E' as const,
  accentBg: '#FDF6F3' as const,

  // Semantic
  sage: '#7A8F7A' as const,
  sageSoft: '#9BAF9B' as const,
  sageBg: '#F2F5F2' as const,
  navy: '#2C3E50' as const,
  navySoft: '#4A6274' as const,
  rose: '#C9928A' as const,
  roseBg: '#FBF3F1' as const,
  slate: '#64748B' as const,

  // Borders
  border: '#E8E6E0' as const,
  borderLight: '#F0EEE8' as const,

  // Category Colors
  catFood: '#C4785C' as const,
  catTransport: '#4A6274' as const,
  catEntertain: '#C9928A' as const,
  catDaily: '#7A8F7A' as const,
  catClothing: '#64748B' as const,
  catComm: '#8A8A82' as const,
  catHousing: '#2C3E50' as const,
  catUtility: '#9BAF9B' as const,
} as const;

export type Colors = typeof colors;
