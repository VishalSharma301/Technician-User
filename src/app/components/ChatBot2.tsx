import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  ScrollView as ScrollViewType,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { scale, moderateScale, verticalScale } from "../../utils/scaling";
import { useAddress } from "../../hooks/useAddress";
import AddressComponent from "./AddressForm";
import { useChatGPTTyping } from "../../hooks/useChatGptTyping";
import TypingDots from "./TypingDots";
import { useCart } from "../../hooks/useCart";
import { ServiceData, ServiceOption } from "../../constants/types";
import { Brand } from "../../constants/serviceRequestTypes";

/* -----------------------------------------------------------
   TYPES USED ONLY IN THIS COMPONENT
-------------------------------------------------------------*/

export type StepType =
  | "GREETING"
  | "BRAND_SELECTION"
  | "OPTION_SELECTION"
  | "QUANTITY_SELECTION"
  | "QUANTITY_CONFIRM"
  | "NOTES_INPUT"
  | "ADDRESS_INPUT"
  | "FINAL_CONFIRMATION";

export interface ConversationConfig {
  brandsSource?: string;
  optionsSource?: string;
  showBrands?: boolean;
  showOptions?: boolean;
  [key: string]: any;
}

export interface ConversationStep {
  _id: string;
  stepType: StepType;
  messageTemplate: string;
  isActive: boolean;
  config?: ConversationConfig;
  [key: string]: any;
}

export interface ConversationSettings {
  agentName?: string;
  [key: string]: any;
}

export interface Message {
  id: string;
  from: "user" | "bot" | "user-voice";
  text: string;
  time?: string;
  stepIndexAtSend?: number;
}

/* -----------------------------------------------------------
   COMPONENT PROPS
-------------------------------------------------------------*/

interface ChatbotBookingProps {
  serviceObject: { data: ServiceData; zipcode: string };
  close: () => void;
}

/* -----------------------------------------------------------
   MAIN COMPONENT
-------------------------------------------------------------*/

export default function ChatbotBooking_NewFlow({
  serviceObject,
  close,
}: ChatbotBookingProps) {
  const service = serviceObject.data;

  const { addresses, setSelectedAddress } = useAddress();
  const { addToCart } = useCart();
  const { showTypingIndicator, typeText } = useChatGPTTyping();

  const conversationSettings: ConversationSettings =
    service.conversationSettings;
  const conversationSteps: ConversationStep[] = service.conversationSteps;

  const scrollRef = useRef<ScrollViewType | null>(null);
  const lastBotStepRef = useRef<number | null>(null);



  const [messages, setMessages] = useState<Message[]>([]);
  const [stepIndex, setStepIndex] = useState<number>(0);

  const [vars, setVars] = useState<any>({
    zipcode: serviceObject.zipcode ?? "",
    serviceName: service.name ?? "",
    selectedOption: "",
    selectedBrand: "",
    quantity: 1,
    totalPrice: 0,
    address: "",
    estimatedTime: "",
    notes: "",
  });

  const [manualAddressMode, setManualAddressMode] = useState<boolean>(false);
  const [manualMode, setManualMode] = useState<boolean>(false);
  const [manualQtyInput, setManualQtyInput] = useState<string>("");
  const [descriptionInput, setDescriptionInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const EXTRA_UNIT_PRICE = 590;

  /* -----------------------------------------------------------
     TEMPLATE RENDERER
  -------------------------------------------------------------*/

  const renderTemplate = useCallback(
    (template: string): string => {
      if (!template) return "";
      return template.replace(/{{(.*?)}}/g, (_, key) => {
        const k = key.trim();
        return (
          vars[k] ??
          conversationSettings[k] ??
          conversationSteps[stepIndex]?.[k] ??
          ""
        );
      });
    },
    [vars, conversationSettings, conversationSteps, stepIndex]
  );

  /* -----------------------------------------------------------
     PUSH USER MESSAGE
  -------------------------------------------------------------*/
  const pushUserMessage = useCallback((text: string) => {
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
  }, []);

  /* -----------------------------------------------------------
     PUSH BOT MESSAGE WITH TYPING EFFECT
  -------------------------------------------------------------*/
  const pushBotMessage = useCallback(
    (fullText: string) => {
      const dotId = Date.now().toString();

      showTypingIndicator(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: dotId,
            from: "bot",
            text: "__DOTS__",
            stepIndexAtSend: stepIndex,
          },
        ]);
      });

      setIsTyping(true);

      setTimeout(() => {
        setMessages((prev) => prev.filter((m) => m.id !== dotId));

        const realId = (Date.now() + 1).toString();

        setMessages((prev) => [
          ...prev,
          {
            id: realId,
            from: "bot",
            text: "",
            time: "",
            stepIndexAtSend: stepIndex,
          },
        ]);

        typeText(
          fullText,
          (typedText: string) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === realId ? { ...m, text: typedText } : m))
            );
            scrollRef.current?.scrollToEnd({ animated: true });
          },
          () => {
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
            setTimeout(() => setIsTyping(false), 50);
          }
        );
      }, 700);
    },
    [stepIndex, typeText, showTypingIndicator]
  );

  /* -----------------------------------------------------------
     GO TO NEXT ACTIVE STEP
  -------------------------------------------------------------*/
  const goToNextActiveStep = useCallback(() => {
    for (let i = stepIndex + 1; i < conversationSteps.length; i++) {
      if (conversationSteps[i].isActive) {
        setStepIndex(i);
        return;
      }
    }
    // fallback: last step
    setStepIndex(conversationSteps.length - 1);
  }, [stepIndex, conversationSteps]);

  /* -----------------------------------------------------------
     STEP CHANGE -> SEND BOT MESSAGE
  -------------------------------------------------------------*/
useEffect(() => {
  if (!conversationSteps.length) return;

  // Prevent duplicate bot messages for same step
  if (lastBotStepRef.current === stepIndex) return;

  lastBotStepRef.current = stepIndex;

  const stepObj = conversationSteps[stepIndex];
  if (!stepObj) return;

  const msg = renderTemplate(stepObj.messageTemplate || "");

  setTimeout(() => pushBotMessage(msg), 300);
}, [stepIndex]);

  /* -----------------------------------------------------------
     OPTION HANDLERS (all typed)
  -------------------------------------------------------------*/

const restartConversationFromStep = (stepType: StepType) => {
  const index = conversationSteps.findIndex(s => s.stepType === stepType);
  if (index !== -1) {
    setStepIndex(index);
    setMessages(prev => prev.filter(m => m.stepIndexAtSend < index));
  }
};

  const handleGreeting = () => {
    pushUserMessage("Confirm");
    goToNextActiveStep();
  };

 const handleBrand = (b: Brand) => {
  setVars(v => ({ ...v, selectedBrand: b.name }));
  restartConversationFromStep("BRAND_SELECTION");
};


 const handleType = (t: ServiceOption) => {
  setVars(v => ({ ...v, selectedOption: t.name, selectedType: t }));
  restartConversationFromStep("OPTION_SELECTION");
};


 const handleQuantitySelection = (units: number) => {
  setVars(v => ({ ...v, quantity: units }));
  restartConversationFromStep("QUANTITY_SELECTION");
};


 const handleDescriptionSubmit = () => {
  setVars(v => ({ ...v, notes: descriptionInput.trim() }));
  restartConversationFromStep("NOTES_INPUT");
};


  const handleSelectAddress = (addr: any) => {
    pushUserMessage(`${addr.label}, ${addr.address.street}`);
    setSelectedAddress(addr);
    setVars((v: any) => ({
      ...v,
      address: `${addr.label}, ${addr.address.street}`,
    }));
    goToNextActiveStep();
  };

  /* -----------------------------------------------------------
     PRICING (fully typed)
  -------------------------------------------------------------*/

  const PRICING = [
    {
      id: "single",
      title: "Single Unit",
      price: vars.selectedType?.singlePrice ?? 0,
      count: 1,
    },
    {
      id: "double",
      title: "Double Units",
      price: vars.selectedType?.doublePrice ?? 0,
      count: 2,
    },
    {
      id: "triple",
      title: "Triple Units",
      price: vars.selectedType?.triplePrice ?? 0,
      count: 3,
    },
  ];

  const totalUnits = (): number =>
    manualMode && manualQtyInput
      ? Number(manualQtyInput)
      : vars.quantity ?? 1;

  const calculateTotal = (): number => {
    const total = totalUnits();
    if (total <= 3) return PRICING[total - 1]?.price ?? 0;
    return PRICING[2].price + (total - 3) * EXTRA_UNIT_PRICE;
  };




  /* -----------------------------------------------------------
     ADD TO CART
  -------------------------------------------------------------*/
  const handleAddToCart = () => {
    pushUserMessage("Add to cart");

    const total = totalUnits();
    const price = calculateTotal();

    const svc = {
      ...service,
      basePrice: price,
      name: `${vars.selectedOption} - ${total} Units`,
      description: `User Issue: ${vars.notes || ""}`,
    };

    addToCart(
      svc,
      vars.selectedType ?? null,
      vars.selectedBrand ?? null,
      total
    );

    pushBotMessage("Added to cart 🎉");
  };

  /* -----------------------------------------------------------
     RENDER OPTIONS (fully typed)
  -------------------------------------------------------------*/
  const renderOptionsForStep = () => {
    const stepObj = conversationSteps[stepIndex];
    if (!stepObj) return null;

    const cfg = stepObj.config ?? {};

    /** GREETING **/
    if (stepObj.stepType === "GREETING") {
      return (
        <View style={{ flexDirection: "row", gap: scale(8) }}>
          <TouchableOpacity
            style={[styles.optionBtn, {
              width: scale(176.5),
              height: verticalScale(37.39),
              backgroundColor: NEW_COLORS[0].bg,
              borderColor: NEW_COLORS[0].border,
            }]}
            onPress={handleGreeting}
          >
            <Text style={styles.optionText}>Confirm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionBtn, {
              width: scale(176.5),
              height: verticalScale(37.39),
              backgroundColor: NEW_COLORS[1].bg,
              borderColor: NEW_COLORS[1].border,
            }]}
            onPress={close}
          >
            <Text style={styles.optionText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      );
    }

    /** BRAND SELECTION **/
    if (stepObj.stepType === "BRAND_SELECTION" || cfg.showBrands) {
      const brands: Brand[] = service.brands ?? [];

      return (
        <View style={{flexDirection : 'row', flexWrap : 'wrap', gap : scale(10)}}>
          {brands.map((b) => (
            <TouchableOpacity
              key={b._id}
              style={[
                styles.optionBtn,
                {
                  width: scale(117.9),
                  backgroundColor: "#C8E6FF1A",
                  borderColor: "#C8E6FF80",
                },
              ]}
              onPress={() => handleBrand(b)}
            >
              <Text style={styles.optionText}>{b.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    /** OPTION SELECTION **/
    if (stepObj.stepType === "OPTION_SELECTION" || cfg.showOptions) {
      const options: ServiceOption[] = service.options ?? [];

      return (
       <View style={{ gap: verticalScale(8) }}>
          {options.map((t, index) => (
            <TouchableOpacity
              key={t._id}
              style={[
                styles.optionBtn,
                {
                  backgroundColor: TYPE_COLORS[index % TYPE_COLORS.length].bg,
                  borderColor: TYPE_COLORS[index % TYPE_COLORS.length].border,
                },
              ]}
              onPress={() => handleType(t)}
            >
              <Text style={styles.optionText}>{t.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    /** QUANTITY SELECTION **/
    if (stepObj.stepType === "QUANTITY_SELECTION") {
      return (
        <View style={{ gap: verticalScale(8) }}>
          {PRICING.map((p, index) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.optionBtn,
                {
                  backgroundColor: TYPE_COLORS[index % TYPE_COLORS.length].bg,
                  borderColor: TYPE_COLORS[index % TYPE_COLORS.length].border,
                },
              ]}
              onPress={() => handleQuantitySelection(p.count)}
            >
              <Text style={styles.optionText}>
                {p.title} - ₹{p.price}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Manual Qty */}
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
                disabled={!manualQtyInput}
                style={[
                  styles.optionBtn,
                  {
                    backgroundColor: "#014e0789",
                    borderColor: "#014e07",
                    marginTop: verticalScale(10),
                    opacity: !manualQtyInput ? 0.3 : 1,
                  },
                ]}
                onPress={() => {
                  const units = Number(manualQtyInput);
                  if (units < 1 || units > 10) {
                    return Alert.alert(
                      "Use a number between 1 and 10"
                    );
                  }
                  setManualMode(false);
                  handleQuantitySelection(units);
                }}
              >
                <Text style={styles.optionText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    }

      if (stepObj.stepType === "QUANTITY_CONFIRM") {
      return (
        <View style={{ flexDirection: "row", gap: scale(8) }}>
          <TouchableOpacity
            style={[styles.optionBtn, {
              width: scale(176.5),
              height: verticalScale(37.39),
              backgroundColor: NEW_COLORS[0].bg,
              borderColor: NEW_COLORS[0].border,
            }]}
            onPress={handleGreeting}
          >
            <Text style={styles.optionText}>Confirm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionBtn, {
              width: scale(176.5),
              height: verticalScale(37.39),
              backgroundColor: NEW_COLORS[1].bg,
              borderColor: NEW_COLORS[1].border,
            }]}
            onPress={close}
          >
            <Text style={styles.optionText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      );
    }


    /** NOTES INPUT **/
    if (stepObj.stepType === "NOTES_INPUT") {
      return (
        <View style={{ padding: scale(10) }}>
          <TextInput
            placeholder="Describe your issue..."
            value={descriptionInput}
            onChangeText={setDescriptionInput}
            style={styles.descriptionInput}
          />
          <TouchableOpacity style={styles.sendTextBtn} onPress={handleDescriptionSubmit}>
            <Text style={{ color: "#fff" }}>Send</Text>
          </TouchableOpacity>
        </View>
      );
    }

    /** ADDRESS SELECTION **/
    if (stepObj.stepType === "ADDRESS_INPUT") {
      return (
        <View style={{ width: "100%", gap: verticalScale(8) }}>
          {addresses.map((addr: any) => (
            <TouchableOpacity
              key={addr._id || addr.label}
              style={[
                styles.optionBtn,
                {
                  backgroundColor: TYPE_COLORS[1].bg,
                  borderColor: TYPE_COLORS[1].border,
                },
              ]}
              onPress={() => handleSelectAddress(addr)}
            >
              <Text style={styles.optionText}>
                {addr.label} - {addr.address.street}, {addr.address.city}
              </Text>
            </TouchableOpacity>
          ))}

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
            <Text style={styles.optionText}>📍 Add New Address</Text>
          </TouchableOpacity>

          {manualAddressMode && <AddressComponent />}
        </View>
      );
    }

    /** FINAL CONFIRMATION **/
    if (stepObj.stepType === "FINAL_CONFIRMATION") {
      return (
        <View style={{ flexDirection: "row", gap: scale(8) }}>
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

    return null;
  };

  /* -----------------------------------------------------------
     RENDER
  -------------------------------------------------------------*/

  return (
    <KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === "ios" ? "padding" : "height"}
  keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
>
    <View style={styles.wrapper}>
      {/* HEADER */}
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

          <TouchableOpacity onPress={close} style={styles.closeBtn}>
            <Text style={{ fontSize: moderateScale(20), color: "#fff" }}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MESSAGES */}
      <ScrollView ref={scrollRef} style={{ flex: 1, paddingHorizontal: scale(8) }}>
        {messages.map((m, index) => {
          const isUser = m.from === "user" || m.from === "user-voice";
          const isLastBotMessage =
            !isUser &&
            messages[index]?.id === messages[messages.length - 1]?.id &&
            messages[messages.length - 1]?.stepIndexAtSend === stepIndex;

          return (
            <View key={m.id} style={styles.messageBlock}>
              {/* Avatar */}
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

              {/* Bubble */}
              <View
                style={[
                  styles.bubble,
                  isUser ? styles.userBubble : styles.botBubble,
                  isUser ? styles.bubbleRight : styles.bubbleLeft,
                ]}
              >
                {m.text === "__DOTS__" ? (
                  <TypingDots />
                ) : (
                  <Text
                    style={{
                      color: isUser ? "#fff" : "#000",
                      fontSize: moderateScale(15),
                      fontWeight: "400",
                    }}
                  >
                    {m.text}
                  </Text>
                )}
              </View>

              {/* Time */}
              <Text
                style={[
                  styles.timeText,
                  isUser ? styles.timeRight : styles.timeLeft,
                ]}
              >
                {m.time}
              </Text>

              {/* OPTIONS BELOW LAST BOT MESSAGE */}
              <View style={styles.inlineOptions}>
  {renderOptionsForStep()}
</View>
              {/* {!isUser && isLastBotMessage && !isTyping && (
                <View style={styles.inlineOptions}>{renderOptionsForStep()}</View>
              )} */}
            </View>
          );
        })}
      </ScrollView>
    </View>
    </KeyboardAvoidingView>
  );
}

/* -----------------------------------------------------------
   STYLES
-------------------------------------------------------------*/

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
  // message styles
  messageBlock: { marginBottom: verticalScale(25) },
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
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLabel: {
    fontSize: moderateScale(13),
    color: "#3A4A5A",
    marginLeft: scale(6),
  },
  bubble: {
    width: "90%",
    padding: scale(12),
    borderBottomLeftRadius: scale(12),
    borderBottomRightRadius: scale(12),
  },
  bubbleLeft: { alignSelf: "flex-start", borderTopRightRadius: scale(12) },
  bubbleRight: { alignSelf: "flex-end", borderTopLeftRadius: scale(12) },
  botBubble: {
    backgroundColor: "#DAF1FF",
    borderWidth: 1,
    borderColor: "#D3E5FF",
  },
  userBubble: { backgroundColor: "#027CC7" },
  timeText: {
    fontSize: moderateScale(11),
    color: "#7A869A",
    marginTop: verticalScale(4),
  },
  timeLeft: { alignSelf: "flex-start" },
  timeRight: { alignSelf: "flex-end" },
  inlineOptions: { marginTop: verticalScale(10), width: "100%" },

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
    backgroundColor: "#FFFFFF",
    fontSize: moderateScale(14),
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
});
