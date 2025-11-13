import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { moderateScale, scale, verticalScale } from "../../utils/scaling";
import { iconMap } from "../../utils/iconMap2";
import ScreenWrapper from "../components/ScreenWrapper";
import Header from "../components/Header";

const CartScreen = () => {
  const orderItems = [
    {
      id: 1,
      title: "Iron Repair",
      category: "Electrical",
      price: 300,
      image: iconMap["default"],
    },
    {
      id: 2,
      title: "Gas Repair",
      category: "Electrical",
      price: 500,
      image: iconMap["appliances"],
    },
  ];

  const platformFee = 25;
  const discount = 25;
  const subtotal = orderItems.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal + platformFee - discount;

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Header />

          <Text style={styles.headerText}>Order Summary</Text>

          {/* Order Items */}
          <View
            style={{
              height: verticalScale(580),
              width: scale(375),
              borderWidth: 1,
              justifyContent : "space-between",
              backgroundColor : '#FFFFFF1A',
              borderRadius : moderateScale(14),
              borderColor : "#ffffff",
            }}
          >
            <View style={styles.cardContainer}>
              {orderItems.map((item) => (
                <View key={item.id} style={styles.card}>
                  <Image source={item.image} style={styles.itemImage} />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemCategory}>{item.category}</Text>
                  </View>

                  <View style={styles.qtySection}>
                    <Text style={styles.qtyText}>Qty 1 ✎</Text>
                  </View>

                  <Text style={styles.itemPrice}>₹{item.price}</Text>
                </View>
              ))}
            </View>

            {/* Order Details */}
            <View style={styles.detailsContainer}>
              <View style={styles.row}>
                <Text style={styles.label}>Order Date</Text>
                <Text style={styles.value}>09 Oct 2025 | 10:32PM</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Promo Code</Text>
                <Text style={styles.value}>FRTYH0KIOOHGI</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <Text style={styles.label}>Amount</Text>
                <Text style={styles.value}>₹{subtotal.toFixed(2)}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Platform fee & taxes</Text>
                <Text style={styles.value}>₹{platformFee.toFixed(2)}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Discount</Text>
                <Text style={[styles.value, { color: "#0083D3" }]}>
                  -₹{discount.toFixed(2)}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <Text style={[styles.label, {color : '#000', fontWeight: "700", fontSize : moderateScale(15) }]}>Total</Text>
                <Text style={[styles.value, { fontWeight: "700", fontSize : moderateScale(15) }]}>
                  ₹{total.toFixed(2)}
                </Text>
              </View>

              {/* Button */}
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Book Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#f7f9fb23",
    paddingVertical: verticalScale(13),
    alignItems: "center",
  },
  headerText: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: "#2E2E2E",
    marginTop: verticalScale(22),
    marginBottom: verticalScale(11),
  },
  cardContainer: {
    // backgroundColor: "#a368681a",
    borderRadius: moderateScale(14),
    paddingVertical: verticalScale(14),
    // paddingHorizontal: scale(12),
    gap: verticalScale(15),
    alignItems: "center",
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.05,
    // shadowRadius: 6,
    // elevation: 2,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "#FFFFFF1A",
    borderRadius: moderateScale(14),
    padding: scale(10),
    height: verticalScale(74),
    width: scale(351),
    borderWidth : 0.8,
    borderColor : "#ffffff"
  },
  itemImage: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(8),
    marginRight: scale(10),
    backgroundColor: "#E8E8E8",
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#2E2E2E",
  },
  itemCategory: {
    fontSize: moderateScale(11),
    color: "#8B8B8B",
    marginTop: verticalScale(2),
  },
  qtySection: {
    marginRight: scale(10),
  },
  qtyText: {
    fontSize: moderateScale(12),
    color: "#555",
  },
  itemPrice: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#2E2E2E",
  },
  detailsContainer: {
    // backgroundColor: "#fff",
    borderRadius: moderateScale(14),
    // padding: scale(14),
    marginTop: verticalScale(14),
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.05,
    // shadowRadius: 6,
    // elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: verticalScale(5),
    marginLeft : scale(23),
    marginRight : scale(22)
  },
  label: {
    fontSize: moderateScale(10),
    fontWeight : "500",
    color: "#6B687D",
  },
  value: {
    fontSize: moderateScale(10),
    fontWeight : "500",
    color: "#000",
  },
  divider: {
    height: 1,
    backgroundColor: "#D7D7D7",
    marginVertical: verticalScale(10),
  },
  button: {
    backgroundColor: "#027CC7",
    borderRadius: moderateScale(10),
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(12),
    marginTop: verticalScale(16),
    marginBottom: verticalScale(25),
    width: scale(340),
    height: verticalScale(48),
    alignSelf: "center",

  },
  buttonText: {
    color: "#fff",
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
});
