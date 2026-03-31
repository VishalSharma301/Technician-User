import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Easing,
} from "react-native";

// ── Color palette (matches original) ─────────────────────────────────────────
const S2 = "#BAE6FD";
const S3 = "#7DD3FC";
const S4 = "#38BDF8";
const S5 = "#0EA5E9";
const S6 = "#0284C7";
const S7 = "#0369A1";
const S8 = "#0C4A6E";

const SERVICES = [
  "AC Repair", "Heating & Air", "Plumbing", "Electrical",
  "Deep Cleaning", "Handyman", "Painting", "HVAC Service",
  "Lawn Care", "Auto Care",
];
const HEADINGS = [
  "Scanning Your Area", "Finding Best Provider", "Matching Your Request",
  "Checking Availability", "Verifying Credentials", "Calculating Distance",
  "Ranking Top Pros", "Assigning Best Provider", "Almost There…",
  "Confirming Your Pro",
];

// ── Cycling text hook ─────────────────────────────────────────────────────────
function useCycle(arr: string[], ms: number) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % arr.length), ms);
    return () => clearInterval(t);
  }, [ms]);
  return arr[i];
}

// ── Fading text with enter animation ─────────────────────────────────────────
function CycleText({
  text,
  style,
}: {
  text: string;
  style?: object;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(10);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 420,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
    ]).start();
  }, [text]);

  return (
    <Animated.Text style={[style, { opacity, transform: [{ translateY }] }]}>
      {text}
    </Animated.Text>
  );
}

// ── The Cube ──────────────────────────────────────────────────────────────────
// React Native can't do CSS preserve-3d, so we fake a 3D cube using
// a skew + rotation illusion with 3 visible faces (top, left, right).
function SpinningCube({ size = 52 }: { size?: number }) {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Map 0→1 to 0→360deg (spin Y-ish)
  const rotateY = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  // Secondary tilt for XY spin feel
  const rotateX = rotateAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ["0deg", "20deg", "0deg", "-20deg", "0deg"],
  });

  const s = size;
  const h = s * 0.55; // top face height (isometric)
  const w = s;

  return (
    <Animated.View
      style={{
        width: s,
        height: s * 1.2,
        alignItems: "center",
        justifyContent: "center",
        transform: [{ rotateY }, { rotateX }],
      }}
    >
      {/* ── Top face ── */}
      <View
        style={{
          position: "absolute",
          top: 0,
          width: w,
          height: h,
          backgroundColor: S3,
          borderWidth: 1.5,
          borderColor: "rgba(255,255,255,0.8)",
          transform: [
            { perspective: 300 },
            { rotateX: "50deg" },
            { scaleX: 0.86 },
          ],
          opacity: 0.9,
        }}
      />
      {/* ── Left face ── */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: w / 2,
          height: s * 0.72,
          backgroundColor: S7,
          borderWidth: 1.5,
          borderColor: "rgba(255,255,255,0.6)",
          transform: [
            { perspective: 300 },
            { rotateY: "50deg" },
            { skewY: "-10deg" },
          ],
          opacity: 0.85,
        }}
      />
      {/* ── Right face ── */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: w / 2,
          height: s * 0.72,
          backgroundColor: S5,
          borderWidth: 1.5,
          borderColor: "rgba(255,255,255,0.6)",
          transform: [
            { perspective: 300 },
            { rotateY: "-50deg" },
            { skewY: "10deg" },
          ],
          opacity: 0.85,
        }}
      />
    </Animated.View>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SpinningCubeLoader() {
  const heading = useCycle(HEADINGS, 2800);
  const service = useCycle(SERVICES, 2800);

  return (
    <View style={styles.box}>
      {/* radial background */}
      <View style={styles.bg} pointerEvents="none" />

      <SpinningCube size={56} />

      <CycleText
        text={heading}
        style={styles.heading}
      />

      {/* divider */}
      <View style={styles.hr} />

      <CycleText
        text={service}
        style={styles.service}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  box: {
    height: 200,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: S5,
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    paddingHorizontal: 16,
  },
  bg: {
    position: "absolute",
    inset: 0,
    // Simulated radial gradient via a large blurred circle in the center
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