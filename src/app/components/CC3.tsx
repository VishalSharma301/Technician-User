// ChatbotBooking3.tsx
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
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
  Animated,
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
   TYPES (kept from your file, slightly extended)
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
  stepNumber?: number;
  agentName?: string;
  config?: ConversationConfig;
  [key: string]: any;
}

export interface ConversationSettings {
  agentName?: string;
  [key: string]: any;
}

export interface StepOption {
  id: string;
  label: string;
  value: any;
  isSelected: boolean;
  type: "brand" | "option" | "quantity" | "address" | "action" | string;
  metadata?: any;
  stepId?: string; // important for rewind mapping
  stepType?: StepType;
}

export interface Message {
  id: string;
  from: "user" | "bot" | "user-voice";
  text: string;
  time?: string;
  stepId?: string; // step _id for bot messages
  stepIndexAtSend?: number;
  stepType?: StepType;
  options?: StepOption[];
  isPersistent?: boolean;
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

export default function ChatbotBooking3({
  serviceObject,
  close,
}: ChatbotBookingProps) {
  const service = serviceObject.data;

  const { addresses, setSelectedAddress } = useAddress();
  const { addToCart } = useCart();
  const { showTypingIndicator, typeText } = useChatGPTTyping();
  const [noteInput, setNoteInput] = useState("");

  const conversationSettings: ConversationSettings =
    service.conversationSettings || {};
  const conversationSteps: ConversationStep[] = service.conversationSteps || [];

  const scrollRef = useRef<ScrollViewType | null>(null);

  // animation values map
  const animationValues = useRef<Map<string, Animated.Value>>(new Map());
  const MAX_ANIMATION_VALUES = 50;

  const [messages, setMessages] = useState<Message[]>([]);
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

  // step navigation uses stepId (DeepSeek-style). store currentStepId
  const [currentStepId, setCurrentStepId] = useState<string | null>(
    conversationSteps.find((s) => s.isActive)?._id ?? null
  );

  // store sequence of previous stepIds shown (for rewind detection)
  const [previousStepIds, setPreviousStepIds] = useState<string[]>([]);

  // typing state
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // manual modes
  const [manualAddressMode, setManualAddressMode] = useState<boolean>(false);
  const [manualMode, setManualMode] = useState<boolean>(false);
  const [manualQtyInput, setManualQtyInput] = useState<string>("");
  const [descriptionInput, setDescriptionInput] = useState<string>("");

  // track selected option per stepId
  const [selectedOptionsByStep, setSelectedOptionsByStep] = useState<
    Record<string, StepOption>
  >({});

  const EXTRA_UNIT_PRICE = 590;

  /* -----------------------------------------------------------
     HELPERS: animation utils
  -------------------------------------------------------------*/
  const getAnimationValue = (id: string) => {
    if (!animationValues.current.has(id)) {
      if (animationValues.current.size >= MAX_ANIMATION_VALUES) {
        const firstKey = animationValues.current.keys().next().value;
        animationValues.current.delete(firstKey);
      }
      animationValues.current.set(id, new Animated.Value(1));
    }
    return animationValues.current.get(id)!;
  };

  const animateOptionSelection = (id: string) => {
    const animValue = getAnimationValue(id);
    Animated.sequence([
      Animated.timing(animValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /* -----------------------------------------------------------
     PRICING (kept from your file)
  -------------------------------------------------------------*/
  const PRICING = useMemo(
    () => [
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
    ],
    [vars.selectedType]
  );

  /* -----------------------------------------------------------
     TEMPLATE RENDERING (supports overrides)
  -------------------------------------------------------------*/
  const renderTemplateWithVars = useCallback(
    (template: string, varsToUse: any) => {
      if (!template) return "";
      return template.replace(/{{(.*?)}}/g, (_, key) => {
        const k = key.trim();
        return varsToUse?.[k] ?? conversationSettings[k] ?? "";
      });
    },
    [conversationSettings]
  );

  const renderTemplate = useCallback(
    (template: string): string => {
      if (!template) return "";
      return template.replace(/{{(.*?)}}/g, (_, key) => {
        const k = key.trim();
        return (
          vars[k] ?? conversationSettings[k] ?? "" // step-level fallback not required here
        );
      });
    },
    [vars, conversationSettings]
  );

  /* -----------------------------------------------------------
     OPTION GENERATION (DeepSeek-style but adapted)
     Generates StepOption[] and attaches stepId & stepType
  -------------------------------------------------------------*/
  const generateOptionsForStep = useCallback(
    (stepObj: ConversationStep, varsOverride?: any): StepOption[] => {
      const cfg = stepObj.config ?? {};
      const stepType = stepObj.stepType;
      const stepId = stepObj._id;
      const localVars = varsOverride ?? vars;

      // BRAND_SELECTION
      if (stepType === "BRAND_SELECTION" && (cfg.showBrands ?? true)) {
        const brands: Brand[] = service.brands ?? [];
        return brands.map((brand, index) => ({
          id: `brand-${brand._id}`,
          label: brand.name,
          value: brand,
          isSelected: localVars.selectedBrand === brand.name,
          type: "brand",
          metadata: { index, logo: brand.logo },
          stepId,
          stepType,
        }));
      }

      // OPTION_SELECTION
      if (stepType === "OPTION_SELECTION" && (cfg.showOptions ?? true)) {
        const options: ServiceOption[] = service.options ?? [];
        return options.map((option, index) => ({
          id: `option-${option._id}`,
          label: `${option.name} - ₹${option.singlePrice}`,
          value: option,
          isSelected: localVars.selectedOption === option.name,
          type: "option",
          metadata: { index, singlePrice: option.singlePrice },
          stepId,
          stepType,
        }));
      }

      // QUANTITY_SELECTION
      if (stepType === "QUANTITY_SELECTION") {
        const quantities = PRICING.map((p, index) => ({
          id: `qty-${p.count}`,
          label: `${p.title} - ₹${p.price}`,
          value: p.count,
          isSelected: localVars.quantity === p.count,
          type: "quantity",
          metadata: { price: p.price },
          stepId,
          stepType,
        }));

        quantities.push({
          id: "qty-manual",
          label: "Enter Quantity Manually",
          value: "manual",
          isSelected: false,
          type: "quantity",
          metadata: { isManual: true },
          stepId,
          stepType,
        });

        return quantities;
      }

      // ADDRESS_INPUT
      if (stepType === "ADDRESS_INPUT") {
        const addressOptions = (addresses ?? []).map((addr: any, index) => ({
          id: `addr-${addr._id ?? index}`,
          label: `${addr.label} - ${addr.address.street}, ${addr.address.city}`,
          value: addr,
          isSelected:
            localVars.address === `${addr.label}, ${addr.address.street}`,
          type: "address",
          metadata: { index },
          stepId,
          stepType,
        }));

        addressOptions.push({
          id: "addr-new",
          label: "📍 Add New Address",
          value: "new",
          isSelected: false,
          type: "address",
          metadata: { isNew: true },
          stepId,
          stepType,
        });

        return addressOptions;
      }

      // GREETING
      if (stepType === "GREETING") {
        return [
          {
            id: "greet-confirm",
            label: "Confirm",
            value: "confirm",
            isSelected: false,
            type: "action",
            stepId,
            stepType,
          },
          {
            id: "greet-cancel",
            label: "Cancel",
            value: "cancel",
            isSelected: false,
            type: "action",
            stepId,
            stepType,
          },
        ];
      }

      // QUANTITY_CONFIRM
      if (stepType === "QUANTITY_CONFIRM") {
        return [
          {
            id: "quantity-confirm",
            label: "Confirm",
            value: "confirm",
            isSelected: false,
            type: "action",
            stepId,
            stepType,
          },
          {
            id: "quantity-cancel",
            label: "Cancel",
            value: "cancel",
            isSelected: false,
            type: "action",
            stepId,
            stepType,
          },
        ];
      }

      // FINAL_CONFIRMATION
      if (stepType === "FINAL_CONFIRMATION") {
        return [
          {
            id: "final-confirm",
            label: "Confirm",
            value: "confirm",
            isSelected: false,
            type: "action",
            stepId,
            stepType,
          },
          {
            id: "final-cancel",
            label: "Cancel",
            value: "cancel",
            isSelected: false,
            type: "action",
            stepId,
            stepType,
          },
        ];
      }

      return [];
    },
    [service, vars, addresses, PRICING]
  );

  /* -----------------------------------------------------------
     MESSAGE SYSTEM (DeepSeek-inspired) + streaming typing
     - renderBotMessage(step) creates a bot message with options attached
     - pushBotMessageWithOptions will stream the text using typeText hook
  -------------------------------------------------------------*/

  const pushBotMessageWithOptions = useCallback(
    async (
      fullText: string,
      options: StepOption[] = [],
      stepId?: string,
      stepType?: StepType
    ): Promise<string> => {
      const messageId = Date.now().toString();

      // insert placeholder bot message (empty) so persistent UI can attach to it immediately
      const newMessage: Message = {
        id: messageId,
        from: "bot",
        text: "", // will be filled by streaming
        stepId,
        stepIndexAtSend: conversationSteps.findIndex((s) => s._id === stepId),
        stepType,
        options: [], // attach later after typing completes (but we keep message present)
      };

      // Add placeholder message (so UI shows typing dots area)
      setMessages((prev) => [...prev, newMessage]);

      // Show typing indicator (your hook)
      showTypingIndicator(() => {
        // add DOTS message (so your TypingDots component will render)
        setMessages((prev) => [
          ...prev,
          {
            id: `${messageId}-dots`,
            from: "bot",
            text: "__DOTS__",
            stepId,
            stepIndexAtSend: newMessage.stepIndexAtSend,
            stepType,
          },
        ]);
      });

      setIsTyping(true);

      // small delay so dot appears
      await new Promise((res) => setTimeout(res, 600));

      // remove dots placeholder (handled in typeText's completion as well, but ensure removal)
      setMessages((prev) => prev.filter((m) => m.id !== `${messageId}-dots`));

      // Stream text using your typeText hook; it accepts callbacks for each chunk and complete
      typeText(
        fullText,
        (typedText: string) => {
          // update placeholder message with typed text
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId ? { ...m, text: typedText } : m
            )
          );
          scrollRef.current?.scrollToEnd({ animated: true });
        },
        () => {
          // on complete, finalize message: set time and attach options
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId
                ? {
                    ...m,
                    text: m.text || fullText,
                    time: new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    }),
                    options: options.length ? options : m.options,
                  }
                : m
            )
          );
          // mark step as shown
          if (stepId) {
            setPreviousStepIds((prev) => {
              // avoid duplicates, keep order
              if (prev.includes(stepId)) return prev;
              return [...prev, stepId];
            });
          }
          setTimeout(() => setIsTyping(false), 50);
          // scroll after finishing
          setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
        }
      );

      return messageId;
    },
    [conversationSteps, showTypingIndicator, typeText]
  );

  const pushUserMessage = useCallback(
    (text: string, stepId?: string, stepType?: StepType) => {
      const msg: Message = {
        id: Date.now().toString(),
        from: "user",
        text,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        stepId,
        stepType,
      };

      setMessages((prev) => [...prev, msg]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    },
    []
  );

  /* -----------------------------------------------------------
     MOVE TO NEXT STEP (by stepId)
     Finds next active step after the given stepId (or currentStepId)
  -------------------------------------------------------------*/
  const moveToNextStep = useCallback(
    (fromStepId?: string) => {
      // determine index to start searching from
      const startIndex =
        conversationSteps.findIndex((s) => s._id === (fromStepId ?? currentStepId)) + 1;

      for (let i = startIndex; i < conversationSteps.length; i++) {
        const s = conversationSteps[i];
        if (s.isActive) {
          // set current and render bot message
          setCurrentStepId(s._id);
          // render bot message (with merged vars)
          const msgText = renderTemplateWithVars(s.messageTemplate || "", vars);
          const opts = generateOptionsForStep(s, vars);
          pushBotMessageWithOptions(msgText, opts, s._id, s.stepType);
          return;
        }
      }

      // No next active step: conversation finished — set currentStepId null
      setCurrentStepId(null);
      return;
    },
    [conversationSteps, currentStepId, generateOptionsForStep, pushBotMessageWithOptions, renderTemplateWithVars, vars]
  );

  /* -----------------------------------------------------------
     REWIND SYSTEM (EXACT DeepSeek logic, adapted)
     handleRewind(option) trims messages after the bot message with that stepId,
     updates dependent vars, inserts user message and jumps forward.
  -------------------------------------------------------------*/
  const handleRewind = useCallback(
    (clickedOption: StepOption) => {
      const clickedStepId = clickedOption.stepId;
      if (!clickedStepId) return;

      // find index of the bot message that produced that stepId (latest)
      const botMessageIndex = messages.findIndex(
        (m) => m.from === "bot" && m.stepId === clickedStepId
      );

      if (botMessageIndex === -1) return;

      // Trim conversation to that bot message (inclusive)
      const trimmedMessages = messages.slice(0, botMessageIndex + 1);

      // Determine which vars to update based on clicked option's stepType
      const variableUpdates: Partial<any> = {};
      const dependenciesToClear: string[] = [];

      switch (clickedOption.stepType) {
        case "OPTION_SELECTION":
          variableUpdates.selectedOption = clickedOption.value?.name ?? clickedOption.value;
          variableUpdates.selectedType = clickedOption.value ?? null;
          dependenciesToClear.push("selectedBrand", "quantity", "totalPrice", "address", "notes");
          break;
        case "BRAND_SELECTION":
          variableUpdates.selectedBrand = clickedOption.value?.name ?? clickedOption.value;
          dependenciesToClear.push("quantity", "totalPrice", "address", "notes");
          break;
        case "QUANTITY_SELECTION":
          variableUpdates.quantity = typeof clickedOption.value === "number" ? clickedOption.value : 1;
          dependenciesToClear.push("totalPrice", "notes");
          break;
        case "ADDRESS_INPUT":
          variableUpdates.address = typeof clickedOption.value === "string"
            ? clickedOption.value
            : clickedOption.value?.label
            ? `${clickedOption.value.label}, ${clickedOption.value.address?.street ?? ""}`
            : "";
          dependenciesToClear.push("notes");
          break;
        case "NOTES_INPUT":
          variableUpdates.notes = clickedOption.value ?? "";
          break;
        default:
          break;
      }

      // Clear dependent variables
      dependenciesToClear.forEach((d) => {
        if (d === "totalPrice") variableUpdates[d] = 0;
        else if (d === "quantity") variableUpdates[d] = 1;
        else variableUpdates[d] = "";
      });

      // Apply variable updates immediately
      setVars((prev) => ({ ...prev, ...variableUpdates }));

      // Add user's new message (the clicked option) to trimmed messages
      const userMessage: Message = {
        id: `user-rewind-${Date.now()}`,
        from: "user",
        text: clickedOption.label,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        stepId: clickedStepId,
        stepType: clickedOption.stepType,
      };

      // Update the bot message's options (mark selected) in trimmedMessages
      const updatedTrimmed = trimmedMessages.map((m) => {
        if (m.from === "bot" && m.options && m.stepId === clickedStepId) {
          return {
            ...m,
            options: m.options.map((opt) => ({
              ...opt,
              isSelected: opt.id === clickedOption.id,
            })),
          };
        }
        return m;
      });

      // Compose new messages array
      const newMessages = [...updatedTrimmed, userMessage];
      setMessages(newMessages);

      // Update selectedOptionsByStep
      setSelectedOptionsByStep((prev) => ({
        ...Object.keys(prev)
          .filter((k) => {
            // keep only entries up to clickedStepId (by order in conversationSteps)
            const sIdx = conversationSteps.findIndex((s) => s.stepType === (prev[k]?.stepType as StepType) || s._id === k);
            const clickedIdx = conversationSteps.findIndex((s) => s._id === clickedStepId);
            return sIdx !== -1 && sIdx <= clickedIdx;
          })
          .reduce((acc, key) => {
            acc[key] = prev[key];
            return acc;
          }, {} as Record<string, StepOption>),
        [clickedStepId]: clickedOption,
      }));

      // Set current step to the clicked step (so when moving forward it continues)
      setCurrentStepId(clickedStepId);

      // After a tiny delay, move to next active step (replay forward)
      setTimeout(() => {
        moveToNextStep(clickedStepId);
      }, 250);
    },
    [messages, conversationSteps, moveToNextStep]
  );

  /* -----------------------------------------------------------
     MAIN OPTION HANDLER (calls rewind if clicking on previous step)
     Mirrors DeepSeek: if option.stepId is in previousStepIds and not equal currentStepId => rewind
  -------------------------------------------------------------*/
  const handleOptionSelection = useCallback(
    (option: StepOption) => {
      // animate
      animateOptionSelection(option.id);

      // If this option belongs to a previous step (rewind)
      if (
        option.stepId &&
        previousStepIds.includes(option.stepId) &&
        option.stepId !== currentStepId
      ) {
        handleRewind(option);
        return;
      }

      // Standard current-step selection:
      // 1. Add user message
      pushUserMessage(option.label, option.stepId, option.stepType);

      // 2. Update vars according to option type
      const varUpdates: any = {};
      switch (option.type) {
        case "brand":
          varUpdates.selectedBrand = option.value?.name ?? option.value;
          break;
        case "option":
          varUpdates.selectedOption = option.value?.name ?? option.value;
          varUpdates.selectedType = option.value ?? option.value;
          break;
        case "quantity":
          if (typeof option.value === "number") varUpdates.quantity = option.value;
          break;
        case "address":
          if (option.value === "new") {
            setManualAddressMode(true);
          } else {
            varUpdates.address =
              option.value?.label ?? `${option.value.label}, ${option.value.address?.street ?? ""}`;
            if (setSelectedAddress && option.value && option.value._id) {
              setSelectedAddress(option.value);
            }
          }
          break;
        case "action":
          // handle special actions (cancel/confirm)
          if (option.value === "cancel") {
            close();
          }
          break;
      }

      if (Object.keys(varUpdates).length) {
        setVars((prev) => ({ ...prev, ...varUpdates }));
      }

      // 3. Mark selected option in that bot message's options (persist)
      setMessages((prev) =>
        prev.map((m) => {
          if (m.from === "bot" && m.stepId === option.stepId && m.options) {
            return {
              ...m,
              options: m.options.map((opt) => ({
                ...opt,
                isSelected: opt.id === option.id,
              })),
            };
          }
          return m;
        })
      );

      // 4. store in selectedOptionsByStep
      if (option.stepId) {
        setSelectedOptionsByStep((prev) => ({
          ...prev,
          [option.stepId!]: option,
        }));
      }

      // 5. Move to next step (auto)
      // If the option is a 'confirm' at final step, you might call addToCart etc. Here we just move forward.
      setTimeout(() => {
        moveToNextStep(option.stepId);
      }, 260);
    },
    [previousStepIds, currentStepId, handleRewind, pushUserMessage, setSelectedAddress, moveToNextStep, close]
  );

  /* -----------------------------------------------------------
     UPDATE OPTIONS HELPERS (to keep persistent UI consistent)
  -------------------------------------------------------------*/
  const updateOptionsForMessage = useCallback((messageId: string, newOptions: StepOption[]) => {
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, options: newOptions } : m)));
  }, []);

  const getOptionsForStepId = useCallback((stepId?: string) => {
    if (!stepId) return [];
    const msgs = messages.filter((m) => m.from === "bot" && m.stepId === stepId && m.options);
    if (!msgs.length) return [];
    return msgs[msgs.length - 1].options || [];
  }, [messages]);

  const getLatestBotMessageForStepId = useCallback((stepId?: string) => {
    if (!stepId) return null;
    const msgs = messages.filter((m) => m.from === "bot" && m.stepId === stepId);
    return msgs.length ? msgs[msgs.length - 1] : null;
  }, [messages]);

  /* -----------------------------------------------------------
     INITIAL START: render first active step (DeepSeek start)
  -------------------------------------------------------------*/
 useEffect(() => {
  if (!conversationSteps.length) return;
  if (currentStepId) return;  // don’t re-init if already set

  const first = conversationSteps.find((s) => s.isActive);
  if (!first) return;

  // ONLY set the stepId — do NOT push bot message here
  setCurrentStepId(first._id);
}, [conversationSteps]);


  /* -----------------------------------------------------------
     EFFECT: when currentStepId is manually set (e.g., after rewind),
     ensure a bot message is pushed if not already present for it.
  -------------------------------------------------------------*/
  useEffect(() => {
    if (!currentStepId) return;
    // If latest bot message for this step already exists, do nothing
    const latest = getLatestBotMessageForStepId(currentStepId);
    if (latest) return;

    const stepObj = conversationSteps.find((s) => s._id === currentStepId);
    if (!stepObj) return;

    const msgText = renderTemplateWithVars(stepObj.messageTemplate || "", vars);
    const opts = generateOptionsForStep(stepObj, vars);
    pushBotMessageWithOptions(msgText, opts, stepObj._id, stepObj.stepType);
  }, [currentStepId, conversationSteps, getLatestBotMessageForStepId, generateOptionsForStep, pushBotMessageWithOptions, vars]);

  /* -----------------------------------------------------------
     RENDER PERSISTENT OPTIONS (keeps your UI - but uses options from bot message)
  -------------------------------------------------------------*/
  const renderPersistentOptions = (message: Message) => {
    const hasOptions = message.options && message.options.length > 0;
    const isNotesStep = message.stepType === "NOTES_INPUT";

    if (!hasOptions && !isNotesStep) {
      return null;
    }

    const stepType = message.stepType;

    return (
      <View style={styles.persistentOptionsContainer}>
        {hasOptions && (
          <View style={styles.persistentOptionsGrid}>
            {message.options?.map((option) => (
              <Animated.View
                key={option.id}
                style={{
                  transform: [{ scale: getAnimationValue(option.id) }],
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.persistentOptionBtn,
                    option.isSelected && styles.persistentOptionSelected,
                    option.type === "brand" && styles.brandOption,
                    option.type === "option" && styles.optionOption,
                    option.type === "quantity" && styles.quantityOption,
                    option.type === "address" && styles.addressOption,
                    option.type === "action" && styles.actionOption,
                  ]}
                  onPress={() => {
                    // handle manual/confirm flows
                    if (option.value === "manual" && stepType === "QUANTITY_SELECTION") {
                      setManualMode(true);
                      return;
                    } else if (option.value === "new" && stepType === "ADDRESS_INPUT") {
                      setManualAddressMode(true);
                      return;
                    } else if (option.value === "cancel") {
                      close();
                      return;
                    } else {
                      // Normal selection handler - passes entire option object
                      handleOptionSelection(option);
                      return;
                    }
                  }}
                  disabled={isTyping}
                >
                  <Text
                    style={[
                      styles.persistentOptionText,
                      option.isSelected && styles.persistentOptionTextSelected,
                    ]}
                  >
                    {option.label}
                    {option.isSelected && " ✓"}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}

        {/* Manual Quantity Input */}
        {message.stepType === "QUANTITY_SELECTION" && manualMode && (
          <View style={styles.manualInputContainer}>
            <TextInput
              keyboardType="numeric"
              placeholder="Enter number (1-10)"
              value={manualQtyInput}
              onChangeText={setManualQtyInput}
              style={styles.input}
            />
            <View style={styles.manualInputButtons}>
              <TouchableOpacity
                style={[styles.optionBtn, styles.cancelBtn]}
                onPress={() => setManualMode(false)}
              >
                <Text style={styles.optionText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!manualQtyInput}
                style={[
                  styles.optionBtn,
                  styles.confirmBtn,
                  !manualQtyInput && styles.disabledBtn,
                ]}
                onPress={() => {
                  const units = Number(manualQtyInput);
                  if (units < 1 || units > 10) {
                    Alert.alert("Use a number between 1 and 10");
                    return;
                  }
                  setManualMode(false);

                  // Construct an option shaped object for manual qty and handle selection
                  const manualOption: StepOption = {
                    id: `qty-manual-${units}`,
                    label: `${units} Units`,
                    value: units,
                    isSelected: true,
                    type: "quantity",
                    stepId: message.stepId,
                    stepType: message.stepType,
                  };

                  handleOptionSelection(manualOption);
                  setManualQtyInput("");
                }}
              >
                <Text style={styles.optionText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Address Input */}
        {stepType === "ADDRESS_INPUT" && manualAddressMode && <AddressComponent />}

        {/* NOTES INPUT FIELD */}
        {stepType === "NOTES_INPUT" && (
          <View style={{ marginTop: verticalScale(10) }}>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Write notes here..."
              value={noteInput}
              onChangeText={setNoteInput}
              editable={!isTyping}
            />

            <TouchableOpacity
              style={[
                styles.sendTextBtn,
                { opacity: noteInput.trim() === "" ? 0.5 : 1 },
              ]}
              disabled={noteInput.trim() === "" || isTyping}
              onPress={() => {
                // Create a fake StepOption for notes input and pass to handler
                const notesOption: StepOption = {
                  id: `notes-${Date.now()}`,
                  label: noteInput,
                  value: noteInput,
                  isSelected: true,
                  type: "action",
                  stepId: message.stepId,
                  stepType: message.stepType,
                };

                handleOptionSelection(notesOption);
                setNoteInput("");
              }}
            >
              <Text style={{ color: "#fff", fontSize: moderateScale(14) }}>
                Send
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
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
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1, paddingHorizontal: scale(8) }}
          contentContainerStyle={styles.scrollContent}
        >
          {messages.map((m) => {
            const isUser = m.from === "user" || m.from === "user-voice";
            const isBotWithOptions = m.from === "bot" && m.options && m.options.length > 0;

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

                {/* PERSISTENT OPTIONS */}
                {(isBotWithOptions || m.stepType === "NOTES_INPUT") && (
                  <View style={styles.persistentOptionsWrapper}>
                    {renderPersistentOptions(m)}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

/* -----------------------------------------------------------
   STYLES (kept from your file)
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
  scrollContent: {
    paddingBottom: verticalScale(20),
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
  // Message styles
  messageBlock: {
    marginBottom: verticalScale(25),
    minHeight: verticalScale(80),
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
    minHeight: verticalScale(50),
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
  // Persistent Options Styles
  persistentOptionsWrapper: {
    marginTop: verticalScale(12),
    marginLeft: scale(45),
    marginRight: scale(10),
  },
  persistentOptionsContainer: {
    borderRadius: scale(12),
    padding: scale(12),
    borderWidth: 1,
  },
  persistentOptionsTitle: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#3A4A5A",
    marginBottom: scale(8),
  },
  persistentOptionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(8),
  },
  persistentOptionBtn: {
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: "#D3E5FF",
    backgroundColor: "#FFFFFF",
    marginBottom: scale(4),
  },
  persistentOptionSelected: {
    backgroundColor: "#027CC7",
    borderColor: "#027CC7",
  },
  brandOption: {
    backgroundColor: "#C8E6FF1A",
    borderColor: "#C8E6FF80",
  },
  optionOption: {
    backgroundColor: "#9FE8C41A",
    borderColor: "#9FE8C480",
  },
  quantityOption: {
    backgroundColor: "#EAE2B733",
    borderColor: "#EAE2B780",
  },
  addressOption: {
    backgroundColor: "#F6B36B1A",
    borderColor: "#F77F0033",
  },
  actionOption: {
    backgroundColor: "#F2F7FF",
    borderColor: "#027CC7",
  },
  persistentOptionText: {
    fontSize: moderateScale(13),
    color: "#3A4A5A",
    fontWeight: "500",
  },
  persistentOptionTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  // Manual Input
  manualInputContainer: {
    marginTop: verticalScale(12),
    padding: scale(12),
    backgroundColor: "rgba(242, 247, 255, 0.9)",
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: "#D3E5FF",
  },
  manualInputButtons: {
    flexDirection: "row",
    gap: scale(8),
    marginTop: verticalScale(8),
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#FFE5E5",
    borderColor: "#FF0000",
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: "#9FE8C41A",
    borderColor: "#00CDBD",
  },
  disabledBtn: {
    opacity: 0.5,
  },
  // Common Styles
  optionBtn: {
    height: verticalScale(42),
    paddingHorizontal: scale(16),
    borderRadius: scale(8),
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
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
