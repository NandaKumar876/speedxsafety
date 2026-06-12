// ============================================
// SpeedxSafety - Design System (Unified Dark Glass)
// ============================================

import { scaleWidth, scaleHeight, scaleFont } from '../utils/responsive';

export const Colors = {
  // Primary palette (Emerald Green / Teal)
  primary: '#10B981',
  primaryLight: '#6EE7B7',
  primaryDark: '#047857',

  // Safety colors
  safe: '#34C759',
  safeLight: '#5AD77A',
  warning: '#FF9500',
  warningLight: '#FFB340',
  danger: '#FF3B30',
  dangerLight: '#FF6961',
  
  // Backgrounds (Unified Dark Mode – green-tinted)
  bgPrimary: '#040E0C',      // Deep dark green-black
  bgSecondary: '#081F1A',    // Dark teal card backdrop
  bgTertiary: '#0F3A31',     // Slightly lighter emerald accent
  bgCard: 'rgba(255, 255, 255, 0.04)',      // Semi-transparent for liquid glass
  bgCardHover: 'rgba(255, 255, 255, 0.08)',
  bgGlass: 'rgba(255, 255, 255, 0.03)',

  // Text
  textPrimary: '#FFFFFF',    // High contrast white
  textSecondary: '#94B8AD',  // Soft greenish-gray
  textTertiary: '#5A7D72',   // Muted greenish-gray
  textInverse: '#040E0C',    // Dark text on bright backgrounds

  // Borders
  border: 'rgba(255, 255, 255, 0.08)',      // Frosty subtle white borders
  borderLight: 'rgba(255, 255, 255, 0.04)',

  // Gradients (used as arrays)
  gradientPrimary: ['#10B981', '#14B8A6'],
  gradientSafe: ['#34C759', '#30D158'],
  gradientWarning: ['#FF9500', '#FFCC00'],
  gradientDanger: ['#FF3B30', '#FF6961'],
  gradientBg: ['#020806', '#041210', '#081F1A'], // Dark emerald gradient background
  gradientCard: ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)'],

  // Grade colors
  gradeA: '#34C759',
  gradeB: '#30D158',
  gradeC: '#FF9500',
  gradeD: '#FF6B35',
  gradeF: '#FF3B30',

  // Misc
  overlay: 'rgba(0, 0, 0, 0.65)',
  shadow: 'rgba(0, 0, 0, 0.5)',
};

export const Spacing = {
  xs: scaleHeight(4),
  sm: scaleHeight(8),
  md: scaleHeight(12),
  lg: scaleHeight(16),
  xl: scaleHeight(20),
  xxl: scaleHeight(24),
  xxxl: scaleHeight(32),
  huge: scaleHeight(48),
};

export const BorderRadius = {
  sm: scaleWidth(8),
  md: scaleWidth(12),
  lg: scaleWidth(16),
  xl: scaleWidth(20),
  xxl: scaleWidth(24),
  round: 999,
};

export const FontSize = {
  xs: scaleFont(11),
  sm: scaleFont(13),
  md: scaleFont(15),
  lg: scaleFont(17),
  xl: scaleFont(20),
  xxl: scaleFont(24),
  xxxl: scaleFont(32),
  hero: scaleFont(48),
  mega: scaleFont(64),
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
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
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
