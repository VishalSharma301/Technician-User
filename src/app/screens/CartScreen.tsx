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
import ScreenWrapper from "../components/ScreenWrapper";
import Header from "../components/Header";
import { CartContext } from "../../store/CartContext";
import { useNavigation } from "@react-navigation/native";
import { BookingContext } from "../../store/BookingContext";
import { iconMap, IconName } from "../../utils/iconMap";
import { EvilIcons as Icon } from "@expo/vector-icons";

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
  const [itemLoadingId, setItemLoadingId] = useState<string | null>(null);

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
    setItemLoadingId(itemId);
    await updateItemQuantity(itemId, newQuantity);
    setItemLoadingId(null);
  };
  // Handle item removal
  const handleRemoveItem = async (itemId: string) => {
    setItemLoadingId(itemId);
    await removeFromCart(itemId);
    setItemLoadingId(null);
  };
  // Loading Screen
  // if (isLoading && !refreshing) {
  //   return (
  //     <ScreenWrapper>
  //       <View style={styles.loadingContainer}>
  //         <ActivityIndicator size="large" color="#027CC7" />
  //         <Text style={styles.loadingText}>Loading cart...</Text>
  //       </View>
  //     </ScreenWrapper>
  //   );
  // }

  // Empty cart screen
  if (isCartEmpty) {
    return (
      <ScreenWrapper style={{ padding: scale(9) }}>
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
          <Header showSearchBar={false} />

          <Text style={styles.headerText}>Order Summary</Text>

          {/* Main card container */}
          <View
            style={{
              // height: verticalScale(580),
              width: scale(375),
              borderWidth: 1,
              justifyContent: "space-between",
              backgroundColor: "#FFFFFF1A",
              borderRadius: moderateScale(14),
              borderColor: "#ffffff",
              marginBottom: verticalScale(70),
            }}
          >
            {/* Order Items */}
            <View style={styles.cardContainer}>
              {cartItems.map((item) => (
                <View
                  key={item._id}
                  style={[
                    styles.card,
                    itemLoadingId === item._id && { opacity: 0.4 },
                  ]}
                >
                  {/* LOADING SPINNER OVERLAY */}
                  {itemLoadingId === item._id && (
                    <View style={styles.itemLoader}>
                      <ActivityIndicator size="small" color="#027CC7" />
                    </View>
                  )}

                  <View
                    style={{
                      marginLeft: scale(17),
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 0,
                    }}
                  >
                    {/* ITEM IMAGE */}
                    <View
                      style={{
                        height: moderateScale(52),
                        width: moderateScale(52),
                        marginRight: scale(11),
                        justifyContent: "center",
                        alignItems: "center",
                        // borderWidth: 1,
                        borderRadius: moderateScale(16),
                        backgroundColor: "#79ccff29",
                      }}
                    >
                      <Image
                        source={
                          iconMap[item.icon as IconName] || iconMap["default"]
                        }
                        style={styles.itemImage}
                      />
                    </View>
                    {/* ITEM DETAILS */}
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemTitle}>{item.serviceName}</Text>
                      {item.selectedBrand && (
                        <Text style={styles.itemCategory}>
                          {item.selectedBrand} : {item.selectedOption}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.itemPrice}>₹{item.totalPrice}</Text>
                  </View>
                  {/* QUANTITY */}
                  <View
                    style={{
                      flexDirection: "row",
                      borderWidth: 0,
                      marginTop: verticalScale(11),
                    }}
                  >
                    <View style={styles.qtySection}>
                      <View style={styles.qtyControls}>
                        <TouchableOpacity
                          disabled={
                            item.quantity <= 1 || itemLoadingId === item._id
                          }
                          onPress={() =>
                            handleQuantityUpdate(item._id, item.quantity - 1)
                          }
                        >
                          <Text style={styles.qtyBtn}>-</Text>
                        </TouchableOpacity>

                        <Text style={styles.qtyNumber}>{item.quantity}</Text>

                        <TouchableOpacity
                          disabled={itemLoadingId === item._id}
                          onPress={() =>
                            handleQuantityUpdate(item._id, item.quantity + 1)
                          }
                        >
                          <Text style={styles.qtyBtn}>+</Text>
                        </TouchableOpacity>
                        {/* REMOVE BUTTON */}
                      </View>
                    </View>
                    <TouchableOpacity
                      disabled={itemLoadingId === item._id}
                      style={styles.removeBtn}
                      onPress={() => handleRemoveItem(item._id)}
                    >
                      <Icon name="trash" size={26} color="#E80000" />
                    </TouchableOpacity>
                  </View>
                  {/* PRICE */}
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
    flexDirection: "column",
    // alignItems: "center",
    borderRadius: moderateScale(14),
    paddingTop: scale(13),
    // paddingLeft: scale(17),
    paddingRight: scale(10),
    height: verticalScale(128),
    width: scale(351),
    borderWidth: 0.8,
    borderColor: "#ffffff",
  },
  itemImage: {
    width: "80%",
    // aspectRatio : 0,
    height: "80%",
    resizeMode: "contain",
    // borderRadius: moderateScale(8),
    // marginRight: scale(10),
    // backgroundColor: "#E8E8E8",
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#2E2E2E",
  },
  itemLoader: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  itemCategory: {
    fontSize: moderateScale(12),
    fontWeight: "400",
    color: "#8B8B8B",
    marginTop: verticalScale(2),
  },
  qtySection: {
    marginRight: scale(10),
    // borderWidth : 1,
    marginLeft: scale(80),
    width: scale(182),
  },
  qtyText: {
    fontSize: moderateScale(12),
    color: "#555",
  },
  itemPrice: {
    fontSize: moderateScale(14),
    fontWeight: "500",
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
    // position: "absolute",
    // right: scale(10),
    // top: scale(5),
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
    backgroundColor: "#FFFFFF1A",
    paddingVertical: verticalScale(4),
    paddingHorizontal: scale(14),
    borderRadius: moderateScale(4),
    gap: scale(12),
    borderWidth: 1,
    borderColor: "#fff",
    justifyContent: "space-between",
    height: verticalScale(36),
  },

  qtyBtn: {
    fontSize: moderateScale(20),
    color: "#00000080",
    fontWeight: "500",
    paddingHorizontal: scale(4),
    // borderWidth : 1,
    lineHeight: verticalScale(22),
  },

  qtyNumber: {
    fontSize: moderateScale(14),
    color: "#000",
    fontWeight: "500",
    minWidth: scale(20),
    textAlign: "center",
  },
});
