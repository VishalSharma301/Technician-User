import React from "react";
import { View, Animated, Easing } from "react-native";

export default function TypingDots() {
  const dot1 = new Animated.Value(0);
  const dot2 = new Animated.Value(0);
  const dot3 = new Animated.Value(0);

  const animate = (dot: Animated.Value, delay: number) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dot, {
          toValue: -4,
          duration: 250,
          delay,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(dot, {
          toValue: 0,
          duration: 250,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  animate(dot1, 0);
  animate(dot2, 200);
  animate(dot3, 400);

  return (
    <View style={{ flexDirection: "row", padding: 8 }}>
      <Animated.View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: "#aaa",
          margin: 3,
          transform: [{ translateY: dot1 }],
        }}
      />
      <Animated.View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: "#aaa",
          margin: 3,
          transform: [{ translateY: dot2 }],
        }}
      />
      <Animated.View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: "#aaa",
          margin: 3,
          transform: [{ translateY: dot3 }],
        }}
      />
    </View>
  );
}
