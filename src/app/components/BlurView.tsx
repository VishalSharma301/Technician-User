import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
// expo-blur ships with Expo. For bare RN use @react-native-community/blur instead.
// import { BlurView } from '@react-native-community/blur';
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";
// ─── Theme ────────────────────────────────────────────────────────────────────
const ACCENT = "#A78BFA"; // violet
const BG = "#07070F";
const CARD = "#0F0F1E";
const MSG_BG = "#16162A";
const TEXT = "#E2E8F0";
const MUTED = "#4A4A6A";
// ─── Quiz data ────────────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: "1",
    question: "What kind of app are you building? 🚀",
    options: [
      "E-commerce Store",
      "Health & Fitness",
      "Travel Planner",
      "Education App",
    ],
  },
  {
    id: "2",
    question: "Which platform are you targeting? 📱",
    options: ["iOS only", "Android only", "Both platforms", "Web + Mobile"],
  },
  {
    id: "3",
    question: "What matters most to your users? ✨",
    options: [
      "Speed & performance",
      "Beautiful design",
      "Easy to use",
      "Lots of features",
    ],
  },
  {
    id: "4",
    question: "When do you want to launch? 🗓️",
    options: [
      "Already shipped!",
      "Within a month",
      "3–6 months",
      "Just exploring",
    ],
  },
];
const BOT_REPLIES: Record<string, string> = {
  "E-commerce Store":
    "Great choice! Smooth animations boost conversions significantly 🛒",
  "Health & Fitness":
    "Zoom-blur animations feel premium — perfect for fitness apps 💪",
  "Travel Planner":
    "That cinematic zoom feel matches the adventure vibe perfectly ✈️",
  "Education App":
    "Engaging transitions help learners stay focused and motivated 🎓",
  "iOS only": "iOS spring physics + zoom blur = buttery smooth premium feel 🍎",
  "Android only": "useNativeDriver keeps this 60fps on every Android device 🤖",
  "Web + Mobile":
    "Add react-spring for web parity with the same zoom-blur feel 💻",
  "Speed & performance":
    "useNativeDriver: true keeps zoom animations off the JS thread ⚡",
  "Beautiful design":
    "Zoom blur adds cinematic depth — your users will notice 🎨",
  "Easy to use":
    "Purposeful animation guides attention without overwhelming 🧭",
  "Lots of features":
    "Progressive reveals with zoom make complex UIs feel effortless ✨",
  "Within a month": "Tight deadline! Zoom blur is easy to drop in anywhere ⏱️",
  "3–6 months": "Perfect runway to refine your full motion design system 🎯",
  "Just exploring":
    "Best time to experiment. You picked a great animation style! 🔭",
};
// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "bot" | "user";
  text: string;
}

interface ZoomBlurMessageProps {
  text: string;
  isUser: boolean;
  delay?: number;
}
const ZoomBlurMessage: React.FC<ZoomBlurMessageProps> = ({
  text,
  isUser,
  delay = 0,
}) => {
  // Animation values
  const scale = useRef(new Animated.Value(1.35)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const blurOpacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const animation = Animated.parallel([
      // 1. Zoom: scale from 1.35 down to 1 with a spring
      Animated.spring(scale, {
        toValue: 1,
        delay,
        tension: 60, // controls stiffness — higher = snappier
        friction: 9, // controls damping — lower = more bounce
        useNativeDriver: true,
      }),
      // 2. Fade in opacity
      Animated.timing(opacity, {
        toValue: 1,
        duration: 420,
        delay,
        useNativeDriver: true,
      }),
      // 3. Blur overlay fades OUT (simulates de-blur)
      Animated.timing(blurOpacity, {
        toValue: 0,
        duration: 380,
        delay: delay + 40, // slight lag so blur lingers briefly
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, []);
  return (
    <View
      style={[
        styles.messageRow,
        isUser ? styles.messageRowUser : styles.messageRowBot,
      ]}
    >
      <Animated.View
        style={[styles.bubbleWrapper, { transform: [{ scale }], opacity }]}
      >
        {/* Actual message bubble */}
        <View
          style={[
            styles.bubble,
            isUser
              ? [styles.bubbleUser, { backgroundColor: ACCENT }]
              : styles.bubbleBot,
          ]}
        >
          <Text
            style={[
              styles.bubbleText,
              isUser ? styles.bubbleTextUser : styles.bubbleTextBot,
            ]}
          >
            {text}
          </Text>
        </View>

        {/*
      Blur overlay — sits on top of the bubble and fades out.
      This is what creates the "blur dissolve" effect.
      On iOS:  BlurView with intensity controlled via opacity
      On Android: BlurView works with @react-native-community/blur
                  (set blurAmount={8} for Android)
    */}
        <Animated.View
          style={[styles.blurOverlay, { opacity: blurOpacity }]}
          pointerEvents="none"
        >
          <BlurView
            style={StyleSheet.absoluteFill}
            intensity={18} // 0–100, tune to taste
            tint="dark" // "light" | "dark" | "default"
            // For @react-native-community/blur use:
            // blurType="dark"
            // blurAmount={10}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
};
// ─── Typing Indicator ─────────────────────────────────────────────────────────
const TypingIndicator: React.FC = () => {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(dot, {
            toValue: -7,
            duration: 280,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 280,
            useNativeDriver: true,
          }),
          Animated.delay(320),
        ]),
      ),
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, []);
  return (
    <View style={[styles.messageRow, styles.messageRowBot]}>
      <View style={[styles.bubble, styles.bubbleBot, styles.typingBubble]}>
        {dots.map((dot, i) => (
          <Animated.View
            key={i}
            style={[styles.dot, { transform: [{ translateY: dot }] }]}
          />
        ))}
      </View>
    </View>
  );
};
// ─── Option Button ─────────────────────────────────────────────────────────
interface OptionButtonProps {
  label: string;
  onPress: () => void;
  disabled: boolean;
  index: number;
}
const OptionButton: React.FC<OptionButtonProps> = ({
  label,
  onPress,
  disabled,
  index,
}) => {
  const slideX = useRef(new Animated.Value(-20)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideX, {
        toValue: 0,
        duration: 320,
        delay: index * 70,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        delay: index * 70,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();
  };
  return (
    <Animated.View
      style={{
        transform: [{ translateX: slideX }, { scale }],
        opacity,
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={({ pressed }) => [
          styles.optionBtn,
          pressed && styles.optionBtnPressed,
          disabled && styles.optionBtnDisabled,
        ]}
      >
        <Text style={styles.optionText}>{label}</Text>
        <Text style={styles.optionArrow}>›</Text>
      </Pressable>
    </Animated.View>
  );
};
// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ZoomBlurChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);
  const [locked, setLocked] = useState(false);
  const [done, setDone] = useState(false);
  const listRef = useRef<FlatList>(null);
  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, typing]);
  // Start conversation
  useEffect(() => {
    setTimeout(() => showQuestion(0), 600);
  }, []);
  function addMessage(msg: Omit<Message, "id">) {
    const full: Message = { ...msg, id: `${Date.now()}_${Math.random()}` };
    setMessages((prev) => [...prev, full]);
    return full;
  }
  function showQuestion(idx: number) {
    if (idx >= QUESTIONS.length) {
      setTyping(true);
      setOptions([]);
      setTimeout(() => {
        setTyping(false);
        addMessage({
          role: "bot",
          text: "🎉 All done! Youre ready to build something amazing. Go ship it!",
        });
        setDone(true);
      }, 1500);
      return;
    }

    setTyping(true);
    setOptions([]);
    setTimeout(() => {
      setTyping(false);
      addMessage({ role: "bot", text: QUESTIONS[idx].question });
      setTimeout(() => setOptions(QUESTIONS[idx].options), 350);
    }, 1300);
  }
  function handleAnswer(option: string) {
    if (locked) return;
    setLocked(true);
    setOptions([]);
    addMessage({ role: "user", text: option });
    const nextIdx = qIndex + 1;
    setQIndex(nextIdx);
    setTimeout(() => {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        addMessage({
          role: "bot",
          text: BOT_REPLIES[option] ?? "Great choice! 👍",
        });
        setLocked(false);
        setTimeout(() => showQuestion(nextIdx), 500);
      }, 1400);
    }, 300);
  }
  const progress = Math.min((qIndex / QUESTIONS.length) * 100, 100);
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerEmoji}>🤖</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>ChatBot</Text>
            <View style={styles.headerSubRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.headerSub}>🔍 Zoom Blur mode</Text>
            </View>
          </View>
        </View>
        {/* ── Progress ── */}
        <View style={styles.progressContainer}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>
              Question {Math.min(qIndex + 1, QUESTIONS.length)} of{" "}
              {QUESTIONS.length}
            </Text>
            <Text style={styles.progressPct}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
        {/* ── Messages ── */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
          }
          renderItem={({ item }) => (
            <ZoomBlurMessage
              text={item.text}
              isUser={item.role === "user"}
              delay={0} // 0 = animate immediately when rendered
            />
          )}
          ListFooterComponent={typing ? <TypingIndicator /> : null}
        />
        {/* ── Options / Footer ── */}
        <View style={styles.footer}>
          {!done && options.length > 0 && (
            <View>
              <Text style={styles.chooseLabel}>CHOOSE AN ANSWER</Text>
              {options.map((opt, i) => (
                <OptionButton
                  key={opt}
                  label={opt}
                  index={i}
                  disabled={locked}
                  onPress={() => handleAnswer(opt)}
                />
              ))}
            </View>
          )}
          {done && (
            <Pressable
              style={styles.restartBtn}
              onPress={() => {
                setMessages([]);
                setQIndex(0);
                setDone(false);
                setOptions([]);
                setLocked(false);
                setTimeout(() => showQuestion(0), 400);
              }}
            >
              <Text style={styles.restartText}>🔄 Start Over</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  flex: { flex: 1 },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: CARD,
    borderBottomWidth: 1,
    borderBottomColor: `${ACCENT}25`,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: `${ACCENT}20`,
    borderWidth: 1.5,
    borderColor: `${ACCENT}50`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerEmoji: { fontSize: 22 },
  headerText: { flex: 1 },
  headerTitle: { color: "#F0F0F0", fontSize: 16, fontWeight: "700" },
  headerSubRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22C55E",
    marginRight: 5,
    shadowColor: "#22C55E",
    shadowRadius: 4,
    shadowOpacity: 0.8,
  },
  headerSub: { color: ACCENT, fontSize: 12, fontWeight: "600" },
  // Progress
  progressContainer: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: CARD,
    borderBottomWidth: 1,
    borderBottomColor: `${ACCENT}15`,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: { color: MUTED, fontSize: 11, fontWeight: "500" },
  progressPct: { color: ACCENT, fontSize: 11, fontWeight: "700" },
  progressTrack: {
    height: 4,
    backgroundColor: "#1A1A2A",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: ACCENT,
    borderRadius: 4,
    shadowColor: ACCENT,
    shadowRadius: 6,
    shadowOpacity: 0.7,
  },
  // Messages
  messageList: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  messageRowUser: { justifyContent: "flex-end" },
  messageRowBot: { justifyContent: "flex-start" },
  // Bubble
  bubbleWrapper: { maxWidth: "78%" },
  bubble: {
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 20,
  },
  bubbleUser: {
    borderBottomRightRadius: 5,
  },
  bubbleBot: {
    backgroundColor: MSG_BG,
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: `${ACCENT}35`,
    shadowColor: ACCENT,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  bubbleText: { fontSize: 14, lineHeight: 21 },
  bubbleTextUser: { color: "#fff" },
  bubbleTextBot: { color: TEXT },
  // Blur overlay (sits on top of bubble, fades out)
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    overflow: "hidden",
  },
  // Typing dots
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: ACCENT,
    opacity: 0.7,
  },
  // Footer / options
  footer: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 8 : 14,
    backgroundColor: CARD,
    borderTopWidth: 1,
    borderTopColor: `${ACCENT}20`,
  },
  chooseLabel: {
    color: MUTED,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 8,
    paddingLeft: 2,
  },
  optionBtn: {
    backgroundColor: "#13131F",
    borderWidth: 1.5,
    borderColor: `${ACCENT}35`,
    borderRadius: 13,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  optionBtnPressed: {
    backgroundColor: `${ACCENT}18`,
    borderColor: ACCENT,
  },
  optionBtnDisabled: { opacity: 0.35 },
  optionText: { color: "#D0D0E8", fontSize: 14, fontWeight: "500", flex: 1 },
  optionArrow: { color: `${ACCENT}80`, fontSize: 20, marginLeft: 8 },
  // Restart
  restartBtn: {
    backgroundColor: ACCENT,
    borderRadius: 13,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: ACCENT,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  restartText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
