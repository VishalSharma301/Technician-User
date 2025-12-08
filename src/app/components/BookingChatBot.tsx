import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
  StyleSheet,
} from "react-native";
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";

export default function Recorder() {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const [savedUri, setSavedUri] = useState<string | null>(null);

  // IMPORTANT: the uri goes directly into useAudioPlayer
  const player = useAudioPlayer(savedUri ?? undefined);
  const playerStatus = useAudioPlayerStatus(player);

  const [timer, setTimer] = useState(0);
  const [isCancelled, setIsCancelled] = useState(false);

  const timerRef = useRef<any>(null);
  const slideX = useRef(new Animated.Value(0)).current;

  // SLIDE TO CANCEL LOGIC
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => recorderState.isRecording,
      onPanResponderMove: (_, g) => {
        slideX.setValue(g.dx);
        setIsCancelled(g.dx < -80);
      },
      onPanResponderRelease: () => stopRecording(),
    })
  ).current;

  // TIMER LOGIC
  const startTimer = () => {
    setTimer(0);
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // RECORDING
  const startRecording = async () => {
    slideX.setValue(0);
    setIsCancelled(false);

    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
    startTimer();
  };

  const stopRecording = async () => {
    stopTimer();

    if (recorderState.isRecording) {
      await audioRecorder.stop();
    }

    if (isCancelled) {
      console.log("Recording cancelled");
      return;
    }

    setSavedUri(audioRecorder.uri);
    console.log("Voice saved:", audioRecorder.uri);
  };

  // PLAYBACK
  const togglePlay = () => {
    if (!savedUri) return;

    if (playerStatus.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* PLAYBACK UI */}
      {savedUri && (
        <View style={styles.playbackBox}>
          <TouchableOpacity style={styles.playBtn} onPress={togglePlay}>
            <Text style={{ fontSize: 22 }}>
              {playerStatus.playing ? "⏸️" : "▶️"}
            </Text>
          </TouchableOpacity>

          {/* Fake waveform */}
          <View style={styles.waveContainer}>
            <Animated.View
              style={[
                styles.wave,
                { height: playerStatus.playing ? 28 : 8 },
              ]}
            />
            <Animated.View
              style={[
                styles.wave,
                { height: playerStatus.playing ? 14 : 6 },
              ]}
            />
            <Animated.View
              style={[
                styles.wave,
                { height: playerStatus.playing ? 22 : 7 },
              ]}
            />
          </View>

          <Text style={styles.duration}>{timer}s</Text>
        </View>
      )}

      {/* MIC + RECORDING */}
      <View style={styles.container}>
        {recorderState.isRecording && (
          <Animated.View
            style={[styles.recordingBar, { transform: [{ translateX: slideX }] }]}
            {...panResponder.panHandlers}
          >
            <Text style={styles.cancelText}>
              {isCancelled ? "Release to cancel" : "Slide left to cancel"}
            </Text>

            <View style={styles.timerBox}>
              <Text style={styles.timerText}>{timer}s</Text>
            </View>
          </Animated.View>
        )}

        <TouchableOpacity
          onPressIn={startRecording}
          onPressOut={stopRecording}
          style={[
            styles.micButton,
            recorderState.isRecording && styles.micActive,
          ]}
        >
          <Text style={styles.micIcon}>🎤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { padding: 10 },

  container: {
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },

  playbackBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e7fbe9",
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },

  playBtn: {
    width: 40,
    height: 40,
    backgroundColor: "#25D366",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  waveContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  wave: {
    width: 4,
    backgroundColor: "#25D366",
    marginHorizontal: 4,
    borderRadius: 4,
  },

  duration: {
    marginLeft: 8,
    fontSize: 13,
  },

  micButton: {
    width: 30,
    height: 30,
    borderRadius: 50,
    backgroundColor: "#acadadff",
    justifyContent: "center",
    alignItems: "center",
  },
  micActive: { backgroundColor: "#1b9a50" },

  micIcon: { color: "#fff", fontSize: 18 },

  recordingBar: {
    position: "absolute",
    left: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    flexDirection: "row",
    alignItems: "center",
  },

  cancelText: { marginRight: 20, fontSize: 14 },

  timerBox: {
    backgroundColor: "#ff3b30",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },

  timerText: { color: "#fff", fontWeight: "600" },
});
