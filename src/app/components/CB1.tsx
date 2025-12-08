import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
} from "react-native";
import {
  ServiceBrand,
  ServiceData,
  ServiceOption,
} from "../../constants/types";
import { useCart } from "../../hooks/useCart";
import VoiceNoteRecorder from "./VoiceNoteRecorder";
import VoiceNoteBubble from "./VoiceNoteBubble";

const EXTRA_UNIT_PRICE = 590;

export default function CB1({
  service,
  close,
}: {
  service: ServiceData;
  close: () => void;
}) {
  // ----------------------- STATES -------------------------
  const [messages, setMessages] = useState<any[]>([]);
  const [step, setStep] = useState(0);

  const [selectedBrand, setSelectedBrand] = useState<ServiceBrand | null>(null);
  const [selectedType, setSelectedType] = useState<ServiceOption | null>(null);
  const [selectedPricing, setSelectedPricing] = useState("single");
  const [addMoreQuantity, setAddMoreQuantity] = useState(0);

  const [manualMode, setManualMode] = useState(false);
  const [manualQtyInput, setManualQtyInput] = useState("");

  const [descriptionInput, setDescriptionInput] = useState("");

  const { addToCart } = useCart();

  const scrollRef = useRef<ScrollView>(null);

  const TYPES = service.options ?? [];

  const PRICING = [
    {
      id: "single",
      title: "Single Unit",
      price: selectedType?.singlePrice ?? 0,
      count: 1,
    },
    {
      id: "double",
      title: "Double Units",
      price: selectedType?.doublePrice ?? 0,
      count: 2,
    },
    {
      id: "triple",
      title: "Triple Units",
      price: selectedType?.triplePrice ?? 0,
      count: 3,
    },
  ];

  // ----------------------- HELPERS -------------------------
  const totalUnits = () =>
    manualMode && manualQtyInput ? Number(manualQtyInput) : 1 + addMoreQuantity;

  const calculateTotal = () => {
    const total = totalUnits();
    if (total <= 3) return PRICING[total - 1]?.price ?? 0;

    const triplePrice = PRICING[2].price;
    return triplePrice + (total - 3) * EXTRA_UNIT_PRICE;
  };

  const pushBotMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), from: "bot", text },
    ]);
  };

  const pushUserMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), from: "user", text },
    ]);
  };

  // Auto scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // ----------------------- RESET ON CLOSE / SERVICE CHANGE -------------------------
  const resetChatbot = () => {
    setMessages([]);
    setStep(0);
    setSelectedBrand(null);
    setSelectedType(null);
    setSelectedPricing("single");
    setAddMoreQuantity(0);
    setManualQtyInput("");
    setDescriptionInput("");
    setManualMode(false);
  };

  useEffect(() => {
    resetChatbot();

    setTimeout(
      () => pushBotMessage("Which brand would you like to select?"),
      250
    );
  }, [service._id]);

  // ----------------------- BOT FLOW -------------------------
  useEffect(() => {
    if (messages.length === 0) return;

    if (step === 1) pushBotMessage("Select the type of service you need.");
    if (step === 2) pushBotMessage("How many units do you want serviced?");
    if (step === 3)
      pushBotMessage(
        "Please describe your issue or request. You can type or send a voice note."
      );
    if (step === 4)
      pushBotMessage(
        `Your total is ₹${calculateTotal()}. Should I add this to your cart?`
      );
  }, [step]);

  // ----------------------- ACTION HANDLERS -------------------------
  const handleBrand = (b: ServiceBrand) => {
    pushUserMessage(b.name);
    setSelectedBrand(b);
    setTimeout(() => setStep(1), 250);
  };

  const handleType = (t: ServiceOption) => {
    pushUserMessage(t.name);
    setSelectedType(t);
    setTimeout(() => setStep(2), 250);
  };

  const handleQuantitySelection = () => {
    pushUserMessage(`Selected ${totalUnits()} units`);
    setTimeout(() => setStep(3), 250);
  };

  const handleDescriptionSubmit = () => {
    if (!descriptionInput.trim()) return;
    pushUserMessage(descriptionInput.trim());
    setDescriptionInput("");
    setTimeout(() => setStep(4), 200);
  };

  const handleAddToCart = () => {
    pushUserMessage("Add to cart");
    proceedAddToCart();
  };

  // ----------------------- CART LOGIC -------------------------
  const proceedAddToCart = () => {
    const total = totalUnits();
    const price = calculateTotal();

    const svc = {
      ...service,
      basePrice: price,
      name: `${selectedType?.name} - ${total} Units`,
      description: `User Issue: ${descriptionInput}`,
    };

    addToCart(svc, selectedType!, selectedBrand!, total);
    pushBotMessage("Added to cart 🎉");

    setTimeout(() => close(), 700);
  };

  // ----------------------- OPTIONS RENDER -------------------------
  const renderOptions = () => {
    // ---------------- Step 0: Brand ----------------
    if (step === 0)
      return service.brands.map((b) => (
        <TouchableOpacity
          key={b._id}
          style={[
            styles.optionBtn,
            {
              width: 133,
              alignItems: "center",
              borderColor: "#C8E6FF80",
              backgroundColor: "#C8E6FF1A",
            },
          ]}
          onPress={() => handleBrand(b)}
        >
          <Text style={styles.optionText}>{b.name}</Text>
        </TouchableOpacity>
      ));

    // ---------------- Step 1: Type ----------------
    if (step === 1)
      return TYPES.map((t) => (
        <TouchableOpacity
          key={t._id}
          style={styles.optionBtn}
          onPress={() => handleType(t)}
        >
          <Text style={styles.optionText}>{t.name}</Text>
        </TouchableOpacity>
      ));

    // ---------------- Step 2: Pricing / Quantity ----------------
    if (step === 2)
      return (
        <View>
          {PRICING.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={styles.optionBtn}
              onPress={() => {
                setSelectedPricing(p.id);
                setManualMode(false);
                setAddMoreQuantity(p.count - 1);
                handleQuantitySelection();
              }}
            >
              <Text style={styles.optionText}>
                {p.title} - ₹{p.price}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Manual Quantity */}
          <View style={{ marginTop: 20 }}>
            <TouchableOpacity
              style={[styles.optionBtn, { backgroundColor: "#ddd" }]}
              onPress={() => setManualMode(true)}
            >
              <Text style={[styles.optionText, { color: "#000" }]}>
                Enter Quantity Manually
              </Text>
            </TouchableOpacity>

            {manualMode && (
              <View style={{ marginTop: 10 }}>
                <TextInput
                  keyboardType="numeric"
                  placeholder="Enter number"
                  value={manualQtyInput}
                  onChangeText={setManualQtyInput}
                  style={styles.input}
                />

                <TouchableOpacity
                  style={[styles.optionBtn, { marginTop: 10 }]}
                  onPress={() => {
                    if (!manualQtyInput || Number(manualQtyInput) < 1) {
                      pushBotMessage("Please enter a valid quantity.");
                      return;
                    }
                    handleQuantitySelection();
                  }}
                >
                  <Text style={styles.optionText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      );

    // ---------------- Step 3: DESCRIPTION (text + mic) ----------------
    if (step === 3)
      return (
        <View style={{ padding: 10 }}>
          {/* Text message input */}
          <TextInput
            placeholder="Describe your issue..."
            style={styles.descriptionInput}
            value={descriptionInput}
            onChangeText={setDescriptionInput}
          />

          <TouchableOpacity
            style={styles.sendTextBtn}
            onPress={handleDescriptionSubmit}
          >
            <Text style={{ color: "#fff" }}>Send</Text>
          </TouchableOpacity>

          {/* Voice note recorder */}
          <VoiceNoteRecorder
            onRecorded={({ uri }) => {
              // ADD VOICE NOTE BUBBLE
              setMessages((prev) => [
                ...prev,
                { id: Date.now().toString(), from: "user-voice", uri },
              ]);

              // Go to next step
              setTimeout(() => setStep(4), 200);
            }}
          />
        </View>
      );

    // ---------------- Step 4: Add to cart ----------------
    if (step === 4)
      return (
        <View>
          <TouchableOpacity style={styles.optionBtn} onPress={handleAddToCart}>
            <Text style={styles.optionText}>Add to Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionBtn, { backgroundColor: "#777" }]}
            onPress={close}
          >
            <Text style={styles.optionText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      );
  };

  // ----------------------- UI -------------------------
  return (
    <View style={styles.wrapper}>
      {/* Close button unchanged */}

      <View style={styles.header}>
        <View style={styles.headerRow}>
          {/* LEFT SIDE: ICON + TEXT */}
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Text style={{ fontSize: 20 }}>❄️</Text>
            </View>

            <View>
              <Text style={styles.headerTitle}>AC Service Booking</Text>
              <Text style={styles.headerSubtitle}>
                Quick & reliable AC service at your doorstep
              </Text>
            </View>
          </View>

          {/* RIGHT SIDE CLOSE BUTTON */}
          <TouchableOpacity onPress={close} style={styles.closeBtn}>
            <Text style={{ fontSize: 20, color: "#fff" }}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView ref={scrollRef} style={{ flex: 1, paddingHorizontal: 8 }}>
        {messages.map((m, index) => {
          const isUser = m.from === "user" || m.from === "user-voice";
          const isLastBotMessage =
            !isUser &&
            messages.length > 0 &&
            messages[index].id === messages[messages.length - 1].id;

          return (
            <View key={m.id} style={styles.messageBlock}>
              {/* ---- AVATAR ABOVE BUBBLE ---- */}
              <View
                style={[
                  styles.avatarContainer,
                  isUser ? styles.avatarRight : styles.avatarLeft,
                ]}
              >
                <View style={styles.avatarCircle}>
                  <Text style={{ fontSize: 20 }}>{isUser ? "🧑" : "👨🏻‍🔧"}</Text>
                </View>

                <Text style={styles.avatarLabel}>
                  {isUser ? "User" : "AC-Assistant"}
                </Text>
              </View>
              {/* ---- MESSAGE BUBBLE ---- */}
              <View
                style={[
                  styles.bubble,
                  isUser ? styles.userBubble : styles.botBubble,
                  isUser ? styles.bubbleRight : styles.bubbleLeft,
                ]}
              >
                {m.from === "user-voice" ? (
                  <VoiceNoteBubble uri={m.uri} />
                ) : (
                  <Text
                    style={{
                      color: isUser ? "#fff" : "#000",
                      fontSize: 14,
                      fontWeight : '400'
                    }}
                  >
                    {m.text}
                  </Text>
                )}
              </View>

              {/* ---- TIMESTAMP ---- */}
              <Text
                style={[
                  styles.timeText,
                  isUser ? styles.timeRight : styles.timeLeft,
                ]}
              >
                01:05 PM
              </Text>

              {/* ---- INLINE OPTIONS UNDER BOT LAST MESSAGE ---- */}
              {!isUser && isLastBotMessage && (
                <View
                  style={[
                    styles.inlineOptions,
                    step == 0 && { flexDirection: "row" },
                    step == 1 && { gap : 8 },
                  ]}
                >
                  {renderOptions()}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Options */}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F2F7FF",
    padding: 12,
  },

  /* Each message group block */
  messageBlock: {
    marginBottom: 25,
  },

  /* ========================
        AVATAR ABOVE BUBBLE
     ======================== */

  avatarContainer: {
    width: "100%",
    marginBottom: 6,
  },

  avatarLeft: {
    alignItems: "flex-start",
  },

  avatarRight: {
    alignItems: "flex-end",
  },

  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#fff",
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ========================
            BUBBLES
     ======================== */

  bubble: {
    maxWidth: "78%",
    padding: 12,
    borderRadius: 12,
  },

  bubbleLeft: {
    alignSelf: "flex-start",
  },

  bubbleRight: {
    alignSelf: "flex-end",
  },

  botBubble: {
    backgroundColor: "#E6F1FF",
    borderWidth: 1,
    borderColor: "#D3E5FF",
  },

  userBubble: {
    backgroundColor: "#027CC7",
  },

  /* ========================
           TIMESTAMP
     ======================== */

  timeText: {
    fontSize: 11,
    color: "#7A869A",
    marginTop: 4,
  },

  timeLeft: {
    alignSelf: "flex-start",
  },

  timeRight: {
    alignSelf: "flex-end",
  },

  /* ========================
           INLINE OPTIONS
     ======================== */

  inlineOptions: {
    marginTop: 10,
    width: "100%",
  },

  optionBtn: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#DDE7FF",
    elevation: 2,
  },

  optionText: {
    color: "#1A2A3A",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "left",
  },
});






