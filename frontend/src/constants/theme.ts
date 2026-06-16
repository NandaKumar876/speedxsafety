// ============================================
// SpeedxSafety - Design System (Electric Blue / Violet Dark Theme)
// ============================================

import { Dimensions, PixelRatio } from 'react-native';
import { scaleWidth, scaleHeight, scaleFont } from '../utils/responsive';

// ── Font Family ──────────────────────────────
export const FontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
};

// ── Colors ───────────────────────────────────
export const Colors = {
  // Primary palette (Electric Blue / Violet)
  primary: '#6C63FF',
  primaryLight: '#A78BFA',
  primaryDark: '#4F46E5',
  accent: '#A855F7',     // Violet accent
  accentLight: '#C084FC',

  // Safety colors
  safe: '#22C55E',
  safeLight: '#4ADE80',
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  danger: '#EF4444',
  dangerLight: '#F87171',

  // Backgrounds (Deep Navy / Midnight)
  bgPrimary: '#06081A',       // Deepest midnight blue
  bgSecondary: '#0C1033',     // Dark navy
  bgTertiary: '#151B4A',      // Slightly lighter indigo
  bgCard: 'rgba(255, 255, 255, 0.04)',
  bgCardHover: 'rgba(255, 255, 255, 0.08)',
  bgGlass: 'rgba(255, 255, 255, 0.03)',
  bgElevated: 'rgba(108, 99, 255, 0.06)',

  // Text
  textPrimary: '#F1F5F9',     // Near-white with slight warmth
  textSecondary: '#94A3B8',   // Soft blue-gray
  textTertiary: '#64748B',    // Muted slate
  textInverse: '#06081A',     // Dark text on bright backgrounds

  // Borders
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.04)',
  borderAccent: 'rgba(108, 99, 255, 0.25)',

  // Gradients (used as arrays)
  gradientPrimary: ['#6C63FF', '#A855F7'],
  gradientSafe: ['#22C55E', '#10B981'],
  gradientWarning: ['#F59E0B', '#F97316'],
  gradientDanger: ['#EF4444', '#DC2626'],
  gradientBg: ['#020418', '#06081A', '#0C1033'],
  gradientCard: ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)'],
  gradientAccent: ['#A855F7', '#6C63FF'],
  gradientCool: ['#6C63FF', '#3B82F6'],

  // Grade colors
  gradeA: '#22C55E',
  gradeB: '#10B981',
  gradeC: '#F59E0B',
  gradeD: '#F97316',
  gradeF: '#EF4444',

  // Misc
  overlay: 'rgba(0, 0, 0, 0.65)',
  shadow: 'rgba(0, 0, 0, 0.5)',
  shimmer: 'rgba(255, 255, 255, 0.06)',
};

// ── Spacing ──────────────────────────────────
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

// ── Border Radius ────────────────────────────
export const BorderRadius = {
  sm: scaleWidth(8),
  md: scaleWidth(12),
  lg: scaleWidth(16),
  xl: scaleWidth(20),
  xxl: scaleWidth(24),
  round: 999,
};

// ── Font Size ────────────────────────────────
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

// ── Font Weight ──────────────────────────────
export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};

// ── Shadows ──────────────────────────────────
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
  glowSoft: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
  }),
};

// ── Helpers ──────────────────────────────────
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

// ── Responsive Breakpoints ───────────────────
const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const Breakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  isMobile: SCREEN_WIDTH < 480,
  isTablet: SCREEN_WIDTH >= 480 && SCREEN_WIDTH < 1024,
  isDesktop: SCREEN_WIDTH >= 1024,
};
