// ============================================
// SpeedxSafety - Design System
// ============================================

export const Colors = {
  // Primary palette
  primary: '#007AFF',
  primaryLight: '#4DA3FF',
  primaryDark: '#0055CC',

  // Safety colors
  safe: '#34C759',
  safeLight: '#5AD77A',
  warning: '#FF9500',
  warningLight: '#FFB340',
  danger: '#FF3B30',
  dangerLight: '#FF6961',
  
  // Backgrounds (Light mode)
  bgPrimary: '#F2F6FF',
  bgSecondary: '#FFFFFF',
  bgTertiary: '#E8EDF5',
  bgCard: 'rgba(255, 255, 255, 0.7)', // Semi-transparent for liquid glass
  bgCardHover: 'rgba(255, 255, 255, 0.85)',
  bgGlass: 'rgba(255, 255, 255, 0.65)',

  // Text
  textPrimary: '#1A1E3A',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Borders
  border: 'rgba(255, 255, 255, 0.8)', // Frosty white borders
  borderLight: 'rgba(255, 255, 255, 0.5)',

  // Gradients (used as arrays)
  gradientPrimary: ['#007AFF', '#00C6FF'],
  gradientSafe: ['#34C759', '#30D158'],
  gradientWarning: ['#FF9500', '#FFCC00'],
  gradientDanger: ['#FF3B30', '#FF6961'],
  gradientBg: ['#E6EFFF', '#F2F6FF', '#FFFFFF'], // Light gradient background
  gradientCard: ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.4)'],

  // Grade colors
  gradeA: '#34C759',
  gradeB: '#30D158',
  gradeC: '#FF9500',
  gradeD: '#FF6B35',
  gradeF: '#FF3B30',

  // Misc
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  hero: 48,
  mega: 64,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  }),
};

export const getGradeColor = (grade: string): string => {
  switch (grade) {
    case 'A': return Colors.gradeA;
    case 'B': return Colors.gradeB;
    case 'C': return Colors.gradeC;
    case 'D': return Colors.gradeD;
    case 'F': return Colors.gradeF;
    default: return Colors.textSecondary;
  }
};
