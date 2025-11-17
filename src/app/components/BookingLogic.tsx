import React, { useCallback, useState, useContext } from "react"; // ⭐ CHANGED: added useContext
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  Alert, // ⭐ ADDED
} from "react-native";
import GradientBorder from "./GradientBorder";
import { scale, moderateScale, verticalScale } from "../../utils/scaling";
import {
  ServiceBrand,
  ServiceData,
  ServiceOption,
} from "../../constants/types";
import { useCart } from "../../hooks/useCart";

interface ServiceType {
  id: string;
  title: string;
  price: number;
  acCount: number;
}

const BookingBottomSheet = ({
  close,
  service,
}: {
  close: () => void;
  service: ServiceData;
}) => {
  const [step, setStep] = useState(0);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<ServiceOption | null>(null);
  const [selectedPricing, setSelectedPricing] = useState<string | null>(null);
  const [addMoreQuantity, setAddMoreQuantity] = useState<number>(0);

  // ⭐ ADDED: CartContext usage
  const { addToCart, isItemInTheCart } = useCart();

  let a = service.name; // example
  let b = "";

  if (/\bac\b/i.test(a)) {
    b = "AC";
  } else if (a.toLowerCase().includes("machine")) {
    b = "Mach..";
  }

  // TYPES (Service options from API)
  const TYPES = service.options ?? [];

  // PRICING derived from selectedType (base prices for single/double/triple)
  const PRICING: ServiceType[] = [
    {
      id: "single",
      title: `Single ${b}`,
      price: selectedType?.singlePrice ?? 0,
      acCount: 1,
    },
    {
      id: "double",
      title: `Double ${b}`,
      price: selectedType?.doublePrice ?? 0,
      acCount: 2,
    },
    {
      id: "triple",
      title: `Triple ${b}`,
      price: selectedType?.triplePrice ?? 0,
      acCount: 3,
    },
  ];

  const BRANDS = service.brands ?? [];

  const onClose = () => {
    close();
    setStep(0);
    // ⭐ CHANGED: reset selections on close
    setSelectedBrand(null);
    setSelectedType(null);
    setSelectedPricing(null);
    setAddMoreQuantity(0);
  };

  const goNext = useCallback(() => setStep((s) => Math.min(2, s + 1)), []);
  const goPrev = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  const renderBrand = ({ item }: { item: ServiceBrand }) => {
    const active = selectedBrand === item._id;
    return (
      <GradientBorder
        style={[
          {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: verticalScale(20) },
            shadowOpacity: 0.12,
            shadowRadius: 24,
            elevation: 4,
          },
          active && styles.brandChipActive,
        ]}
      >
        <TouchableOpacity onPress={() => setSelectedBrand(item._id)}>
          <View style={[styles.brandChip, active && styles.brandChipActive]}>
            <Text style={[styles.brandText, active && { color: "#fff" }]}>
              {item.name}
            </Text>
          </View>
        </TouchableOpacity>
      </GradientBorder>
    );
  };

  const renderPricing = ({ item }: { item: ServiceType }) => {
    const active = selectedPricing === item.id;
    return (
      <GradientBorder style={{ marginRight: scale(10) }}>
        <TouchableOpacity
          style={[styles.pricingCard, active && styles.pricingCardActive]}
          onPress={() => {
            setSelectedPricing(item.id);
            // Keep selectedType same — pricing depends on selectedType's prices (already in PRICING)
          }}
        >
          <View style={styles.pricingRow}>
            <View style={{ flex: 1, marginLeft: scale(12) }}>
              <Text style={styles.pricingTitle}>{item.title}</Text>
              <Text style={styles.pricingPrice}>₹{item.price}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </GradientBorder>
    );
  };

  // ---------- COUNT & PRICE LOGIC (⭐ ADDED) ----------

  // Get selected pricing ServiceType object
  const getCurrentServiceType = (): ServiceType => {
    const found = PRICING.find((p) => p.id === selectedPricing);
    return found || PRICING[0];
  };

  const getTotalACCount = (): number => {
    const currentService = getCurrentServiceType();
    return currentService.acCount + addMoreQuantity;
  };

  const calculateTotalPrice = (): number => {
    const currentService = getCurrentServiceType();
    // Additional ACs at fixed rate (same as ACServiceCard)
    const additionalACPrice = addMoreQuantity * 590;
    return currentService.price + additionalACPrice;
  };

  const handleAddMoreQuantity = (increment: boolean): void => {
    if (increment) {
      setAddMoreQuantity((prev) => prev + 1);
    } else {
      setAddMoreQuantity((prev) => Math.max(0, prev - 1));
    }
  };
  // ---------- END COUNT & PRICE LOGIC ----------

  // ---------- CART LOGIC (⭐ ADDED) ----------
  const showSuccessAlert = () => {
    const totalACs = getTotalACCount();
    const totalPrice = calculateTotalPrice();

    Alert.alert(
      "Added to Cart!",
      `${selectedType?.name ?? "Selected"} service for ${totalACs} unit${
        totalACs > 1 ? "s" : ""
      } has been added to your cart.\n\nTotal: ₹${totalPrice}`,
      [{ text: "OK", onPress: () => onClose() }]
    );
  };

  const proceedWithAddToCart = () => {
    // Build service object for cart (similar to ACServiceCard)
    const currentServiceType = getCurrentServiceType();
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
      BRANDS.find((b) => b._id === selectedBrand) ?? (null as any);
    const totalACs = getTotalACCount();

    // Duplicate check by service.name (same as ACServiceCard)
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
                serviceForCart.name = `${itemName} (${Date.now()})`;
                addToCart(serviceForCart, selectedType, brandObject, totalACs);
                close();
                showSuccessAlert();
              } else Alert.prompt("Select a suitable option");
            },
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
    } else {
      if (selectedType) {
        addToCart(serviceForCart, selectedType, brandObject, totalACs);
        close();
        showSuccessAlert();
      } else Alert.prompt("Select a suitable option");
    }
  };

  const handleAddToCart = () => {
    try {
      // Basic validations
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

      // Ask if brand not selected (previous code asked to Add Anyway) — but we enforce brand selection above.
      proceedWithAddToCart();
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert.alert("Error", "Failed to add item to cart. Please try again.");
    }
  };
  // ---------- END CART LOGIC ----------

  return (
    <ImageBackground
      source={require("../../../assets/bottomWrapper.png")}
      style={{ width: "100%", alignSelf: "flex-start" }}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.infoBubble}>
            <Text style={styles.infoText}>i</Text>
          </View>

          <View
            style={{
              width: scale(110),
              height: verticalScale(28),
              backgroundColor: "#767676",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: scale(4),
            }}
          >
            <Text style={styles.headerTitle}>Installation</Text>
          </View>
        </View>

        {/* STEP CONTENT */}
        <View style={styles.stepContainer}>
          {step === 0 && (
            <View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.sectionTitle}>Brand</Text>
                <Text style={styles.sectionTitle}>{step + 1}/3</Text>
              </View>

              <FlatList
                data={BRANDS}
                renderItem={renderBrand}
                keyExtractor={(i) => i._id}
                numColumns={3}
                columnWrapperStyle={{
                  justifyContent: "space-between",
                  marginBottom: verticalScale(12),
                  gap: 5,
                }}
                contentContainerStyle={{ paddingBottom: verticalScale(10) }}
              />
            </View>
          )}

          {step === 1 && (
            <View>
              <Text style={styles.sectionTitle}>Type</Text>

              <View style={styles.typeRow}>
                {TYPES.map((t) => {
                  const active = t._id === selectedType?._id;
                  return (
                    <GradientBorder key={t._id}>
                      <TouchableOpacity
                        style={[
                          styles.typeChip,
                          active && styles.typeChipActive,
                        ]}
                        onPress={() => {
                          setSelectedType(t);
                          // Reset pricing selection when type changes so pricing reads from new selectedType's prices
                          setSelectedPricing(null);
                        }}
                      >
                        <Text
                          style={[styles.typeText, active && { color: "#fff" }]}
                        >
                          {t.name}
                        </Text>
                      </TouchableOpacity>
                    </GradientBorder>
                  );
                })}
              </View>
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={styles.sectionTitle}>Pricing</Text>

              <FlatList
                data={PRICING}
                renderItem={renderPricing}
                keyExtractor={(i) => i.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: verticalScale(21) }}
              />

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    height: verticalScale(36),
                    width: scale(143),
                    backgroundColor: "#FFC300",
                    borderWidth: 1,
                    borderColor: "#FFC300",
                    borderRadius: scale(8),
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: scale(10),
                  }}
                >
                  <TouchableOpacity
                    onPress={() => handleAddMoreQuantity(false)} // ⭐ CHANGED (fixed): decrement
                    style={{
                      height: scale(12),
                      width: scale(12),
                      backgroundColor: "#fff",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        lineHeight: scale(12),
                        color: "#FFC300",
                        fontWeight: "600",
                        fontSize: moderateScale(16),
                      }}
                    >
                      -
                    </Text>
                  </TouchableOpacity>

                  <Text
                    style={{
                      lineHeight: scale(12),
                      color: "#fff",
                      fontWeight: "600",
                      fontSize: moderateScale(16),
                    }}
                  >
                    {getTotalACCount()}{" "}
                    {/* ⭐ CHANGED: display total AC count */}
                  </Text>

                  <TouchableOpacity
                    onPress={() => handleAddMoreQuantity(true)} // ⭐ CHANGED (fixed): increment
                    style={{
                      height: scale(12),
                      width: scale(12),
                      backgroundColor: "#fff",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        lineHeight: scale(12),
                        color: "#FFC300",
                        fontWeight: "600",
                        fontSize: moderateScale(16),
                      }}
                    >
                      +
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text
                  style={{ fontSize: moderateScale(25), fontWeight: "500" }}
                >
                  ₹{calculateTotalPrice()} {/* ⭐ CHANGED: dynamic price */}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* NAV BUTTONS */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, step === 0 && styles.navBtnDisabled]}
            onPress={step === 0 ? onClose : goPrev}
          >
            <Text style={styles.navBtnText}>
              {step === 0 ? "Cancel" : "Previous"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navBtnPrimary, step === 2 && { width: scale(244) }]}
            onPress={step === 2 ? handleAddToCart : goNext} // ⭐ CHANGED: on final step call handleAddToCart
          >
            <Text style={[styles.navBtnText, { color: "#fff" }]}>
              {step === 2 ? "Add To Cart" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

export default BookingBottomSheet;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(12),
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    fontSize: moderateScale(16),
    fontWeight: "500",
    color: "#fff",
  },

  infoBubble: {
    width: scale(14),
    height: scale(14),
    borderRadius: scale(14),
    backgroundColor: "#00000080",
    alignItems: "center",
    justifyContent: "center",
  },

  infoText: {
    fontWeight: "700",
    color: "#fff",
    lineHeight: scale(12),
  },

  stepContainer: {
    marginTop: verticalScale(16),
  },

  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: "500",
    marginBottom: verticalScale(13),
  },

  brandChip: {
    width: scale(112),
    height: verticalScale(34),
    backgroundColor: "#E8E8E8",
    borderRadius: scale(8),
    alignItems: "center",
    justifyContent: "center",
  },

  brandChipActive: {
    backgroundColor: "#0083D3",
    shadowOpacity: 0,
    elevation: 0,
  },

  brandText: {
    fontSize: moderateScale(14),
    fontWeight: "400",
  },

  typeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    // gap: scale(12),
    marginBottom: verticalScale(5),
  },

  typeChip: {
    borderRadius: scale(10),
    width: scale(170),
    height: verticalScale(34),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8E8E8",
    elevation: 10,
  },

  typeChipActive: { backgroundColor: "#0b78d1" },

  typeText: { fontSize: moderateScale(14) },

  pricingCard: {
    width: scale(107),
    height: verticalScale(63),
    backgroundColor: "#E8E8E8",
    borderRadius: scale(8),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    elevation: 4,
  },

  pricingCardActive: {
    borderWidth: scale(2),
    borderColor: "#0b78d1",
  },

  pricingRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  pricingTitle: { fontWeight: "600" },

  pricingPrice: {
    marginTop: verticalScale(6),
    color: "#666",
  },

  navRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: scale(12),
    marginTop: verticalScale(12),
    marginBottom: verticalScale(23),
  },

  navBtn: {
    borderRadius: scale(8),
    height: verticalScale(36),
    width: scale(96),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e8e8e8d4",
    borderColor: "#fff",
    borderWidth: 1,
    elevation: 25,
  },

  navBtnDisabled: {
    opacity: 0.5,
  },

  navBtnPrimary: {
    backgroundColor: "#027CC7",
    borderRadius: scale(8),
    height: verticalScale(36),
    width: scale(96),
    alignItems: "center",
    justifyContent: "center",
  },

  navBtnText: {
    fontWeight: "600",
  },
});
