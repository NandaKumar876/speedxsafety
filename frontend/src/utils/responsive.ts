import { Dimensions, PixelRatio, Platform, StatusBar } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Baseline dimensions based on a standard modern mobile screen (e.g., iPhone 15)
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

const widthScale = SCREEN_WIDTH / BASE_WIDTH;
const heightScale = SCREEN_HEIGHT / BASE_HEIGHT;

/**
 * Scales a width or horizontal value based on the current screen width.
 */
export const scaleWidth = (size: number): number => {
  const newSize = size * widthScale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Scales a height or vertical value based on the current screen height.
 */
export const scaleHeight = (size: number): number => {
  const newSize = size * heightScale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Moderate scale — width-based with dampening factor.
 * Better for font sizes and elements that shouldn't scale linearly.
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  const newSize = size + (widthScale - 1) * factor * size;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Scales a font size based on screen width, with capped scaling on tablets to avoid oversized text.
 */
export const scaleFont = (size: number): number => {
  if (SCREEN_WIDTH > 500) {
    // For tablets or wider screens, cap the text growth factor
    return Math.round(PixelRatio.roundToNearestPixel(size * 1.15));
  }
  const newSize = size * widthScale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Calculates a value as a percentage of the screen width.
 */
export const widthPercent = (percent: number): number => {
  return (percent * SCREEN_WIDTH) / 100;
};

/**
 * Calculates a value as a percentage of the screen height.
 */
export const heightPercent = (percent: number): number => {
  return (percent * SCREEN_HEIGHT) / 100;
};

/**
 * Safe area utilities for Dynamic Island, notch, and punch-hole cameras
 */
export const getSafeAreaTop = (): number => {
  if (Platform.OS === 'ios') {
    // iPhone 15 Pro / Dynamic Island
    if (SCREEN_HEIGHT >= 852) return 59;
    // iPhone with notch (X, 11, 12, 13, 14)
    if (SCREEN_HEIGHT >= 812) return 47;
    // Older iPhones
    return 20;
  }
  // Android — use StatusBar height + extra padding for punch-hole
  return (StatusBar.currentHeight || 24) + 8;
};

export const getSafeAreaBottom = (): number => {
  if (Platform.OS === 'ios') {
    // Devices with home indicator
    if (SCREEN_HEIGHT >= 812) return 34;
    return 0;
  }
  // Android
  return 8;
};

/**
 * Adaptive spacing based on device category
 */
export const getAdaptiveSpacing = () => {
  if (SCREEN_WIDTH < 340) {
    // Small phone — tighter spacing
    return { horizontal: 16, vertical: 12, cardGap: 10 };
  }
  if (SCREEN_WIDTH < 400) {
    // Standard phone
    return { horizontal: 20, vertical: 16, cardGap: 12 };
  }
  if (SCREEN_WIDTH < 480) {
    // Large phone
    return { horizontal: 24, vertical: 20, cardGap: 16 };
  }
  // Tablet+
  return { horizontal: 32, vertical: 24, cardGap: 20 };
};

/**
 * Returns responsive layout helpers for the current screen size.
 */
export const getResponsiveInfo = () => {
  return {
    screenWidth: SCREEN_WIDTH,
    screenHeight: SCREEN_HEIGHT,
    isSmallPhone: SCREEN_WIDTH < 340,
    isMobile: SCREEN_WIDTH < 480,
    isTablet: SCREEN_WIDTH >= 480 && SCREEN_WIDTH < 1024,
    isDesktop: SCREEN_WIDTH >= 1024,
    isFoldable: SCREEN_WIDTH >= 600 && SCREEN_WIDTH < 768,
    columns: SCREEN_WIDTH < 480 ? 1 : SCREEN_WIDTH < 1024 ? 2 : 3,
    safeAreaTop: getSafeAreaTop(),
    safeAreaBottom: getSafeAreaBottom(),
  };
};

/**
 * Calculate dynamic card width for grid layouts
 */
export const getCardWidth = (columns: number, gap: number, padding: number): number => {
  const availableWidth = SCREEN_WIDTH - (padding * 2) - (gap * (columns - 1));
  return availableWidth / columns;
};

export { SCREEN_WIDTH, SCREEN_HEIGHT };
