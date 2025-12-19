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
import { ServiceData, ServiceOption } from "../../constants/types";
import {
  ConversationBookingResponse,
  createConversationBooking,
  CreateConversationBookingPayload,
} from "../../utils/bookingApi";
import { useProfile } from "../../hooks/useProfile";
import { Feather } from "@expo/vector-icons";

/* ---------------- TYPES ---------------- */

type Message = {
  id: string;
  from: "bot" | "user";
  text: string;
  stepIndex: number;
  options?: StepOption[];
  time: string; // ✅ add this
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
  const BOOK_AGAIN_STEP = steps.length;
  const { addresses, setSelectedAddress, selectedAddress, setAddresses } =
    useAddress();
  const { userId } = useProfile();
  const { showTypingIndicator, typeText } = useChatGPTTyping();
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<ServiceOption | null>(
    null
  );
  const [quantity, setQuantity] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [notesSubmitted, setNotesSubmitted] = useState(false);
  const [response, setResponse] = useState<ConversationBookingResponse>();
  const startedStepsRef = useRef<Set<number>>(new Set());

  const [manualQty, setManualQty] = useState("");
  const [manualQtyActive, setManualQtyActive] = useState(false);

  const [showBookAgain, setShowBookAgain] = useState(false); // 🔥 NEW

  const bookingCompleted = messages.some(
    (m) => m.from === "bot" && m.text === "__BADGE__"
  );

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
      totalPrice:
        quantity === 1
          ? selectedOption?.singlePrice
          : quantity === 2
          ? selectedOption?.doublePrice
          : quantity === 3
          ? selectedOption?.triplePrice
          : service.basePrice * quantity!,
    };

    return template.replace(/{{(.*?)}}/g, (_, k) => vars[k.trim()] ?? "");
  };

  const scrollToBottom = () =>
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);

  const getFormattedTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

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
        {
          id: `${id}-dots`,
          from: "bot",
          text: "__DOTS__",
          stepIndex,
          time: getFormattedTime(),
        },
      ]);
    });

    await new Promise((r) => setTimeout(r, 400));

    setMessages((p) => p.filter((m) => m.id !== `${id}-dots`));
    setMessages((p) => [
      ...p,
      { id, from: "bot", text: "", stepIndex, time: getFormattedTime() },
    ]);

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
      {
        id: Date.now().toString(),
        from: "user",
        text,
        stepIndex,
        time: getFormattedTime(),
      },
    ]);
    scrollToBottom();
  };

  /* ---------------- BOOK AGAIN LOGIC ---------------- */

  const askBookAgain = () => {
    setShowBookAgain(true);

    pushBotMessage("Do you want to book again?", BOOK_AGAIN_STEP, [
      { id: "yes", label: "Confirm", value: "yes", stepIndex: BOOK_AGAIN_STEP },
      { id: "no", label: "Cancel", value: "no", stepIndex: BOOK_AGAIN_STEP },
    ]);
  };

  const resetToStep2 = () => {
    startedStepsRef.current.clear(); // 🔥 important

    setMessages([]);
    setShowBadge(false);
    setShowBookAgain(false);

    setSelectedBrand(null);
    setSelectedOption(null);
    setQuantity(null);
    setNotes("");
    setNotesSubmitted(false);
    setManualQty("");
    setManualQtyActive(false);

    setCurrentStep(1);
  };
  

  /* ---------------- BOOKING ---------------- */

  const bookingInProgressRef = useRef(false);

  const handleCreateBooking = async () => {
    // 🔒 Prevent double execution
    if (bookingInProgressRef.current) return;

    if (!selectedOption || !quantity || !selectedAddress) return;

    bookingInProgressRef.current = true;

    try {
      const payload: CreateConversationBookingPayload = {
        userId,
        zipcode: serviceObject.zipcode,
        selectedOption: {
          optionId: selectedOption._id,
          name: selectedOption.name,
          price: selectedOption.singlePrice,
        },
        quantity,
        address: selectedAddress.address,
        notes,
        preferredDate: new Date().toISOString().split("T")[0],
        preferredTime: "10:00 AM",
        paymentMethod: "cash",
      };

      const res = await createConversationBooking(service._id, payload);
        console.log('response :', res);
        
      setResponse(res);
      // setShowBadge(true);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          from: "bot",
          text: "__BADGE__",
          stepIndex: steps.length - 1, // FINAL_CONFIRMATION
          time: getFormattedTime(),
        },
      ]);

      // ✅ Push Book Again ONLY ONCE
      setTimeout(() => {
        if (!showBookAgain) {
          askBookAgain();
          scrollToBottom();
        }
      }, 300);
    } catch (err) {
      console.error("Booking failed:", err);
      // optional: show error toast/message here
    } finally {
      bookingInProgressRef.current = false;
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
          label: `${o.name} `,
          value: o,
          stepIndex,
        }));

      case "QUANTITY_SELECTION":
        return [
          ...[1, 2, 3].map((q) => {
            const price =
              q === 1
                ? selectedOption?.singlePrice
                : q === 2
                ? selectedOption?.doublePrice
                : selectedOption?.triplePrice;

            return {
              id: `q-${q}`,
              label: `${q} Unit${q > 1 ? "s" : ""} - ₹${price}`,
              value: q,
              stepIndex,
            };
          }),
          {
            id: "manual",
            label: "Set Manual Quantity",
            value: "manual",
            stepIndex,
          },
        ];

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
        if (opt.value === "manual") {
          setManualQtyActive(true); // 🔥 open input
          return;
        }
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
    if (showBookAgain) {
      pushUserMessage(opt.label, BOOK_AGAIN_STEP);

      if (opt.value === "yes") resetToStep2();
      if (opt.value === "no") onClose();
      return;
    }

    if (showBadge) return;

    const targetStep = opt.stepIndex;
    const stepType = steps[targetStep].stepType;

    if (stepType === "ADDRESS_INPUT" && opt.value === "new") {
      setShowAddressForm(true);
      return;
    }
    if (stepType === "QUANTITY_SELECTION" && opt.value === "manual") {
      applySelection(opt);
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
  if (currentStep === BOOK_AGAIN_STEP) return;
  if (!steps[currentStep] || showBadge) return;

  // Check if a completed bot message already exists for this step
  const hasCompletedBotMessage = messages.some(
    (m) =>
      m.from === "bot" &&
      m.stepIndex === currentStep &&
      m.text !== "" &&
      m.text !== "__DOTS__"
  );

  if (hasCompletedBotMessage) return;

  const hasTypingDots = messages.some(
    (m) => m.text === "__DOTS__" && m.stepIndex === currentStep
  );

  if (hasTypingDots) return;

  pushBotMessage(
    steps[currentStep].messageTemplate,
    currentStep,
    getOptionsForStep(currentStep)
  );
}, [currentStep, messages]);


  const handleAddressSaved = (address: any) => {
    setAddresses((prev) => [...prev, address]);

    setShowAddressForm(false);

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

  useEffect(() => {
    console.log("Address changed");

    setMessages((prev) =>
      prev.map((m) => {
        if (
          m.from === "bot" &&
          steps[m.stepIndex]?.stepType === "ADDRESS_INPUT"
        ) {
          return {
            ...m,
            options: getOptionsForStep(m.stepIndex),
          };
        }
        return m;
      })
    );
  }, [addresses]);

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
                  styles.avatarContainer,
                  m.from === "user" ? styles.avatarRight : styles.avatarLeft,
                ]}
              >
                <View style={styles.avatarCircle}>
                  <Text style={{ fontSize: moderateScale(20) }}>
                    {m.from === "user" ? "🧑" : "👨🏻‍🔧"}
                  </Text>
                </View>
                <Text style={styles.avatarLabel}>
                  {m.from === "user"
                    ? "User"
                    : `${steps[m.stepIndex]?.agentName ?? "Service"} - Service Assistant`
}
                </Text>
              </View>
              <View
                style={[
                  styles.bubble,
                  m.from === "user" ? styles.userBubble : styles.botBubble,
                   stepType == 'FINAL_CONFIRMATION' && { maxWidth : '100%'}
                ]}
              >
                {m.text === "__DOTS__" ? (
                  <TypingDots />
                ) : m.text === "__BADGE__" ? (
                  response && <BadgeCard response={response} />
                ) : (
                  <Text
                    style={[
                      { fontSize: moderateScale(16) },
                      m.from === "user" && { color: "#fff" },
                    ]}
                  >
                    {m.text}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.timeText,
                  m.from === "user" ? styles.timeRight : styles.timeLeft,
                ]}
              >
                {m.time}
              </Text>
              {m.options &&
                (!bookingCompleted || m.stepIndex === BOOK_AGAIN_STEP) && (
                  <View
                    style={[
                      styles.options,
                      (stepType == "BRAND_SELECTION" ||
                        stepType == "QUANTITY_CONFIRM"|| m.stepIndex === BOOK_AGAIN_STEP) && {
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
                              stepType == "GREETING" ||
                              stepType == "FINAL_CONFIRMATION" ||
                              stepType == "QUANTITY_SELECTION" ||
                              stepType == "ADDRESS_INPUT") && {
                              backgroundColor: color.bg,
                              borderColor: color.border,
                            },
                            (stepType == "QUANTITY_CONFIRM" || m.stepIndex === BOOK_AGAIN_STEP) && {
                              backgroundColor: newColor.bg,
                              borderColor: newColor.border,
                              flex: 1,
                            },
                            stepType == "BRAND_SELECTION" && {
                              width: scale(117),
                              alignItems: "center",
                              backgroundColor: "#C8E6FF1A",
                              borderColor: "#C8E6FF80",
                              height: verticalScale(45.3),
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
                  <>
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
                        <Feather
                          name="send"
                          color={"#fff"}
                          size={moderateScale(20)}
                        />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        setNotesSubmitted(true);
                        setCurrentStep((s) => s + 1);
                      }}
                      style={[
                        styles.optionBtn,
                        {
                          borderColor: "#C8E6FF80",
                          backgroundColor: "#C8E6FF1A",
                          marginTop: verticalScale(10),
                        },
                      ]}
                    >
                      <Text style={styles.skip}>
                        Skip - I'll explain to technician directly
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              {stepType === "QUANTITY_SELECTION" &&
                m.stepIndex === currentStep &&
                manualQtyActive && (
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
                        const qty = Number(manualQty);
                        if (!qty || qty <= 0) return;

                        setQuantity(qty);
                        setManualQty("");
                        setManualQtyActive(false);

                        pushUserMessage(`${qty} Units`, currentStep);
                        setCurrentStep((s) => s + 1);
                      }}
                    >
                      <Feather
                        name="send"
                        color={"#fff"}
                        size={moderateScale(20)}
                      />
                    </TouchableOpacity>
                  </View>
                )}
            </View>
          );
        })}

        {/* {showBadge && response && <BadgeCard response={response} />} */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  header: {
    // height: verticalScale(55),
    width: "100%",
    backgroundColor: "#027CC7",
    paddingHorizontal: scale(8),
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(8),
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
    marginRight: scale(30),
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
    // borderWidth: 1,
  },
  avatarContainer: {
    width: "100%",
    marginBottom: verticalScale(6),
    flexDirection: "row",
    alignItems: "center",
  },
  avatarLeft: { justifyContent: "flex-start" },
  avatarRight: { justifyContent: "flex-end" },
  avatarCircle: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLabel: {
    fontSize: moderateScale(13),
    color: "#3A4A5A",
    marginLeft: scale(6),
  },
  bubble: { padding: scale(12), borderRadius: scale(10), maxWidth: "85%" },
  botBubble: { backgroundColor: "#DAF1FF", alignSelf: "flex-start" },
  userBubble: { backgroundColor: "#027CC7", alignSelf: "flex-end" },
  timeText: {
    fontSize: moderateScale(11),
    color: "#7A869A",
    marginTop: verticalScale(4),
  },
  timeLeft: { alignSelf: "flex-start" },
  timeRight: { alignSelf: "flex-end" },
  options: { marginTop: verticalScale(8), gap: scale(8) },
  optionBtn: {
    padding: scale(10),
    borderWidth: 1,
    borderRadius: scale(8),
    backgroundColor: "#fff",
    justifyContent: "center",
    height: verticalScale(52),
  },
  notesBox: {
    marginTop: verticalScale(8),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    borderWidth: 1,
    borderRadius: scale(8),
    padding: scale(10),
    backgroundColor: "#FFFFFF80",
    height: verticalScale(47),
    borderColor: "#ADADAD",
    width: scale(315),
  },
  sendBtn: {
    width: scale(47),
    height: scale(47),
    // marginTop: verticalScale(6),
    backgroundColor: "#027CC7",
    // padding: scale(10),
    borderRadius: scale(8),
    alignItems: "center",
    justifyContent: "center",
  },
  skip: {
    // marginTop: verticalScale(6),
    color: "#000000",
    textAlign: "center",
  },
});
