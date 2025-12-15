
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
} from "react-native";

// Utility: unique id
const uid = (() => {
  let i = 0;
  return (p = "") => `${Date.now()}_${i++}_${p}`;
})();

/* -----------------------------
   Example: backend payload shape
   (in real app replace with fetched data)
------------------------------*/
const exampleBackend = {
  service: {
    name: "AC Service",
    description: "AC professional servicing",
    options: ["Full Service", "Gas Refill", "Filter Change"],
    brands: ["LG", "Samsung", "Voltas"],
    tierPricing: [
      { min: 1, max: 1, price: 250 },
      { min: 2, max: 3, price: 230 },
      { min: 4, max: 10, price: 200 },
    ],
    basePrice: 250,
    estimatedTime: "45 mins",
    zipcode: "140802",
    addresses: [
      { id: "a1", label: "Home - 12 Baker St", details: "12 Baker St" },
    ],
  },
  conversationSettings: {
    agentNames: ["Ravi"],
    allowSkipSteps: true,
    enableConversationMode: true,
    showProgressIndicator: true,
  },
  conversationSteps: [
    {
      stepType: "GREETING",
      stepNumber: 1,
      messageTemplate: "Hello! Welcome to {{service.name}}. Ready to book?",
      isActive: true,
      isSkippable: false,
    },
    {
      stepType: "OPTION_SELECTION",
      stepNumber: 2,
      messageTemplate: "Which type of service do you want?",
      isActive: true,
      isSkippable: false,
    },
    {
      stepType: "BRAND_SELECTION",
      stepNumber: 3,
      messageTemplate: "Which brand is your unit?",
      isActive: true,
      isSkippable: true,
    },
    {
      stepType: "QUANTITY_SELECTION",
      stepNumber: 4,
      messageTemplate: "How many units?",
      isActive: true,
      isSkippable: false,
    },
    {
      stepType: "QUANTITY_CONFIRM",
      stepNumber: 5,
      messageTemplate:
        "Confirm {{quantity}} unit(s) for {{selectedOption}} at ₹{{totalPrice}}",
      isActive: true,
      isSkippable: false,
    },
    {
      stepType: "ADDRESS_INPUT",
      stepNumber: 6,
      messageTemplate: "Which address should we use?",
      isActive: true,
      isSkippable: false,
    },
    {
      stepType: "NOTES_INPUT",
      stepNumber: 7,
      messageTemplate: "Any notes for the technician?",
      isActive: true,
      isSkippable: true,
    },
    {
      stepType: "FINAL_CONFIRMATION",
      stepNumber: 8,
      messageTemplate:
        "Review: Service: {{service.name}} - Option: {{selectedOption}} - Brand: {{selectedBrand}} - Qty: {{quantity}} - Price: ₹{{totalPrice}} - Address: {{address.label}}",
      isActive: true,
      isSkippable: false,
    },
  ],
};

/* -----------------------------
   Engine: Step Types & Dependencies
------------------------------*/

const STEP_TYPES_ORDERED = [
  "GREETING",
  "OPTION_SELECTION",
  "BRAND_SELECTION",
  "QUANTITY_SELECTION",
  "QUANTITY_CONFIRM",
  "ADDRESS_INPUT",
  "NOTES_INPUT",
  "FINAL_CONFIRMATION",
];

// dependencyMap: when step X changes, which later step types must be reset
const DEPENDENCY_MAP = {
  OPTION_SELECTION: [
    "BRAND_SELECTION",
    "QUANTITY_SELECTION",
    "QUANTITY_CONFIRM",
    "ADDRESS_INPUT",
    "NOTES_INPUT",
    "FINAL_CONFIRMATION",
  ],
  BRAND_SELECTION: [
    "QUANTITY_SELECTION",
    "QUANTITY_CONFIRM",
    "ADDRESS_INPUT",
    "NOTES_INPUT",
    "FINAL_CONFIRMATION",
  ],
  QUANTITY_SELECTION: [
    "QUANTITY_CONFIRM",
    "ADDRESS_INPUT",
    "NOTES_INPUT",
    "FINAL_CONFIRMATION",
  ],
  QUANTITY_CONFIRM: ["ADDRESS_INPUT", "NOTES_INPUT", "FINAL_CONFIRMATION"],
  ADDRESS_INPUT: ["NOTES_INPUT", "FINAL_CONFIRMATION"],
  NOTES_INPUT: ["FINAL_CONFIRMATION"],
  GREETING: [
    "OPTION_SELECTION",
    "BRAND_SELECTION",
    "QUANTITY_SELECTION",
    "QUANTITY_CONFIRM",
    "ADDRESS_INPUT",
    "NOTES_INPUT",
    "FINAL_CONFIRMATION",
  ],
};

/* -----------------------------
   Template rendering
------------------------------*/
function renderTemplate(template, state, service, settings) {
  if (!template) return "";
  return template.replace(/{{\s*([^}]+)\s*}}/g, (m, key) => {
    // priority: conversation state -> service data -> conversationSettings
    const keys = key.split(".");
    // try state
    let val = keys.reduce((acc, k) => (acc ? acc[k] : undefined), state);
    if (val !== undefined && val !== null) return String(val);
    // try service
    val = keys.reduce((acc, k) => (acc ? acc[k] : undefined), service);
    if (val !== undefined && val !== null) return String(val);
    // try settings
    val = keys.reduce((acc, k) => (acc ? acc[k] : undefined), settings);
    if (val !== undefined && val !== null) return String(val);
    return "";
  });
}

/* -----------------------------
   Pricing utility: compute price from tierPricing & basePrice
------------------------------*/
function computeUnitPrice(quantity, service) {
  const { tierPricing, basePrice } = service || {};
  if (Array.isArray(tierPricing) && tierPricing.length) {
    // find tier where min<=q<=max or largest min <= q
    for (let t of tierPricing) {
      if (quantity >= t.min && quantity <= t.max) return t.price;
    }
    // fallback choose last tier's price or basePrice
    const last = tierPricing[tierPricing.length - 1];
    return last.price || basePrice;
  }
  return basePrice || 0;
}

/* -----------------------------
   Option generator
------------------------------*/
function generateOptionsForStep(stepType, service, state) {
  switch (stepType) {
    case "GREETING":
      return ["Confirm", "Cancel"];
    case "OPTION_SELECTION":
      return service.options || [];
    case "BRAND_SELECTION":
      return service.brands && service.brands.length ? service.brands : [];
    case "QUANTITY_SELECTION": {
      // generate up to 5 quick picks based on typical tiers
      const maxQuick = 5;
      const quick = [];
      for (let i = 1; i <= maxQuick; i++) quick.push(String(i));
      quick.push("Enter quantity manually");
      return quick;
    }
    case "QUANTITY_CONFIRM":
      return ["Confirm", "Cancel"];
    case "ADDRESS_INPUT": {
      const saved = (service.addresses || []).map(
        (a) => a.label || a.details || a.id
      );
      return [...saved, "Add new address"];
    }
    case "NOTES_INPUT":
      return ["Send Notes", "Skip"];
    case "FINAL_CONFIRMATION":
      return ["Confirm", "Cancel"];
    default:
      return [];
  }
}

/* -----------------------------
   Message types: bot or user
------------------------------*/
function makeBotMessage(text, step) {
  return {
    id: uid("bot"),
    sender: "bot",
    text,
    stepType: step?.stepType,
    stepNumber: step?.stepNumber,
    timestamp: Date.now(),
  };
}
function makeUserMessage(text, step) {
  return {
    id: uid("user"),
    sender: "user",
    text,
    stepType: step?.stepType,
    stepNumber: step?.stepNumber,
    timestamp: Date.now(),
  };
}

/* -----------------------------
   Main Chatbot Engine Component
------------------------------*/
export default function ChatbotEngine({
  backend = exampleBackend,
  styleOverrides = {},
}) {
  const { service, conversationSteps, conversationSettings } = backend;

  // Conversation state variables (must store these)
  const [stateVars, setStateVars] = useState({
    serviceName: service.name || "",
    zipcode: service.zipcode || "",
    selectedOption: null,
    selectedBrand: null,
    selectedType: null,
    quantity: null,
    totalPrice: null,
    address: null,
    notes: null,
    estimatedTime: service.estimatedTime || null,
  });

  // messages list
  const [messages, setMessages] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0); // index in activeSteps array
  const [typing, setTyping] = useState(false);
  const flatRef = useRef();

  // compute active steps (filter by isActive and maintain ordering by stepNumber)
  const activeSteps = conversationSteps
    .filter((s) => s.isActive)
    .sort((a, b) => a.stepNumber - b.stepNumber);

  // init engine: start at first active step
  useEffect(() => {
    // reset everything
    setMessages([]);
    setCurrentStepIndex(0);
    setStateVars((prev) => ({
      ...prev,
      serviceName: service.name || "",
      zipcode: service.zipcode || "",
      estimatedTime: service.estimatedTime || prev.estimatedTime,
    }));
    // start conversation
    setTimeout(() => proceedToStep(0), 300);
  }, [backend]);

  // scroll helper
  useEffect(() => {
    if (flatRef.current) {
      flatRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  /* -----------------------------
     Core: proceedToStep (renders bot msg for that step)
  ------------------------------*/
  async function proceedToStep(stepIdx) {
    if (stepIdx < 0 || stepIdx >= activeSteps.length) return;
    const step = activeSteps[stepIdx];
    // Render bot typing animation then push bot message
    setTyping(true);
    // disable inputs while typing (UI should reflect typing state)
    await new Promise((r) => setTimeout(r, 600));
    const text = renderTemplate(
      step.messageTemplate || "",
      stateVars,
      service,
      conversationSettings
    );
    // prevent duplicate bot messages for same step
    setMessages((prev) => {
      // check last bot message for same step
      const lastBot = [...prev].reverse().find((m) => m.sender === "bot");
      if (
        lastBot &&
        lastBot.stepType === step.stepType &&
        lastBot.stepNumber === step.stepNumber
      )
        return prev;
      return [...prev, makeBotMessage(text, step)];
    });
    setTyping(false);
    // update current step pointer
    setCurrentStepIndex(stepIdx);
  }

  /* -----------------------------
     Handler for option clicks (this implements forward + rewind)
  ------------------------------*/
  function onOptionPress(
    optionText,
    optionMeta = { stepType: null, stepIdx: null, rawOption: null }
  ) {
    // determine which step this option belongs to
    const { stepType: optionStepType, stepIdx } = optionMeta;
    const targetStepIndex =
      typeof stepIdx === "number" ? stepIdx : currentStepIndex;
    const currentIdx = currentStepIndex;

    // If clicked option belongs to a previous step -> rewind/edit
    if (targetStepIndex < currentIdx) {
      handleRewindSelection(optionText, optionStepType, targetStepIndex);
      return;
    }

    // normal forward selection from current step
    handleForwardSelection(optionText, optionStepType, targetStepIndex);
  }

  /* -----------------------------
     Forward flow
  ------------------------------*/
  function handleForwardSelection(optionText, stepType, stepIdx) {
    const step = activeSteps[stepIdx];
    if (!step) return;
    // push user message AFTER bot message
    const userMsg = makeUserMessage(optionText, step);

    setMessages((prev) => {
      // prevent duplicate user messages: if last message is same user text and step -> ignore
      const last = prev[prev.length - 1];
      if (
        last &&
        last.sender === "user" &&
        last.text === userMsg.text &&
        last.stepType === userMsg.stepType
      )
        return prev;
      return [...prev, userMsg];
    });

    // update state vars according to stepType
    applySelectionToState(stepType, optionText, step);

    // move to next active step automatically
    // find next step index (stepIdx + 1 that exists)
    let next = stepIdx + 1;
    while (next < activeSteps.length && !activeSteps[next].isActive) next++;
    if (next < activeSteps.length) {
      // slight delay for realism then proceed
      setTimeout(() => proceedToStep(next), 400);
    }
  }

  /* -----------------------------
     Rewind (edit) flow: trim -> apply -> reset dependents -> auto-jump
     Must follow EXACT sequence from user's requirements
  ------------------------------*/
  function handleRewindSelection(optionText, stepType, stepIdx) {
    // 1) Trim conversation history safely: remove all messages after that step's bot message
    const step = activeSteps[stepIdx];
    if (!step) return;

    setMessages((prev) => {
      // find index of bot message for that step
      const botIndex = prev.findIndex(
        (m) =>
          m.sender === "bot" &&
          m.stepType === step.stepType &&
          m.stepNumber === step.stepNumber
      );
      if (botIndex === -1) return prev; // nothing to do
      const trimmed = prev.slice(0, botIndex + 1); // keep bot message for that step and everything before
      // 2) Do NOT push user message before slicing (we already sliced)
      const userMsg = makeUserMessage(optionText, step);
      trimmed.push(userMsg);
      return trimmed;
    });

    // 3) Apply new selection AFTER trimming
    applySelectionToState(stepType, optionText, step, /*isEdit=*/ true);

    // 4) Clear dependent variables based on dependency map
    const deps = DEPENDENCY_MAP[stepType] || [];
    clearDependentVars(deps);

    // 5) Automatically jump to the next active step AFTER edit
    let next = stepIdx + 1;
    while (next < activeSteps.length && !activeSteps[next].isActive) next++;
    if (next < activeSteps.length) {
      setTimeout(() => proceedToStep(next), 300);
    }
  }

  /* -----------------------------
     Apply selection to state variables
     Also updates totalPrice when quantity or option changed
  ------------------------------*/
  function applySelectionToState(stepType, optionText, step, isEdit = false) {
    setStateVars((prev) => {
      const next = { ...prev };
      switch (stepType) {
        case "GREETING":
          // typically confirm or cancel -- ignore for state
          break;
        case "OPTION_SELECTION":
          next.selectedOption = optionText;
          // selecting a new option invalidates downstream deps
          break;
        case "BRAND_SELECTION":
          next.selectedBrand = optionText;
          break;
        case "QUANTITY_SELECTION":
          if (optionText === "Enter quantity manually") {
            // open UI for manual entry - handled in UI area: we'll set quantity when user submits
          } else {
            const q = parseInt(optionText, 10);
            if (!Number.isNaN(q)) {
              next.quantity = q;
              const unitPrice = computeUnitPrice(q, service);
              next.totalPrice = unitPrice * q;
            }
          }
          break;
        case "QUANTITY_CONFIRM":
          // Confirm/Cancel behavior handled in UI flow - assume Confirm keeps quantity
          break;
        case "ADDRESS_INPUT":
          if (optionText === "Add new address") {
            // UI will handle manual add; for now we expect UI to push new address into state
          } else {
            // find address object
            const found = (service.addresses || []).find(
              (a) => a.label === optionText || a.details === optionText
            );
            next.address = found || {
              id: uid("addr"),
              label: optionText,
              details: optionText,
            };
          }
          break;
        case "NOTES_INPUT":
          if (optionText === "Send Notes") {
            // in UI, the user types notes and presses 'Send Notes'
          } else if (optionText === "Skip") {
            next.notes = null;
          }
          break;
        case "FINAL_CONFIRMATION":
          // final confirm -> would trigger booking flow
          break;
        default:
          break;
      }
      // keep serviceName and zipcode in sync
      next.serviceName = service.name;
      next.zipcode = service.zipcode;
      next.estimatedTime = service.estimatedTime;
      return next;
    });
  }

  /* -----------------------------
     Clear dependent variables helper
  ------------------------------*/
  function clearDependentVars(depStepTypes = []) {
    setStateVars((prev) => {
      const next = { ...prev };
      for (let t of depStepTypes) {
        switch (t) {
          case "BRAND_SELECTION":
            next.selectedBrand = null;
            break;
          case "QUANTITY_SELECTION":
            next.quantity = null;
            next.totalPrice = null;
            break;
          case "QUANTITY_CONFIRM":
            // nothing additional
            break;
          case "ADDRESS_INPUT":
            next.address = null;
            break;
          case "NOTES_INPUT":
            next.notes = null;
            break;
          case "FINAL_CONFIRMATION":
            // nothing extra
            break;
          default:
            break;
        }
      }
      return next;
    });
  }

  /* -----------------------------
     UI: render message bubble with persistent options for bot messages
  ------------------------------*/
  function renderBotOptionsForMessage(botMsg) {
    if (!botMsg || botMsg.sender !== "bot") return null;
    // find the step index of this bot message
    const stepIdx = activeSteps.findIndex(
      (s) =>
        s.stepType === botMsg.stepType && s.stepNumber === botMsg.stepNumber
    );
    if (stepIdx === -1) return null;

    const opts =
      generateOptionsForStep(botMsg.stepType, service, stateVars) || [];
    // if brand selection but brands empty -> show nothing
    if (
      botMsg.stepType === "BRAND_SELECTION" &&
      (!service.brands || service.brands.length === 0)
    )
      return null;

    return (
      <View style={styles.optionsRow}>
        {opts.map((opt, i) => {
          // visual: highlight if selected in stateVars
          const selected = isOptionSelectedForStep(botMsg.stepType, opt);
          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.optionBtn,
                selected ? styles.optionSelected : null,
              ]}
              onPress={() =>
                onOptionPress(opt, { stepType: botMsg.stepType, stepIdx })
              }
              disabled={typing}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  selected ? styles.optionTextSelected : null,
                ]}
              >
                {opt}
              </Text>
              {selected && <Text style={styles.check}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  function isOptionSelectedForStep(stepType, optText) {
    switch (stepType) {
      case "OPTION_SELECTION":
        return stateVars.selectedOption === optText;
      case "BRAND_SELECTION":
        return stateVars.selectedBrand === optText;
      case "QUANTITY_SELECTION":
        return (
          stateVars.quantity !== null &&
          String(stateVars.quantity) === String(optText)
        );
      case "ADDRESS_INPUT":
        return (
          stateVars.address &&
          (stateVars.address.label === optText ||
            stateVars.address.details === optText)
        );
      case "NOTES_INPUT":
        // notes is free-form; don't mark
        return false;
      default:
        return false;
    }
  }

  /* -----------------------------
     Manual input handlers (quantity, address, notes)
  ------------------------------*/
  function submitManualQuantity(q) {
    const qn = parseInt(q, 10);
    if (Number.isNaN(qn) || qn <= 0) return;
    // emulate selecting quantity option
    const stepIdx = activeSteps.findIndex(
      (s) => s.stepType === "QUANTITY_SELECTION"
    );
    if (stepIdx === -1) return;
    // push user message
    const step = activeSteps[stepIdx];
    setMessages((prev) => [...prev, makeUserMessage(String(qn), step)]);
    // apply
    applySelectionToState("QUANTITY_SELECTION", String(qn), step);
    // compute price
    setStateVars((prev) => {
      const next = { ...prev };
      const unit = computeUnitPrice(qn, service);
      next.quantity = qn;
      next.totalPrice = unit * qn;
      return next;
    });
    // move forward
    const next = stepIdx + 1;
    setTimeout(() => proceedToStep(next), 300);
  }

  function submitManualAddress(addressObj) {
    // addressObj = { label, details }
    const stepIdx = activeSteps.findIndex(
      (s) => s.stepType === "ADDRESS_INPUT"
    );
    if (stepIdx === -1) return;
    const step = activeSteps[stepIdx];
    setMessages((prev) => [
      ...prev,
      makeUserMessage(addressObj.label || addressObj.details, step),
    ]);
    // add into service.addresses? (ideally saved by backend) but we attach locally
    if (!service.addresses) service.addresses = [];
    service.addresses.push(addressObj);
    setStateVars((prev) => ({ ...prev, address: addressObj }));
    const next = stepIdx + 1;
    setTimeout(() => proceedToStep(next), 300);
  }

  function submitNotes(text) {
    const stepIdx = activeSteps.findIndex((s) => s.stepType === "NOTES_INPUT");
    if (stepIdx === -1) return;
    const step = activeSteps[stepIdx];
    setMessages((prev) => [...prev, makeUserMessage(text, step)]);
    setStateVars((prev) => ({ ...prev, notes: text }));
    const next = stepIdx + 1;
    setTimeout(() => proceedToStep(next), 300);
  }

  /* -----------------------------
     Render each message
  ------------------------------*/
  function renderMessage({ item }) {
    if (item.sender === "bot") {
      return (
        <View style={styles.botBubble} key={item.id}>
          <Text style={styles.botText}>{item.text}</Text>
          {renderBotOptionsForMessage(item)}
        </View>
      );
    }
    return (
      <View style={styles.userBubble} key={item.id}>
        <Text style={styles.userText}>{item.text}</Text>
      </View>
    );
  }

  /* -----------------------------
     Small helper: show current progress var snapshot (debug)
  ------------------------------*/
  function renderStateSnapshot() {
    return (
      <View style={styles.snapshot}>
        <Text style={styles.snapshotText}>State Snapshot:</Text>
        <Text style={styles.snapshotTextSmall}>
          {JSON.stringify(stateVars, null, 2)}
        </Text>
      </View>
    );
  }

  /* -----------------------------
     Main render
  ------------------------------*/
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.container, styleOverrides.container]}
    >
      <FlatList
        ref={flatRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.messageList}
      />

      {typing && (
        <View style={styles.typingRow}>
          <Text style={styles.typingText}>Bot is typing...</Text>
        </View>
      )}

      {/* Manual inputs area: only show when relevant */}
      <ManualInputs
        stateVars={stateVars}
        service={service}
        onSubmitQuantity={submitManualQuantity}
        onSubmitAddress={submitManualAddress}
        onSubmitNotes={submitNotes}
        currentStep={activeSteps[currentStepIndex]}
        typing={typing}
      />

      {renderStateSnapshot()}
    </KeyboardAvoidingView>
  );
}

/* -----------------------------
   Manual Inputs Component
   Shows input fields for manual quantity, address, notes when relevant
------------------------------*/
function ManualInputs({
  currentStep,
  onSubmitQuantity,
  onSubmitAddress,
  onSubmitNotes,
  typing,
}) {
  const [qtyInput, setQtyInput] = useState("");
  const [addrInput, setAddrInput] = useState("");
  const [notesInput, setNotesInput] = useState("");

  useEffect(() => {
    setQtyInput("");
    setAddrInput("");
    setNotesInput("");
  }, [currentStep?.stepType]);

  if (!currentStep) return null;
  const stepType = currentStep.stepType;
  if (stepType === "QUANTITY_SELECTION") {
    return (
      <View style={styles.manualRow}>
        <TextInput
          value={qtyInput}
          onChangeText={setQtyInput}
          keyboardType="numeric"
          editable={!typing}
          placeholder="Enter quantity"
          style={styles.input}
        />
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={() => {
            if (!typing) onSubmitQuantity(qtyInput);
          }}
          disabled={typing}
        >
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (stepType === "ADDRESS_INPUT") {
    return (
      <View style={styles.manualRow}>
        <TextInput
          value={addrInput}
          onChangeText={setAddrInput}
          editable={!typing}
          placeholder="Enter new address"
          style={styles.input}
        />
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={() => {
            if (!typing)
              onSubmitAddress({
                id: uid("addr_new"),
                label: addrInput,
                details: addrInput,
              });
          }}
          disabled={typing}
        >
          <Text style={styles.sendText}>Add</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (stepType === "NOTES_INPUT") {
    return (
      <View style={styles.manualRow}>
        <TextInput
          value={notesInput}
          onChangeText={setNotesInput}
          editable={!typing}
          placeholder="Enter notes"
          style={styles.input}
        />
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={() => {
            if (!typing) onSubmitNotes(notesInput);
          }}
          disabled={typing}
        >
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return null;
}

/* -----------------------------
   Basic styles - adapt for your app
------------------------------*/
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f7" },
  messageList: { padding: 12, paddingBottom: 120 },
  botBubble: {
    backgroundColor: "#fff",
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    alignSelf: "flex-start",
    maxWidth: "90%",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  botText: { color: "#333" },
  userBubble: {
    backgroundColor: "#0b84ff",
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    alignSelf: "flex-end",
    maxWidth: "80%",
  },
  userText: { color: "#fff" },
  optionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  optionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
  },
  optionSelected: { backgroundColor: "#e6f2ff", borderColor: "#0b84ff" },
  optionText: { color: "#333" },
  optionTextSelected: { color: "#0b84ff", fontWeight: "600" },
  check: { marginLeft: 8, color: "#0b84ff" },
  typingRow: { padding: 10, alignItems: "center" },
  typingText: { color: "#666" },
  manualRow: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  sendBtn: {
    marginLeft: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#0b84ff",
    borderRadius: 10,
  },
  sendText: { color: "#fff" },
  snapshot: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.05)",
    padding: 8,
    borderRadius: 8,
  },
  snapshotText: { fontSize: 12, fontWeight: "700" },
  snapshotTextSmall: { fontSize: 10, marginTop: 6 },
});
