// components/ChatbotEngine.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Text,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {
  ServiceData,
  ConversationStep,
  ChatMessage,
  ChatOption,
  ChatbotVariables,
  ConversationState,
} from './cbTypes';

interface ChatbotEngineProps {
  serviceData: ServiceData;
  userAddresses?: string[];
  onComplete?: (variables: ChatbotVariables) => void;
  onCancel?: () => void;
}

const ChatbotEngine: React.FC<ChatbotEngineProps> = ({
  serviceData,
  userAddresses = [],
  onComplete,
  onCancel,
}) => {
  // Initial state
  const [state, setState] = useState<ConversationState>({
    messages: [],
    variables: {
      serviceId: serviceData._id,
      serviceName: serviceData.name,
      selectedOption: null,
      selectedBrand: null,
      quantity: 1,
      totalPrice: serviceData.basePrice,
      address: '',
      notes: '',
      estimatedTime: serviceData.estimatedTime,
    },
    currentStepId: null,
    previousStepIds: [],
    isTyping: false,
    manualInput: '',
  });

  const flatListRef = useRef<FlatList>(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;
  
  // Get active steps
  const activeSteps = serviceData.conversationSteps
    .filter(step => step.isActive)
    .sort((a, b) => a.stepNumber - b.stepNumber);

  // Get current step
  const currentStep = activeSteps.find(
    step => step._id === state.currentStepId
  ) || activeSteps[0];

  // Initialize conversation
  useEffect(() => {
    if (activeSteps.length > 0 && state.messages.length === 0) {
      startConversation(activeSteps[0]);
    }
  }, []);

  // Start conversation with first step
  const startConversation = (step: ConversationStep) => {
    setState(prev => ({ ...prev, currentStepId: step._id }));
    renderBotMessage(step);
  };

  // Template Renderer with Variable Replacement
  const renderTemplate = useCallback((template: string): string => {
    const context = {
      // Variables from state
      serviceName: state.variables.serviceName,
      selectedOption: state.variables.selectedOption?.name || '',
      selectedBrand: state.variables.selectedBrand?.name || '',
      quantity: state.variables.quantity,
      totalPrice: state.variables.totalPrice,
      address: state.variables.address,
      notes: state.variables.notes,
      estimatedTime: state.variables.estimatedTime,
      
      // Service data
      ...serviceData,
      
      // Conversation settings
      agentName: currentStep.agentName || 
                serviceData.conversationSettings.agentNames[0] || 
                'Assistant',
      
      // Computed values
      formattedPrice: `$${state.variables.totalPrice.toFixed(2)}`,
      unitText: state.variables.quantity === 1 ? 'unit' : 'units',
    };

    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      // Handle nested properties
      const keys = key.split('.');
      let value: any = context;
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          value = '';
          break;
        }
      }
      
      return value?.toString() || '';
    });
  }, [state.variables, serviceData, currentStep]);

  // Option Generator with Config Support
  const generateOptions = useCallback((step: ConversationStep): ChatOption[] => {
    const options: ChatOption[] = [];
    const config = step.config || {};

    switch (step.stepType) {
      case 'GREETING':
        options.push(
          {
            id: 'confirm-start',
            text: 'Start Service',
            value: 'confirm',
            stepType: 'GREETING',
            stepId: step._id,
            isSelected: false,
          },
          {
            id: 'cancel-start',
            text: 'Cancel',
            value: 'cancel',
            stepType: 'GREETING',
            stepId: step._id,
            isSelected: false,
          }
        );
        break;

      case 'OPTION_SELECTION':
        // Check if we should show options based on config
        if (config.showOptions === false) {
          // Auto-select first option
          setTimeout(() => {
            if (serviceData.options.length > 0) {
              handleOptionSelect({
                id: 'auto-option',
                text: serviceData.options[0].name,
                value: serviceData.options[0],
                stepType: 'OPTION_SELECTION',
                stepId: step._id,
                isSelected: false,
                metadata: { price: serviceData.options[0].singlePrice },
              });
            }
          }, 500);
          return [];
        }

        // Auto-select if only one option
        if (serviceData.options.length === 1) {
          setTimeout(() => {
            handleOptionSelect({
              id: 'auto-option',
              text: serviceData.options[0].name,
              value: serviceData.options[0],
              stepType: 'OPTION_SELECTION',
              stepId: step._id,
              isSelected: false,
              metadata: { price: serviceData.options[0].singlePrice },
            });
          }, 500);
          return [];
        }

        // Generate options from service data
        serviceData.options.forEach((option, idx) => {
          options.push({
            id: `option-${option._id}`,
            text: `${option.name} - $${option.singlePrice}`,
            value: option,
            stepType: 'OPTION_SELECTION',
            stepId: step._id,
            isSelected: state.variables.selectedOption?._id === option._id,
            metadata: {
              price: option.singlePrice,
            },
          });
        });
        break;

      case 'BRAND_SELECTION':
        // Check config
        if (config.showBrands === false || serviceData.brands.length === 0) {
          setTimeout(() => moveToNextStep(step), 100);
          return [];
        }

        // Generate brand options
        serviceData.brands.forEach((brand, idx) => {
          options.push({
            id: `brand-${brand._id}`,
            text: brand.name,
            value: brand,
            stepType: 'BRAND_SELECTION',
            stepId: step._id,
            isSelected: state.variables.selectedBrand?._id === brand._id,
            metadata: {
              logo: brand.logo,
              description: brand.description,
            },
          });
        });
        break;

      case 'QUANTITY_SELECTION':
        const selectedOption = state.variables.selectedOption;
        
        if (selectedOption) {
          // Generate quantity options based on selected option's pricing
          const quantities = [1, 2, 3];
          quantities.forEach(qty => {
            let price = selectedOption.singlePrice;
            if (qty === 2 && selectedOption.doublePrice) {
              price = selectedOption.doublePrice;
            } else if (qty === 3 && selectedOption.triplePrice) {
              price = selectedOption.triplePrice;
            } else {
              price = selectedOption.singlePrice * qty;
            }
            
            options.push({
              id: `qty-${qty}`,
              text: `${qty} ${qty === 1 ? 'Unit' : 'Units'} - $${price.toFixed(2)}`,
              value: qty,
              stepType: 'QUANTITY_SELECTION',
              stepId: step._id,
              isSelected: state.variables.quantity === qty,
              metadata: { price },
            });
          });
        } else {
          // Use service base price
          [1, 2, 3].forEach(qty => {
            const price = serviceData.basePrice * qty;
            options.push({
              id: `qty-${qty}`,
              text: `${qty} ${qty === 1 ? 'Unit' : 'Units'} - $${price.toFixed(2)}`,
              value: qty,
              stepType: 'QUANTITY_SELECTION',
              stepId: step._id,
              isSelected: state.variables.quantity === qty,
              metadata: { price },
            });
          });
        }
        
        // Manual input option
        options.push({
          id: 'manual-qty',
          text: 'Enter custom quantity',
          value: 'manual',
          stepType: 'QUANTITY_SELECTION',
          stepId: step._id,
          isSelected: false,
          isManualInput: true,
        });
        break;

      case 'ADDRESS_INPUT':
        // Show saved addresses
        userAddresses.forEach((address, idx) => {
          options.push({
            id: `addr-${idx}`,
            text: address,
            value: address,
            stepType: 'ADDRESS_INPUT',
            stepId: step._id,
            isSelected: state.variables.address === address,
          });
        });
        
        // Add new address option
        options.push({
          id: 'new-addr',
          text: '➕ Add New Address',
          value: 'new',
          stepType: 'ADDRESS_INPUT',
          stepId: step._id,
          isSelected: false,
          isManualInput: true,
        });
        break;

      case 'NOTES_INPUT':
        // Notes step doesn't have pre-defined options
        // Manual input will be shown
        break;

      case 'FINAL_CONFIRMATION':
        options.push(
          {
            id: 'final-confirm',
            text: '✅ Confirm & Book Now',
            value: 'confirm',
            stepType: 'FINAL_CONFIRMATION',
            stepId: step._id,
            isSelected: false,
          },
          {
            id: 'final-cancel',
            text: '✖ Cancel',
            value: 'cancel',
            stepType: 'FINAL_CONFIRMATION',
            stepId: step._id,
            isSelected: false,
          }
        );
        break;
    }

    // Add skip option if allowed
    if (step.isSkippable && !options.find(opt => opt.value === 'skip')) {
      options.push({
        id: 'skip-step',
        text: 'Skip',
        value: 'skip',
        stepType: step.stepType,
        stepId: step._id,
        isSelected: false,
      });
    }

    return options;
  }, [state.variables, serviceData, userAddresses]);

  // Bot Message Renderer
  const renderBotMessage = useCallback((step: ConversationStep) => {
    setState(prev => ({ ...prev, isTyping: true }));
    
    const message: ChatMessage = {
      id: `bot-${step._id}-${Date.now()}`,
      sender: 'bot',
      text: renderTemplate(step.messageTemplate),
      stepId: step._id,
      stepNumber: step.stepNumber,
      timestamp: new Date(),
      options: generateOptions(step),
    };

    // Typing animation
    Animated.sequence([
      Animated.delay(600),
      Animated.timing(typingAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, message],
        isTyping: false,
        previousStepIds: [...prev.previousStepIds, step._id],
      }));
      
      typingAnimation.setValue(0);
      
      // Auto-scroll
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
  }, [renderTemplate, generateOptions]);

  // Calculate Total Price
  const calculateTotalPrice = useCallback((
    selectedOption: ServiceOption | null,
    quantity: number
  ): number => {
    if (!selectedOption) {
      return serviceData.basePrice * quantity;
    }
    
    if (quantity === 1) {
      return selectedOption.singlePrice;
    } else if (quantity === 2 && selectedOption.doublePrice) {
      return selectedOption.doublePrice;
    } else if (quantity === 3 && selectedOption.triplePrice) {
      return selectedOption.triplePrice;
    } else {
      return selectedOption.singlePrice * quantity;
    }
  }, [serviceData.basePrice]);

  // Update Variables
  const updateVariables = useCallback((updates: Partial<ChatbotVariables>) => {
    setState(prev => {
      const newVariables = { ...prev.variables, ...updates };
      
      // Recalculate total price if quantity or option changes
      if (updates.quantity !== undefined || updates.selectedOption !== undefined) {
        newVariables.totalPrice = calculateTotalPrice(
          updates.selectedOption || prev.variables.selectedOption,
          updates.quantity || prev.variables.quantity
        );
      }
      
      return { ...prev, variables: newVariables };
    });
  }, [calculateTotalPrice]);

  // Move to Next Step
  const moveToNextStep = useCallback((currentStep: ConversationStep) => {
    const currentIndex = activeSteps.findIndex(s => s._id === currentStep._id);
    const nextStep = activeSteps[currentIndex + 1];
    
    if (nextStep) {
      setState(prev => ({ ...prev, currentStepId: nextStep._id }));
      renderBotMessage(nextStep);
    } else {
      // Conversation complete
      onComplete?.(state.variables);
    }
  }, [activeSteps, renderBotMessage, state.variables, onComplete]);

  // **CRITICAL: REWIND SYSTEM**
  const handleRewind = useCallback((clickedOption: ChatOption) => {
    const clickedStepId = clickedOption.stepId;
    
    // 1. Find the bot message for the edited step
    const botMessageIndex = state.messages.findIndex(
      msg => msg.sender === 'bot' && msg.stepId === clickedStepId
    );
    
    if (botMessageIndex === -1) return;
    
    // 2. Trim conversation history
    const trimmedMessages = state.messages.slice(0, botMessageIndex + 1);
    
    // 3. Update variables with new selection
    const variableUpdates: Partial<ChatbotVariables> = {};
    const dependencies: (keyof ChatbotVariables)[] = [];
    
    switch (clickedOption.stepType) {
      case 'OPTION_SELECTION':
        variableUpdates.selectedOption = clickedOption.value as ServiceOption;
        dependencies.push('selectedBrand', 'quantity', 'totalPrice', 'address', 'notes');
        break;
        
      case 'BRAND_SELECTION':
        variableUpdates.selectedBrand = clickedOption.value as ServiceBrand;
        dependencies.push('quantity', 'totalPrice', 'address', 'notes');
        break;
        
      case 'QUANTITY_SELECTION':
        variableUpdates.quantity = clickedOption.value as number;
        dependencies.push('totalPrice', 'notes');
        break;
        
      case 'ADDRESS_INPUT':
        variableUpdates.address = clickedOption.value as string;
        dependencies.push('notes');
        break;
    }
    
    // Clear dependent variables
    dependencies.forEach(dep => {
      variableUpdates[dep] = dep === 'totalPrice' ? 0 : '';
    });
    
    updateVariables(variableUpdates);
    
    // 4. Add user's new message
    const userMessage: ChatMessage = {
      id: `user-rewind-${Date.now()}`,
      sender: 'user',
      text: clickedOption.text,
      stepId: clickedStepId,
      stepNumber: activeSteps.find(s => s._id === clickedStepId)?.stepNumber || 0,
      timestamp: new Date(),
    };
    
    // 5. Update message selection states
    const updatedMessages = [...trimmedMessages, userMessage].map(msg => {
      if (msg.sender === 'bot' && msg.options) {
        return {
          ...msg,
          options: msg.options.map(opt => ({
            ...opt,
            isSelected: opt.id === clickedOption.id,
          })),
        };
      }
      return msg;
    });
    
    // 6. Update state
    setState(prev => ({
      ...prev,
      messages: updatedMessages,
      currentStepId: clickedStepId,
    }));
    
    // 7. Jump to next step
    const clickedStep = activeSteps.find(s => s._id === clickedStepId);
    if (clickedStep) {
      setTimeout(() => {
        moveToNextStep(clickedStep);
      }, 300);
    }
    
  }, [state.messages, activeSteps, updateVariables, moveToNextStep]);

  // Main Option Handler
  const handleOptionSelect = useCallback((option: ChatOption) => {
    // Check if this is a rewind (previous step selection)
    if (state.previousStepIds.includes(option.stepId) && option.stepId !== state.currentStepId) {
      handleRewind(option);
      return;
    }
    
    // Handle special actions
    if (option.value === 'cancel') {
      onCancel?.();
      return;
    }
    
    if (option.value === 'skip') {
      moveToNextStep(currentStep);
      return;
    }
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: option.text,
      stepId: currentStep._id,
      stepNumber: currentStep.stepNumber,
      timestamp: new Date(),
    };
    
    // Update messages with selection highlighting
    const updatedMessages = state.messages.map(msg => {
      if (msg.sender === 'bot' && msg.stepId === currentStep._id && msg.options) {
        return {
          ...msg,
          options: msg.options.map(opt => ({
            ...opt,
            isSelected: opt.id === option.id,
          })),
        };
      }
      return msg;
    });
    
    setState(prev => ({
      ...prev,
      messages: [...updatedMessages, userMessage],
    }));
    
    // Update variables based on step type
    switch (currentStep.stepType) {
      case 'OPTION_SELECTION':
        updateVariables({ selectedOption: option.value as ServiceOption });
        break;
      case 'BRAND_SELECTION':
        updateVariables({ selectedBrand: option.value as ServiceBrand });
        break;
      case 'QUANTITY_SELECTION':
        updateVariables({ quantity: option.value as number });
        break;
      case 'ADDRESS_INPUT':
        updateVariables({ address: option.value as string });
        break;
      case 'NOTES_INPUT':
        updateVariables({ notes: option.value as string });
        break;
    }
    
    // Move to next step
    setTimeout(() => {
      moveToNextStep(currentStep);
    }, 300);
    
  }, [state, currentStep, updateVariables, moveToNextStep, handleRewind, onCancel]);

  // Manual Input Handler
  const handleManualSubmit = useCallback(() => {
    if (!state.manualInput.trim()) return;
    
    let value: string | number = state.manualInput;
    let option: ChatOption | null = null;
    
    // Create appropriate option based on current step
    switch (currentStep.stepType) {
      case 'QUANTITY_SELECTION':
        const qty = parseInt(state.manualInput);
        if (isNaN(qty) || qty <= 0) return;
        value = qty;
        option = {
          id: `manual-qty-${qty}`,
          text: `${qty} ${qty === 1 ? 'Unit' : 'Units'}`,
          value: qty,
          stepType: 'QUANTITY_SELECTION',
          stepId: currentStep._id,
          isSelected: true,
        };
        updateVariables({ quantity: qty });
        break;
        
      case 'ADDRESS_INPUT':
        option = {
          id: `new-addr-${Date.now()}`,
          text: state.manualInput,
          value: state.manualInput,
          stepType: 'ADDRESS_INPUT',
          stepId: currentStep._id,
          isSelected: true,
        };
        updateVariables({ address: state.manualInput });
        break;
        
      case 'NOTES_INPUT':
        option = {
          id: `notes-${Date.now()}`,
          text: state.manualInput,
          value: state.manualInput,
          stepType: 'NOTES_INPUT',
          stepId: currentStep._id,
          isSelected: true,
        };
        updateVariables({ notes: state.manualInput });
        break;
    }
    
    if (!option) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-manual-${Date.now()}`,
      sender: 'user',
      text: option.text,
      stepId: currentStep._id,
      stepNumber: currentStep.stepNumber,
      timestamp: new Date(),
    };
    
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      manualInput: '',
    }));
    
    // Move to next step
    setTimeout(() => {
      moveToNextStep(currentStep);
    }, 300);
    
  }, [state.manualInput, currentStep, updateVariables, moveToNextStep]);

  // Render Methods
  const renderMessageItem = ({ item }: { item: ChatMessage }) => {
    const isBot = item.sender === 'bot';
    
    return (
      <View style={[styles.messageContainer, isBot ? styles.botMessage : styles.userMessage]}>
        {isBot && (
          <View style={styles.agentIndicator}>
            <Text style={styles.agentName}>
              {currentStep.agentName || serviceData.conversationSettings.agentNames[0]}
            </Text>
          </View>
        )}
        
        <Text style={isBot ? styles.botText : styles.userText}>{item.text}</Text>
        
        {isBot && item.options && renderOptions(item.options)}
      </View>
    );
  };

  const renderOptions = (options: ChatOption[]) => (
    <View style={styles.optionsContainer}>
      {options.map(option => {
        // Don't render manual input options (handled separately)
        if (option.isManualInput && option.value === 'manual') {
          return null;
        }
        
        return (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              option.isSelected && styles.selectedOption,
              option.metadata?.logo && styles.brandOption,
            ]}
            onPress={() => handleOptionSelect(option)}
            disabled={state.isTyping}
          >
            {option.metadata?.logo && (
              <Image
                source={{ uri: option.metadata.logo }}
                style={styles.brandLogo}
                resizeMode="contain"
              />
            )}
            
            <Text style={[
              styles.optionText,
              option.isSelected && styles.selectedOptionText,
            ]}>
              {option.text}
              {option.isSelected && ' ✓'}
            </Text>
            
            {option.metadata?.price && (
              <Text style={styles.optionPrice}>
                ${option.metadata.price.toFixed(2)}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderManualInput = () => {
    if (!currentStep) return null;
    
    // Only show manual input for specific steps
    const showManualInput = 
      currentStep.stepType === 'QUANTITY_SELECTION' ||
      currentStep.stepType === 'ADDRESS_INPUT' ||
      currentStep.stepType === 'NOTES_INPUT';
    
    if (!showManualInput) return null;
    
    let placeholder = '';
    if (currentStep.stepType === 'QUANTITY_SELECTION') placeholder = 'Enter quantity...';
    if (currentStep.stepType === 'ADDRESS_INPUT') placeholder = 'Enter address...';
    if (currentStep.stepType === 'NOTES_INPUT') 
      placeholder = currentStep.config?.notesPlaceholder || 'Any special instructions?';
    
    return (
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={state.manualInput}
          onChangeText={text => setState(prev => ({ ...prev, manualInput: text }))}
          placeholder={placeholder}
          multiline={currentStep.stepType === 'NOTES_INPUT' || currentStep.stepType === 'ADDRESS_INPUT'}
          numberOfLines={currentStep.stepType === 'NOTES_INPUT' ? 3 : 1}
        />
        <TouchableOpacity
          style={[styles.sendButton, !state.manualInput.trim() && styles.sendButtonDisabled]}
          onPress={handleManualSubmit}
          disabled={!state.manualInput.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Step {currentStep?.stepNumber || 1} of {activeSteps.length}
        </Text>
        <View style={styles.progressBar}>
          <View style={[
            styles.progressFill,
            { 
              width: `${(activeSteps.findIndex(s => s._id === state.currentStepId) + 1) / activeSteps.length * 100}%` 
            }
          ]} />
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={state.messages}
        renderItem={renderMessageItem}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        keyboardShouldPersistTaps="handled"
      />

      {/* Typing Indicator */}
      {state.isTyping && (
        <View style={styles.typingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.typingText}>
            {currentStep.agentName || serviceData.conversationSettings.agentNames[0]} is typing...
          </Text>
        </View>
      )}

      {/* Manual Input */}
      {renderManualInput()}
    </KeyboardAvoidingView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  progressContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '85%',
    borderRadius: 18,
    padding: 12,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  agentIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  agentName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  botText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  userText: {
    fontSize: 16,
    color: 'white',
    lineHeight: 22,
  },
  optionsContainer: {
    marginTop: 12,
  },
  optionButton: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  brandOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  optionText: {
    fontSize: 14,
    color: '#495057',
    flex: 1,
  },
  selectedOptionText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  optionPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745',
    marginLeft: 8,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  typingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 12,
    backgroundColor: '#007AFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChatbotEngine;