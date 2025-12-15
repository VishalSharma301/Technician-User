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

import { scale, verticalScale } from "../../utils/scaling";
import { useChatGPTTyping } from "../../hooks/useChatGptTyping";
import { useAddress } from "../../hooks/useAddress";
import AddressComponent from "./AddressForm";
import TypingDots from "./TypingDots";
import BadgeCard from "./BadgeCard";

import { ServiceData } from "../../constants/types";

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

/* ---------------- COMPONENT ---------------- */

export default function ChatbotBookingManualUI({
  serviceObject,
}: {
  serviceObject: { data: ServiceData; zipcode: string };
}) {
  const service = serviceObject.data;
  const steps = service.conversationSteps;

  const { addresses, setSelectedAddress } = useAddress();
  const { showTypingIndicator, typeText } = useChatGPTTyping();

  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [quantity, setQuantity] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showBadge, setShowBadge] = useState(false);

  /* ---------------- TEMPLATE ---------------- */

  const renderTemplate = (template: string) => {
    const vars = {
      agentName: steps[currentStep]?.agentName ?? "",
      serviceName: service.name,
      zipcode: serviceObject.zipcode,
      estimatedTime: service.estimatedTime,
      selectedBrand: selectedBrand?.name ?? "",
      selectedOption: selectedOption?.name ?? "",
      quantity: quantity ?? "",
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

    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 400));

    setMessages((p) => p.filter((m) => m.id !== `${id}-dots`));
    setMessages((p) => [...p, { id, from: "bot", text: "", stepIndex }]);

    typeText(
      renderTemplate(rawText),
      (t) => {
        setMessages((p) =>
          p.map((m) => (m.id === id ? { ...m, text: t } : m))
        );
        scrollToBottom();
      },
      () => {
        setMessages((p) =>
          p.map((m) => (m.id === id ? { ...m, options } : m))
        );
        setIsTyping(false);
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

  /* ---------------- OPTIONS ---------------- */

  const getOptionsForStep = (stepIndex: number): StepOption[] => {
    const step = steps[stepIndex];
    if (!step) return [];

    switch (step.stepType) {
      case "GREETING":
        return [{ id: "start", label: "Let’s get started", value: true, stepIndex }];

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

  /* ---------------- OPTION HANDLER ---------------- */

  const handleOptionPress = (opt: StepOption) => {
    pushUserMessage(opt.label, opt.stepIndex);

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

      case "QUANTITY_CONFIRM":
        if (opt.value === "cancel") {
          setCurrentStep((s) => s - 1);
          return;
        }
        break;

      case "ADDRESS_INPUT":
        if (opt.value === "new") {
          setShowAddressForm(true);
          return;
        }
        setSelectedAddress(opt.value);
        break;

      case "FINAL_CONFIRMATION":
        setShowBadge(true);
        return;
    }

    setCurrentStep((s) => s + 1);
  };

  /* ---------------- STEP FLOW (SINGLE EFFECT) ---------------- */

  useEffect(() => {
    if (!steps.length || showBadge) return;

    pushBotMessage(
      steps[currentStep].messageTemplate,
      currentStep,
      getOptionsForStep(currentStep)
    );
  }, [currentStep]);

  /* ---------------- RENDER ---------------- */

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView ref={scrollRef} style={styles.wrapper}>
        {messages.map((m) => {
          const stepType = steps[m.stepIndex]?.stepType;

          return (
            <View key={m.id} style={{ marginBottom: verticalScale(16) }}>
              <View style={[styles.bubble, m.from === "user" ? styles.userBubble : styles.botBubble]}>
                {m.text === "__DOTS__" ? <TypingDots /> : <Text>{m.text}</Text>}
              </View>

              {m.options && (
                <View style={styles.options}>
                  {m.options.map((o) => (
                    <TouchableOpacity key={o.id} style={styles.optionBtn} onPress={() => handleOptionPress(o)}>
                      <Text>{o.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {stepType === "ADDRESS_INPUT" && showAddressForm && <AddressComponent onAddressSaved={} />}

              {stepType === "NOTES_INPUT" && m.stepIndex === currentStep && (
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
                      pushUserMessage(notes, currentStep);
                      setNotes("");
                      setCurrentStep((s) => s + 1);
                    }}
                  >
                    <Text style={{ color: "#fff" }}>Send</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setCurrentStep((s) => s + 1)}>
                    <Text style={styles.skip}>Skip notes</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        {showBadge && <BadgeCard />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#F2F7FF", padding: scale(10) },
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
