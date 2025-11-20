// src/app/screens/CartScreen.tsx

import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  ImageBackground,
  Alert,
} from "react-native";
import { moderateScale, scale, verticalScale } from "../../utils/scaling";
import { iconMap } from "../../utils/iconMap2";
import ScreenWrapper from "../components/ScreenWrapper";
import Header from "../components/Header";
import { CartContext } from "../../store/CartContext";
import { useNavigation } from "@react-navigation/native";
import { BookingContext } from "../../store/BookingContext";

const CartScreen = () => {
  const {
    cartItems,
    totalItems,
    totalPrice,
    isLoading,
    isCartEmpty,
    fetchCart,
    removeFromCart,
    updateItemQuantity,
  } = useContext(CartContext);

  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { bookCurrentCart, isBooking } = useContext(BookingContext);

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, []);

  // Pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCart();
    setRefreshing(false);
  };

  // Real subtotal (sum of item totals)
  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  // For now: platform fee and discount static or computed
  const platformFee = 0;
  const discount = 0;
  const grandTotal = subtotal + platformFee - discount;

  const handleQuantityUpdate = async (itemId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      await updateItemQuantity(itemId, newQuantity);
    }
  };

  // Handle item removal
  const handleRemoveItem = async (itemId: string) => {
    console.log("id :", itemId);

    await removeFromCart(itemId);
  };

  // Loading Screen
  if (isLoading && !refreshing) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#027CC7" />
          <Text style={styles.loadingText}>Loading cart...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Empty cart screen
  if (isCartEmpty) {
    return (
      <ScreenWrapper style={{padding : scale(9)}}>
          <Header />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Your Cart Is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Add some services to continue
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  const handleAutoBooking = async () => {
    // 1. Generate tomorrow’s date
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const dateString = tomorrow.toISOString().split("T")[0];

    // 2. Fixed time slot (backend accepts any slot)
    const timeSlot = "10:00 AM - 12:00 PM";

    // 3. Create date object
    const scheduledDate = new Date(`${dateString}T10:00:00Z`);

    // 4. Perform booking
    const result = await bookCurrentCart(
      scheduledDate,
      timeSlot,
      undefined, // no notes
      "cash" // payment mode
    );
 console.log("result", result);
 

    // 5. Navigate based on result
    if (result) {
      Alert.alert("Booking Successful");
      console.log(result);
      
    } else {
      alert("Booking failed. Please try again.");
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <Header />

          <Text style={styles.headerText}>Order Summary</Text>

          {/* Main card container */}
          <View
            style={{
              height: verticalScale(580),
              width: scale(375),
              borderWidth: 1,
              justifyContent: "space-between",
              backgroundColor: "#FFFFFF1A",
              borderRadius: moderateScale(14),
              borderColor: "#ffffff",
            }}
          >
            {/* Order Items */}
            <View style={styles.cardContainer}>
              {cartItems.map((item) => (
                <View key={item._id} style={styles.card}>
                  {/* REMOVE BUTTON */}
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemoveItem(item._id)}
                  >
                    <Text style={styles.removeBtnText}>×</Text>
                  </TouchableOpacity>

                  {/* ITEM IMAGE */}
                  <Image source={iconMap["default"]} style={styles.itemImage} />

                  {/* ITEM DETAILS */}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{item.serviceName}</Text>
                    {item.selectedBrand && (
                      <Text style={styles.itemCategory}>
                        Brand: {item.selectedBrand}
                      </Text>
                    )}
                  </View>

                  {/* QUANTITY SECTION */}
                  <View style={styles.qtySection}>
                    {/* Quantity Controls */}
                    <View style={styles.qtyControls}>
                      <TouchableOpacity
                        disabled={item.quantity <= 1}
                        onPress={() =>
                          handleQuantityUpdate(item._id, item.quantity - 1)
                        }
                      >
                        <Text style={styles.qtyBtn}>-</Text>
                      </TouchableOpacity>

                      <Text style={styles.qtyNumber}>{item.quantity}</Text>

                      <TouchableOpacity
                        onPress={() =>
                          handleQuantityUpdate(item._id, item.quantity + 1)
                        }
                      >
                        <Text style={styles.qtyBtn}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* PRICE */}
                  <Text style={styles.itemPrice}>₹{item.totalPrice}</Text>
                </View>
              ))}
            </View>

            {/* Order Details */}
            <View style={styles.detailsContainer}>
              <View style={styles.row}>
                <Text style={styles.label}>Subtotal</Text>
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
                <Text
                  style={[
                    styles.label,
                    {
                      color: "#000",
                      fontWeight: "700",
                      fontSize: moderateScale(15),
                    },
                  ]}
                >
                  Total
                </Text>
                <Text
                  style={[
                    styles.value,
                    { fontWeight: "700", fontSize: moderateScale(15) },
                  ]}
                >
                  ₹{grandTotal.toFixed(2)}
                </Text>
              </View>

              {/* Checkout Button */}
              <TouchableOpacity
                style={styles.button}
                onPress={handleAutoBooking}
              >
                <Text style={styles.buttonText}>
                  {isBooking ? "Booking..." : "Book Now"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default CartScreen;

// ===========================================================
// STYLES (unchanged from your design)
// ===========================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderRadius: moderateScale(14),
    paddingVertical: verticalScale(14),
    gap: verticalScale(15),
    alignItems: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: moderateScale(14),
    padding: scale(10),
    height: verticalScale(74),
    width: scale(351),
    borderWidth: 0.8,
    borderColor: "#ffffff",
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
    borderRadius: moderateScale(14),
    marginTop: verticalScale(14),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: verticalScale(5),
    marginLeft: scale(23),
    marginRight: scale(22),
  },
  label: {
    fontSize: moderateScale(10),
    fontWeight: "500",
    color: "#6B687D",
  },
  value: {
    fontSize: moderateScale(10),
    fontWeight: "500",
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

  // Loading & Empty styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // paddingTop: verticalScale(40),
  },
  emptyTitle: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    marginTop: verticalScale(10),
  },
  emptySubtitle: {
    fontSize: moderateScale(12),
    color: "#555",
    marginTop: verticalScale(5),
  },
  removeBtn: {
    position: "absolute",
    right: scale(10),
    top: scale(5),
    zIndex: 10,
    padding: scale(5),
  },

  removeBtnText: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: "#D9534F",
  },

  qtyControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F1F1",
    paddingVertical: verticalScale(4),
    paddingHorizontal: scale(8),
    borderRadius: moderateScale(8),
    gap: scale(12),
  },

  qtyBtn: {
    fontSize: moderateScale(18),
    color: "#333",
    fontWeight: "700",
    paddingHorizontal: scale(4),
  },

  qtyNumber: {
    fontSize: moderateScale(14),
    color: "#000",
    fontWeight: "600",
    minWidth: scale(20),
    textAlign: "center",
  },
});
