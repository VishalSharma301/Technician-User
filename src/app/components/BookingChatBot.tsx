// src/app/components/BookingChatBot.tsx

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
  Alert,
} from "react-native";
import { ServiceData, ServiceOption, ServiceBrand } from "../../constants/types";
import { addToCart } from "../../utils/cartApis";
import { useCart } from "../../hooks/useCart";

type ChatMessage = {
  id: string;
  sender: "bot" | "user";
  text?: string;
  options?: { id: string; label: string }[];
};

interface ServiceType {
  id: string;
  title: string;
  price: number;
  acCount: number;
}




interface Props {
  service: ServiceData;
  onClose: () => void;
  onAddToCart: (args: {
    brand: ServiceBrand;
    type: ServiceOption;
    pricingId: string;
  }) => void;
}

const BookingChatBot: React.FC<Props> = ({
  service,
  onClose,
  onAddToCart,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const { addToCart, isItemInTheCart } = useCart();
  const listRef = useRef<FlatList>(null);

  const [selectedBrand, setSelectedBrand] = useState<ServiceBrand | null>(null);
  const [selectedType, setSelectedType] = useState<ServiceOption | null>(null);
  const [selectedPricing, setSelectedPricing] = useState<string | null>(null);
  const [addMoreQuantity, setAddMoreQuantity] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState("");
  const PRICING = [
    { id: "single", label: "Single Unit" },
    { id: "double", label: "Double Unit" },
    { id: "triple", label: "Triple Unit" },
  ];

  /* ---------- Auto scroll ---------- */
  const scrollToBottom = () => {
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 80);
  };




  
  /* ---------- Typing animation ---------- */
  // Animated dot values
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  const animateDots = () => {
    Animated.loop(
      Animated.stagger(150, [
        Animated.sequence([
          Animated.timing(dot1, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot1, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dot2, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dot3, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ]),
      ])
    ).start();
  };

  useEffect(() => {
    animateDots();
  }, []);

  /* ---------- Helpers ---------- */
  const botMessage = (msg: ChatMessage) => {
    setIsBotTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      setIsBotTyping(false);
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    }, 800);
  };

  const userMessage = (text: string) => {
    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "user", text }]);
    scrollToBottom();
  };

  /* ---------- Initial Message ---------- */
  useEffect(() => {
    botMessage({
      id: "q-brand",
      sender: "bot",
      text: "Choose your brand",
      options: service.brands.map((b) => ({ id: b._id, label: b.name })),
    });
  }, []);

  /* ---------- Handlers ---------- */
  const handleBrandSelect = (brand: ServiceBrand) => {
    setSelectedBrand(brand);
    userMessage(`Brand: ${brand.name}`);

    botMessage({
      id: "q-type",
      sender: "bot",
      text: "Choose service type",
      options: service.options.map((o) => ({
        id: o._id,
        label: o.name,
      })),
    });
  };

  const handleTypeSelect = (type: ServiceOption) => {
    setSelectedType(type);
    userMessage(`Type: ${type.name}`);

    botMessage({
      id: "q-pricing",
      sender: "bot",
      text: "Choose pricing",
      options: PRICING,
    });
  };

  const handlePricingSelect = (pricingId: string) => {
    setSelectedPricing(pricingId);
    const selected = PRICING.find((p) => p.id === pricingId);
    userMessage(`Pricing: ${selected?.label}`);

    botMessage({
      id: "confirm",
      sender: "bot",
      text: "Add to cart?",
      options: [
        { id: "yes", label: "Yes" },
        { id: "no", label: "No" },
      ],
    });
  };

  const handleConfirmation = (choice: string) => {
    userMessage(choice === "yes" ? "Yes" : "No");

    if (choice === "no") {
      botMessage({
        id: "cancel",
        sender: "bot",
        text: "Okay, cancelled.",
      });
      return;
    }

    if (selectedBrand && selectedType && selectedPricing) {
      onAddToCart({
        brand: selectedBrand,
        type: selectedType,
        pricingId: selectedPricing,
      });

      botMessage({
        id: "done",
        sender: "bot",
        text: "Added to cart! 🎉",
      });
    }
  };

  /* ---------- Central Option Router ---------- */
  const handleOptionPress = (qId: string, opt: { id: string; label: string }) => {
    if (qId === "q-brand") {
      const brand = service.brands.find((b) => b._id === opt.id)!;
      handleBrandSelect(brand);
    }

    if (qId === "q-type") {
      const type = service.options.find((t) => t._id === opt.id)!;
      handleTypeSelect(type);
    }

    if (qId === "q-pricing") {
      handlePricingSelect(opt.id);
    }

    if (qId === "confirm") {
      handleConfirmation(opt.id);
    }
  };

  const getCurrentServiceType = (): ServiceType => {
    const found = PRICING.find((p) => p.id === selectedPricing);
    return found || PRICING[0];
  };

  const getTotalACCount = () => 1 + addMoreQuantity;

  // ---------- Calculate total price with smart tier logic ----------
  const calculateTotalPrice = (): number => {
    const total = getTotalACCount();

    if (total === 1) return PRICING.find((p) => p.id === "single")?.price ?? 0;
    if (total === 2) return PRICING.find((p) => p.id === "double")?.price ?? 0;
    if (total === 3) return PRICING.find((p) => p.id === "triple")?.price ?? 0;

    const triple = PRICING.find((p) => p.id === "triple")?.price ?? 0;
    return triple + (total - 3) * EXTRA_UNIT_PRICE;
  };


    const proceedWithAddToCart = () => {
      const currentServiceType = getCurrentServiceType();
      const totalACs = getTotalACCount();
  
      // Build minimal cart service object (keeps existing fields as you requested not to change)
      const serviceForCart: ServiceData = {
        _id: service._id,
        name: `${selectedType?.name ?? ""} ${service.name} - ${
          currentServiceType.title
        }`,
        basePrice: calculateTotalPrice(),
        description: service.description,
        icon: service.icon,
        availableInZipcode: service.availableInZipcode,
        brands: service.brands,
        options: service.options,
        category: service.category,
        dailyNeed: service.dailyNeed,
        estimatedTime: service.estimatedTime,
        mostBooked: service.mostBooked,
        popular: service.popular,
        providerCount: service.providerCount,
        quickPick: service.quickPick,
        slug: service.slug,
        specialty: service.specialty,
        subcategoryName: service.subcategoryName,
        subServices: service.subServices,
      };
  
      const brandObject =
        service.brands?.find((b) => b._id === selectedBrand) ?? (null as any);
  
      const itemName = service.name;
  
      if (isItemInTheCart(itemName)) {
        Alert.alert(
          "Item Already in Cart",
          "This service configuration is already in your cart. Do you want to add it again?",
          [
            {
              text: "Add Again",
              onPress: () => {
                if (selectedType) {
                  // clone instead of mutating
                  const duplicatedItem = {
                    ...serviceForCart,
                    name: `${itemName} (${Date.now()})`,
                  };
                  addToCart(duplicatedItem, selectedType, brandObject, totalACs);
                  onClose();
                  showSuccessAlert();
                } else {
                  Alert.alert(
                    "Selection Required",
                    "Please select a suitable option."
                  );
                }
              },
            },
            { text: "Cancel", style: "cancel" },
          ]
        );
      } else {
        if (selectedType) {
          addToCart(serviceForCart, selectedType, brandObject, totalACs);
          onClose();
          showSuccessAlert();
        } else {
          Alert.alert("Selection Required", "Please select a suitable option.");
        }
      }
    };
  
    const handleAddToCart = () => {
      try {
        if (!selectedBrand) {
          Alert.alert("Selection Required", "Please select a brand.");
          return;
        }
        if (!selectedType) {
          Alert.alert("Selection Required", "Please select a type/option.");
          return;
        }
        if (!selectedPricing) {
          Alert.alert(
            "Selection Required",
            "Please select a pricing (Single/Double/Triple)."
          );
          return;
        }
  
        proceedWithAddToCart();
      } catch (error) {
        console.error("Error adding to cart:", error);
        Alert.alert("Error", "Failed to add item to cart. Please try again.");
      }
    };
  

  /* ---------- Render bubble ---------- */
  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.sender === "user";

    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.botBubble,
        ]}
      >
        {item.text && (
          <Text style={isUser ? styles.userText : styles.botText}>
            {item.text}
          </Text>
        )}

        {item.options && (
          <View style={styles.optionContainer}>
            {item.options.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                onPress={() => handleOptionPress(item.id, opt)}
                style={styles.optionButton}
              >
                <Text style={styles.optionText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  /* ---------- Render UI ---------- */
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
        <Text style={{ fontSize: 18 }}>✕</Text>
      </TouchableOpacity>

      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={scrollToBottom}
      />

      {/* ---------- Typing Indicator ---------- */}
      {isBotTyping && (
        <View style={styles.typingContainer}>
          <Animated.Text style={[styles.dot, { opacity: dot1 }]}>•</Animated.Text>
          <Animated.Text style={[styles.dot, { opacity: dot2 }]}>•</Animated.Text>
          <Animated.Text style={[styles.dot, { opacity: dot3 }]}>•</Animated.Text>
        </View>
      )}
    </View>
  );
};

export default BookingChatBot;

/* ---------------------------  BASIC STYLES --------------------------- */

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: 12,
  },

  closeBtn: {
    alignSelf: "flex-end",
    padding: 8,
  },

  messageBubble: {
    padding: 10,
    marginVertical: 6,
    borderRadius: 8,
    maxWidth: "80%",
  },

  botBubble: {
    backgroundColor: "#eaeaea",
    alignSelf: "flex-start",
  },

  userBubble: {
    backgroundColor: "#027CC7",
    alignSelf: "flex-end",
  },

  botText: { color: "#333" },
  userText: { color: "#fff" },

  optionContainer: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  optionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#aaa",
  },

  optionText: { color: "#333" },

  typingContainer: {
    flexDirection: "row",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
  },

  dot: {
    fontSize: 24,
    color: "#555",
  },
});
