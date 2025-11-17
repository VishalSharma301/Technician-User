import { Dimensions, PixelRatio } from "react-native";

const { width, height } = Dimensions.get("window");

const guidelineBaseWidth = 393;
const guidelineBaseHeight = 898;

// Standard width & height scaling
export const scale = (size : number) => (width / guidelineBaseWidth) * size;
export const verticalScale = (size : number) => (height / guidelineBaseHeight) * size;

/**
 * SAFE moderate scale
 * - Text will NOT get too large on small screens
 * - Still scales smoothly on large screens
 * - PixelRatio ensures fonts are not blown up unnecessarily
 */
export const moderateScale = (size : number, factor = 0.3) => {
  const scaledSize = scale(size );

  // Prevent text from becoming too large on small screens
  const limitedSize = Math.min(scaledSize, size * 1.12); // max +12% increase

  // Ensure balanced DPI scaling
  const dpiAdjusted = limitedSize / PixelRatio.getFontScale();

  // Blend original & scaled
  return size + (dpiAdjusted - size) * factor;
};
