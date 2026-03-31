import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Easing,
} from "react-native-reanimated";

// ── Palette ───────────────────────────────────────────────────────────────────
const S2 = "#BAE6FD";
const S3 = "#7DD3FC";
const S4 = "#38BDF8";
const S5 = "#0EA5E9";
const S6 = "#0284C7";
const S7 = "#0369A1";
const S8 = "#0C4A6E";

const SERVICES = [
  "AC Repair","Heating & Air","Plumbing","Electrical",
  "Deep Cleaning","Handyman","Painting","HVAC Service",
  "Lawn Care","Auto Care",
];
const HEADINGS = [
  "Scanning Your Area","Finding Best Provider","Matching Your Request",
  "Checking Availability","Verifying Credentials","Calculating Distance",
  "Ranking Top Pros","Assigning Best Provider","Almost There…",
  "Confirming Your Pro",
];

// ── Cycle hook ────────────────────────────────────────────────────────────────
function useCycle(arr: string[], ms: number) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % arr.length), ms);
    return () => clearInterval(t);
  }, [ms]);
  return arr[i];
}

// ── Animated text with enter transition ───────────────────────────────────────
function CycleText({ text, style }: { text: string; style?: object }) {
  const opacity    = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    opacity.value    = 0;
    translateY.value = 12;
    opacity.value    = withTiming(1, { duration: 450, easing: Easing.out(Easing.quad) });
    translateY.value = withTiming(0, { duration: 450, easing: Easing.out(Easing.quad) });
  }, [text]);

  const animStyle = useAnimatedStyle(() => ({
    opacity:   opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.Text style={[style, animStyle]}>{text}</Animated.Text>;
}

// ── Cube face ─────────────────────────────────────────────────────────────────
function Face({
  color,
  size,
  rotate,
  skew,
  position,
}: {
  color: string;
  size: number;
  rotate: { rotateY?: string; rotateX?: string };
  skew?: { skewY?: string };
  position: object;
}) {
  return (
    <View
      style={[
        {
          position: "absolute",
          width:  size,
          height: size * 0.72,
          backgroundColor: color,
          borderWidth: 1.5,
          borderColor: "rgba(255,255,255,0.75)",
          opacity: 0.88,
        },
        position,
        { transform: [{ perspective: 400 }, rotate, ...(skew ? [skew] : [])] },
      ]}
    />
  );
}

// ── Spinning Cube ─────────────────────────────────────────────────────────────
function SpinningCube({ size = 56 }: { size?: number }) {
  // Primary Y spin  0 → 360
  const spinY = useSharedValue(0);
  // Secondary X tilt  0 → 1 → 0  (oscillates)
  const tiltX = useSharedValue(0);

  useEffect(() => {
    // Continuous Y rotation – 4 s per revolution
    spinY.value = withRepeat(
      withTiming(360, { duration: 4000, easing: Easing.linear }),
      -1,   // infinite
      false // don't reverse
    );

    // Gentle X tilt oscillation (matches cubeSpinXY feel)
    tiltX.value = withRepeat(
      withSequence(
        withTiming( 1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(-1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false
    );
  }, []);

  // Wrapper spins the whole cube group
  const wrapStyle = useAnimatedStyle(() => {
    const tiltDeg = interpolate(tiltX.value, [-1, 1], [-18, 18]);
    return {
      transform: [
        { perspective: 400 },
        { rotateY: `${spinY.value}deg` },
        { rotateX: `${tiltDeg}deg`    },
      ],
    };
  });

  const s = size;

  return (
    <Animated.View style={[{ width: s, height: s * 1.15, alignItems: "center", justifyContent: "center" }, wrapStyle]}>
      {/* Top face */}
      <View
        style={{
          position: "absolute",
          top: 0,
          width: s,
          height: s * 0.52,
          backgroundColor: S3,
          borderWidth: 1.5,
          borderColor: "rgba(255,255,255,0.85)",
          opacity: 0.9,
          transform: [
            { perspective: 400 },
            { rotateX: "52deg" },
            { scaleX: 0.86 },
          ],
        }}
      />
      {/* Left face */}
      <Face
        color={S7}
        size={s}
        rotate={{ rotateY: "52deg" }}
        skew={{ skewY: "-10deg" }}
        position={{ bottom: 0, left: 0, width: s / 2 }}
      />
      {/* Right face */}
      <Face
        color={S5}
        size={s}
        rotate={{ rotateY: "-52deg" }}
        skew={{ skewY: "10deg" }}
        position={{ bottom: 0, right: 0, width: s / 2 }}
      />
    </Animated.View>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function SpinningCubeLoader() {
  const heading = useCycle(HEADINGS, 2800);
  const service = useCycle(SERVICES, 2800);

  return (
    <View style={styles.box}>
      <View style={styles.bg} pointerEvents="none" />

      <SpinningCube size={58} />

      <CycleText text={heading} style={styles.heading} />
      <View style={styles.hr} />
      <CycleText text={service} style={styles.service} />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  box: {
    height: 210,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: S5,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    paddingHorizontal: 20,
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#E0F2FE",
    opacity: 0.45,
  },
  heading: {
    fontFamily: "Arial",
    fontWeight: "900",
    fontSize: 9,
    color: S6,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    textAlign: "center",
  },
  hr: {
    width: "50%",
    height: 1.5,
    backgroundColor: S5,
    opacity: 0.4,
    borderRadius: 1,
  },
  service: {
    fontFamily: "Arial",
    fontWeight: "900",
    fontSize: 13,
    color: S8,
    letterSpacing: 3,
    textTransform: "uppercase",
    textAlign: "center",
    lineHeight: 18,
  },
});