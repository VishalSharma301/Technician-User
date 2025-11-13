import React, { useState } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import BottomSheet from "../components/BottomSheet";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function JobsScreen() {
  const [visible, setVisible] = useState(false);

  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <TouchableOpacity
        onPress={() => {
          console.log("open sheet");
          setVisible(true);
        }}
        style={{
          backgroundColor: "#007bff",
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 10,
          marginBottom: 20,
        }}
      >
        <Text style={{ color: "#fff" }}>Open Sheet</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          console.log("close sheet");
          setVisible(false);
        }}
        style={{
          backgroundColor: "gray",
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "#fff" }}>Close Sheet</Text>
      </TouchableOpacity>

      <BottomSheet visible={visible} height={SCREEN_HEIGHT * 0.5}>
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: "600" }}>Job Details</Text>
          <Text style={{ marginTop: 10 }}>This is your bottom sheet content.</Text>
        </View>
      </BottomSheet>
    </View>
  );
}
