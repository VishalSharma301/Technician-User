import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { moderateScale, scale, verticalScale } from "../../utils/scaling";
import { useChatGPTTyping } from "../../hooks/useChatGptTyping";
import { useAddress } from "../../hooks/useAddress";
import { useProfile } from "../../hooks/useProfile";
import AddressComponent from "./AddressForm";
import TypingDots from "./TypingDots";
import BadgeCard from "./BadgeCard";
import {
  createConversationBooking,
  ConversationBookingResponse,
  CreateConversationBookingPayload,
} from "../../utils/bookingApi";

/* ---------------- TYPES ---------------- */

type StepOption = {
  id: string;
  label: string;
  value: any;
};

type Message = {
  id: string;
  from: "bot" | "user";
  text: string;
  stepIndex: number;
  options?: StepOption[];
  time: string;
};

/* ---------------- COMPONENT ---------------- */

export default function Chatbot8({
  serviceObject,
  onClose,
}: {
  serviceObject: any;
  onClose: () => void;
}) {
  const { userId } = useProfile();
  const { addresses, setAddresses, setSelectedAddress, selectedAddress } =
    useAddress();
  const { showTypingIndicator, typeText } = useChatGPTTyping(true);

  const steps = serviceObject.conversation.steps;
  const service = serviceObject.service;

  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [selectedCapacity, setSelectedCapacity] = useState<any>(null);

  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState("");
  const [notesInputActive, setNotesInputActive] = useState(false);

  const [followUpQueue, setFollowUpQueue] = useState<any[]>([]);
  const [currentFollowUp, setCurrentFollowUp] = useState<any>(null);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [manualQty, setManualQty] = useState("");
  const [manualQtyActive, setManualQtyActive] = useState(false);

  const [response, setResponse] = useState<ConversationBookingResponse | null>(
    null
  );

  /* ---------------- HELPERS ---------------- */

  const time = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const scrollToBottom = () =>
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);

  const unitPrice =
    selectedCapacity?.finalPrice ??
    selectedProblem?.estimatedPrice ??
    selectedOption?.basePrice ??
    0;

  const totalPrice = quantity * unitPrice;

  /* ---------------- BOT MESSAGE ---------------- */

  const pushBotMessage = async (
    text: string,
    stepIndex: number,
    options?: StepOption[]
  ) => {
    const id = Date.now().toString();

    showTypingIndicator(() => {
      setMessages((p) => [
        ...p,
        {
          id: `${id}-dots`,
          from: "bot",
          text: "__DOTS__",
          stepIndex,
          time: time(),
        },
      ]);
    });

    await new Promise((r) => setTimeout(r, 400));

    setMessages((p) => p.filter((m) => m.id !== `${id}-dots`));
    setMessages((p) => [
      ...p,
      { id, from: "bot", text: "", stepIndex, time: time() },
    ]);

    typeText(
      text,
      (t) =>
        setMessages((p) => p.map((m) => (m.id === id ? { ...m, text: t } : m))),
      () =>
        setMessages((p) => p.map((m) => (m.id === id ? { ...m, options } : m)))
    );

    scrollToBottom();
  };

  const pushUserMessage = (text: string) => {
    setMessages((p) => [
      ...p,
      {
        id: Date.now().toString(),
        from: "user",
        text,
        stepIndex: currentStepIndex,
        time: time(),
      },
    ]);
    scrollToBottom();
  };

  /* ---------------- OPTIONS ---------------- */

  const resolveOptionsFromStep = (step: any): StepOption[] => {
    switch (step.stepType) {
      case "GREETING":
        return [{ id: "start", label: "Let’s get started", value: true }];

      case "PROBLEM_SELECTION":
        return step.data.problems.map((p: any) => ({
          id: p._id,
          label: p.name,
          value: p,
        }));

      case "CAPACITY_SELECTION":
        return selectedOption?.capacityVariants?.map((v: any) => ({
          id: v.id,
          label: `${v.displayName} (₹${v.finalPrice})`,
          value: v,
        }));

      case "OPTION_SELECTION":
        return step.data.options.map((o: any) => ({
          id: o.id,
          label: o.name,
          value: o,
        }));

      case "BRAND_SELECTION":
        return step.data.brands.map((b: any) => ({
          id: b.id,
          label: b.name,
          value: b,
        }));

      case "QUANTITY_SELECTION":
        return [
          { id: "1", label: "1 Unit", value: 1 },
          { id: "2", label: "2 Units", value: 2 },
          { id: "3", label: "3 Units", value: 3 },
          { id: "manual", label: "Set Manual Quantity", value: "manual" },
        ];

      case "QUANTITY_CONFIRM":
        return [
          { id: "confirm", label: "Confirm", value: "confirm" },
          { id: "cancel", label: "Cancel", value: "cancel" },
        ];

      case "ADDRESS_INPUT":
        return [
          ...addresses.map((a, i) => ({
            id: `addr-${i}`,
            label: `${a.label} - ${a.address.street}`,
            value: a,
          })),
          { id: "new", label: "Add New Address", value: "new" },
        ];

      case "FINAL_CONFIRMATION":
        return [{ id: "book", label: "Book Now", value: "book" }];

      default:
        return [];
    }
  };

  /* ---------------- OPTION HANDLER ---------------- */

  const handleOptionPress = (opt: StepOption) => {
    const step = steps[currentStepIndex];

    pushUserMessage(opt.label);

    if (opt.value === "manual") {
      setManualQtyActive(true);
      return;
    }

    if (step.stepType === "PROBLEM_SELECTION") setSelectedProblem(opt.value);
    if (step.stepType === "OPTION_SELECTION") setSelectedOption(opt.value);
    if (step.stepType === "CAPACITY_SELECTION") setSelectedCapacity(opt.value);
    if (step.stepType === "BRAND_SELECTION") setSelectedBrand(opt.value);
    if (step.stepType === "QUANTITY_SELECTION") setQuantity(opt.value);

    if (step.stepType === "ADDRESS_INPUT") {
      if (opt.value === "new") {
        setShowAddressForm(true);
        return;
      }
      setSelectedAddress(opt.value);
    }

    if (step.stepType === "QUANTITY_CONFIRM") {
      if (opt.value === "cancel") {
        setCurrentStepIndex((s) => s - 1);
        return;
      }
    }

    if (step.stepType === "FINAL_CONFIRMATION") {
      handleBooking();
      return;
    }

    setCurrentStepIndex((s) => s + 1);
  };

  /* ---------------- BOOKING ---------------- */

  const handleBooking = async () => {
    const payload: CreateConversationBookingPayload = {
      userId,
      zipcode: selectedAddress.address.zipcode,
      selectedOption: {
        optionId: selectedOption._id,
        name: selectedOption.name,
        price: unitPrice,
      },
      quantity,
      address: selectedAddress.address,
      notes,
      preferredDate: new Date().toISOString().split("T")[0],
      preferredTime: "10:00 AM",
      paymentMethod: "cash",
    };

    const res = await createConversationBooking(service.id, payload);
    setResponse(res);

    setMessages((p) => [
      ...p,
      {
        id: Date.now().toString(),
        from: "bot",
        text: "__BADGE__",
        stepIndex: currentStepIndex,
        time: time(),
      },
    ]);
  };

  /* ---------------- STEP FLOW ---------------- */

  useEffect(() => {
    const step = steps[currentStepIndex];
    if (!step) return;

    const alreadyRendered = messages.some(
      (m) => m.stepIndex === currentStepIndex && m.from === "bot"
    );
    if (alreadyRendered) return;

    pushBotMessage(
      step.messageTemplate,
      currentStepIndex,
      resolveOptionsFromStep(step)
    );
  }, [currentStepIndex]);

  /* ---------------- RENDER ---------------- */

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* HEADER */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.appIconPlaceholder} />
          <View>
            <Text style={styles.headerTitle}>AC Service Booking</Text>
            <Text style={styles.headerSubtitle}>
              Quick & reliable AC service at your doorstep
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.wrapper}
        contentContainerStyle={{ paddingBottom: verticalScale(120) }}
      >
        {messages.map((m) => (
          <View key={m.id}>
            {m.from === "bot" ? (
              <View style={styles.botCard}>
                <View style={styles.botRow}>
                  <View style={styles.botAvatarPlaceholder} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.botTag}>
                      <Text style={styles.botTagText}>
                        AI - AC Service Assistant
                      </Text>
                    </View>

                    {m.text === "__DOTS__" ? (
                      <TypingDots />
                    ) : m.text === "__BADGE__" ? (
                      response && <BadgeCard response={response} />
                    ) : (
                      <Text style={styles.botText}>{m.text}</Text>
                    )}
                  </View>
                </View>

                <View style={styles.optionsWrap}>
                  {m.options?.map((o) => (
                    <TouchableOpacity
                      key={o.id}
                      style={styles.optionChip}
                      onPress={() => handleOptionPress(o)}
                    >
                      <Text style={styles.optionText}>{o.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.userRow}>
                <View style={styles.userBubble}>
                  <Text style={styles.userText}>{m.text}</Text>
                </View>
              </View>
            )}
          </View>
        ))}

        {manualQtyActive && (
          <View style={styles.notesBox}>
            <TextInput
              placeholder="Enter quantity"
              keyboardType="number-pad"
              value={manualQty}
              onChangeText={setManualQty}
              style={styles.input}
            />
            <TouchableOpacity
              style={styles.sendBtn}
              onPress={() => {
                setQuantity(Number(manualQty));
                setManualQty("");
                setManualQtyActive(false);
                setCurrentStepIndex((s) => s + 1);
              }}
            >
              <Feather name="send" color="#fff" size={18} />
            </TouchableOpacity>
          </View>
        )}

        {showAddressForm && (
          <AddressComponent
            onAddressSaved={(addr: any) => {
              setAddresses((p) => [...p, addr]);
              setSelectedAddress(addr);
              setShowAddressForm(false);
              setCurrentStepIndex((s) => s + 1);
            }}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  topHeader: {
    backgroundColor: "#0A7BC2",
    padding: scale(14),
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: scale(14),
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  appIconPlaceholder: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: "#E6F4FF",
    marginRight: scale(10),
  },
  headerTitle: { color: "#fff", fontWeight: "700" },
  headerSubtitle: { color: "#EAF6FF", fontSize: 11 },
  close: { color: "#fff", fontSize: 18 },

  wrapper: { flex: 1, padding: scale(10), backgroundColor: "#F4F6FA" },

  botCard: {
    backgroundColor: "#fff",
    borderRadius: scale(14),
    padding: scale(12),
    marginBottom: verticalScale(10),
  },
  botRow: { flexDirection: "row" },
  botAvatarPlaceholder: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: "#E6F4FF",
    marginRight: scale(10),
  },
  botTag: {
    backgroundColor: "#E53935",
    paddingHorizontal: scale(10),
    paddingVertical: 3,
    borderRadius: scale(6),
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  botTagText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  botText: { fontSize: 14, color: "#333" },

  optionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(8),
    marginTop: scale(10),
  },
  optionChip: {
    width: "48%",
    padding: scale(10),
    borderRadius: scale(20),
    backgroundColor: "#F4F6FA",
    alignItems: "center",
  },
  optionText: { fontSize: 13 },

  userRow: { alignItems: "flex-end", marginBottom: 10 },
  userBubble: {
    backgroundColor: "#E9F3FF",
    padding: scale(12),
    borderRadius: scale(14),
    maxWidth: "80%",
  },
  userText: { fontSize: 14 },

  notesBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: scale(10),
    padding: scale(10),
    backgroundColor: "#fff",
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#0A7BC2",
    padding: 12,
    borderRadius: 10,
  },
});
