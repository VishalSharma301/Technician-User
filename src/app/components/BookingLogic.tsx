import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ImageBackground,
} from "react-native";
import GradientBorder from "./GradientBorder";
import { scale, moderateScale, verticalScale } from "../../utils/scaling";

type Brand = { id: string; name: string };

const BRANDS: Brand[] = [
  { id: "1", name: "Daiken" },
  { id: "2", name: "LG" },
  { id: "3", name: "Voltas" },
  { id: "4", name: "Blue Star" },
  { id: "5", name: "Samsung" },
  { id: "6", name: "Hitachi" },
  { id: "7", name: "Carrier" },
  { id: "8", name: "Panasonic" },
  { id: "9", name: "Godrej" },
];

const TYPES = ["Window", "Split"];

const PRICING = [
  { id: "p1", title: "Single Ac", price: "₹550" },
  { id: "p2", title: "Double Ac", price: "₹850" },
  { id: "p3", title: "Triple Ac", price: "₹1230" },
];

const BookingBottomSheet = ({close} :{close : ()=>void}) => {
  const [step, setStep] = useState(0);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(BRANDS[0].id);
  const [selectedType, setSelectedType] = useState<string | null>(TYPES[0]);
  const [selectedPricing, setSelectedPricing] = useState<string | null>(
    PRICING[0].id
  );

  const onClose=()=>{
    close()
    setStep(0)
  }

  const goNext = useCallback(() => setStep((s) => Math.min(2, s + 1)), []);
  const goPrev = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  const renderBrand = ({ item }: { item: Brand }) => {
    const active = selectedBrand === item.id;
    return (
      <TouchableOpacity onPress={() => setSelectedBrand(item.id)}>
        <GradientBorder borderWidth={2}>
          <View style={[styles.brandChip, active && styles.brandChipActive]}>
            <Text style={[styles.brandText, active && { color: "#fff" }]}>
              {item.name}
            </Text>
          </View>
        </GradientBorder>
      </TouchableOpacity>
    );
  };

  const renderPricing = ({
    item,
  }: {
    item: { id: string; title: string; price: string };
  }) => {
    const active = selectedPricing === item.id;
    return (
      <GradientBorder style={{ marginRight: scale(10) }}>
        <TouchableOpacity
          style={[styles.pricingCard, active && styles.pricingCardActive]}
          onPress={() => setSelectedPricing(item.id)}
        >
          <View style={styles.pricingRow}>
            <View style={{ flex: 1, marginLeft: scale(12) }}>
              <Text style={styles.pricingTitle}>{item.title}</Text>
              <Text style={styles.pricingPrice}>{item.price}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </GradientBorder>
    );
  };

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
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={styles.sectionTitle}>Brand</Text>
                <Text style={styles.sectionTitle}>{step + 1}/3</Text>
              </View>

              <FlatList
                data={BRANDS}
                renderItem={renderBrand}
                keyExtractor={(i) => i.id}
                numColumns={3}
                columnWrapperStyle={{
                  justifyContent: "space-between",
                  marginBottom: verticalScale(12),
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
                  const active = t === selectedType;
                  return (
                    <GradientBorder key={t}>
                      <TouchableOpacity
                        style={[styles.typeChip, active && styles.typeChipActive]}
                        onPress={() => setSelectedType(t)}
                      >
                        <Text style={[styles.typeText, active && { color: "#fff" }]}>
                          {t}
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

              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
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
                  <View
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
                  </View>

                  <Text
                    style={{
                      lineHeight: scale(12),
                      color: "#fff",
                      fontWeight: "600",
                      fontSize: moderateScale(16),
                    }}
                  >
                    4
                  </Text>

                  <View
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
                  </View>
                </View>

                <Text style={{ fontSize: moderateScale(25), fontWeight: "500" }}>
                  ₹1500
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* NAV BUTTONS */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, step === 0 && styles.navBtnDisabled]}
            onPress={step===0 ? onClose  : goPrev}
            // disabled={step === 0}
          >
            <Text style={styles.navBtnText}>{step===0 ? "Cancel" : "Previous"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navBtnPrimary, step === 2 && { width: scale(244) }]}
            onPress={step===2 ? onClose :goNext}
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
    paddingHorizontal: scale(12),
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: verticalScale(20) },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
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
    gap: scale(12),
    marginBottom : verticalScale(5)
  },

  typeChip: {
    borderRadius: scale(10),
    width: scale(160),
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
    marginBottom : verticalScale(23)
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
