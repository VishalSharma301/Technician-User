import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import {
  AddressCardType,
  ServiceBrand,
  ServiceData,
  ServiceOption,
} from "../../constants/types";
import { useCart } from "../../hooks/useCart";
import { scale, moderateScale, verticalScale } from "../../utils/scaling";
import { useAddress } from "../../hooks/useAddress";
import AddressComponent from "./AddressForm";
import { useChatGPTTyping } from "../../hooks/useChatGptTyping";
import TypingDots from "./TypingDots";

const EXTRA_UNIT_PRICE = 590;

const TYPE_COLORS = [
  { bg: "#9FE8C41A", border: "#9FE8C480" },
  { bg: "#EAE2B733", border: "#EAE2B780" },
  { bg: "#C8E6FF1A", border: "#C8E6FF80" },
  { bg: "#F6B36B1A", border: "#F77F0033" },
];

const NEW_COLORS = [
  { bg: "#9FE8C41A", border: "#00CDBD" },
  { bg: "#FFE5E5", border: "#FF0000" },
];

export default function ChatbotBooking({
  service,
  close,
}: {
  service: ServiceData;
  close: () => void;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [step, setStep] = useState(0);
  const { addresses, setAddresses, selectedAddress, setSelectedAddress } =
    useAddress();
  const [manualAddressMode, setManualAddressMode] = useState(false);

  const [selectedBrand, setSelectedBrand] = useState<ServiceBrand | null>(null);
  const [selectedType, setSelectedType] = useState<ServiceOption | null>(null);
  const [selectedPricing, setSelectedPricing] = useState("single");
  const [addMoreQuantity, setAddMoreQuantity] = useState(0);

  const [manualMode, setManualMode] = useState(false);
  const [manualQtyInput, setManualQtyInput] = useState("");

  const [descriptionInput, setDescriptionInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const { isTypingIndicator, showTypingIndicator, typeText } =
  useChatGPTTyping();

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

  const totalUnits = () =>
    manualMode && manualQtyInput ? Number(manualQtyInput) : 1 + addMoreQuantity;

  const calculateTotal = () => {
    const total = totalUnits();
    if (total <= 3) return PRICING[total - 1]?.price ?? 0;

    const triplePrice = PRICING[2].price;
    return triplePrice + (total - 3) * EXTRA_UNIT_PRICE;
  };

 const pushBotMessage = (fullText: string) => {
  // 1. Push a temporary dot bubble (typing indicator)
  const dotMessageId = Date.now().toString();

  showTypingIndicator(() => {
    setMessages((prev) => [
      ...prev,
      {
        id: dotMessageId,
        from: "bot",
        text: "__DOTS__", // special marker
      },
    ]);
  });

  setIsTyping(true)

  // 2. After 800ms delay, replace dots with real typing
  setTimeout(() => {
    // Remove dot bubble
    setMessages((prev) => prev.filter((m) => m.id !== dotMessageId));

    // Now add real empty message for typing
    const realId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: realId,
        from: "bot",
        text: "",
        time: "",
      },
    ]);

    // 3. Start typing it naturally
    typeText(
      fullText,
      (typedText : string) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === realId
              ? { ...m, text: typedText }
              : m
          )
        );
        scrollRef.current?.scrollToEnd({ animated: true });
      },
      () => {
        // On finish
        setMessages((prev) =>
          prev.map((m) =>
            m.id === realId
              ? {
                  ...m,
                  time: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  }),
                }
              : m
          )
        );
        setIsTyping(false);
      }
    );
  }, 800);
};

  const pushUserMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        from: "user",
        text,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      },
    ]);
  };

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

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

  useEffect(() => {
    if (messages.length === 0) return;

    if (step === 1) pushBotMessage("Select the type of service you need.");
    if (step === 2) pushBotMessage("How many units do you want serviced?");
    if (step === 3)
      pushBotMessage(
        "Please describe your issue or request. You can type or send a voice note."
      );
    if (step === 4) pushBotMessage("Please select your service address.");
    if (step === 5)
      pushBotMessage(
        `Your total is ₹${calculateTotal()}. Should I add this to your cart?`
      );
  }, [step]);

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

  const handleQuantitySelection = (units: number) => {
    // Push a clear user message using the concrete units value
    pushUserMessage(`Selected ${units} unit${units > 1 ? "s" : ""}`);

    // update state so UI and later calculations still have the value
    setAddMoreQuantity(units - 1);
    setManualMode(false);

    // move to next step after small delay for UX
    setTimeout(() => setStep(3), 250);
  };

  const handleDescriptionSubmit = () => {
    if (!descriptionInput.trim()) return;
    pushUserMessage(descriptionInput.trim());
    setDescriptionInput("");
    setTimeout(() => setStep(4), 200); // STEP 4 is Address
  };

  const handleSelectAddress = (addr : AddressCardType) => {
    pushUserMessage(`${addr.label}, ${addr.address.street}`);
    setSelectedAddress(addr);
    setTimeout(() => setStep(5), 300); // Move to final Add-to-cart step
  };

  const handleAddToCart = () => {
    pushUserMessage("Add to cart");
    proceedAddToCart();
  };

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

  const renderOptions = () => {
    

    if (step === 0)
      return service.brands.map((b) => (
        <TouchableOpacity
          key={b._id}
          style={[
            styles.optionBtn,
            {
              paddingHorizontal: scale(4),
              height: verticalScale(45.29),
              width: scale(115.9),
              alignItems: "center",
              borderColor: "#C8E6FF80",
              backgroundColor: "#C8E6FF1A",
            },
          ]}
          onPress={() => handleBrand(b)}
        >
          <Text numberOfLines={1} style={styles.optionText}>
            {b.name}
          </Text>
        </TouchableOpacity>
      ));

    if (step === 1) {
      return TYPES.map((t, index) => {
        const color = TYPE_COLORS[index % TYPE_COLORS.length];

        return (
          <TouchableOpacity
            key={t._id}
            style={[
              styles.optionBtn,
              { backgroundColor: color.bg, borderColor: color.border },
            ]}
            onPress={() => handleType(t)}
          >
            <Text style={styles.optionText}>{t.name}</Text>
          </TouchableOpacity>
        );
      });
    }

    // ---------------------- STEP 2 → QUANTITY ----------------------
    if (step === 2) {
      return (
        <View style={{ gap: verticalScale(8) }}>
          {PRICING.map((p, index) => {
            const color = TYPE_COLORS[index % TYPE_COLORS.length];
            return (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.optionBtn,
                  { backgroundColor: color.bg, borderColor: color.border },
                ]}
                // onPress={() => {
                //   setSelectedPricing(p.id);
                //   setManualMode(false);
                //   setAddMoreQuantity(p.count - 1);
                //   handleQuantitySelection();
                // }}
                onPress={() => {
                  setSelectedPricing(p.id);
                  handleQuantitySelection(p.count); // <-- pass units directly
                }}
              >
                <Text style={styles.optionText}>
                  {p.title} - ₹{p.price}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* MANUAL QUANTITY */}
          <View style={{ marginTop: verticalScale(0) }}>
            <TouchableOpacity
              style={[
                styles.optionBtn,
                {
                  backgroundColor: TYPE_COLORS[3].bg,
                  borderColor: TYPE_COLORS[3].border,
                },
              ]}
              onPress={() => setManualMode(true)}
            >
              <Text style={[styles.optionText, { color: "#000" }]}>
                Enter Quantity Manually
              </Text>
            </TouchableOpacity>

            {manualMode && (
              <View style={{ marginTop: verticalScale(10) }}>
                <TextInput
                  keyboardType="numeric"
                  placeholder="Enter number"
                  value={manualQtyInput}
                  onChangeText={setManualQtyInput}
                  style={styles.input}
                />

                <TouchableOpacity
                  style={[
                    styles.optionBtn,
                    {
                      backgroundColor: "#014e0789",
                      borderColor: "#014e07",
                      marginTop: verticalScale(10),
                      opacity: !manualQtyInput ? 0.3 : 1,
                    },
                  ]}
                  disabled={!manualQtyInput}
               onPress={() => {
  const units = Number(manualQtyInput);
  if (!units || units < 1 || units > 10) {
    Alert.alert("Use a number between 1 and 10");
    return;
  }

  // set selected pricing to manual (if you want) and pass units
  setSelectedPricing("manual");
  handleQuantitySelection(units);
}}
                >
                  <Text style={styles.optionText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      );
    }

    // ---------------------- STEP 3 → DESCRIPTION ----------------------
    if (step === 3) {
      return (
        <View style={{ padding: scale(10) }}>
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
        </View>
      );
    }

    // ---------------------- ⭐ STEP 4 → ADDRESS SELECTION ⭐ ----------------------
    if (step === 4) {
      return (
        <View style={{ width: "100%", gap: verticalScale(8) }}>
          {addresses.map((addr, index) => {
            const color = TYPE_COLORS[index % TYPE_COLORS.length];

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionBtn,
                  {
                    backgroundColor: color.bg,
                    borderColor: color.border,
                  },
                ]}
                onPress={() => handleSelectAddress(addr)}
              >
                <Text style={styles.optionText}>
                  {addr.label} - {addr.address.street}, {addr.address.city}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Add new address */}
          <TouchableOpacity
            style={[
              styles.optionBtn,
              {
                backgroundColor: TYPE_COLORS[3].bg,
                borderColor: TYPE_COLORS[3].border,
              },
            ]}
            onPress={() => setManualAddressMode(true)}
          >
            <Text style={[styles.optionText, { color: "#000" }]}>
              📍Add New Address
            </Text>
          </TouchableOpacity>

          {manualAddressMode && <AddressComponent />}
        </View>
      );
    }

    // ---------------------- STEP 5 → ADD TO CART ----------------------
    if (step === 5) {
      return (
        <View
          style={{
            flexDirection: "row",
            gap: scale(8),
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            style={[
              styles.optionBtn,
              {
                width: scale(176.5),
                height: verticalScale(37.39),
                backgroundColor: NEW_COLORS[0].bg,
                borderColor: NEW_COLORS[0].border,
              },
            ]}
            onPress={handleAddToCart}
          >
            <Text style={styles.optionText}>Add to Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionBtn,
              {
                width: scale(176.5),
                height: verticalScale(37.39),
                backgroundColor: NEW_COLORS[1].bg,
                borderColor: NEW_COLORS[1].border,
              },
            ]}
            onPress={close}
          >
            <Text style={styles.optionText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Text style={{ fontSize: moderateScale(20) }}>❄️</Text>
            </View>

            <View>
              <Text style={styles.headerTitle}>AC Service Booking</Text>
              <Text style={styles.headerSubtitle}>
                Quick & reliable AC service at your doorstep
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={close} style={styles.closeBtn}>
            <Text style={{ fontSize: moderateScale(20), color: "#fff" }}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1, paddingHorizontal: scale(8) }}
      >
        {messages.map((m, index) => {
          const isUser = m.from === "user" || m.from === "user-voice";
          const isLastBotMessage =
            !isUser &&
            messages.length > 0 &&
            messages[index].id === messages[messages.length - 1].id;

          return (
            <View key={m.id} style={styles.messageBlock}>
              <View
                style={[
                  styles.avatarContainer,
                  isUser ? styles.avatarRight : styles.avatarLeft,
                ]}
              >
                <View style={styles.avatarCircle}>
                  <Text style={{ fontSize: moderateScale(20) }}>
                    {isUser ? "🧑" : "👨🏻‍🔧"}
                  </Text>
                </View>

                <Text style={styles.avatarLabel}>
                  {isUser ? "User" : "AC-Assistant"}
                </Text>
              </View>

            <View
  style={[
    styles.bubble,
    isUser ? styles.userBubble : styles.botBubble,
    isUser ? styles.bubbleRight : styles.bubbleLeft,
  ]}
>
  {/* 🔥 SHOW DOTS IF m.text IS THE TYPING INDICATOR */}
  {m.text === "__DOTS__" ? (
    <TypingDots />
  ) : (
    <Text
      style={{
        color: isUser ? "#fff" : "#000",
        fontSize: moderateScale(14),
        fontWeight: "400",
      }}
    >
      {m.text}
    </Text>
  )}
</View>

              <Text
                style={[
                  styles.timeText,
                  isUser ? styles.timeRight : styles.timeLeft,
                ]}
              >
                {m.time}
              </Text>

              {!isUser && isLastBotMessage && !isTyping && (
                <View
                  style={[
                    styles.inlineOptions,
                    step == 0 && { flexDirection: "row" },
                    step == 1 && { gap: scale(8) },
                  ]}
                >
                  {renderOptions()}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F2F7FF",
    paddingBottom: verticalScale(50),
  },

  header: {
    height: verticalScale(55),
    width: "100%",
    backgroundColor: "#027CC7",
    paddingHorizontal: scale(8),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(23),
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: scale(4),
    shadowOffset: { width: 0, height: verticalScale(3) },
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  headerIcon: {
    width: scale(39),
    height: scale(39),
    borderRadius: scale(21),
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(8),
    elevation: 3,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: moderateScale(14),
    fontWeight: "700",
  },

  headerSubtitle: {
    color: "#ffffff",
    fontSize: moderateScale(12),
    marginTop: verticalScale(0),
  },

  closeBtn: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },

  messageBlock: {
    marginBottom: verticalScale(25),
  },

  avatarContainer: {
    width: "100%",
    marginBottom: verticalScale(6),
    flexDirection: "row",
  },
  avatarLeft: { justifyContent: "flex-start" },
  avatarRight: { justifyContent: "flex-end" },

  avatarCircle: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: "#fff",
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarLabel: {
    fontSize: moderateScale(13),
    color: "#3A4A5A",
    marginLeft: scale(6),
    alignSelf: "center",
  },

  sendTextBtn: {
    height: verticalScale(42),
    paddingHorizontal: scale(16),
    backgroundColor: "#027CC7",
    borderRadius: scale(8),
    alignItems: "center",
    justifyContent: "center",
    marginTop: verticalScale(10),
    alignSelf: "flex-end",
    elevation: 2,
  },

  bubble: {
    width: "90%",
    padding: scale(12),
    borderBottomLeftRadius: scale(12),
    borderBottomRightRadius: scale(12),
  },

  bubbleLeft: {
    alignSelf: "flex-start",
    borderTopRightRadius: scale(12),
  },

  bubbleRight: {
    alignSelf: "flex-end",
    borderTopLeftRadius: scale(12),
  },

  botBubble: {
    backgroundColor: "#DAF1FF",
    borderWidth: 1,
    borderColor: "#D3E5FF",
  },

  userBubble: {
    backgroundColor: "#027CC7",
  },

  timeText: {
    fontSize: moderateScale(11),
    color: "#7A869A",
    marginTop: verticalScale(4),
  },

  timeLeft: { alignSelf: "flex-start" },
  timeRight: { alignSelf: "flex-end" },

  inlineOptions: {
    marginTop: verticalScale(10),
    width: "100%",
    gap: scale(8),
  },

  optionBtn: {
    height: verticalScale(52),
    width: "100%",
    paddingHorizontal: scale(16),
    borderRadius: scale(8),
    borderWidth: 1,
    justifyContent: "center",
  },

  descriptionInput: {
    width: "100%",
    minHeight: verticalScale(45),
    borderWidth: 1,
    borderColor: "#C7D7E8",
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    backgroundColor: "#FFFFFF",
    fontSize: moderateScale(14),
    color: "#000",
  },

  input: {
    width: "100%",
    height: verticalScale(45),
    borderWidth: 1,
    borderColor: "#B8C4D6",
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
    backgroundColor: "#FFFFFF",
    fontSize: moderateScale(14),
    color: "#000",
  },

  optionText: {
    color: "#000",
    fontSize: moderateScale(14),
    fontWeight: "500",
    textAlign: "left",
  },
});
