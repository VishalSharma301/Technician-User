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
import BadgeCard from "./BadgeCard";
/* -----------------------------------------------------------
   TYPES
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
  stepId?: string;
  stepType?: StepType;
}

export interface Message {
  id: string;
  from: "user" | "bot" | "user-voice";
  text: string;
  time?: string;
  stepId?: string;
  stepType?: StepType;
  options?: StepOption[];
  isPersistent?: boolean;

  // ✅ NEW
  showBadgeCard?: boolean;
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

export default function ChatbotBooking4({
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
    selectedType: null,
    quantity: 1,
    totalPrice: 0,
    address: "",
    estimatedTime: "",
    notes: "",
  });

  // step navigation uses stepId (DeepSeek-style). store currentStepId
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);

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
     PRICING
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
        return vars[k] ?? conversationSettings[k] ?? "";
      });
    },
    [vars, conversationSettings]
  );

  /* -----------------------------------------------------------
     calculate total price and update vars.totalPrice
  -------------------------------------------------------------*/
  const calculateTotalPrice = useCallback(
    (selectedType: any, quantity: number) => {
      if (!selectedType) {
        return EXTRA_UNIT_PRICE * quantity;
      }
      if (quantity === 1) return selectedType.singlePrice ?? EXTRA_UNIT_PRICE;
      if (quantity === 2 && selectedType.doublePrice)
        return selectedType.doublePrice;
      if (quantity === 3 && selectedType.triplePrice)
        return selectedType.triplePrice;
      return (selectedType.singlePrice ?? EXTRA_UNIT_PRICE) * quantity;
    },
    []
  );

  useEffect(() => {
    const newTotal = calculateTotalPrice(vars.selectedType, vars.quantity || 1);
    setVars((prev: any) => ({ ...prev, totalPrice: newTotal }));
  }, [vars.selectedType, vars.quantity, calculateTotalPrice]);

  /* -----------------------------------------------------------
     OPTION GENERATION (DeepSeek-style but adapted)
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
        stepType,
        options: [], // attach later
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
            stepType,
          },
        ]);
      });

      setIsTyping(true);

      // small delay so dot appears
      await new Promise((res) => setTimeout(res, 600));

      // remove dots placeholder (in case)
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
              if (prev.includes(stepId)) return prev;
              return [...prev, stepId];
            });
          }
          setTimeout(() => setIsTyping(false), 50);
          setTimeout(
            () => scrollRef.current?.scrollToEnd({ animated: true }),
            80
          );
        }
      );

      return messageId;
    },
    [showTypingIndicator, typeText]
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
  -------------------------------------------------------------*/
  const moveToNextStep = useCallback(
    (fromStepId?: string) => {
      // find index of the fromStepId (if undefined, start from currentStepId)
      const startIndex =
        conversationSteps.findIndex(
          (s) => s._id === (fromStepId ?? currentStepId)
        ) + 1;

      for (let i = startIndex; i < conversationSteps.length; i++) {
        const s = conversationSteps[i];
        if (s.isActive) {
          setCurrentStepId(s._id);
          const msgText = renderTemplateWithVars(s.messageTemplate || "", vars);
          const opts = generateOptionsForStep(s, vars);
          pushBotMessageWithOptions(msgText, opts, s._id, s.stepType);
          return;
        }
      }

      // end of steps
      setCurrentStepId(null);
      return;
    },
    [
      conversationSteps,
      currentStepId,
      generateOptionsForStep,
      pushBotMessageWithOptions,
      renderTemplateWithVars,
      vars,
    ]
  );

  /* -----------------------------------------------------------
     DEPENDENCY RESET MAP (used in rewind to clear downstream vars)
  -------------------------------------------------------------*/
  const dependencyResetMap: Record<StepType, string[]> = {
    GREETING: [],
    BRAND_SELECTION: [
      "selectedOption",
      "selectedType",
      "quantity",
      "notes",
      "address",
      "totalPrice",
    ],
    OPTION_SELECTION: [
      "selectedBrand",
      "quantity",
      "notes",
      "address",
      "totalPrice",
    ],
    QUANTITY_SELECTION: ["notes", "address", "totalPrice"],
    QUANTITY_CONFIRM: ["notes", "address"],
    NOTES_INPUT: ["address"],
    ADDRESS_INPUT: [],
    FINAL_CONFIRMATION: [],
  };

  /* -----------------------------------------------------------
     REWIND SYSTEM (DeepSeek-style)
  -------------------------------------------------------------*/
  const getLatestBotMessageForStepId = useCallback(
    (stepId?: string) => {
      if (!stepId) return null;
      const msgs = messages.filter(
        (m) => m.from === "bot" && m.stepId === stepId
      );
      return msgs.length ? msgs[msgs.length - 1] : null;
    },
    [messages]
  );

  const handleRewind = useCallback(
    (clickedOption: StepOption) => {
      const clickedStepId = clickedOption.stepId;
      if (!clickedStepId) return;

      // find index of the bot message for the step (latest)
      const botMessageIndex = messages.findIndex(
        (m) => m.from === "bot" && m.stepId === clickedStepId
      );

      if (botMessageIndex === -1) return;

      // Trim messages to that bot message (inclusive)
      const trimmedMessages = messages.slice(0, botMessageIndex + 1);

      // Determine vars to update
      const variableUpdates: Partial<any> = {};
      const resetKeys =
        dependencyResetMap[clickedOption.stepType || "GREETING"] || [];

      // set the clicked value
      switch (clickedOption.stepType) {
        case "OPTION_SELECTION":
          variableUpdates.selectedOption =
            clickedOption.value?.name ?? clickedOption.value;
          variableUpdates.selectedType = clickedOption.value ?? null;
          break;
        case "BRAND_SELECTION":
          variableUpdates.selectedBrand =
            clickedOption.value?.name ?? clickedOption.value;
          break;
        case "QUANTITY_SELECTION":
          variableUpdates.quantity =
            typeof clickedOption.value === "number" ? clickedOption.value : 1;
          break;
        case "ADDRESS_INPUT":
          variableUpdates.address =
            clickedOption.value === "new"
              ? ""
              : clickedOption.value?.label ?? clickedOption.value;
          break;
        case "NOTES_INPUT":
          variableUpdates.notes = clickedOption.value ?? "";
          break;
        default:
          break;
      }

      // Clear downstream dependent keys
      resetKeys.forEach((k) => {
        if (k === "totalPrice") variableUpdates[k] = 0;
        else if (k === "quantity") variableUpdates[k] = 1;
        else variableUpdates[k] = "";
      });

      // Apply variable updates
      setVars((prev) => ({ ...prev, ...variableUpdates }));

      // Update bot message's options to mark selection
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

      // Add user message reflecting the selection
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

      const newMessages = [...updatedTrimmed, userMessage];
      setMessages(newMessages);

      // Update selectedOptionsByStep to keep only steps up to clicked one
      setSelectedOptionsByStep((prev) => {
        const next: Record<string, StepOption> = {};
        const clickedIdx = conversationSteps.findIndex(
          (s) => s._id === clickedStepId
        );
        Object.keys(prev).forEach((key) => {
          const sIdx = conversationSteps.findIndex((s) => s._id === key);
          if (sIdx !== -1 && sIdx <= clickedIdx) next[key] = prev[key];
        });
        next[clickedStepId] = clickedOption;
        return next;
      });

      // Set current step to clicked (so next step continues from it)
      setCurrentStepId(clickedStepId);

      // Replay forward after a short delay
      setTimeout(() => {
        moveToNextStep(clickedStepId);
      }, 250);
    },
    [messages, conversationSteps, moveToNextStep]
  );

  /* -----------------------------------------------------------
     MAIN OPTION HANDLER (uses rewind if necessary)
  -------------------------------------------------------------*/
  const handleOptionSelection = useCallback(
    (option: StepOption) => {
      animateOptionSelection(option.id);

      // Rewind detection: clicked option belongs to a previous step (and not current)
      if (
        option.stepId &&
        previousStepIds.includes(option.stepId) &&
        option.stepId !== currentStepId
      ) {
        handleRewind(option);
        return;
      }

      // Standard current-step selection
      pushUserMessage(option.label, option.stepId, option.stepType);

      // Update vars
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
          if (typeof option.value === "number")
            varUpdates.quantity = option.value;
          break;
        case "address":
          if (option.value === "new") {
            setManualAddressMode(true);
          } else {
            varUpdates.address =
              option.value?.label ??
              `${option.value.label}, ${option.value.address?.street ?? ""}`;
            if (setSelectedAddress && option.value && option.value._id) {
              setSelectedAddress(option.value);
            }
          }
          break;
        case "action":
          if (option.value === "cancel") {
            close();
            return;
          }

          // ✅ FINAL CONFIRMATION LOGIC
          if (
            option.value === "confirm" &&
            option.stepType === "FINAL_CONFIRMATION"
          ) {
            // 1️⃣ Add to cart
            addToCart({
              serviceId: service._id,
              option: vars.selectedType,
              quantity: vars.quantity,
              address: vars.address,
              notes: vars.notes,
              price: vars.totalPrice,
            });

            // 2️⃣ Push success bot message
            setMessages((prev) => [
              ...prev,
              {
                id: `final-msg-${Date.now()}`,
                from: "bot",
                text: "✅ Booking confirmed! Here are your service details.",
                time: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }),
              },
              {
                id: `badge-${Date.now()}`,
                from: "bot",
                text: "",
                showBadgeCard: true, // 👈 IMPORTANT
              },
            ]);

            setCurrentStepId(null); // stop chatbot
            return;
          }

          break;
      }

      if (Object.keys(varUpdates).length) {
        setVars((prev) => ({ ...prev, ...varUpdates }));
      }

      // Mark option selected in the bot message
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

      // Persist selection
      if (option.stepId) {
        setSelectedOptionsByStep((prev) => ({
          ...prev,
          [option.stepId!]: option,
        }));
      }

      // Move forward
      setTimeout(() => {
        moveToNextStep(option.stepId);
      }, 260);
    },
    [
      previousStepIds,
      currentStepId,
      handleRewind,
      pushUserMessage,
      setSelectedAddress,
      moveToNextStep,
      close,
    ]
  );

  /* -----------------------------------------------------------
     UPDATE OPTIONS HELPERS
  -------------------------------------------------------------*/
  const updateOptionsForMessage = useCallback(
    (messageId: string, newOptions: StepOption[]) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, options: newOptions } : m
        )
      );
    },
    []
  );

  /* -----------------------------------------------------------
     INITIAL START: set the first active stepId only (do NOT push message here)
  -------------------------------------------------------------*/
  useEffect(() => {
    if (!conversationSteps.length) return;
    if (messages.length > 0) return; // don't auto-start if messages exist

    const first = conversationSteps.find((s) => s.isActive);
    if (!first) return;

    // only set current step id — the effect below will push the message
    setCurrentStepId(first._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationSteps]);

  /* -----------------------------------------------------------
     EFFECT: when currentStepId changes, push bot message if not present
  -------------------------------------------------------------*/
  useEffect(() => {
    if (!currentStepId) return;

    const latest = getLatestBotMessageForStepId(currentStepId);
    if (latest) return; // message already exists

    const stepObj = conversationSteps.find((s) => s._id === currentStepId);
    if (!stepObj) return;

    const msgText = renderTemplateWithVars(stepObj.messageTemplate || "", vars);
    const opts = generateOptionsForStep(stepObj, vars);
    pushBotMessageWithOptions(msgText, opts, stepObj._id, stepObj.stepType);
  }, [
    currentStepId,
    conversationSteps,
    getLatestBotMessageForStepId,
    generateOptionsForStep,
    pushBotMessageWithOptions,
    vars,
    renderTemplateWithVars,
  ]);

  /* -----------------------------------------------------------
     RENDER PERSISTENT OPTIONS (keeps your UI)
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
                    if (
                      option.value === "manual" &&
                      stepType === "QUANTITY_SELECTION"
                    ) {
                      setManualMode(true);
                      return;
                    } else if (
                      option.value === "new" &&
                      stepType === "ADDRESS_INPUT"
                    ) {
                      setManualAddressMode(true);
                      return;
                    } else if (option.value === "cancel") {
                      close();
                      return;
                    } else {
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
        {stepType === "ADDRESS_INPUT" && manualAddressMode && (
          <AddressComponent />
        )}

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
            const isBotWithOptions =
              m.from === "bot" && m.options && m.options.length > 0;

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
                  {m.showBadgeCard ? (
                    <BadgeCard
                    
                    />
                  ) : m.text === "__DOTS__" ? (
                    <TypingDots />
                  ) : (
                    <Text
                      style={{
                        color: isUser ? "#fff" : "#000",
                        fontSize: moderateScale(15),
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
