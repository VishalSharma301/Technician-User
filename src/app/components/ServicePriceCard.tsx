import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "../../utils/scaling";
import { InsetShadowBox } from "./InsetShadow";
import CustomView from "./CustomView";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  initialQty?: number;
  unitPrice: number;
  originalPrice: number;
  discountPercent: number;
  onConfirm: (qty: number) => void;
  onCancel: () => void;
};

export default function ServicePriceCard({
  initialQty = 1,
  unitPrice,
  originalPrice,
  discountPercent,
  onConfirm,
  onCancel,
}: Props) {
  const [qty, setQty] = useState(initialQty);

  const totalPrice = qty * unitPrice;
  const savedAmount = originalPrice - totalPrice;

  const increase = () => setQty((q) => q + 1);
  const decrease = () => setQty((q) => (q > 1 ? q - 1 : q));

  return (
    // <View style={{ borderWidth: 2, borderColor: "#DB5B00", borderRadius: scale(24), }}>
    <ImageBackground
      source={require("../../../assets/priceBG.png")}
      style={{
        height: verticalScale(512),
        width: scale(350),
        marginLeft: scale(5),
        alignItems: "center",
        justifyContent: "center",
        padding: scale(25),
      }}
      resizeMode="stretch"
    >
      {/* Quantity Stepper */}
      <View style={{ position: "absolute", top: verticalScale(-27) }}>
        <LinearGradient
          colors={["#ffffff", "#F0B68D"]}
          locations={[0, 0.2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            height: verticalScale(55),
            width: scale(145),
            borderRadius: scale(30),
            borderWidth: 1,
            borderColor: "#DB5B00",
            justifyContent: "center",
            paddingHorizontal: scale(8),
            paddingVertical: verticalScale(5),
          }}
        >
          <View style={styles.stepper}>
            <TouchableOpacity style={styles.stepBtn} onPress={decrease}>
              <Text style={styles.stepText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.qty}>{qty}</Text>

            <TouchableOpacity style={styles.stepBtn} onPress={increase}>
              <Text style={styles.stepText}>+</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
      <View style={styles.container}>
        {/* Tags */}
        <View style={styles.tagRow}>
          <View style={styles.blueTag}>
            <Text style={styles.tagText}>Split</Text>
          </View>
          <View style={styles.orangeTag}>
            <Text style={styles.tagText}>Samsung</Text>
          </View>
        </View>

        {/* Discount */}
        <View style={styles.discountTag}>
          <Text style={styles.discountText}>{discountPercent}% Off</Text>
        </View>

        {/* Price */}
        <Text style={styles.price}>₹{totalPrice}</Text>

        <View style={styles.saveRow}>
          <Text style={styles.saveText}>You save ₹{savedAmount}</Text>
          <Text style={styles.oldPrice}>₹{originalPrice}</Text>
        </View>

        {/* Feature List */}
        <View style={styles.listBox}>
          {[
            "Comprehensive AC Maintenance",
            "Refrigerant level and cooling assessment",
            "Cleaning of air filters",
            "Complete performance evaluation",
            "Thorough AC Maintenance",
          ].map((item, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.checkIcon}>
                <Feather name="check" size={12} color="#fff" />
              </View>
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={onCancel}>
            <CustomView
              radius={scale(25)}
              width={scale(144)}
              boxStyle={styles.cancelBtn}
              gradientColors={["#FDEDE2", "#FDEDE2"]}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </CustomView>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={() => onConfirm(qty)}
          >
            <Text style={styles.confirmText}>Confirm</Text>
          </TouchableOpacity>
        </View>

        {/* Visiting Charges */}
        <Text style={styles.note}>
          Visiting Charges: <Text style={styles.bold}>150</Text>{" "}
          <Text style={styles.gray}>
            (Adjusted in final bill if service is taken)
          </Text>
        </Text>
      </View>
    </ImageBackground>
    // </View>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF6EF",
    // borderRadius: scale(24),
    // padding: scale(16),
    // borderWidth : 1,
    height: " 100%",
    paddingVertical: verticalScale(3),
    marginTop: verticalScale(5),
    // borderWidth : 1
  },

  stepper: {
    flexDirection: "row",
    // alignSelf: "center",
    backgroundColor: "#DB5B00",
    borderRadius: scale(30),
    // paddingHorizontal: scale(14),
    paddingVertical: verticalScale(6),
    // marginBottom: verticalScale(10),
    alignItems: "center",
    gap: scale(16),
    justifyContent: "center",
    borderWidth: moderateScale(1.5),
    borderColor: "#fff",
  },
  stepBtn: {
    backgroundColor: "#fff",
    width: scale(26),
    height: scale(26),
    borderRadius: scale(13),
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: "#DB5B00",
  },
  qty: {
    color: "#fff",
    fontWeight: "700",
    fontSize: moderateScale(16),
  },

  tagRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: scale(8),
    // borderWidth : 1
  },
  blueTag: {
    backgroundColor: "#027CC7",
    borderRadius: scale(14),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(3),
  },
  orangeTag: {
    backgroundColor: "#DB5B00",
    borderRadius: scale(14),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(3),
  },
  tagText: {
    color: "#fff",
    fontSize: moderateScale(11),
    fontWeight: "600",
  },

  discountTag: {
    alignSelf: "center",
    marginTop: verticalScale(8),
    backgroundColor: "#027CC7",
    borderRadius: scale(6),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(2),
  },
  discountText: {
    color: "#fff",
    fontSize: moderateScale(11),
    fontWeight: "700",
  },

  price: {
    textAlign: "center",
    fontSize: moderateScale(36),
    fontWeight: "800",
    color: "#000",
    marginTop: verticalScale(6),
  },

  saveRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: scale(10),
    marginBottom: verticalScale(10),
  },
  saveText: {
    backgroundColor: "#027CC7",
    color: "#fff",
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(2),
    borderRadius: scale(6),
    fontSize: moderateScale(11),
    fontWeight: "600",
  },
  oldPrice: {
    textDecorationLine: "line-through",
    color: "#DB5B00",
    fontWeight: "700",
  },

  listBox: {
    backgroundColor: "#FFE7D6",
    borderRadius: scale(16),
    padding: scale(12),
    borderWidth: 1,
    borderColor: "#DB5B00",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(6),
    gap: scale(8),
  },
  checkIcon: {
    width: scale(18),
    height: scale(18),
    borderRadius: scale(9),
    backgroundColor: "#DB5B00",
    alignItems: "center",
    justifyContent: "center",
  },
  listText: {
    fontSize: moderateScale(13),
    color: "#000",
    flex: 1,
  },

  actionRow: {
    flexDirection: "row",
    gap: scale(12),
    marginTop: verticalScale(14),
  },
  cancelBtn: {
    // flex: 1,
    // backgroundColor: "#",
    // borderRadius: scale(30),
    paddingVertical: verticalScale(10),
    alignItems: "center",
    borderWidth: moderateScale(0.7),
    borderColor: "#FFFFFF",
  },
  cancelText: {
    fontWeight: "600",
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: "#DB5B00",
    borderRadius: scale(30),
    paddingVertical: verticalScale(10),
    alignItems: "center",
    borderWidth: moderateScale(0.7),
    borderColor: "#FF6A00",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "700",
  },

  note: {
    marginTop: verticalScale(10),
    fontSize: moderateScale(12),
    color: "#DB5B00",
    textAlign: "center",
  },
  bold: { fontWeight: "700" },
  gray: { color: "#555" },
});
