// ============================================
// SpeedxSafety - Spatial Design System Constants
// Premium 2026-era spatial UI tokens
// ============================================

import { Easing } from 'react-native';
import { canUseNativeDriver } from '../utils/platform';

// ── Depth / Elevation Layers ─────────────────
// 5-tier depth system for spatial hierarchy
export const Elevation = {
  surface: 0,    // Flush with background
  raised: 1,     // Slightly above (cards, inputs)
  floating: 2,   // Floating above content (active cards, FABs)
  overlay: 3,    // Overlays (modals, drawers)
  modal: 4,      // Top-level modals
} as const;

// ── Glassmorphism Presets ────────────────────
export const Glass = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    blurIntensity: 20,
  },
  medium: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1.2,
    blurIntensity: 40,
  },
  heavy: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1.5,
    blurIntensity: 60,
  },
  ultra: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1.5,
    blurIntensity: 80,
  },
} as const;

// ── Animation Spring Presets ─────────────────
// Spring configurations for natural-feeling motion
export const Springs = {
  gentle: {
    friction: 26,
    tension: 170,
    useNativeDriver: canUseNativeDriver,
  },
  snappy: {
    friction: 18,
    tension: 280,
    useNativeDriver: canUseNativeDriver,
  },
  bouncy: {
    friction: 8,
    tension: 180,
    useNativeDriver: canUseNativeDriver,
  },
  stiff: {
    friction: 30,
    tension: 400,
    useNativeDriver: canUseNativeDriver,
  },
};

// ── Animation Duration Presets ───────────────
export const Duration = {
  instant: 100,
  fast: 200,
  normal: 350,
  slow: 500,
  entrance: 600,
  dramatic: 800,
} as const;

// ── Stagger Delays ───────────────────────────
export const Stagger = {
  fast: 40,
  normal: 80,
  slow: 120,
  dramatic: 160,
} as const;

// ── Easing Curves ────────────────────────────
export const Curves = {
  decelerate: Easing.out(Easing.cubic),
  accelerate: Easing.in(Easing.cubic),
  standard: Easing.bezier(0.4, 0.0, 0.2, 1),
  emphasized: Easing.bezier(0.2, 0.0, 0, 1),
  spatial: Easing.bezier(0.34, 1.56, 0.64, 1),
} as const;

// ── Blur Intensities ─────────────────────────
export const Blur = {
  subtle: 15,
  light: 25,
  medium: 40,
  heavy: 60,
  ultra: 80,
  backdrop: 100,
} as const;

// ── Ambient Light / Glow ─────────────────────
export const AmbientLight = {
  primary: 'rgba(108, 99, 255, 0.15)',
  accent: 'rgba(168, 85, 247, 0.12)',
  safe: 'rgba(34, 197, 94, 0.12)',
  warning: 'rgba(245, 158, 11, 0.12)',
  danger: 'rgba(239, 68, 68, 0.15)',
  warm: 'rgba(255, 149, 0, 0.10)',
  cool: 'rgba(59, 130, 246, 0.10)',
  surface: 'rgba(255, 255, 255, 0.02)',
} as const;

// ── Floating Element Offsets ─────────────────
export const FloatOffset = {
  subtle: 4,     // Gentle float (badges, labels)
  normal: 8,     // Standard float (cards)
  elevated: 12,  // Elevated float (FABs, active elements)
  dramatic: 20,  // Dramatic float (modals, hero elements)
} as const;

// ── Spatial Radii ────────────────────────────
// Larger, more premium border radii for spatial feel
export const SpatialRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  xxxl: 32,
  pill: 999,
} as const;

// ── Tab Bar Constants ────────────────────────
export const TabBar = {
  height: 72,
  marginHorizontal: 16,
  marginBottom: 20,
  borderRadius: 28,
  iconSize: 22,
  activeScale: 1.15,
  inactiveOpacity: 0.5,
  indicatorSize: 4,
  blurIntensity: 50,
} as const;

// ── Touch Feedback ───────────────────────────
export const TouchFeedback = {
  pressedScale: 0.96,
  pressedOpacity: 0.9,
  hapticEnabled: true,
} as const;

// ── Floating Particle System ─────────────────
export const Particles = {
  count: 6,
  minSize: 3,
  maxSize: 8,
  minOpacity: 0.03,
  maxOpacity: 0.08,
  animationDuration: 8000,
} as const;

// ── Gradient Mesh Backgrounds ────────────────
export const MeshGradients = {
  hero: [
    { color: 'rgba(108, 99, 255, 0.08)', position: { x: 0.2, y: 0.3 } },
    { color: 'rgba(168, 85, 247, 0.06)', position: { x: 0.8, y: 0.6 } },
    { color: 'rgba(59, 130, 246, 0.04)', position: { x: 0.5, y: 0.9 } },
  ],
  dashboard: [
    { color: 'rgba(108, 99, 255, 0.05)', position: { x: 0.1, y: 0.2 } },
    { color: 'rgba(34, 197, 94, 0.04)', position: { x: 0.9, y: 0.5 } },
  ],
  danger: [
    { color: 'rgba(239, 68, 68, 0.08)', position: { x: 0.5, y: 0.3 } },
    { color: 'rgba(239, 68, 68, 0.04)', position: { x: 0.2, y: 0.7 } },
  ],
} as const;

// ── Safe Area Offsets ────────────────────────
export const SafeArea = {
  dynamicIslandTop: 59,
  notchTop: 47,
  standardTop: 20,
  bottomBar: 34,
  androidPunchHole: 32,
} as const;
