import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutChangeEvent,
} from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { moderateScale, scale, verticalScale } from "../../utils/scaling";

interface TimelineItem {
  date: string;
  time: string;
  title: string;
  subtitle: string;
  badge?: string;
  emoji?: string;
}

interface Props {
  data: TimelineItem[];
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

const TimelineProgress: React.FC<Props> = ({ data }) => {
  const [lineHeight, setLineHeight] = useState(0);
  const [progressIndex, setProgressIndex] = useState(1);
  const animatedProgress = useSharedValue(0);

  const handleNext = () => {
    if (progressIndex < data.length) setProgressIndex(progressIndex + 1);
  };

  const handleLayout = (e: LayoutChangeEvent) => {
    const { height } = e.nativeEvent.layout;
    setLineHeight(height);
  };

  useEffect(() => {
    animatedProgress.value = withTiming(progressIndex / data.length, {
      duration: 800,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [progressIndex]);

  const getArrowPath = (height: number, steps: number) => {
    const segment = height / (steps - 1);
    let path = `M10 0`;
    for (let i = 1; i < steps; i++) {
      const y = i * segment;
      // Arrow body and head between steps
      path += `
        L10 ${y - segment * 0.5}
        L14 ${y - segment * 0.35}
        L10 ${y - segment * 0.2}
        L6 ${y - segment * 0.35}
        L10 ${y - segment * 0.5}
        L10 ${y}
      `;
    }
    // Bottom tip
    path += ` L14 ${height - 8} L10 ${height} L6 ${height - 8} Z`;
    return path;
  };

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: (1 - animatedProgress.value) * 1000,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.timelineContainer} onLayout={handleLayout}>
        {/* LEFT SECTION — DATE & TIME */}
        <View style={styles.leftSection}>
          {data.map((item, index) => (
            <View key={index} style={styles.leftItem}>
              <Text style={styles.date}>{item.date}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          ))}
        </View>

        {/* CENTER SECTION — ARROW SVG */}
        <View style={styles.centerSection}>
          {lineHeight > 0 && (
            <Svg height={lineHeight} width={scale(30)} style={styles.svg}>
              <Defs>
                <LinearGradient id="gradActive" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#0083D3" />
                  <Stop offset="1" stopColor="#0D5D8E" />
                </LinearGradient>
              </Defs>

              {/* Inactive Arrow */}
              <Path
                d={getArrowPath(lineHeight, data.length)}
                stroke="#E0E0E0"
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                opacity={0.4}
              />

              {/* Animated Active Arrow */}
              <AnimatedPath
                d={getArrowPath(lineHeight, data.length)}
                stroke="url(#gradActive)"
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                strokeDasharray="1000"
                animatedProps={animatedProps}
              />
            </Svg>
          )}
        </View>

        {/* RIGHT SECTION — STATUS INFO */}
        <View style={styles.rightSection}>
          {data.map((item, index) => (
            <View key={index} style={styles.rightItem}>
              <Text
                style={[
                  styles.title,
                  index < progressIndex ? styles.activeText : styles.inactiveText,
                ]}
              >
                {item.title}
              </Text>
              {item.subtitle ? (
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              ) : null}
              {item.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
              {item.emoji && <Text style={styles.emoji}>{item.emoji}</Text>}
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next Step</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TimelineProgress;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(15),
    paddingVertical: verticalScale(20),
    paddingHorizontal: scale(15),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    margin: moderateScale(10),
  },
  timelineContainer: {
    flexDirection: "row",
    alignItems: "stretch",
  },

  /** LEFT COLUMN */
  leftSection: {
    width: "30%",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftItem: {
    alignItems: "center",
    marginVertical: verticalScale(15),
  },
  date: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    color: "#333",
  },
  time: {
    fontSize: moderateScale(11),
    color: "#999",
  },

  /** CENTER COLUMN (Arrow) */
  centerSection: {
    width: "10%",
    alignItems: "center",
    justifyContent: "center",
  },
  svg: {
    position: "absolute",
    top: 0,
    left: "25%",
  },

  /** RIGHT COLUMN */
  rightSection: {
    width: "60%",
    justifyContent: "space-between",
  },
  rightItem: {
    marginVertical: verticalScale(15),
  },
  title: {
    fontSize: moderateScale(13),
    fontWeight: "600",
  },
  activeText: {
    color: "#0083D3",
  },
  inactiveText: {
    color: "#999",
  },
  subtitle: {
    fontSize: moderateScale(11),
    color: "#666",
    marginTop: verticalScale(2),
  },
  badge: {
    backgroundColor: "#FF5E5E",
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(3),
    borderRadius: moderateScale(10),
    alignSelf: "flex-start",
    marginTop: verticalScale(4),
  },
  badgeText: {
    color: "#fff",
    fontSize: moderateScale(10),
  },
  emoji: {
    fontSize: moderateScale(16),
    marginTop: verticalScale(5),
  },

  /** Button */
  button: {
    backgroundColor: "#0083D3",
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(10),
    alignItems: "center",
    marginTop: verticalScale(20),
  },
  buttonText: {
    color: "#fff",
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
});
