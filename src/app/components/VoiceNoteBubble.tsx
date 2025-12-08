// components/VoiceNoteBubble.tsx

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

export default function VoiceNoteBubble({ uri }: { uri: string }) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.playBtn}
        onPress={() => {
          status.playing ? player.pause() : player.play();
        }}
      >
        <Text style={{ fontSize: 22 }}>
          {status.playing ? "⏸️" : "▶️"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.duration}>
        {Math.round((status.currentTime ?? 0))}s
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0083D3",
    padding: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "70%",
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  duration: {
    color: "#fff",
    fontWeight: "600",
  },
});
