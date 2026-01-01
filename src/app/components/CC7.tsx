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
import {
  createConversationBooking,
  ConversationBookingResponse,
  CreateConversationBookingPayload,
} from "../../utils/bookingApi";
import { useProfile } from "../../hooks/useProfile";
import { Feather } from "@expo/vector-icons";

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

const totalPrice = quantity ? quantity * unitPrice : "";

  const templateVars: any = {
    agentName: steps[currentStepIndex]?.agentName,
    // zipcode: serviceObject.data?.zipcode ,
    zipcode: selectedAddress.address.zipcode ,
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
      renderTemplate(text),
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

  /* ---------------- OPTION RESOLUTION ---------------- */

  const resolveOptionsFromStep = (step: any): StepOption[] => {
    switch (step.stepType) {
      case "GREETING":
        return [{ id: "start", label: "Let’s get started", value: true }];
case "CAPACITY_SELECTION":
  return selectedOption?.capacityVariants?.map((v: any) => ({
    id: v.id,
    label: `${v.displayName} (₹${v.finalPrice})`,
    value: v,
  })) || [];

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

      case "FINAL_CONFIRMATION":
        return [{ id: "book", label: "Book Now", value: "book" }];

      default:
        return [];
    }
  };

  /* ---------------- OPTION HANDLER ---------------- */


  
  const handleOptionPress = (opt: StepOption) => {
    const step = steps[currentStepIndex];

if (currentFollowUp) {
  // This is the user's answer to the current follow-up
  pushUserMessage(opt.label);

  // Save the answer
  setFollowUpAnswers((p: any) => ({
    ...p,
    [currentFollowUp.question]: opt.value,
  }));

  // Advance the follow-up queue
  const remaining = followUpQueue.slice(1);

  if (remaining.length > 0) {
    setFollowUpQueue(remaining);
    setCurrentFollowUp(remaining[0]);
    // don't advance main step yet — next useEffect will push next follow-up
  } else {
    // follow-ups finished — clear and move to next main step
    setFollowUpQueue([]);
    setCurrentFollowUp(null);
    setCurrentStepIndex((s) => s + 1);
  }

  return;
}


    if (opt.value === "manual") {
      setManualQtyActive(true);
      return;
    }

    pushUserMessage(opt.label);

   if (step.stepType === "PROBLEM_SELECTION") {
  setSelectedProblem(opt.value);

  const questions = opt.value.followUpQuestions || [];

  if (questions.length > 0) {
    setFollowUpQueue(questions);
    setCurrentFollowUp(questions[0]);
    return; // ⛔ stop main step advance
  }
}
if (step.stepType === "CAPACITY_SELECTION") {
  setSelectedCapacity(opt.value);
}
    if (step.stepType === "OPTION_SELECTION") setSelectedOption(opt.value);
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
  if (opt.value === "confirm") {
    setCurrentStepIndex((s) => s + 1); // go forward
  }

  if (opt.value === "cancel") {
    setQuantity(0);
    setCurrentStepIndex((s) => s - 1); // go back to quantity selection
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
     } catch (err) {
      console.error("Booking failed:", err);
      // optional: show error toast/message here
    }
  };

  /* ---------------- STEP FLOW ---------------- */

useEffect(() => {
  const step = steps[currentStepIndex];
  if (!step) return;

  // only enable notes input for NOTES_INPUT
  if (step.stepType === "NOTES_INPUT") {
    setNotesInputActive(true);
  } else {
    setNotesInputActive(false);
  }

  // If there's an active follow-up question, ask it (once)
  if (currentFollowUp) {
    // avoid duplicate follow-up messages
    const alreadyAsked = messages.some(
      (m) => m.from === "bot" && m.text === currentFollowUp.question
    );

    if (!alreadyAsked) {
      pushBotMessage(
        currentFollowUp.question,
        currentStepIndex,
        resolveFollowUpOptions(currentFollowUp)
      );
    }
    return;
  }

  // For normal step messages: ensure we haven't already pushed the main bot message for this step
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


  /* ---------------- RENDER ---------------- */

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <View style={styles.header}>
              <View style={styles.headerRow}>
              
      
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Text style={{ fontSize: moderateScale(20), color: "#fff" }}>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
      <ScrollView ref={scrollRef} style={styles.wrapper} contentContainerStyle={{ paddingBottom: verticalScale(80) }}>
        {messages.map((m) => (
          <View key={m.id} style={{ marginBottom: verticalScale(16) }}>
            <View
              style={[
                styles.bubble,
                m.from === "user" ? styles.userBubble : styles.botBubble,
              ]}
            >
              {m.text === "__DOTS__" ? (
                <TypingDots />
              ) : m.text === "__BADGE__" ? (
                response && <BadgeCard response={response} />
              ) : (
                <Text style={[{ fontSize: moderateScale(15) }, m.from === "user" && {color : '#fff'}]}>{m.text}</Text>
              )}
            </View>

           {m.options &&
  m.id === messages[messages.length - 1]?.id &&
  m.options.map((o) => (
    <TouchableOpacity
      key={o.id}
      style={styles.optionBtn}
      onPress={() => handleOptionPress(o)}
    >
      <Text>{o.label}</Text>
    </TouchableOpacity>
  ))}

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
{notesInputActive && (
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
   header: {
    // height: verticalScale(55),
    width: "100%",
    backgroundColor: "#516377ff",
    paddingHorizontal: scale(8),
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(8),
    borderRadius : scale(12)
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
  wrapper: { flex: 1, padding: scale(10), backgroundColor: "#F2F7FF", paddingBottom : 150, borderWidth : 1 },
  bubble: { padding: scale(12), borderRadius: scale(10), maxWidth: "90%" },
  botBubble: { backgroundColor: "#DAF1FF" },
  userBubble: {
    backgroundColor: "#027CC7",
    alignSelf: "flex-end",
  },
  optionBtn: {
    padding: scale(10),
    marginTop: verticalScale(6),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: "#C8E6FF80",
    backgroundColor: "#C8E6FF1A",
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
