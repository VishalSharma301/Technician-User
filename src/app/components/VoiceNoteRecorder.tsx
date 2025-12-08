// components/VoiceNoteRecorder.tsx

import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  AudioModule,
} from "expo-audio";

export default function VoiceNoteRecorder({
  onRecorded,
}: {
  onRecorded: (data: { uri: string }) => void;
}) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder);

  const [hasPermission, setHasPermission] = useState(false);

  // Ask mic permission
  useEffect(() => {
    (async () => {
      const p = await AudioModule.requestRecordingPermissionsAsync();
      setHasPermission(p.granted);
    })();
  }, []);

  const startRecording = async () => {
    if (!hasPermission) return;
    await recorder.prepareToRecordAsync();
    recorder.record();
  };

  const stopRecording = async () => {
    await recorder.stop();
    if (recorder.uri) {
      onRecorded({ uri: recorder.uri });
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.micButton,
          state.isRecording && { backgroundColor: "#FF4444" },
        ]}
        onPressIn={startRecording}
        onPressOut={stopRecording}
      >
        <Text style={{ fontSize: 30, color: "#fff" }}>🎤</Text>
      </TouchableOpacity>

      {state.isRecording && (
        <Text style={{ marginTop: 6, fontSize: 12 }}>Recording...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  micButton: {
    width: 60,
    height: 60,
    backgroundColor: "#027CC7",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
