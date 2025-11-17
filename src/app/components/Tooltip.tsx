import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Tooltip({ text   } : {text : string}) {
  return (
    <View style={styles.tooltip}>
      <Text style={styles.tooltipText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tooltip: {
    position: "absolute",
    top: -35,  
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#333",
    borderRadius: 6,
    zIndex: 20,
  },
  tooltipText: {
    color: "#fff",
    fontSize: 12,
  },
});
