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

import { moderateScale, scale, verticalScale } from "../../utils/scaling";
import { useChatGPTTyping } from "../../hooks/useChatGptTyping";
import { useAddress } from "../../hooks/useAddress";
import AddressComponent from "./AddressForm";
import TypingDots from "./TypingDots";
import BadgeCard from "./BadgeCard";
import { ServiceData } from "../../constants/types";
import { ConversationBookingResponse, createConversationBooking, CreateConversationBookingPayload } from "../../utils/bookingApi";
import { useProfile } from "../../hooks/useProfile";

/* ---------------- TYPES ---------------- */

type Message = {
  id: string;
  from: "bot" | "user";
  text: string;
  stepIndex: number;
  options?: StepOption[];
};

type StepOption = {
  id: string;
  label: string;
  value: any;
  stepIndex: number;
};

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

/* ---------------- COMPONENT ---------------- */

export default function Chatbot6({
  serviceObject,
  onClose,
}: {
  serviceObject: { data: ServiceData; zipcode: string };
  onClose: () => void;
}) {
  const service = serviceObject.data;
  const steps = service.conversationSteps;

  const { addresses, setSelectedAddress, selectedAddress, setAddresses } =
    useAddress();
  const { userId } = useProfile();
  const { showTypingIndicator, typeText } = useChatGPTTyping(true);
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [quantity, setQuantity] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [notesSubmitted, setNotesSubmitted] = useState(false);
  const [response, setResponse] = useState<ConversationBookingResponse>();

  /* ---------------- HELPERS ---------------- */

  const renderTemplate = (template: string) => {
    const vars: any = {
      agentName: steps[currentStep]?.agentName ?? "",
      serviceName: service.name,
      zipcode: serviceObject.zipcode,
      estimatedTime: service.estimatedTime,
      selectedBrand: selectedBrand?.name ?? "",
      selectedOption: selectedOption?.name ?? "",
      quantity: quantity ?? "",
      address: `${selectedAddress.label},${selectedAddress.address.street}`,
    };

    return template.replace(/{{(.*?)}}/g, (_, k) => vars[k.trim()] ?? "");
  };

  const scrollToBottom = () =>
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);

  /* ---------------- BOT MESSAGE ---------------- */

  const pushBotMessage = async (
    rawText: string,
    stepIndex: number,
    options: StepOption[]
  ) => {
    const id = Date.now().toString();

    showTypingIndicator(() => {
      setMessages((p) => [
        ...p,
        { id: `${id}-dots`, from: "bot", text: "__DOTS__", stepIndex },
      ]);
    });

    await new Promise((r) => setTimeout(r, 400));

    setMessages((p) => p.filter((m) => m.id !== `${id}-dots`));
    setMessages((p) => [...p, { id, from: "bot", text: "", stepIndex }]);

    typeText(
      renderTemplate(rawText),
      (t) => {
        setMessages((p) => p.map((m) => (m.id === id ? { ...m, text: t } : m)));
        scrollToBottom();
      },
      () => {
        setMessages((p) => p.map((m) => (m.id === id ? { ...m, options } : m)));
      }
    );
  };

  const pushUserMessage = (text: string, stepIndex: number) => {
    setMessages((p) => [
      ...p,
      { id: Date.now().toString(), from: "user", text, stepIndex },
    ]);
    scrollToBottom();
  };

const handleCreateBooking = async () => {
  if (!selectedOption || !quantity || !selectedAddress) {
    console.warn("Missing booking data");
    return;
  }

  const payload: CreateConversationBookingPayload = {
    userId,
    zipcode: serviceObject.zipcode,

    selectedOption: {
      optionId: selectedOption._id,
      name: selectedOption.name,
      price: selectedOption.singlePrice,
    },

 

    selectedBrand: selectedBrand
      ? {
          brandId: selectedBrand._id,
          name: selectedBrand.name,
        }
      : undefined,

    quantity, // ✅ number now

    address: {
      street: selectedAddress.address.street,
      city: selectedAddress.address.city,
      state: selectedAddress.address.state,
      zipcode: selectedAddress.address.zipcode,
    },

    notes,
    preferredDate: (() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
})(),
    preferredTime : '10:00 AM',
    paymentMethod: "cash",
  };

  console.log(
    "📦 Booking Payload (NEW):",
    JSON.stringify(payload, null, 2)
  );

  try {
    const res = await createConversationBooking(service._id, payload);
    
      res && setResponse(res)
    

    console.log("✅ Booking created:", res.data);
    setShowBadge(true);
  } catch (err: any) {
    console.error("❌ Booking failed:", err.message);
  }
};


  /* ---------------- OPTIONS ---------------- */

  const getOptionsForStep = (stepIndex: number): StepOption[] => {
    const step = steps[stepIndex];
    if (!step) return [];

    switch (step.stepType) {
      case "GREETING":
        return [
          { id: "start", label: "Let’s get started", value: true, stepIndex },
        ];

      case "BRAND_SELECTION":
        return service.brands.map((b) => ({
          id: b._id,
          label: b.name,
          value: b,
          stepIndex,
        }));

      case "OPTION_SELECTION":
        return service.options.map((o) => ({
          id: o._id,
          label: `${o.name} - ₹${o.singlePrice}`,
          value: o,
          stepIndex,
        }));

      case "QUANTITY_SELECTION":
        return [1, 2, 3].map((q) => ({
          id: `q-${q}`,
          label: `${q} Unit${q > 1 ? "s" : ""}`,
          value: q,
          stepIndex,
        }));

      case "QUANTITY_CONFIRM":
        return [
          { id: "qc", label: "Confirm", value: "confirm", stepIndex },
          { id: "qx", label: "Cancel", value: "cancel", stepIndex },
        ];

      case "ADDRESS_INPUT":
        return [
          ...addresses.map((a, i) => ({
            id: `addr-${i}`,
            label: `${a.label} - ${a.address.street}`,
            value: a,
            stepIndex,
          })),
          { id: "new", label: "📍 Add New Address", value: "new", stepIndex },
        ];

      case "FINAL_CONFIRMATION":
        return [{ id: "book", label: "Book Now", value: "book", stepIndex }];

      default:
        return [];
    }
  };

  /* ---------------- RESET STATE ---------------- */

  const resetStateAfterStep = (stepIndex: number) => {
    const after = (type: string) =>
      steps.findIndex((s) => s.stepType === type) > stepIndex;

    if (after("BRAND_SELECTION")) setSelectedBrand(null);
    if (after("OPTION_SELECTION")) setSelectedOption(null);
    if (after("QUANTITY_SELECTION")) setQuantity(null);
    if (after("NOTES_INPUT")) {
      setNotes("");
      setNotesSubmitted(false);
    }
    if (after("ADDRESS_INPUT")) setShowAddressForm(false);
  };

  /* ---------------- OPTION HANDLER ---------------- */

  const applySelection = (opt: StepOption) => {
    const stepType = steps[opt.stepIndex].stepType;

    switch (stepType) {
      case "BRAND_SELECTION":
        setSelectedBrand(opt.value);
        break;
      case "OPTION_SELECTION":
        setSelectedOption(opt.value);
        break;
      case "QUANTITY_SELECTION":
        setQuantity(opt.value);
        break;
      case "ADDRESS_INPUT":
        setSelectedAddress(opt.value);
        break;
      case "FINAL_CONFIRMATION":
        handleCreateBooking();
        break;
    }
  };

  const handleOptionPress = (opt: StepOption) => {
    if (showBadge) return; // Lock editing after confirmation

    const targetStep = opt.stepIndex;
    const stepType = steps[targetStep].stepType;

    if (stepType === "ADDRESS_INPUT" && opt.value === "new") {
      setShowAddressForm(true);
      return;
    }

    applySelection(opt);

    // Filter messages: keep all < targetStep, and only bot for === targetStep (remove old user for this step)
    setMessages((prev) =>
      prev.filter(
        (m) =>
          m.stepIndex < targetStep ||
          (m.stepIndex === targetStep && m.from === "bot")
      )
    );

    resetStateAfterStep(targetStep);

    pushUserMessage(opt.label, targetStep);
    setCurrentStep(targetStep + 1);
    scrollToBottom();
  };

  /* ---------------- STEP FLOW ---------------- */

  useEffect(() => {
    if (!steps[currentStep] || showBadge) return;

    // Check if we already have a completed bot message (with text) for this exact step
    const hasCompletedBotMessage = messages.some(
      (m) =>
        m.from === "bot" &&
        m.stepIndex === currentStep &&
        m.text !== "" &&
        m.text !== "__DOTS__"
    );

    if (hasCompletedBotMessage) return;

    // If we have typing dots already, don't restart the whole process
    const hasTypingDots = messages.some(
      (m) => m.text === "__DOTS__" && m.stepIndex === currentStep
    );

    if (hasTypingDots) return;

    // Otherwise, start fresh typing for this step
    pushBotMessage(
      steps[currentStep].messageTemplate,
      currentStep,
      getOptionsForStep(currentStep)
    );
  }, [currentStep, messages]);

  const handleAddressSaved = (address: any) => {
    setAddresses((prev) => [...prev, address]);

    // setShowAddressForm(false);

    // 🔥 Force refresh of address options
    //   setTimeout(()=>{
    //     setMessages((prev) =>
    //     prev.map((m) => {
    //       if (
    //         m.from === "bot" &&
    //         steps[m.stepIndex]?.stepType === "ADDRESS_INPUT"
    //       ) {
    //         return {
    //           ...m,
    //           options: getOptionsForStep(m.stepIndex),
    //         };
    //       }
    //       return m;
    //     })
    //   )
    //   },500)
  };

  // useEffect(() => {
  //   console.log("Address changed");

  //   setMessages((prev) =>
  //     prev.map((m) => {
  //       if (
  //         m.from === "bot" &&
  //         steps[m.stepIndex]?.stepType === "ADDRESS_INPUT"
  //       ) {
  //         return {
  //           ...m,
  //           options: getOptionsForStep(m.stepIndex),
  //         };
  //       }
  //       return m;
  //     })
  //   );
  // }, [addresses]);

  /* ---------------- RENDER ---------------- */

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Text style={{ fontSize: moderateScale(20) }}>❄️</Text>
            </View>

            <View>
              <Text style={styles.headerTitle}>{service.name}</Text>
              <Text style={styles.headerSubtitle}>{service.description}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={{ fontSize: moderateScale(20), color: "#fff" }}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.wrapper}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {messages.map((m) => {
          const stepType = steps[m.stepIndex]?.stepType;

          return (
            <View key={m.id} style={{ marginBottom: verticalScale(16) }}>
              <View
                style={[
                  styles.bubble,
                  m.from === "user" ? styles.userBubble : styles.botBubble,
                ]}
              >
                {m.text === "__DOTS__" ? (
                  <TypingDots />
                ) : (
                  <Text style={{ fontSize: moderateScale(16) }}>{m.text}</Text>
                )}
              </View>

              {m.options && (
                <View
                  style={[
                    styles.options,
                    (stepType == "BRAND_SELECTION" ||
                      stepType == "QUANTITY_CONFIRM") && {
                      flexDirection: "row",
                      flexWrap: "wrap",
                    },
                  ]}
                >
                  {m.options.map((o, index) => {
                    const color = TYPE_COLORS[index % TYPE_COLORS.length];
                    const newColor = NEW_COLORS[index % TYPE_COLORS.length];
                    return (
                      <TouchableOpacity
                        key={o.id}
                        style={[
                          styles.optionBtn,
                          (stepType == "OPTION_SELECTION" ||
                            stepType == "QUANTITY_SELECTION" ||
                            stepType == "ADDRESS_INPUT") && {
                            backgroundColor: color.bg,
                            borderColor: color.border,
                          },
                          stepType == "QUANTITY_CONFIRM" && {
                            backgroundColor: newColor.bg,
                            borderColor: newColor.border,
                            flex: 1,
                          },
                          stepType == "BRAND_SELECTION" && {
                            width: scale(117),
                            alignItems: "center",
                            backgroundColor: "#C8E6FF1A",
                            borderColor: "#C8E6FF80",
                          },
                        ]}
                        onPress={() => handleOptionPress(o)}
                      >
                        <Text>{o.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {stepType === "ADDRESS_INPUT" && showAddressForm && (
                <AddressComponent onAddressSaved={handleAddressSaved} />
              )}

              {stepType === "NOTES_INPUT" &&
                m.stepIndex === currentStep &&
                !notesSubmitted && (
                  <View style={styles.notesBox}>
                    <TextInput
                      placeholder="Write notes..."
                      value={notes}
                      onChangeText={setNotes}
                      style={styles.input}
                    />

                    <TouchableOpacity
                      style={styles.sendBtn}
                      onPress={() => {
                        setNotesSubmitted(true);
                        pushUserMessage(notes, currentStep);
                        setNotes("");
                        setCurrentStep((s) => s + 1);
                      }}
                    >
                      <Text style={{ color: "#fff" }}>Send</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setNotesSubmitted(true);
                        setCurrentStep((s) => s + 1);
                      }}
                    >
                      <Text style={styles.skip}>Skip notes</Text>
                    </TouchableOpacity>
                  </View>
                )}
            </View>
          );
        })}

        {showBadge && response && <BadgeCard response={response} />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  header: {
    height: verticalScale(55),
    width: "100%",
    backgroundColor: "#027CC7",
    paddingHorizontal: scale(8),
    alignItems: "center",
    justifyContent: "center",
    // marginBottom: verticalScale(23),
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  headerIcon: {
    width: scale(39),
    height: scale(39),
    borderRadius: scale(21),
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(8),
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: moderateScale(14),
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#fff",
    fontSize: moderateScale(12),
  },
  closeBtn: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  wrapper: {
    flex: 1,
    backgroundColor: "#F2F7FF",
    padding: scale(10),
    borderWidth: 1,
  },
  bubble: { padding: scale(12), borderRadius: scale(10), maxWidth: "85%" },
  botBubble: { backgroundColor: "#DAF1FF", alignSelf: "flex-start" },
  userBubble: { backgroundColor: "#027CC7", alignSelf: "flex-end" },
  options: { marginTop: verticalScale(8), gap: scale(6) },
  optionBtn: {
    padding: scale(10),
    borderWidth: 1,
    borderRadius: scale(8),
    backgroundColor: "#fff",
  },
  notesBox: { marginTop: verticalScale(8) },
  input: {
    borderWidth: 1,
    borderRadius: scale(8),
    padding: scale(10),
    backgroundColor: "#fff",
  },
  sendBtn: {
    marginTop: verticalScale(6),
    backgroundColor: "#027CC7",
    padding: scale(10),
    borderRadius: scale(8),
    alignItems: "center",
  },
  skip: {
    marginTop: verticalScale(6),
    color: "#027CC7",
    textAlign: "center",
  },
});
