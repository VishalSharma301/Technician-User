import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { scale, verticalScale, moderateScale } from "../../utils/scaling";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  quantity: number;
  price: number;
  originalPrice: number;
  discountPercent?: number;
};

export default function QuantityPriceCard({
  quantity,
  price,
  originalPrice,
  discountPercent = 25,
}: Props) {
  const savedAmount = originalPrice - price;

  return (
    <View style={styles.container}>
      {/* HEADER */}

      {/* CARD */}
      <View style={styles.card}>
        <Image
          source={require("../../../assets/PriceImg.png")}
          style={{
            width: scale(93),
            height: verticalScale(83),
            resizeMode: "contain",
            position: "absolute",
            right: 0,
            top: verticalScale(27),
          }}
        />
        {/* QUANTITY */}
        <Text style={styles.label}>Quantity</Text>
        <Text style={styles.qty}>{String(quantity).padStart(2, "0")}</Text>

        {/* PRICE */}
        <Text style={[styles.label, { marginTop: verticalScale(2) }]}>
          Price
        </Text>

        {/* DISCOUNT */}
        <>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPercent}% Off</Text>
          </View>
          <View
            style={{
              backgroundColor: "#027bc7b1",
              width: scale(44),
              marginLeft: scale(3),
              paddingVertical: verticalScale(2),
            }}
          ></View>
        </>

        {/* FINAL PRICE */}
        <Text style={styles.price}>₹{price}</Text>

        {/* SAVINGS */}
        <View style={styles.savingRow}>
          <View>
            <View style={styles.savePill}>
              <Text style={styles.saveText}>You save ₹{savedAmount}</Text>
            </View>
            <View
              style={{
                backgroundColor: "#027bc7b1",
                width: scale(80),
                marginLeft: scale(3),
                paddingVertical: verticalScale(2),
              }}
            ></View>
          </View>
          <Text style={styles.originalPrice}>₹{originalPrice}</Text>
        </View>
      </View>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },

  header: {
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(4),
    borderRadius: scale(20),
    marginBottom: verticalScale(6),
  },

  headerText: {
    color: "#fff",
    fontSize: moderateScale(12),
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#B8D3E959",
    borderRadius: scale(14),
    paddingHorizontal: scale(14),
    width: scale(198),
    // borderWidth : 1,
    height: verticalScale(216),
    paddingTop : verticalScale(10)
  },

  label: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: "#000",
  },

  qty: {
    fontSize: moderateScale(45.45),
    fontWeight: "700",
    color: "#027CC7",
    marginTop: verticalScale(-2),
    // borderWidth : 1,
    lineHeight: moderateScale(50),
  },

  discountBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#027CC7",
    // borderRadius: scale(4),
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(2),
    // marginTop: verticalScale(4),
  },

  discountText: {
    color: "#fff",
    fontSize: moderateScale(11.27),
    fontWeight: "500",
  },

  price: {
    fontSize: moderateScale(45.45),
    fontWeight: "700",
    color: "#000",
    lineHeight: moderateScale(46),
    // marginTop: verticalScale(4),
  },

  savingRow: {
    flexDirection: "row",
    alignItems: "center",
    // justifyContent: "space-between",
    gap : scale(4),
    marginTop: verticalScale(-2),
  },

  savePill: {
    backgroundColor: "#027CC7",
    // borderRadius: scale(4),
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(2),
  },

  saveText: {
    color: "#fff",
    fontSize: moderateScale(9),
    fontWeight: "500",
  },

  originalPrice: {
    fontSize: moderateScale(18),
    color: "#DB5B00",
    textDecorationLine: "line-through",
    fontWeight: "700",
  },
});
