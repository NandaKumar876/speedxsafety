import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Baseline dimensions based on a standard modern mobile screen (e.g., iPhone 13/14)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

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
