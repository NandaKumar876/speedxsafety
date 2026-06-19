// ============================================
// SpeedxSafety - Design System (Spatial UI Edition)
// Premium 2026-era Electric Blue / Violet Dark Theme
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
  primaryMuted: 'rgba(108, 99, 255, 0.35)',
  accent: '#A855F7',     // Violet accent
  accentLight: '#C084FC',
  accentMuted: 'rgba(168, 85, 247, 0.30)',

  // Safety colors
  safe: '#22C55E',
  safeLight: '#4ADE80',
  safeMuted: 'rgba(34, 197, 94, 0.25)',
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  warningMuted: 'rgba(245, 158, 11, 0.25)',
  danger: '#EF4444',
  dangerLight: '#F87171',
  dangerMuted: 'rgba(239, 68, 68, 0.25)',

  // Backgrounds (Deep Navy / Midnight) — Spatial Depth
  bgPrimary: '#050714',       // Deepest void
  bgSecondary: '#0A0E2A',     // Dark navy
  bgTertiary: '#111640',      // Slightly lighter indigo
  bgCard: 'rgba(255, 255, 255, 0.04)',
  bgCardHover: 'rgba(255, 255, 255, 0.07)',
  bgCardActive: 'rgba(255, 255, 255, 0.09)',
  bgGlass: 'rgba(255, 255, 255, 0.03)',
  bgGlassMedium: 'rgba(255, 255, 255, 0.06)',
  bgGlassHeavy: 'rgba(255, 255, 255, 0.10)',
  bgElevated: 'rgba(108, 99, 255, 0.06)',
  bgSurface: 'rgba(15, 20, 55, 0.85)',

  // Text
  textPrimary: '#F1F5F9',     // Near-white with slight warmth
  textSecondary: '#94A3B8',   // Soft blue-gray
  textTertiary: '#64748B',    // Muted slate
  textInverse: '#050714',     // Dark text on bright backgrounds
  textGlow: '#E0DDFF',        // Glowing text for emphasis

  // Borders — Spatial
  border: 'rgba(255, 255, 255, 0.07)',
  borderLight: 'rgba(255, 255, 255, 0.04)',
  borderMedium: 'rgba(255, 255, 255, 0.10)',
  borderAccent: 'rgba(108, 99, 255, 0.25)',
  borderGlow: 'rgba(108, 99, 255, 0.40)',

  // Gradients (used as arrays)
  gradientPrimary: ['#6C63FF', '#A855F7'],
  gradientSafe: ['#22C55E', '#10B981'],
  gradientWarning: ['#F59E0B', '#F97316'],
  gradientDanger: ['#EF4444', '#DC2626'],
  gradientBg: ['#020410', '#050714', '#0A0E2A'],
  gradientCard: ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)'],
  gradientAccent: ['#A855F7', '#6C63FF'],
  gradientCool: ['#6C63FF', '#3B82F6'],
  gradientSurface: ['rgba(15, 20, 60, 0.9)', 'rgba(10, 14, 42, 0.95)'],
  gradientGlassCard: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)'],
  gradientGlow: ['rgba(108, 99, 255, 0.20)', 'rgba(168, 85, 247, 0.10)', 'transparent'],

  // Spatial ambient colors
  ambientPrimary: 'rgba(108, 99, 255, 0.08)',
  ambientAccent: 'rgba(168, 85, 247, 0.06)',
  ambientSafe: 'rgba(34, 197, 94, 0.06)',
  ambientDanger: 'rgba(239, 68, 68, 0.08)',

  // Grade colors
  gradeA: '#22C55E',
  gradeB: '#10B981',
  gradeC: '#F59E0B',
  gradeD: '#F97316',
  gradeF: '#EF4444',

  // Misc
  overlay: 'rgba(0, 0, 0, 0.70)',
  overlayLight: 'rgba(0, 0, 0, 0.50)',
  shadow: 'rgba(0, 0, 0, 0.6)',
  shimmer: 'rgba(255, 255, 255, 0.06)',
  shimmerHighlight: 'rgba(255, 255, 255, 0.12)',
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
  massive: scaleHeight(64),
};

// ── Border Radius (Spatial — larger, premium) ─
export const BorderRadius = {
  xs: scaleWidth(6),
  sm: scaleWidth(10),
  md: scaleWidth(14),
  lg: scaleWidth(18),
  xl: scaleWidth(22),
  xxl: scaleWidth(28),
  xxxl: scaleWidth(32),
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

// ── Shadows — Spatial Elevation System ───────
export const Shadow = {
  // Tier 1: Surface level (subtle lift)
  surface: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  // Tier 2: Raised (cards, inputs)
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  // Tier 3: Floating (active cards, FABs)
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  // Tier 4: Elevated (overlays, popovers)
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.40,
    shadowRadius: 20,
    elevation: 12,
  },
  // Tier 5: Modal (top-level modals)
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.50,
    shadowRadius: 32,
    elevation: 16,
  },
  // Colored glows — for spatial ambient effects
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.40,
    shadowRadius: 16,
    elevation: 8,
  }),
  glowSoft: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 6,
  }),
  glowIntense: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 28,
    elevation: 12,
  }),
  // Floating tab bar shadow
  tabBar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.30,
    shadowRadius: 16,
    elevation: 10,
  },
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
  smallPhone: 320,
  phone: 375,
  largePhone: 430,
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  isMobile: SCREEN_WIDTH < 480,
  isTablet: SCREEN_WIDTH >= 480 && SCREEN_WIDTH < 1024,
  isDesktop: SCREEN_WIDTH >= 1024,
  isSmallPhone: SCREEN_WIDTH < 375,
  isLargePhone: SCREEN_WIDTH >= 430,
};
