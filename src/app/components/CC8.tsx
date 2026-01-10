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
  Image,
  ViewStyle,
} from "react-native";

import { moderateScale, scale, verticalScale } from "../../utils/scaling";
import { useChatGPTTyping } from "../../hooks/useChatGptTyping";
import { useAddress } from "../../hooks/useAddress";
import AddressComponent from "./AddressForm";
import TypingDots from "./TypingDots";
import BadgeCard from "./BadgeCard";
import {
  createConversationBooking,
  ConversationBookingResponse,
  CreateConversationBookingPayload,
} from "../../utils/bookingApi";
import { useProfile } from "../../hooks/useProfile";
import { Feather } from "@expo/vector-icons";
import CustomView from "./CustomView";
import { LinearGradient } from "expo-linear-gradient";
import ServicePriceCard from "./ServicePriceCard";
import { InsetShadowBox } from "./InsetShadow";
import ReviewDetailCard from "./ReviewDetailCard";
import ProviderCard from "./ProviderCard";
import QuantityPriceCard from "./QuantityPriceCard";

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
  const { userId, firstName } = useProfile();
  const { addresses, setAddresses, setSelectedAddress, selectedAddress } =
    useAddress();
  const { showTypingIndicator, typeText } = useChatGPTTyping(true);

  const steps = serviceObject.conversation.steps;
  const service = serviceObject.service;

  const scrollRef = useRef<ScrollView>(null);
  const [isBotTyping, setIsBotTyping] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedCapacity, setSelectedCapacity] = useState<any>(null);

  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [notesInputActive, setNotesInputActive] = useState(false);
  const [followUpQueue, setFollowUpQueue] = useState<any[]>([]);
  const [currentFollowUp, setCurrentFollowUp] = useState<any>(null);
  const [followUpAnswers, setFollowUpAnswers] = useState<any>({});
  const askedFollowUpRef = useRef<string | null>(null);
  const [showReview, setShowReview] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [manualQty, setManualQty] = useState("");
  const [manualQtyActive, setManualQtyActive] = useState(false);

  const [response, setResponse] = useState<ConversationBookingResponse | null>(
    null
  );
  const isCustomQuestionStep =
    steps[currentStepIndex]?.stepType === "CUSTOM_QUESTION";
  const isQuantityStep =
    steps[currentStepIndex]?.stepType === "QUANTITY_SELECTION";
  const isAddressStep = steps[currentStepIndex]?.stepType === "ADDRESS_INPUT";
  const isFinalStep =
    steps[currentStepIndex]?.stepType === "FINAL_CONFIRMATION";
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

  const totalPrice = quantity ? quantity * unitPrice : "";

  const templateVars: any = {
    customerName: firstName,
    agentName: steps[currentStepIndex]?.agentName,
    // zipcode: serviceObject.data?.zipcode ,
    zipcode: selectedAddress.address.zipcode,
    estimatedTime: service.estimatedTime,
    selectedProblem: selectedProblem?.name ?? "",
    selectedOption: selectedOption?.name ?? "",
    selectedBrand: selectedBrand?.name ?? "",
    quantity,
    totalPrice,
    address: selectedAddress
      ? `${selectedAddress.label}, ${selectedAddress.address.street}`
      : "",
  };

  const renderTemplate = (t: string) =>
    t.replace(/{{(.*?)}}/g, (_, k) => templateVars[k.trim()] ?? "");

  /* ---------------- BOT MESSAGE ---------------- */

  const pushBotMessage = (
    text: string,
    stepIndex: number,
    options?: StepOption[]
  ) => {
    const id = Date.now().toString();

    setIsBotTyping(true);

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

    setTimeout(() => {
      setMessages((p) => p.filter((m) => m.id !== `${id}-dots`));
      setMessages((p) => [
        ...p,
        { id, from: "bot", text: "", stepIndex, time: time() },
      ]);

      typeText(
        renderTemplate(text),
        (t) =>
          setMessages((p) =>
            p.map((m) => (m.id === id ? { ...m, text: t } : m))
          ),
        () => {
          setMessages((p) =>
            p.map((m) => (m.id === id ? { ...m, options } : m))
          );
          setIsBotTyping(false); // ✅ ONLY HERE
        }
      );
    }, 400);
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

  /* ---------------- OPTION RESOLUTION ---------------- */

  const resolveOptionsFromStep = (step: any): StepOption[] => {
    switch (step.stepType) {
      case "GREETING":
      // return [{ id: "start", label: "Let’s get started", value: true }];
      case "CAPACITY_SELECTION":
        return (
          selectedOption?.capacityVariants?.map((v: any) => ({
            id: v.id,
            label: `${v.displayName} (₹${v.finalPrice})`,
            value: v,
          })) || []
        );

      case "PROBLEM_SELECTION":
        return step.data.problems.map((p: any) => ({
          id: p._id,
          // label: `${p.name} (₹${p.estimatedPrice})`,
          label: `${p.name}`,
          value: p,
        }));

      case "OPTION_SELECTION":
        return step.data.options.map((o: any) => ({
          id: o.id,
          // label: `${o.name} (₹${o.basePrice})`,
          label: `${o.name}`,
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
          ...step.data.availableQuantities.map((q: string) => ({
            id: q,
            label: q.toUpperCase(),
            value: q === "single" ? 1 : q === "double" ? 2 : 3,
          })),
          { id: "manual", label: "Set Manual Quantity", value: "manual" },
        ];

      case "QUANTITY_CONFIRM":
        return [
          { id: "confirm", label: "✅ Confirm", value: "confirm" },
          { id: "cancel", label: "❌ Change Quantity", value: "cancel" },
        ];

      case "ADDRESS_INPUT":
        return [
          ...addresses.map((a, i) => ({
            id: `addr-${i}`,
            label: `${a.label} - ${a.address.street}`,
            value: a,
          })),
          { id: "new", label: "📍 Add New Address", value: "new" },
        ];

      // case "FINAL_CONFIRMATION":
      //   return [{ id: "book", label: "Book Now", value: "book" }];

      default:
        return [];
    }
  };

  /* ---------------- OPTION HANDLER ---------------- */

  const handleOptionPress = (opt: StepOption) => {
    const step = steps[currentStepIndex];

    const closeAllOverlays = () => {
      setManualQtyActive(false);
      setShowAddressForm(false);
    };

    /* ---------------- FOLLOW UP ---------------- */
    if (currentFollowUp) {
      pushUserMessage(opt.label);

      setFollowUpAnswers((p: any) => ({
        ...p,
        [currentFollowUp.question]: opt.value,
      }));

      const remaining = followUpQueue.slice(1);

      if (remaining.length > 0) {
        setFollowUpQueue(remaining);
        setCurrentFollowUp(remaining[0]);
      } else {
        setFollowUpQueue([]);
        setCurrentFollowUp(null);
        setCurrentStepIndex((s) => s + 1);
      }
      return;
    }

    /* ---------------- OVERLAYS (NO USER MESSAGE) ---------------- */

    // Manual quantity overlay
    if (opt.value === "manual") {
      setManualQtyActive(true);
      return;
    }

    // Address overlay (behaves EXACTLY like manual qty)
    if (step.stepType === "ADDRESS_INPUT" && opt.value === "new") {
      setShowAddressForm(true);
      return;
    }
    if (step.stepType === "CUSTOM_QUESTION") {
      if (opt.value === "confirm") {
        pushUserMessage("Confirm");
        setCurrentStepIndex((s) => s + 1);
        return;
      }

      if (opt.value === "cancel") {
        pushUserMessage("Cancel");
        onClose(); // or reset chat if needed
        return;
      }
    }
    /* ---------------- REAL USER SELECTION ---------------- */

    // push user message ONCE
    closeAllOverlays();
    pushUserMessage(opt.label);

    /* ---------------- STATE UPDATES ---------------- */

    if (step.stepType === "PROBLEM_SELECTION") {
      setSelectedProblem(opt.value);

      const questions = opt.value.followUpQuestions || [];
      if (questions.length > 0) {
        setFollowUpQueue(questions);
        setCurrentFollowUp(questions[0]);
        return;
      }
    }

    if (step.stepType === "CAPACITY_SELECTION") {
      setSelectedCapacity(opt.value);
    }

    if (step.stepType === "OPTION_SELECTION") {
      setSelectedOption(opt.value);
    }

    if (step.stepType === "BRAND_SELECTION") {
      setSelectedBrand(opt.value);
    }

    if (step.stepType === "QUANTITY_SELECTION") {
      setQuantity(opt.value);
    }

    if (step.stepType === "ADDRESS_INPUT") {
      setSelectedAddress(opt.value);
    }

    if (step.stepType === "QUANTITY_CONFIRM") {
      if (opt.value === "confirm") {
        setCurrentStepIndex((s) => s + 1);
      } else {
        setQuantity(0);
        setCurrentStepIndex((s) => s - 1);
      }
      return;
    }

    if (step.stepType === "FINAL_CONFIRMATION") {
      handleBooking();
      return;
    }

    setCurrentStepIndex((s) => s + 1);
  };

  const resolveFollowUpOptions = (q: any): StepOption[] => {
    if (q.questionType === "yes_no") {
      return q.options.map((o: any) => ({
        id: o._id,
        label: o.label,
        value: o.value,
      }));
    }

    return q.options.map((o: any) => ({
      id: o._id,
      label: o.label,
      value: o.value,
    }));
  };

  /* ---------------- BOOKING ---------------- */

  const handleBooking = async () => {
    // pushUserMessage("Book Now");

    try {
      const payload: CreateConversationBookingPayload = {
        userId,
        zipcode: selectedAddress.address.zipcode,
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

      const res = await createConversationBooking(service.id, payload);
      setResponse(res);

      // setMessages((p) => [
      //   ...p,
      //   {
      //     id: Date.now().toString(),
      //     from: "bot",
      //     text: "__BADGE__",
      //     stepIndex: currentStepIndex,
      //     time: time(),
      //   },
      // ]);
    } catch (err) {
      console.error("Booking failed:", err);
      // optional: show error toast/message here
    }
    setShowReview(false);
  };

  /* ---------------- STEP FLOW ---------------- */

  useEffect(() => {
    const step = steps[currentStepIndex];
    if (!step) return;

    // GREETING: show message once, then auto-advance
    if (step.stepType === "GREETING") {
      const alreadyRendered = messages.some(
        (m) => m.stepIndex === currentStepIndex && m.from === "bot"
      );

      if (!alreadyRendered && !isBotTyping) {
        pushBotMessage(step.messageTemplate, currentStepIndex);
      }

      // move ONLY when typing is finished
      if (alreadyRendered && !isBotTyping) {
        setCurrentStepIndex((s) => s + 1);
      }

      return;
    }
    // NOTES INPUT toggle
    setNotesInputActive(step.stepType === "NOTES_INPUT");

    // FOLLOW-UP QUESTION
    if (currentFollowUp) {
      if (
        askedFollowUpRef.current !== currentFollowUp.question &&
        !isBotTyping
      ) {
        askedFollowUpRef.current = currentFollowUp.question;

        pushBotMessage(
          currentFollowUp.question,
          currentStepIndex,
          resolveFollowUpOptions(currentFollowUp)
        );
      }
      return;
    }

    // NORMAL STEP
    const alreadyRendered = messages.some(
      (m) => m.stepIndex === currentStepIndex && m.from === "bot"
    );
    if (alreadyRendered) return;

    pushBotMessage(
      step.messageTemplate,
      currentStepIndex,
      resolveOptionsFromStep(step)
    );
  }, [currentStepIndex, currentFollowUp, messages]);

  function MessageTitle({
    stepIndex,
    style,
  }: {
    stepIndex: number;
    style?: ViewStyle;
  }) {
    const step = steps[stepIndex];
    if (!step) return null;

    return (
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          {
            paddingVertical: verticalScale(4),
            paddingHorizontal: scale(9),
            borderRadius: scale(4),
            alignSelf: "flex-start",
          },
          style,
        ]}
        colors={["#FF0000", "#990000"]}
      >
        <Text
          style={{
            color: "#fff",
            fontWeight: "400",
            fontSize: moderateScale(12),
          }}
        >
          {renderTemplate(step.label)}
        </Text>
      </LinearGradient>
    );
  }

  /* ---------------- RENDER ---------------- */
  const activeBotMessage = [...messages]
    .reverse()
    .find((m) => m.from === "bot");
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
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
        contentContainerStyle={{ paddingBottom: verticalScale(80) }}
      >
        {messages.map((m) => {
          const isLatestBotMessage =
            m.from === "bot" && m.id === activeBotMessage?.id;

          const isCurrentStep =
            m.from === "bot" && m.stepIndex === currentStepIndex;

          const isCustomQuestionMessage =
            isLatestBotMessage &&
            steps[m.stepIndex]?.stepType === "CUSTOM_QUESTION";
          /* USER MESSAGE (unchanged) */
          if (m.from === "user") {
            return (
              <View
                key={m.id}
                style={{
                  marginBottom: verticalScale(16),
                  alignItems: "flex-end",
                }}
              >
                <CustomView
                  radius={scale(25)}
                  height={verticalScale(40)}
                  gradientColors={["#B8D3E959", "#B8D3E959"]}
                  boxStyle={{
                    backgroundColor: "white",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    paddingHorizontal: scale(15),
                    minWidth: scale(190),
                    borderWidth: 1,
                    borderColor: "#fff",
                  }}
                >
                  <Text style={{ fontSize: moderateScale(15), color: "#000" }}>
                    {m.text}
                  </Text>
                </CustomView>
              </View>
            );
          }

          /* BOT CARD */
          return (
            <CustomView
              key={m.id}
              isGradient={false}
              radius={scale(14.9)}
              width={scale(370)}
              boxStyle={styles.botCard}
              shadowStyle={{
                backgroundColor: "#8092ac68",
                marginBottom: verticalScale(16),
              }}
            >
              <MessageTitle
                stepIndex={m.stepIndex}
                style={{
                  position: "absolute",
                  top: verticalScale(10),
                  left: scale(90),
                  elevation: 1,
                  zIndex: 999,
                }}
              />
              <View style={{ flexDirection: "row" }}>
                {
                  <Image
                    source={require("../../../assets/bot.png")}
                    style={{ width: scale(57), aspectRatio: 1 }}
                  />
                }
                {/* Bot bubble */}
                <CustomView
                  width={scale(280)}
                  shadowStyle={{
                    backgroundColor: "#E3E3E3",
                    marginTop: verticalScale(12),
                    justifyContent: "center",
                    alignSelf: "flex-start",
                    // alignItems : 'center',
                  }}
                  isGradient={false}
                  radius={scale(12.4)}
                  boxStyle={[styles.botBubble]}
                >
                  {m.text === "__DOTS__" ? (
                    <TypingDots />
                  ) : (
                    // )
                    // : m.text === "__BADGE__" ? (
                    //   response && <BadgeCard response={response} />
                    //   response && <ProviderCard />
                    <Text style={{ fontSize: moderateScale(15) }}>
                      {m.text}
                    </Text>
                  )}
                </CustomView>
              </View>
              <View
                style={{
                  flexWrap: "wrap",
                  flexDirection: "row",
                  marginTop: verticalScale(10),
                  gap: scale(8),
                }}
              >
                {/* CUSTOM QUESTION CARD */}

                {isCustomQuestionMessage && !isBotTyping && (
                  <CustomView
                    width={scale(330)}
                    shadowStyle={{
                      backgroundColor: "#E3E3E3",
                      marginTop: verticalScale(12),
                    }}
                    isGradient={false}
                    radius={scale(12.4)}
                    boxStyle={[styles.botBubble, { gap: verticalScale(5) }]}
                  >
                    {/* ZIP */}
                    <CustomView
                      height={verticalScale(37)}
                      radius={scale(40)}
                      boxStyle={styles.infoRow}
                      width={scale(320)}
                      shadowStyle={{ alignSelf: "flex-start" }}
                    >
                      <Feather name="map-pin" size={16} color="#027CC7" />
                      <Text style={styles.infoLabel}>Zip code</Text>
                      <Text style={styles.infoValue}>
                        {selectedAddress?.address?.zipcode}
                      </Text>
                    </CustomView>

                    {/* SERVICE TIME */}
                    <CustomView
                      height={verticalScale(37)}
                      radius={scale(40)}
                      boxStyle={styles.infoRow}
                      width={scale(320)}
                      shadowStyle={{ alignSelf: "flex-start" }}
                    >
                      <Feather name="clock" size={16} color="#027CC7" />
                      <Text style={styles.infoLabel}>Service Time</Text>
                      <Text style={styles.infoValue}>
                        Service within {service.estimatedTime}
                      </Text>
                    </CustomView>

                    {/* ACTION BUTTONS */}
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        // style={styles.cancelBtn}
                        onPress={() => {
                          pushUserMessage("Cancel");
                          onClose();
                        }}
                      >
                        <CustomView
                          height={verticalScale(36)}
                          radius={scale(40)}
                          boxStyle={[styles.optionBtn]}
                          width={scale(155)}
                          // shadowStyle={{flex : 1}}
                        >
                          <Text style={styles.cancelText}>Cancel</Text>
                        </CustomView>
                      </TouchableOpacity>
                      <TouchableOpacity
                        // style={styles.confirmBtn}
                        onPress={() => {
                          pushUserMessage("Confirm");
                          setCurrentStepIndex((s) => s + 1);
                        }}
                      >
                        <CustomView
                          height={verticalScale(36)}
                          radius={scale(40)}
                          boxStyle={[styles.optionBtn]}
                          width={scale(155)}
                          gradientColors={["#027CC7", "#027CC7"]}
                          shadowStyle={{ flex: 1 }}
                        >
                          <Text style={styles.confirmText}>Confirm</Text>
                        </CustomView>
                      </TouchableOpacity>
                    </View>
                  </CustomView>
                )}

                {/* OPTIONS */}
                {isLatestBotMessage &&
                  !isCustomQuestionStep &&
                  !isQuantityStep &&
                  !isFinalStep &&
                  m.options?.map((o) => (
                    <CustomView
                      height={verticalScale(36)}
                      radius={scale(40)}
                      key={o.id}
                      boxStyle={[
                        styles.optionBtn,
                        isAddressStep && {
                          width: scale(335),
                          alignItems: "flex-start",
                          paddingLeft: scale(20),
                        },
                      ]}
                      // width={scale(200)}
                      shadowStyle={{ alignSelf: "flex-start" }}
                    >
                      <TouchableOpacity onPress={() => handleOptionPress(o)}>
                        <Text>
                          {"🕑"} {o.label}
                        </Text>
                      </TouchableOpacity>
                    </CustomView>
                  ))}
              </View>

              {isLatestBotMessage && isFinalStep && !isBotTyping && (
                <View
                  style={{
                    marginTop: verticalScale(50),
                    borderWidth: 0,
                    marginLeft: scale(-14),
                    width: scale(368),
                  }}
                >
                  {showReview && (
                    <ReviewDetailCard
                      onBookNow={() => {
                        if (isBotTyping) return;
                        handleBooking();
                      }}
                    />
                  )}
                  <View
                    style={{
                      paddingLeft: scale(7),
                      borderTopWidth: moderateScale(0.4),
                      paddingTop: verticalScale(20),
                      borderColor: "#BFBFBF",
                      borderRadius: scale(12),
                    }}
                  >
                    {response && <ProviderCard />}
                  </View>
                </View>
              )}

              {/* MANUAL QUANTITY INPUT */}
              {isLatestBotMessage && isQuantityStep && !isBotTyping && (
                <View style={{ marginTop: verticalScale(50) }}>
                  <ServicePriceCard
                    discountPercent={5}
                    originalPrice={500}
                    unitPrice={100}
                    onConfirm={(qty) => {
                      setQuantity(Number(qty));
                      setManualQty("");
                      setManualQtyActive(false);
                      pushUserMessage();
                      setCurrentStepIndex((s) => s + 1);
                    }}
                    onCancel={() => {}}
                  />
                </View>
              )}

              {/* NOTES INPUT */}
              {isLatestBotMessage && notesInputActive && (
                <View style={styles.notesBox}>
                  <TextInput
                    placeholder={
                      steps[currentStepIndex]?.data?.placeholder ||
                      "Any special instructions?"
                    }
                    value={notes}
                    onChangeText={setNotes}
                    style={styles.input}
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.sendBtn}
                    onPress={() => {
                      pushUserMessage(notes || "No special instructions");
                      setNotesInputActive(false);
                      setCurrentStepIndex((s) => s + 1);
                    }}
                  >
                    <Feather name="send" color="#fff" size={18} />
                  </TouchableOpacity>
                </View>
              )}

              {/* ADDRESS FORM */}
              {isLatestBotMessage && showAddressForm && (
                <AddressComponent
                  onAddressSaved={(addr: any) => {
                    setAddresses((p) => [...p, addr]);
                    setSelectedAddress(addr);
                    setShowAddressForm(false);
                    setCurrentStepIndex((s) => s + 1);
                  }}
                />
              )}
            </CustomView>
          );
        })}

        {/* Bot bubble */}

        {/* OPTIONS */}

        {/* <QuantityPriceCard quantity={5} price={5025} originalPrice={6700} /> */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  confirmCard: {
    // marginTop: verticalScale(10),
    // backgroundColor: "#F9FAFF",
    // borderRadius: scale(14),
    padding: scale(14),
    // borderWidth: 1,
    // borderColor: "#E3EAF5",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "#FFFFFF",
    // borderRadius: scale(30),
    // paddingVertical: verticalScale(10),
    paddingHorizontal: scale(14),
    gap: scale(10),
  },

  infoLabel: {
    flex: 1,
    fontSize: moderateScale(14),
    color: "#333",
    fontWeight: "500",
  },

  infoValue: {
    fontSize: moderateScale(14),
    color: "#000",
    fontWeight: "600",
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: verticalScale(10),
    gap: scale(10),
  },

  cancelBtn: {
    flex: 1,
    backgroundColor: "#F1F3F6",
    paddingVertical: verticalScale(10),
    borderRadius: scale(30),
    alignItems: "center",
  },

  cancelText: {
    color: "#333",
    fontWeight: "500",
  },

  confirmBtn: {
    flex: 1,
    backgroundColor: "#027CC7",
    paddingVertical: verticalScale(10),
    borderRadius: scale(30),
    alignItems: "center",
  },

  confirmText: {
    color: "#fff",
    fontWeight: "600",
  },

  botCard: {
    // backgroundColor: "#ffffff",
    // borderRadius: scale(12),
    padding: scale(14),
    // marginBottom: verticalScale(9),
    alignSelf: "flex-start",
    // maxWidth: "100%",
    borderWidth: moderateScale(1),
    borderColor: "#EFEFEF",
  },
  topHeader: {
    backgroundColor: "#0A7BC2",
    padding: scale(14),
    flexDirection: "row",
    justifyContent: "space-between",
    // borderRadius: scale(14),
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

  wrapper: {
    flex: 1,
    padding: scale(10),
    backgroundColor: "#ffffff",
    paddingBottom: 150,
    // borderWidth: 1,
  },
  bubble: { padding: scale(12), borderRadius: scale(10) },
  botBubble: {
    paddingHorizontal: scale(14),
    paddingTop: verticalScale(18),
    paddingBottom: verticalScale(5),
    // minHeight : verticalScale(50)
    // borderWidth: 2,
  },
  userBubble: {
    // backgroundColor: "#1784c7ff",
    // alignSelf: "flex-end",
  },
  optionBtn: {
    paddingHorizontal: scale(15),
    // marginTop: verticalScale(6),
    // borderRadius: scale(8),
    // borderWidth: 1,
    // borderColor: "#C8E6FF80",
    // backgroundColor: "#C8E6FF1A",
    alignItems: "center",
    justifyContent: "center",
  },
  notesBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: verticalScale(10),
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: scale(8),
    padding: scale(10),
    backgroundColor: "#fff",
  },
  sendBtn: {
    marginLeft: scale(8),
    backgroundColor: "#027CC7",
    padding: scale(12),
    borderRadius: scale(8),
  },
});
