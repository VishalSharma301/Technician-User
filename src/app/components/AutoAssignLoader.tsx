import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function AutoAssignLoader({
  onFinish,
  name,
}: {
  onFinish: () => void;
  name: string;
}) {
  const [isGreen, setIsGreen] = useState(false);
  const [phase, setPhase] = useState<"blue" | "green" | "done">("blue");

  // Ring progress 0 → 1
  const ringProgress = useRef(new Animated.Value(0)).current;
  // Checkmark draw 36 → 0
  const checkDash = useRef(new Animated.Value(36)).current;
  // Center circle color transition (0=blue, 1=green)
  const colorAnim = useRef(new Animated.Value(0)).current;
  // Confetti particles
  const confetti = useRef(
    Array.from({ length: 6 }, () => ({
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      rotate: new Animated.Value(0),
    })),
  ).current;

  // Derived stroke offset
  const strokeDashoffset = ringProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  // Circle fill color
  const circleColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#0EA5E9", "#22C55E"],
  });

  // Track ring color
  const trackColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E0F2FE", "#DCFCE7"],
  });

  // Progress ring stroke color
  const ringColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#0EA5E9", "#22C55E"],
  });

  // Step dots activation based on ring progress
  const [ringPct, setRingPct] = useState(0);
  useEffect(() => {
    const id = ringProgress.addListener(({ value }) => setRingPct(value));
    return () => ringProgress.removeListener(id);
  }, []);

  // Dot pulse animation
  const dotOpacities = useRef(
    [0, 1, 2].map(() => new Animated.Value(0.3)),
  ).current;

  useEffect(() => {
    // Animate dots pulsing
    const pulseDots = () => {
      Animated.stagger(
        220,
        dotOpacities.map((dot) =>
          Animated.sequence([
            Animated.timing(dot, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0.3,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ),
      ).start(() => {
        if (phase === "blue") pulseDots();
      });
    };
    pulseDots();
  }, [phase]);

  useEffect(() => {
    // 1. Fill ring over 1.8s (blue)
    Animated.timing(ringProgress, {
      toValue: 1,
      duration: 1800,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start(() => {
      // 2. Draw checkmark
      Animated.timing(checkDash, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();

      // 3. Turn green
      setTimeout(() => {
        setIsGreen(true);
        setPhase("green");
        Animated.timing(colorAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }).start();

        // 4. Confetti burst
        confetti.forEach((p, i) => {
          Animated.parallel([
            Animated.timing(p.opacity, {
              toValue: 1,
              duration: 100,
              delay: i * 40,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(p.y, {
                toValue: -80,
                duration: 800,
                delay: i * 40,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(p.rotate, {
              toValue: 1,
              duration: 800,
              delay: i * 40,
              useNativeDriver: true,
            }),
            Animated.timing(p.opacity, {
              toValue: 0,
              duration: 800,
              delay: i * 40 + 200,
              useNativeDriver: true,
            }),
          ]).start();
        });

        // 5. Finish after 900ms green hold
        setTimeout(() => {
          setPhase("done");
          setTimeout(onFinish, 500);
        }, 900);
      }, 80);
    });
  }, []);

  const confettiColors = [
    "#38BDF8",
    "#22C55E",
    "#7DD3FC",
    "#34D399",
    "#38BDF8",
    "#22C55E",
  ];
  const confettiPositions = ["38%", "55%", "28%", "62%", "48%", "32%"];

  const steps = [
    { label: "Verified", done: ringPct > 0 },
    { label: "Matched", done: ringPct > 0.4 },
    { label: "Assigned", done: isGreen },
  ];

  return (
    <View style={styles.container}>
      {/* Confetti */}
      {confetti.map((p, i) => {
        const rotate = p.rotate.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", `${180 + i * 30}deg`],
        });
        return (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              top: "40%",
              left: confettiPositions[i] as any,
              width: 8,
              height: 8,
              borderRadius: 2,
              backgroundColor: confettiColors[i],
              opacity: p.opacity,
              transform: [{ translateY: p.y }, { rotate }],
            }}
          />
        );
      })}

      <View style={styles.card}>
        {/* ── Progress Ring ── */}
        <View style={{ width: 130, height: 130 }}>
          <Svg
            width="130"
            height="130"
            viewBox="0 0 130 130"
            style={StyleSheet.absoluteFillObject}
          >
            {/* Track ring */}
            <AnimatedCircle
              cx="65"
              cy="65"
              r={RADIUS}
              fill="none"
              stroke={trackColor as any}
              strokeWidth="7"
            />
          </Svg>

          {/* Progress ring */}
          <Svg
            width="130"
            height="130"
            viewBox="0 0 130 130"
            style={[
              StyleSheet.absoluteFillObject,
              { transform: [{ rotate: "-90deg" }] },
            ]}
          >
            <AnimatedCircle
              cx="65"
              cy="65"
              r={RADIUS}
              fill="none"
              stroke={ringColor as any}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE}`}
              strokeDashoffset={strokeDashoffset as any}
            />
          </Svg>

          {/* Center circle */}
          <Animated.View
            style={[
              styles.centerCircle,
              { backgroundColor: circleColor as any },
            ]}
          >
            <Svg width="42" height="42" viewBox="0 0 42 42" fill="none">
              <AnimatedPath
                d="M10 21.5L17.5 29L32 14"
                stroke="#ffffff"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="36"
                strokeDashoffset={checkDash as any}
              />
            </Svg>
          </Animated.View>
        </View>

        {/* ── Status Text ── */}
        <Text
          style={[styles.title, { color: isGreen ? "#14532D" : "#0C4A6E" }]}
        >
          {isGreen ? "Provider Assigned!" : "Processing Booking…"}
        </Text>
        <Text
          style={[styles.subtitle, { color: isGreen ? "#16A34A" : "#0284C7" }]}
        >
          {isGreen
            ? `{${name} is on assigned to you.}`
            : "Matching best provider for you"}
        </Text>

        {/* Pulsing dots (blue phase only) */}
        {!isGreen && (
          <View style={styles.dotsRow}>
            {dotOpacities.map((opacity, i) => (
              <Animated.View key={i} style={[styles.dot, { opacity }]} />
            ))}
          </View>
        )}

        {/* Percentage */}
        {!isGreen && (
          <Text style={styles.percent}>{Math.round(ringPct * 100)}%</Text>
        )}

        {/* ── Step Indicators ── */}
        <View style={styles.stepsRow}>
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    step.done && {
                      backgroundColor: isGreen ? "#22C55E" : "#0EA5E9",
                      borderWidth: 0,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.stepCircleText,
                      step.done && { color: "#fff" },
                    ]}
                  >
                    {step.done ? "✓" : i + 1}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    step.done && {
                      color: isGreen ? "#16A34A" : "#0284C7",
                      fontWeight: "700",
                    },
                  ]}
                >
                  {step.label}
                </Text>
              </View>
              {i < 2 && (
                <View
                  style={[
                    styles.stepConnector,
                    step.done && {
                      backgroundColor: isGreen ? "#22C55E" : "#0EA5E9",
                    },
                  ]}
                />
              )}
            </React.Fragment>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "90%",
    backgroundColor: "rgba(240,249,255,0.96)",
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    gap: 14,
    shadowColor: "#0EA5E9",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  centerCircle: {
    position: "absolute",
    top: 18,
    left: 18,
    right: 18,
    bottom: 18,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 12,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  dotsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#0EA5E9",
  },
  percent: {
    fontSize: 13,
    color: "#0EA5E9",
    fontWeight: "900",
  },
  stepsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  stepItem: {
    alignItems: "center",
    gap: 3,
  },
  stepCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E0F2FE",
    borderWidth: 1.5,
    borderColor: "#BAE6FD",
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#94A3B8",
  },
  stepLabel: {
    fontSize: 9,
    color: "#94A3B8",
  },
  stepConnector: {
    width: 16,
    height: 1.5,
    backgroundColor: "#E0F2FE",
    borderRadius: 1,
    marginBottom: 12,
  },
});
