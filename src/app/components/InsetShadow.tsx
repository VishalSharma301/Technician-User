import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { scale } from "../../utils/scaling";

export function InsetShadowBox({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.container}>
      {/* Inner shadow overlay */}
      <LinearGradient
        colors={[
          // "rgba(0,0,0,0.15)",
          // "rgba(0,0,0,0.15)",
          "#db5b006f",
          "#db5b0056",
          // "rgba(241, 128, 7, 0.24)",
          // "rgba(0,0,0,0)",
        ]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF6EF",
    borderRadius: scale(24),
    padding: scale(4),
    overflow: "hidden", // VERY IMPORTANT
  },
});
