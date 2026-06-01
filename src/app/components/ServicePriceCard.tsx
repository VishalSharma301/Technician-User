import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
} from "react-native";
import { scale, verticalScale, moderateScale } from "../../utils/scaling";
import { LinearGradient } from "expo-linear-gradient";
import CustomView from "./CustomView";
import { iconMap } from "../../utils/iconMap";

type Props = {
  initialQty?: number;
  basePrice: number; // 👈 replaces unitPrice / originalPrice / discountPercent
  quantityPricing: Array<{
    quantity: number;
    label: string;
    avgDiscountPct: number;
    displayPrice: number;
  }>;
  onConfirm: (qty: number) => void;
  onCancel: () => void;
  serviceName?: string;
  serviceType?: string;
  brand?: string;
  features?: string[];
  icon?: string;
  acType?: string;
};

export default function ServicePriceCard({
  initialQty = 1,
  basePrice,
  // unitPrice,
  // originalPrice,
  quantityPricing,
  onConfirm,
  onCancel,
  serviceName,
  brand,
  acType,
  features = [
    "Comprehensive AC Maintenance",
    "Refrigerant level and cooling assessment",
    "Cleaning of air filters",
    "Complete performance evaluation",
    "Refrigerant level and cooling assessment",
    "Air filter cleaning",
    "Total performance evaluation",
    "Thorough AC Maintenance",
  ],
  icon,
}: Props) {
  const [qty, setQty] = useState(initialQty);

  const getTieredPrice = (q: number) => {
    if (q === 1) return { total: basePrice, discountPct: 0 };
    if (q === 2) {
      const tier = quantityPricing.find((t) => t.quantity === 2);
      if (tier)
        return { total: tier.displayPrice, discountPct: tier.avgDiscountPct };
      return { total: basePrice * 2, discountPct: 0 };
    }
    if (q === 3) {
      const tier = quantityPricing.find((t) => t.quantity === 3);
      if (tier)
        return { total: tier.displayPrice, discountPct: tier.avgDiscountPct };
      return { total: basePrice * 3, discountPct: 0 };
    }
    // 3+
    const tier = quantityPricing.find((t) => t.label === "3+");
    const pct = tier?.avgDiscountPct ?? 0;
    return { total: q * basePrice * (1 - pct / 100), discountPct: pct };
  };

  const { total: totalPrice, discountPct: discountPercent } =
    getTieredPrice(qty);
  const savedAmount = qty * basePrice - totalPrice;
  const originalPrice = qty * basePrice; // for the strikethrough

  // const discountedUnitPrice = unitPrice * (1 - discountPercent / 100);
  // const totalPrice = qty * discountedUnitPrice;
  // const savedAmount = qty * unitPrice - totalPrice;

  const increase = () => setQty((q) => q + 1);
  const decrease = () => setQty((q) => (q > 1 ? q - 1 : q));

  return (
    <View style={styles.wrapper}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* "AC MAINTENANCE" label */}
          <Text style={styles.acLabel}>{serviceName}</Text>
          <Text style={styles.serviceName}>Complete Service Pack</Text>

          {/* Tags */}
          <View style={styles.tagRow}>
            <CustomView
              radius={moderateScale(8)}
              gradientColors={["#D7DB9E", "#D7DB9E"]}
              shadowColor={"#EAC9A3"}
              borderColor={"#fff"}
              boxStyle={{
                alignItems: "center",
              }}
            >
              <View style={styles.outlineTag}>
                <Text style={styles.outlineTagText}>{acType}</Text>
              </View>
            </CustomView>
            <CustomView
              radius={moderateScale(8)}
              gradientColors={["#FFDCB3", "#FFDCB3"]}
              shadowColor={"#EAC9A3"}
              borderColor={"#fff"}
              boxStyle={{
                alignItems: "center",
              }}
            >
              <View style={styles.outlineTag}>
                <Text style={styles.outlineTagText}>{brand}</Text>
              </View>
            </CustomView>
          </View>
        </View>

        {/* Snowflake icon box */}
        <CustomView radius={12} gradientColors={['#FFF5EA','#FBE8D1']}>
        <View style={styles.snowflakeBox}>
          <Image
            source={{ uri: icon }}
            style={styles.snowflakeEmoji}
            resizeMode="contain"
          />
        </View>
        </CustomView>
      </View>

      {/* ── Price Card (blue gradient) ── */}
      <ImageBackground
        source={require("../../../assets/ServiceBG.png")}
        style={styles.priceCard}
        resizeMode="stretch"
      >
        {/* <LinearGradient
          colors={["#1D365D", "#1D365D"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.priceCard}
        > */}
        {/* Discount badge */}
        {/* <View style={styles.discountBadge}>
            
          </View> */}

        {/* Total label */}
        <View style={{ borderWidth: 0, flexDirection: "row" }}>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.oldPriceText}>₹{basePrice * qty}</Text>
        </View>

        {/* Price + Stepper row */}
        <View style={styles.priceStepperRow}>
          <View>
            <Text style={styles.priceText}>₹{Math.round(totalPrice)}</Text>
            <Text style={styles.discountBadgeText}>
              {discountPercent || 0}% Off
            </Text>
          </View>

          {/* Quantity Stepper */}
          <View style={styles.stepper}>
            <TouchableOpacity style={styles.stepBtn} onPress={decrease}>
              <Text style={styles.stepBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyText}>{qty}</Text>
            <TouchableOpacity style={styles.stepBtn} onPress={increase}>
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Savings badge */}
        <View style={styles.savingsBadge}>
          <Text style={styles.savingsText}>
            You save ₹{Math.round(savedAmount)} on this Order
          </Text>
        </View>
        {/* </LinearGradient> */}
      </ImageBackground>

      {/* ── Feature List ── */}
      <View style={styles.featureList}>
        {features.map((item, index) => (
          <View key={index} style={styles.featureItem}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
            <Text style={styles.featureText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* ── Visiting Charges Banner ── */}
      <View style={styles.visitingBanner}>
        <View style={styles.visitingLeft}>
          {/* <Text style={styles.visitingPlantIcon}>🌿</Text> */}
          {/* <Image style={{width :scale(18), height: scale(18)}} source={iconMap['rupee']}/> */}
          <Text style={styles.visitingBoldLabel}>Visiting Charges:</Text>
          <Text style={styles.visitingPrice}>₹150</Text>
        </View>
        <View style={styles.visitingRight}>
          <Text style={styles.visitingMuted}>Adjusted if service is taken</Text>
        </View>
      </View>

      {/* ── Action Buttons ── */}
      <View style={styles.actionRow}>
        <TouchableOpacity onPress={onCancel} style={{ width: "49%" }}>
          <CustomView
            radius={moderateScale(8)}
            gradientColors={["#D2882C", "#D2882C"]}
            shadowColor={"#AA5F00"}
            borderColor={"#fff"}
            boxStyle={{
              paddingVertical: verticalScale(10),
              // height : verticalScale(45),
              alignItems: "center",
            }}
            
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </CustomView>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ width: "49%" }}
          onPress={() => onConfirm(qty)}
        >
          <CustomView
            radius={moderateScale(8)}
            gradientColors={["#729869", "#729869"]}
            shadowColor={"#77966F"}
            boxStyle={{
              paddingVertical: verticalScale(10),
              alignItems: "center",
            }}
            // shadowStyle={{ marginVertical: verticalScale(10) }}
          >
            <Text style={styles.confirmText}>Confirm</Text>
          </CustomView>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const TEXT_COLOR = "#936140";
const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#FFF5EB",
    borderRadius: scale(8),
    padding: scale(18),
    width: scale(350),
    borderWidth: moderateScale(1),
    borderColor: "#F2D6B5",
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.08,
    // shadowRadius: 12,
    // elevation: 4,
  },

  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: verticalScale(14),
  },
  headerLeft: {
    flex: 1,
  },
  acLabel: {
    fontSize: moderateScale(11),
    fontWeight: "700",
    color: "#519679",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: verticalScale(4),
  },
  serviceName: {
    fontSize: moderateScale(22),
    fontWeight: "800",
    color: TEXT_COLOR,

    marginBottom: verticalScale(10),
  },
  tagRow: {
    flexDirection: "row",
    gap: scale(8),
  },
  outlineTag: {
    // borderWidth: moderateScale(0.7),
    // borderColor: "#045BD826",
    borderRadius: scale(4),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(4),
    // backgroundColor: "#DDE6F3",
  },
  outlineTagText: {
    fontSize: moderateScale(12),
    color: "#656565",
    fontWeight: "600",
  },

  /* Snowflake box — blue rounded square */
  snowflakeBox: {
    width: scale(48),
    height: scale(48),
    // borderRadius: scale(14),
    // backgroundColor: "#258ECF",
    alignItems: "center",
    justifyContent: "center",
    // marginLeft: scale(10),
  },
  snowflakeEmoji: {
    // fontSize: moderateScale(22),
    height: scale(36),
    width: scale(36),
    resizeMode: "contain",
  },

  /* Price Card — blue gradient */
  priceCard: {
    borderRadius: scale(8),
    paddingVertical: scale(26),
    paddingHorizontal: scale(16),
    marginBottom: verticalScale(16),
    overflow: "hidden",
    height: verticalScale(190),
  },
  discountBadge: {
    position: "absolute",
    top: scale(14),
    right: scale(14),
    backgroundColor: "#96AEA4",
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(4),
    borderWidth: moderateScale(1),
    borderColor: "#E7ECF8",
  },
  discountBadgeText: {
    color: "#fff",
    fontSize: moderateScale(13),
    fontWeight: "700",
  },
  totalLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: moderateScale(13),
    fontWeight: "500",
    marginBottom: verticalScale(2),
  },
  priceStepperRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(12),
  },
  priceText: {
    fontSize: moderateScale(42),
    fontWeight: "800",
    color: "#fff",
    lineHeight: moderateScale(48),
  },
  oldPriceText: {
    fontSize: moderateScale(15),
    color: "#FF0000",
    textDecorationLine: "line-through",
    fontWeight: "700",
    marginLeft: scale(22),
    marginTop: verticalScale(7),
  },

  /* Stepper */
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#34A4FB33",
    borderRadius: scale(30),
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(5),
    gap: scale(12),
    borderWidth: moderateScale(1),
    borderColor: "#E7ECF8",
  },
  stepBtn: {
    // backgroundColor: "#34A4FB33",
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    alignItems: "center",
    justifyContent: "center",
    // borderColor: "#3b99d449",
    // borderWidth: moderateScale(1),
  },
  stepBtnText: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    color: "#fff",
    lineHeight: moderateScale(22),
  },
  qtyText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: moderateScale(18),
    minWidth: scale(22),
    textAlign: "center",
  },

  /* Savings */
  savingsBadge: {
    backgroundColor: "#00FFE133",
    borderRadius: scale(100),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    alignSelf: "stretch",
    alignItems: "center",
    borderBottomWidth: moderateScale(0.7),
    // borderColor : '#fff'
    // shadowColor: "#fff",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.5,
    // shadowRadius: 4,
    //  elevation: 3,
  },
  savingsText: {
    color: "#fff",
    fontSize: moderateScale(12.5),
    fontWeight: "600",
  },

  /* Feature list */
  featureList: {
    marginBottom: verticalScale(14),
    paddingHorizontal: scale(2),
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(10),
    gap: scale(10),
  },
  checkCircle: {
    width: scale(15),
    height: scale(15),
    borderRadius: scale(10),
    backgroundColor: "#864C2D",
    alignItems: "center",
    justifyContent: "center",
  },
  checkIcon: {
    color: "#fff",
    fontSize: moderateScale(9),
    fontWeight: "800",
    lineHeight: moderateScale(13),
  },
  featureText: {
    fontSize: moderateScale(13.5),
    color: TEXT_COLOR,
    fontWeight: "600",
    flex: 1,
  },

  /* Visiting charges — horizontal layout */
  visitingBanner: {
    backgroundColor: "#fff",
    borderRadius: scale(12),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(10),
    marginBottom: verticalScale(16),
    // flexDirection: "row",
    // justifyContent: "space-between",
    alignItems: "center",
    height: verticalScale(68.3),
    borderWidth: moderateScale(1),
    borderColor: "#F2D6B5",
  },
  visitingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    // borderWidth : 1,
    alignSelf: "flex-start",
  },
  visitingPlantIcon: {
    fontSize: moderateScale(16),
  },
  visitingBoldLabel: {
    fontSize: moderateScale(13.5),
    fontWeight: "700",
    color: TEXT_COLOR,
  },
  visitingRight: {
    // borderWidth : 1,
    alignSelf: "flex-end",
    marginTop: verticalScale(6),
    // gap: verticalScale(5),
  },
  visitingPrice: {
    fontSize: moderateScale(15),
    fontWeight: "800",
    color: TEXT_COLOR,
    alignSelf: "center",
    marginLeft: "35%",
  },
  visitingMuted: {
    fontSize: moderateScale(11),
    color: "#729869",
    fontWeight: "600",
    fontStyle: "italic",
  },

  /* Action buttons */
  actionRow: {
    flexDirection: "row",
    gap: scale(12),
  },
  cancelBtn: {
    flex: 1,
    borderWidth: moderateScale(0.7),
    borderColor: "#027CC736",
    borderRadius: scale(4),
    paddingVertical: verticalScale(12.5),
    alignItems: "center",
    backgroundColor: "#FFF5EB",
  },
  cancelText: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: "#fff",
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: "#1D365D",
    borderRadius: scale(4),
    paddingVertical: verticalScale(12.5),
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: {
    color: "#fff",
    fontSize: moderateScale(15),
    fontWeight: "700",
  },
});
