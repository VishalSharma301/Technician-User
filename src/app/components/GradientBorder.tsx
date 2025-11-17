import React, { ReactNode } from "react";
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  ColorValue,
} from "react-native";
// For Expo, use: import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "../../utils/scaling";
import { LinearGradient } from "expo-linear-gradient";

interface GradientBorderProps {
  /** Thickness of the border */
  innerWidth?: number;
  outerWidth?: number;
  /** Corner radius of the bordered box */
  borderRadius?: number;
  /** Vertical gradient colors for outer border */
  outerColors?: readonly [ColorValue, ColorValue, ...ColorValue[]];
  /** Horizontal gradient colors for inner border */
  innerColors?: readonly [ColorValue, ColorValue, ...ColorValue[]];
  /** Custom styles for inner content container */
  style?: StyleProp<ViewStyle>;
  /** Content inside the bordered box */
  children?: ReactNode;
  gradientStyle?: StyleProp<ViewStyle>;
}

/**
 * GradientBorder Component
 * ------------------------
 * Creates a smooth two-layer gradient border effect using nested LinearGradients.
 */
const GradientBorder: React.FC<GradientBorderProps> = ({
  innerWidth = moderateScale(2),
  outerWidth = moderateScale(0),
  borderRadius = moderateScale(12),
  innerColors = [
    "rgba(255, 255, 255, 0.1)",
    "#FFFFFF",
    "rgba(255, 255, 255, 0.1)",
  ] as const,
  outerColors = [
    "rgba(0, 0, 0, 0.01)",
    "rgba(0, 0, 0, 0.2)",
    "rgba(0, 0, 0, 0.01)",
  ] as const,
  style,
  children,
  gradientStyle
}) => {
  return (
   <LinearGradient
  colors={outerColors}
  start={{ x: 0.5, y: 0 }}
  end={{ x: 0.5, y: 1 }}
  style={[
    {
      padding: outerWidth,
      borderRadius: borderRadius,
    },
    gradientStyle, // ✅ safe to merge here
  ]}
>

      <LinearGradient
        colors={innerColors}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          padding: innerWidth,
          borderRadius: borderRadius - moderateScale(2),
        }}
      >
        <View
          style={[
            styles.innerContainer,
            {
              borderRadius: borderRadius,
              //   borderRadius: borderRadius - moderateScale(4),
            },
            style,
          ]}
        >
          {children}
        </View>
      </LinearGradient>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  innerContainer: {
    backgroundColor: "#FFFFFF",
  },
});

export default GradientBorder;
