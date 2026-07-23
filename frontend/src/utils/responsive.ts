import { Dimensions, PixelRatio, Platform, StatusBar } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Baseline dimensions based on a standard modern mobile screen (e.g., iPhone 15)
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

const getWindowDimensions = () => Dimensions.get('window');

const getCappedWidthScale = (width: number): number => {
  if (width > 480) {
    return Math.min(width / BASE_WIDTH, 1.15);
  }
  return width / BASE_WIDTH;
};

const getCappedHeightScale = (height: number, width: number): number => {
  if (width > 480 || height > 900) {
    return Math.min(height / BASE_HEIGHT, 1.15);
  }
  return height / BASE_HEIGHT;
};

/**
 * Scales a width or horizontal value based on current screen width (capped for desktop/tablets).
 */
export const scaleWidth = (size: number): number => {
  const { width } = getWindowDimensions();
  const scale = getCappedWidthScale(width);
  return Math.round(PixelRatio.roundToNearestPixel(size * scale));
};

/**
 * Scales a height or vertical value based on current screen height (capped for desktop/tablets).
 */
export const scaleHeight = (size: number): number => {
  const { width, height } = getWindowDimensions();
  const scale = getCappedHeightScale(height, width);
  return Math.round(PixelRatio.roundToNearestPixel(size * scale));
};

/**
 * Moderate scale — width-based with dampening factor.
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  const { width } = getWindowDimensions();
  const scale = getCappedWidthScale(width);
  const newSize = size + (scale - 1) * factor * size;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Scales a font size based on screen width, capped on desktop/tablets to avoid oversized text.
 */
export const scaleFont = (size: number): number => {
  const { width } = getWindowDimensions();
  if (width > 500) {
    return Math.round(PixelRatio.roundToNearestPixel(size * 1.15));
  }
  const scale = getCappedWidthScale(width);
  return Math.round(PixelRatio.roundToNearestPixel(size * scale));
};

/**
 * Calculates a value as a percentage of the screen width.
 */
export const widthPercent = (percent: number): number => {
  return (percent * getWindowDimensions().width) / 100;
};

/**
 * Calculates a value as a percentage of the screen height.
 */
export const heightPercent = (percent: number): number => {
  return (percent * getWindowDimensions().height) / 100;
};

/**
 * Safe area utilities for Dynamic Island, notch, and punch-hole cameras
 */
export const getSafeAreaTop = (): number => {
  const { height, width } = getWindowDimensions();
  if (Platform.OS === 'web') {
    return 16;
  }
  if (Platform.OS === 'ios') {
    if (height >= 852) return 59;
    if (height >= 812) return 47;
    return 20;
  }
  return (StatusBar.currentHeight || 24) + 8;
};

export const getSafeAreaBottom = (): number => {
  const { height, width } = getWindowDimensions();
  if (Platform.OS === 'web') {
    return 16;
  }
  if (Platform.OS === 'ios') {
    if (height >= 812) return 34;
    return 0;
  }
  return 8;
};

/**
 * Adaptive spacing based on device category
 */
export const getAdaptiveSpacing = () => {
  const { width } = getWindowDimensions();
  if (width < 340) {
    return { horizontal: 16, vertical: 12, cardGap: 10 };
  }
  if (width < 400) {
    return { horizontal: 20, vertical: 16, cardGap: 12 };
  }
  if (width < 480) {
    return { horizontal: 24, vertical: 20, cardGap: 16 };
  }
  return { horizontal: 32, vertical: 24, cardGap: 20 };
};

/**
 * Returns responsive layout helpers for the current screen size.
 */
export const getResponsiveInfo = () => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = getWindowDimensions();
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
  const { width } = getWindowDimensions();
  const availableWidth = width - (padding * 2) - (gap * (columns - 1));
  return availableWidth / columns;
};

/**
 * React Hook for dynamic responsive calculations.
 * Listens to screen resizing events and triggers re-renders.
 */
import { useState, useEffect } from 'react';

export const useResponsive = () => {
  const [dims, setDims] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDims(window);
    });
    return () => {
      subscription?.remove();
    };
  }, []);

  const width = dims.width;
  const height = dims.height;

  const wScale = getCappedWidthScale(width);
  const hScale = getCappedHeightScale(height, width);

  const dScaleWidth = (size: number): number => {
    return Math.round(PixelRatio.roundToNearestPixel(size * wScale));
  };

  const dScaleHeight = (size: number): number => {
    return Math.round(PixelRatio.roundToNearestPixel(size * hScale));
  };

  const dScaleFont = (size: number): number => {
    if (width > 500) {
      return Math.round(PixelRatio.roundToNearestPixel(size * 1.15));
    }
    return Math.round(PixelRatio.roundToNearestPixel(size * wScale));
  };

  const isMobile = width < 480;
  const isTablet = width >= 480 && width < 1024;
  const isDesktop = width >= 1024;

  return {
    screenWidth: width,
    screenHeight: height,
    isMobile,
    isTablet,
    isDesktop,
    scaleWidth: dScaleWidth,
    scaleHeight: dScaleHeight,
    scaleFont: dScaleFont,
    getCardWidth: (cols: number, gap: number, pad: number): number => {
      const available = width - (pad * 2) - (gap * (cols - 1));
      return available / cols;
    },
    columns: isMobile ? 1 : isTablet ? 2 : 3,
    safeAreaTop: getSafeAreaTop(),
    safeAreaBottom: getSafeAreaBottom(),
  };
};

export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;
