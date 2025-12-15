// types/index.ts
export type ServiceOption = {
  _id: string;
  name: string;
  singlePrice: number;
  doublePrice: number;
  triplePrice: number;
};

export type ServiceBrand = {
  _id: string;
  name: string;
  description: string;
  logo: string;
};

export type ServiceCategory = {
  _id: string;
  name: string;
  icon: string;
};

export type ConversationSettings = {
  agentNames: string[];
  enableConversationMode: boolean;
};

export type ConversationStepConfig = {
  allowSavedAddress?: boolean;
  requireAddress?: boolean;
  brandsSource?: "service.supportedBrands" | string;
  showBrands?: boolean;
  optionsSource?: "service.options" | string;
  showOptions?: boolean;
  showPricing?: boolean;
  pricingType?: "all" | "single" | "double" | "triple";
  notesRequired?: boolean;
  notesPlaceholder?: string;
  customOptions?: any[];
};

export type ConversationStepType =
  | "GREETING"
  | "OPTION_SELECTION"
  | "BRAND_SELECTION"
  | "QUANTITY_SELECTION"
  | "QUANTITY_CONFIRM"
  | "ADDRESS_INPUT"
  | "NOTES_INPUT"
  | "FINAL_CONFIRMATION";

export type ConversationStep = {
  _id: string;
  stepNumber: number;
  stepType: ConversationStepType;
  agentName: string;
  messageTemplate: string;
  isActive: boolean;
  isSkippable: boolean;
  config: ConversationStepConfig;
};

export type ServiceData = {
  _id: string;
  name: string;
  description: string;
  estimatedTime: string;
  conversationSettings: ConversationSettings;
  conversationSteps: ConversationStep[];
  icon: string;
  specialty: string;
  slug: string;
  subcategoryName: string;
  mostBooked: boolean;
  popular: boolean;
  dailyNeed: boolean;
  quickPick: boolean;
  availableInZipcode: boolean;
  providerCount: number;
  basePrice: number;
  category: ServiceCategory;
  options: ServiceOption[];
  brands: ServiceBrand[];
  subServices: any[];
};

// Chatbot Engine Types
export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  stepId: string;
  stepNumber: number;
  timestamp: Date;
  options?: ChatOption[];
}

export interface ChatOption {
  id: string;
  text: string;
  value: string | number | object;
  stepType: ConversationStepType;
  stepId: string;
  isSelected: boolean;
  isManualInput?: boolean;
  metadata?: {
    price?: number;
    logo?: string;
    description?: string;
  };
}

export interface ChatbotVariables {
  serviceId: string;
  serviceName: string;
  selectedOption: ServiceOption | null;
  selectedBrand: ServiceBrand | null;
  quantity: number;
  totalPrice: number;
  address: string;
  notes: string;
  estimatedTime: string;
}

export interface ConversationState {
  messages: ChatMessage[];
  variables: ChatbotVariables;
  currentStepId: string | null;
  previousStepIds: string[];
  isTyping: boolean;
  manualInput: string;
}