// screens/ChatScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// utils/acServiceQuestions.js
export const getServiceTypeLabel = (serviceType) => {
  const labels = {
    'repair': 'AC Repair',
    'installation': 'AC Installation',
    'maintenance': 'AC Maintenance',
    'cleaning': 'AC Deep Cleaning',
    'gas_refill': 'AC Gas Refill',
    'emergency': 'Emergency AC Repair'
  };
  return labels[serviceType] || 'AC Service';
};

export const questions = [
  {
    id: 'service_type',
    text: "Welcome to AC Service Pro! What type of AC service do you need?",
    type: 'options',
    options: [
      { value: 'repair', label: 'Repair', icon: 'fas fa-tools' },
      { value: 'installation', label: 'Installation', icon: 'fas fa-plus-circle' },
      { value: 'maintenance', label: 'Maintenance', icon: 'fas fa-clipboard-check' },
      { value: 'cleaning', label: 'Deep Cleaning', icon: 'fas fa-broom' },
      { value: 'gas_refill', label: 'Gas Refill', icon: 'fas fa-gas-pump' },
      { value: 'emergency', label: 'Emergency Repair', icon: 'fas fa-ambulance' }
    ],
    validation: (val) => val.length > 0,
    errorMsg: "Please select a service type.",
    dynamic: true,
    priority: 1
  },
  {
    id: 'ac_type',
    text: "What type of AC unit do you have?",
    type: 'options',
    options: [
      { value: 'split', label: 'Split AC', icon: 'fas fa-cube' },
      { value: 'window', label: 'Window AC', icon: 'fas fa-window-maximize' },
      { value: 'cassette', label: 'Cassette AC', icon: 'fas fa-th-large' },
      { value: 'tower', label: 'Tower AC', icon: 'fas fa-arrow-up' },
      { value: 'central', label: 'Central AC', icon: 'fas fa-building' },
      { value: 'portable', label: 'Portable AC', icon: 'fas fa-mobile-alt' },
      { value: 'unknown', label: "Don't know", icon: 'fas fa-question-circle' }
    ],
    validation: (val) => val.length > 0,
    errorMsg: "Please select your AC type.",
    dynamic: true,
    priority: 2
  },
  {
    id: 'tonnage',
    text: "What is your AC's tonnage/capacity?",
    type: 'options',
    options: ['0.75 Ton', '1 Ton', '1.5 Ton', '2 Ton', '2.5 Ton', '3 Ton', 'Unknown'],
    validation: (val) => val.length > 0,
    errorMsg: "Please select AC tonnage.",
    dynamic: true,
    priority: 3
  },
  {
    id: 'brand',
    text: "What brand is your AC?",
    type: 'options',
    options: ['Daikin', 'LG', 'Samsung', 'Voltas', 'Blue Star', 'Hitachi', 'Carrier', 'Panasonic', 'Other', 'Unknown'],
    validation: (val) => val.length > 0,
    errorMsg: "Please select AC brand.",
    dynamic: true,
    priority: 4
  },
  {
    id: 'location',
    text: "Where is the AC located?",
    type: 'options',
    options: ['Living Room', 'Bedroom', 'Office', 'Shop', 'Restaurant', 'Hospital', 'Other'],
    validation: (val) => val.length > 0,
    errorMsg: "Please select location.",
    dynamic: true,
    priority: 5
  },
  {
    id: 'problem_description',
    text: "Please describe the problem you're facing:",
    type: 'textarea',
    validation: (val) => val.length >= 10,
    errorMsg: "Please describe the problem (at least 10 characters).",
    dynamic: true,
    priority: 6
  },
  {
    id: 'urgency',
    text: "How urgent is this service?",
    type: 'options',
    options: [
      { value: 'emergency', label: 'Emergency (Today)', icon: 'fas fa-exclamation-triangle' },
      { value: 'urgent', label: 'Urgent (Within 24 hours)', icon: 'fas fa-clock' },
      { value: 'standard', label: 'Standard (2-3 days)', icon: 'fas fa-calendar' },
      { value: 'flexible', label: 'Flexible (1 week+)', icon: 'fas fa-calendar-alt' }
    ],
    validation: (val) => val.length > 0,
    errorMsg: "Please select urgency level.",
    dynamic: true,
    priority: 7
  },
  {
    id: 'contact_name',
    text: "What's your name?",
    type: 'text',
    validation: (val) => val.length >= 2,
    errorMsg: "Please enter your name (at least 2 characters).",
    priority: 8
  },
  {
    id: 'phone',
    text: "What's your phone number?",
    type: 'phone',
    validation: (val) => {
      const digits = val.replace(/\D/g, '');
      return digits.length >= 10;
    },
    errorMsg: "Please enter a valid 10-digit phone number.",
    priority: 9
  },
  {
    id: 'email',
    text: "Email address for confirmation:",
    type: 'email',
    validation: (val) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(val);
    },
    errorMsg: "Please enter a valid email address.",
    dynamic: true,
    priority: 10
  }
];

export const getQuestionsByCount = (count) => {
  // Sort by priority
  const sortedQuestions = [...questions].sort((a, b) => a.priority - b.priority);
  const selectedQuestions = sortedQuestions.slice(0, count);
  
  // Ensure name and phone are included if count allows
  const hasName = selectedQuestions.some(q => q.id === 'contact_name');
  const hasPhone = selectedQuestions.some(q => q.id === 'phone');
  
  if (!hasName && count >= 3) {
    const nameQuestion = questions.find(q => q.id === 'contact_name');
    selectedQuestions.splice(Math.min(3, selectedQuestions.length), 0, nameQuestion);
  }
  
  if (!hasPhone && count >= 4) {
    const phoneQuestion = questions.find(q => q.id === 'phone');
    selectedQuestions.splice(Math.min(4, selectedQuestions.length), 0, phoneQuestion);
  }
  
  // Trim to exact count
  return selectedQuestions.slice(0, count);
};

const getIcon = (iconName) => {
  const [family, name] = iconName.split(' ');
  switch (family) {
    case 'fas':
      return { family: 'FontAwesome5', name: name.replace('fa-', '') };
    case 'fab':
      return { family: 'FontAwesome5', name: name.replace('fa-', '') };
    case 'material':
      return { family: 'MaterialIcons', name: name };
    default:
      return { family: 'Ionicons', name: 'options' };
  }
};

export  function OptionButton({ label, icon, isSelected, onPress, isEmergency }) {
  const IconComponent = icon ? getIcon(icon).family : null;
  const iconName = icon ? getIcon(icon).name : null;
  
  return (
    <TouchableOpacity 
      style={[
        stylesOc.button,
        isSelected && stylesOc.selectedButton,
        isEmergency && stylesOc.emergencyButton
      ]}
      onPress={onPress}
    >
      <View style={stylesOc.buttonContent}>
        {icon && IconComponent && (
          <View style={stylesOc.iconContainer}>
            {IconComponent === 'FontAwesome5' && (
              <FontAwesome5 name={iconName} size={16} color={isSelected ? 'white' : '#1e88e5'} />
            )}
            {IconComponent === 'MaterialIcons' && (
              <MaterialIcons name={iconName} size={16} color={isSelected ? 'white' : '#1e88e5'} />
            )}
            {IconComponent === 'Ionicons' && (
              <Ionicons name={iconName} size={16} color={isSelected ? 'white' : '#1e88e5'} />
            )}
          </View>
        )}
        
        <Text style={[
          stylesOc.buttonText,
          isSelected && stylesOc.selectedText
        ]}>
          {label}
        </Text>
        
        {isEmergency && (
          <View style={stylesOc.emergencyBadge}>
            <Text style={stylesOc.emergencyText}>URGENT</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const stylesOc = StyleSheet.create({
  button: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    margin: 5,
    minWidth: 120,
  },
  selectedButton: {
    backgroundColor: '#1e88e5',
    borderColor: '#0d47a1',
  },
  emergencyButton: {
    borderColor: '#ff4444',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedText: {
    color: 'white',
  },
  emergencyBadge: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  emergencyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export  function BookingSummary({ bookingData, isComplete, totalQuestions, currentStep }) {
  const formatLabel = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const getServiceTypeLabel = (type) => {
    const labels = {
      'repair': 'AC Repair',
      'installation': 'AC Installation',
      'maintenance': 'AC Maintenance',
      'cleaning': 'AC Deep Cleaning',
      'gas_refill': 'AC Gas Refill',
      'emergency': 'Emergency AC Repair',
    };
    return labels[type] || 'AC Service';
  };

  return (
    <ScrollView style={stylesBs.container}>
      <View style={stylesBs.header}>
        <Ionicons name="clipboard" size={24} color="white" />
        <Text style={stylesBs.title}>Service Details</Text>
      </View>
      
      <View style={stylesBs.content}>
        <View style={stylesBs.summaryItem}>
          <Text style={stylesBs.label}>Status:</Text>
          <Text style={stylesBs.value}>
            {isComplete ? 'Completed' : 'In Progress'}
          </Text>
        </View>
        
        <View style={stylesBs.summaryItem}>
          <Text style={stylesBs.label}>Questions:</Text>
          <Text style={stylesBs.value}>{currentStep}/{totalQuestions}</Text>
        </View>
        
        {Object.entries(bookingData).map(([key, value]) => {
          if (['bookingId', 'timestamp', 'totalCost', 'questionsAnswered'].includes(key)) {
            return null;
          }
          
          let displayValue = value;
          if (key === 'service_type') {
            displayValue = getServiceTypeLabel(value);
          }
          
          if (displayValue.length > 20) {
            displayValue = displayValue.substring(0, 20) + '...';
          }
          
          return (
            <View key={key} style={stylesBs.summaryItem}>
              <Text style={stylesBs.label}>{formatLabel(key)}:</Text>
              <Text style={stylesBs.value}>{displayValue}</Text>
            </View>
          );
        })}
        
        {isComplete && bookingData.bookingId && (
          <>
            <View style={stylesBs.summaryItem}>
              <Text style={stylesBs.label}>Booking ID:</Text>
              <Text style={[stylesBs.value, styles.highlight]}>{bookingData.bookingId}</Text>
            </View>
            <View style={stylesBs.summaryItem}>
              <Text style={stylesBs.label}>Estimated Cost:</Text>
              <Text style={[stylesBs.value, styles.highlight]}>{bookingData.totalCost}</Text>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const stylesBs = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    maxHeight: 300,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {},
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  label: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    maxWidth: '60%',
  },
  highlight: {
    color: '#4fc3f7',
  },
});

export  function ProgressBar({ currentStep, totalSteps }) {
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;
  
  return (
    <View style={stylesP.container}>
      <View style={stylesP.header}>
        <Text style={stylesP.title}>Booking Progress</Text>
        <View style={stylesP.counter}>
          <Text style={stylesP.counterText}>{currentStep}/{totalSteps}</Text>
        </View>
      </View>
      
      <View style={stylesP.progressBar}>
        <LinearGradient
          colors={['#4fc3f7', '#1e88e5']}
          style={[stylesP.progressFill, { width: `${progress}%` }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </View>
      
      <View style={stylesP.stats}>
        <Text style={stylesP.statText}>{currentStep} answered</Text>
        <Text style={stylesP.statText}>{totalSteps - currentStep} remaining</Text>
      </View>
    </View>
  );
}

const stylesP = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  counter: {
    backgroundColor: '#1e88e5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
  },
  counterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
});

export function MessageBubble({ text, isUser, timestamp }) {
  return (
    <View style={[
      stylesB.messageContainer,
      isUser ? stylesB.userMessage : stylesB.botMessage
    ]}>
      <View style={[
        stylesB.avatar,
        isUser ? stylesB.userAvatar : stylesB.botAvatar
      ]}>
        <Ionicons 
          name={isUser ? "person" : "snow"} 
          size={20} 
          color={isUser ? "#1e88e5" : "white"} 
        />
      </View>
      
      <View style={[
        stylesB.bubble,
        isUser ? stylesB.userBubble : stylesB.botBubble
      ]}>
        <Text style={isUser ? stylesB.userText : stylesB.botText}>
          {text}
        </Text>
        <Text style={stylesB.timestamp}>
          {timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
}

const stylesB = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  botAvatar: {
    backgroundColor: '#1e88e5',
  },
  userAvatar: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#1e88e5',
  },
  bubble: {
    maxWidth: '75%',
    padding: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  botBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  userBubble: {
    backgroundColor: '#1e88e5',
    borderBottomRightRadius: 5,
  },
  botText: {
    color: '#333',
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 5,
    textAlign: 'right',
  },
});




export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  
  const scrollViewRef = useRef();
  const questionCount = 8; // Can be random between 5-18

  useEffect(() => {
    initializeBot();
  }, []);

  useEffect(() => {
    if (currentStep < totalQuestions) {
      const question = questions[currentStep];
      setCurrentQuestion(question);
      showQuestion(question);
    }
  }, [currentStep, totalQuestions]);

  const initializeBot = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const selectedQuestions = getQuestionsByCount(questionCount);
      setTotalQuestions(selectedQuestions.length);
      setMessages([
        {
          id: '1',
          text: "❄️ Welcome to AC Service Pro!\nI'll help you book professional AC service quickly and easily.",
          isUser: false,
          timestamp: new Date(),
        },
        {
          id: '2',
          text: `📋 Today's Booking: ${questionCount} questions to complete your service request`,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
      setIsLoading(false);
      updateProgress();
    }, 1500);
  };

  const showQuestion = (question) => {
    if (!question) return;
    
    let formattedText = question.text;
    
    // Add dynamic text replacement
    if (question.dynamic && bookingData.service_type) {
      const serviceType = getServiceTypeLabel(bookingData.service_type);
      formattedText = formattedText.replace(/\{service_type\}/g, serviceType);
    }
    
    if (question.dynamic && bookingData.contact_name) {
      formattedText = formattedText.replace(/\{contact_name\}/g, bookingData.contact_name.split(' ')[0]);
    }
    
    const typeBadge = question.type.charAt(0).toUpperCase() + question.type.slice(1);
    
    setMessages(prev => [...prev, {
      id: `q-${currentStep}`,
      text: `${formattedText}\n\n[${typeBadge}]`,
      isUser: false,
      timestamp: new Date(),
      isQuestion: true,
    }]);
  };

  const handleSend = () => {
    if (!userInput.trim() || isLoading || isComplete) return;
    
    if (currentQuestion) {
      // Validate input
      if (currentQuestion.validation && !currentQuestion.validation(userInput)) {
        Alert.alert('Invalid Input', currentQuestion.errorMsg);
        return;
      }
      
      // Add user message
      setMessages(prev => [...prev, {
        id: `u-${Date.now()}`,
        text: userInput,
        isUser: true,
        timestamp: new Date(),
      }]);
      
      // Store booking data
      setBookingData(prev => ({
        ...prev,
        [currentQuestion.id]: userInput,
      }));
      
      // Clear input
      setUserInput('');
      setSelectedOption(null);
      
      // Move to next step or complete
      if (currentStep + 1 >= totalQuestions) {
        completeBooking();
      } else {
        setCurrentStep(prev => prev + 1);
      }
      
      updateProgress();
    }
  };

  const handleOptionSelect = (value) => {
    setSelectedOption(value);
    setUserInput(value);
  };

  const completeBooking = () => {
    setIsComplete(true);
    
    // Generate booking ID
    const bookingId = 'AC' + Date.now().toString().substr(-8);
    const totalCost = calculateEstimatedCost();
    
    const finalData = {
      ...bookingData,
      bookingId,
      timestamp: new Date().toLocaleString(),
      totalCost,
      questionsAnswered: totalQuestions,
    };
    
    setBookingData(finalData);
    
    setMessages(prev => [...prev, {
      id: 'complete',
      text: `🎉 Booking Confirmed Successfully!\n\nBooking ID: ${bookingId}\nService Type: ${getServiceTypeLabel(bookingData.service_type)}\nEstimated Cost: ${totalCost}\nQuestions Answered: ${totalQuestions}\n\n✅ What happens next?\n1. Our AC expert will contact you within 30 minutes\n2. Service appointment will be scheduled\n3. You'll receive SMS & email confirmation\n\nFor immediate assistance, call: 1800-AC-HELP`,
      isUser: false,
      timestamp: new Date(),
    }]);
    
    updateProgress();
  };

  const calculateEstimatedCost = () => {
    const baseCosts = {
      'repair': 800,
      'installation': 3000,
      'maintenance': 600,
      'cleaning': 900,
      'gas_refill': 1200,
      'emergency': 1500,
    };
    
    let cost = baseCosts[bookingData.service_type] || 1000;
    
    // Adjust based on tonnage
    if (bookingData.tonnage) {
      const tonnage = parseFloat(bookingData.tonnage);
      if (tonnage > 1.5) cost *= 1.3;
    }
    
    if (bookingData.service_type === 'emergency') cost *= 1.5;
    
    return `₹${Math.round(cost)} - ₹${Math.round(cost * 1.5)}`;
  };

  const updateProgress = () => {
    // Progress is updated via state
  };

  const resetBooking = () => {
    Alert.alert(
      'Start New Booking',
      'Are you sure you want to start a new booking? Current progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'New Booking', 
          onPress: () => {
            setMessages([]);
            setCurrentStep(0);
            setBookingData({});
            setIsComplete(false);
            setUserInput('');
            setSelectedOption(null);
            initializeBot();
          }
        },
      ]
    );
  };

  const testFlow = () => {
    const testCounts = [5, 8, 12, 15, 18];
    const randomCount = testCounts[Math.floor(Math.random() * testCounts.length)];
    Alert.alert('Test Flow', `Testing ${randomCount}-question flow`);
    // Implement test logic
  };

  const renderOptions = () => {
    if (!currentQuestion || currentQuestion.type !== 'options' || isComplete) {
      return null;
    }
    
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.optionsContainer}
      >
        <View style={styles.optionsGrid}>
          {currentQuestion.options.map((option, index) => {
            const optionValue = typeof option === 'object' ? option.value : option;
            const optionLabel = typeof option === 'object' ? option.label : option;
            const icon = typeof option === 'object' ? option.icon : null;
            
            return (
              <OptionButton
                key={index}
                label={optionLabel}
                icon={icon}
                isSelected={selectedOption === optionValue}
                onPress={() => handleOptionSelect(optionValue)}
                isEmergency={optionValue === 'emergency'}
              />
            );
          })}
        </View>
      </ScrollView>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <LinearGradient
        colors={['#1e88e5', '#0d47a1']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <Ionicons name="snow" size={28} color="white" />
          <Text style={styles.headerTitle}>AC Service Booking Assistant</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Professional AC installation, repair, and maintenance booking
        </Text>
      </LinearGradient>

      <View style={styles.mainContainer}>
        {/* Left Panel - Chat */}
        <View style={styles.chatPanel}>
          <ScrollView 
            ref={scrollViewRef}
            style={styles.chatContainer}
            contentContainerStyle={styles.chatContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
          >
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                text={message.text}
                isUser={message.isUser}
                timestamp={message.timestamp}
              />
            ))}
            
            {isLoading && (
              <View style={styles.loadingContainer}>
                <View style={styles.typingIndicator}>
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>
                <Text style={styles.loadingText}>Initializing AC Service Bot...</Text>
              </View>
            )}
          </ScrollView>

          {/* Options */}
          {renderOptions()}

          {/* Input Area */}
          {!isComplete && !isLoading && currentQuestion && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type your answer here..."
                value={userInput}
                onChangeText={setUserInput}
                multiline={currentQuestion.type === 'textarea'}
                numberOfLines={currentQuestion.type === 'textarea' ? 3 : 1}
                keyboardType={
                  currentQuestion.type === 'phone' ? 'phone-pad' :
                  currentQuestion.type === 'email' ? 'email-address' :
                  'default'
                }
              />
              <TouchableOpacity 
                style={styles.sendButton}
                onPress={handleSend}
                disabled={!userInput.trim()}
              >
                <LinearGradient
                  colors={['#1e88e5', '#0d47a1']}
                  style={styles.sendButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="send" size={20} color="white" />
                  <Text style={styles.sendButtonText}>Send</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Right Panel - Info */}
        {/* <View style={styles.infoPanel}>
          <LinearGradient
            colors={['#0f3460', '#1a1a2e']}
            style={styles.infoContent}
          >
            <ProgressBar
              currentStep={currentStep}
              totalSteps={totalQuestions}
            />
            
            <BookingSummary
              bookingData={bookingData}
              isComplete={isComplete}
              totalQuestions={totalQuestions}
              currentStep={currentStep}
            />
            
            <View style={styles.controlButtons}>
              <TouchableOpacity 
                style={[styles.controlButton, styles.resetButton]}
                onPress={resetBooking}
              >
                <Ionicons name="refresh" size={20} color="white" />
                <Text style={styles.controlButtonText}>New Booking</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.controlButton, styles.testButton]}
                onPress={testFlow}
              >
                <MaterialIcons name="science" size={20} color="white" />
                <Text style={styles.controlButtonText}>Test Flow</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.noteContainer}>
              <Ionicons name="information-circle" size={16} color="rgba(255,255,255,0.7)" />
              <Text style={styles.noteText}>
                Questions adapt based on service type. 5-18 questions total.
              </Text>
            </View>
          </LinearGradient>
        </View> */}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3c72',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    textAlign: 'center',
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
  },
  chatPanel: {
    flex: 3,
    backgroundColor: '#f8fafc',
    borderRadius: 15,
    marginRight: 10,
    overflow: 'hidden',
  },
  infoPanel: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
  },
  infoContent: {
    flex: 1,
    padding: 20,
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1e88e5',
    marginHorizontal: 4,
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
  },
  optionsContainer: {
    maxHeight: 150,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  optionsGrid: {
    flexDirection: 'row',
    padding: 15,
    flexWrap: 'wrap',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sendButton: {
    borderRadius: 10,
    overflow: 'hidden',
    width: 100,
  },
  sendButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 5,
  },
  controlButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  resetButton: {
    backgroundColor: '#ff7043',
  },
  testButton: {
    backgroundColor: '#4db6ac',
  },
  controlButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    gap: 8,
  },
  noteText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    flex: 1,
  },
});