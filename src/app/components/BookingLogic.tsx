// src/app/components/BookingBottomSheet.tsx
import React, {
  useCallback,
  useMemo,
  useState,
  useContext,
  useEffect,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  Alert,
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

const EXTRA_UNIT_PRICE = 590; // static extra price for units beyond triple

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
  const [errorMessage, setErrorMessage] = useState("");

  const { addToCart, isItemInTheCart } = useCart();

  // ------------------ Unit detection ------------------
  const detectUnitType = (name: string) => {
    const n = (name || "").toLowerCase();
    if (n.includes("ac")) return "AC";
    if (n.includes("machine")) return "Machine";
    return "Unit";
  };

  // const unitType = useMemo(() => detectUnitType(service.name), [service.name]);
  const unitType = "Unit";

  // ---------- TYPES & PRICING (memoized) ----------
  const TYPES = service.options ?? [];

  const PRICING: ServiceType[] = useMemo(() => {
    return [
      {
        id: "single",
        title: `Single ${unitType}`,
        price: selectedType?.singlePrice ?? 0,
        acCount: 1,
      },
      {
        id: "double",
        title: `Double ${unitType}`,
        price: selectedType?.doublePrice ?? 0,
        acCount: 2,
      },
      {
        id: "triple",
        title: `Triple ${unitType}`,
        price: selectedType?.triplePrice ?? 0,
        acCount: 3,
      },
    ];
  }, [selectedType, unitType]);

  // ---------- Close handler ----------
  const onClose = () => {
    close();
    setStep(0);
    setSelectedBrand(null);
    setSelectedType(null);
    setSelectedPricing(null);
    setAddMoreQuantity(0);
  };

  // ---------- Step navigation with validation ----------
  const goPrev = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
    setErrorMessage("");
  }, []);

  const goNext = () => {
    if (step === 0 && !selectedBrand) {
      setErrorMessage("Select Brand*");
      return;
    }

    if (step === 1 && !selectedType) {
      setErrorMessage("Select Type*");
      return;
    }

    // Clear error on valid step change
    setErrorMessage("");
    setStep((s) => Math.min(2, s + 1));
  };

  // ---------- Helper: get current service type object ----------
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

  useEffect(() => {
    if (step === 2 && !selectedPricing) {
      setSelectedPricing("single");
      setAddMoreQuantity(0); // total = 1
    }
  }, [step]);
  // ---------- Quantity increment/decrement with auto-pricing ----------
  const handleAddMoreQuantity = (increment: boolean) => {
    setAddMoreQuantity((prev) => {
      const newAdd = increment ? prev + 1 : Math.max(0, prev - 1);

      const totalACs = 1 + newAdd; // <-- ALWAYS based on initial 1 unit

      // Auto-select pricing based on count
      if (totalACs === 1) {
        setSelectedPricing("single");
      } else if (totalACs === 2) {
        setSelectedPricing("double");
      } else if (totalACs === 3) {
        setSelectedPricing("triple");
      } else if (totalACs > 3) {
        setSelectedPricing("triple"); // triple + extras
      }

      return newAdd;
    });
  };

  // ---------- Brand rendering ----------
  const renderBrand = useCallback(
    ({ item }: { item: ServiceBrand }) => {
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
          <TouchableOpacity
            onPress={() => {
              setSelectedBrand(item._id);
            }}
          >
            <View style={[styles.brandChip, active && styles.brandChipActive]}>
              <Text style={[styles.brandText, active && { color: "#fff" }]}>
                {item.name}
              </Text>
            </View>
          </TouchableOpacity>
        </GradientBorder>
      );
    },
    [selectedBrand]
  );

  // ---------- Pricing rendering ----------
  const renderPricing = useCallback(
    ({ item }: { item: ServiceType }) => {
      const active = selectedPricing === item.id;
      return (
        <GradientBorder style={{ marginRight: scale(10) }}>
          <TouchableOpacity
            style={[styles.pricingCard, active && styles.pricingCardActive]}
            onPress={() => {
              setSelectedPricing(item.id);

              // Set quantity correctly based on selected pricing
              if (item.id === "single") {
                setAddMoreQuantity(0); // total = 1
              } else if (item.id === "double") {
                setAddMoreQuantity(1); // total = 2
              } else if (item.id === "triple") {
                setAddMoreQuantity(2); // total = 3
              }
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
    },
    [selectedPricing]
  );

  // ---------- Add to cart helpers ----------
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

  // ---------- Type selection: if on step 2, go back to 1 when type changes ----------
  const handleTypeSelect = (t: ServiceOption) => {
    setSelectedType(t);
    setSelectedPricing(null);
    // If user changes type while viewing pricing, return them to type step to pick pricing
    if (step === 2) setStep(1);
  };

  // ---------- Render ----------
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
              // borderWidth : 1,
              // width: scale(110),
              height: verticalScale(28),
              backgroundColor: "#767676",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: scale(4),
            }}
          >
            <Text numberOfLines={1} style={styles.headerTitle}>
              {service.name}
            </Text>
          </View>
        </View>

        {/* STEP CONTENT */}
        <View style={styles.stepContainer}>
          {step === 0 && (
            <View style={{ marginTop: verticalScale(20) }}>
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
                data={service.brands ?? []}
                renderItem={renderBrand}
                keyExtractor={(i) => i._id}
                numColumns={3}
                columnWrapperStyle={{
                  justifyContent:
                    service.brands.length > 3 ? "flex-start" : "space-evenly",
                  marginBottom: verticalScale(12),
                  gap: 5,
                }}
                contentContainerStyle={{ paddingBottom: verticalScale(10) }}
              />
            </View>
          )}

          {step === 1 && (
            <View style={{ marginTop: verticalScale(40) }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.sectionTitle}>Type</Text>
                <Text style={styles.sectionTitle}>{step + 1}/3</Text>
              </View>

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
                        onPress={() => handleTypeSelect(t)}
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
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.sectionTitle}>Pricing</Text>
                <Text style={styles.sectionTitle}>{step + 1}/3</Text>
              </View>
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
                    onPress={() => handleAddMoreQuantity(false)}
                    style={{
                      // height: scale(14),
                      width: scale(14),
                      aspectRatio: 1,
                      backgroundColor: "#fff",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        lineHeight: scale(14),
                        color: "#FFC300",
                        fontWeight: "600",
                        fontSize: moderateScale(14),
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
                    {getTotalACCount()}
                  </Text>

                  <TouchableOpacity
                    onPress={() => handleAddMoreQuantity(true)}
                    style={{
                      // height: scale(14),
                      width: scale(14),
                      aspectRatio: 1,
                      backgroundColor: "#fff",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        lineHeight: scale(14),
                        color: "#FFC300",
                        fontWeight: "600",
                        fontSize: moderateScale(14),
                      }}
                    >
                      +
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text
                  style={{ fontSize: moderateScale(25), fontWeight: "500" }}
                >
                  ₹{calculateTotalPrice()}
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
            onPress={step === 2 ? handleAddToCart : goNext}
          >
            <Text style={[styles.navBtnText, { color: "#fff" }]}>
              {step === 2 ? "Add To Cart" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
      </View>
    </ImageBackground>
  );
};

export default BookingBottomSheet;

const styles = StyleSheet.create({
  container: {
    height: verticalScale(350),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(24),
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
    paddingHorizontal: scale(6),
  },

  infoBubble: {
    width: scale(16),
    height: scale(16),
    borderRadius: scale(14),
    backgroundColor: "#00000080",
    alignItems: "center",
    justifyContent: "center",
  },

  infoText: {
    fontWeight: "700",
    color: "#fff",
    lineHeight: scale(13),
    fontSize: moderateScale(12),
    // borderWidth : 1
  },

  stepContainer: {
    marginTop: verticalScale(20),
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
    marginTop: verticalScale(24),
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
    shadowColor: "#000",
    shadowOpacity: 0.04,
    // elevation: 4,
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
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.04,
  },

  navBtnText: {
    fontWeight: "600",
  },
  errorText: {
    color: "red",
    marginTop: verticalScale(4),
    alignSelf: "center",
    fontSize: moderateScale(14),
    fontWeight: "500",
  },
});
