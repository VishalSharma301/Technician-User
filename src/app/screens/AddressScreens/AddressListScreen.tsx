// AddressListScreen.tsx
import React, { useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "../../../utils/scaling";
import { AddressContext } from "../../../store/AddressContext";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { HomeStackParamList } from "../../../constants/navigation";
import ScreenWrapper from "../../components/ScreenWrapper";
import CustomNavBar from "../../components/CustomNavBar";
import Header from "../../components/Header";

type NavigationProp = StackNavigationProp<HomeStackParamList, "Addresses">;

export default function AddressListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { addresses, setSelectedAddress, setAddresses } =
    useContext(AddressContext);

  const deleteAddress = (index: number) => {
    setAddresses((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container}>
        <Header />
        {/* <TouchableOpacity
        style={styles.addRow}
        onPress={() => navigation.navigate("AddAddress" as never)}
      >
        <Icon name="plus" size={22} color="#007BFF" />
        <Text style={styles.addRowText}>Add address</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.currentRow}>
        <Icon name="crosshairs-gps" size={22} color="#007BFF" />
        <Text style={styles.currentRowText}>Use Current Location</Text>
      </TouchableOpacity> */}
        <View
          style={{
            borderWidth: 1,
            height: verticalScale(122),
            borderColor: "#fff",
            borderRadius: scale(8),
            marginVertical: verticalScale(15),
          }}
        >
          <TouchableOpacity
            style={styles.addAddress}
            onPress={() => navigation.navigate("AddAddress")}
          >
            <View style={styles.addAddressIcon}>
              <Icon name="plus" size={moderateScale(25)} color="#153B93" />
            </View>
            <Text style={styles.addAddressText}>Add New Address</Text>
            <Icon
              name="chevron-right"
              size={moderateScale(18)}
              color="#6B7280"
            />
          </TouchableOpacity>

          {/* Current Location */}
          <View style={styles.currentLocationCard}>
            <View style={styles.currentLocationIcon}>
              <Icon
                name="crosshairs-gps"
                size={moderateScale(20)}
                color="#3B82F6"
              />
            </View>
            <View style={styles.currentLocationInfo}>
              <Text style={styles.currentTitle}>Use Current Location</Text>
              <Text style={styles.currentSubtitle}>
                Cheema Colony, Bassi Pathana
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.savedTitle}>SAVED ADDRESS</Text>

        {addresses.map((item, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.topRow}>
              <View style={styles.leftRow}>
                <Icon
                  name="home"
                  size={26}
                  color="#2956A3"
                  style={{ marginRight: scale(10) }}
                />
                <View>
                  <Text style={styles.label}>{item.label}</Text>
                  <Text style={styles.address}>
                    {item.address.street}, {item.address.city}, India
                  </Text>
                  <Text style={styles.phone}>Phone number: {item.phone}</Text>
                </View>
              </View>

              <View style={styles.zipChip}>
                <Text style={styles.zipText}>{item.address.zipcode}</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <View
                style={{
                  flexDirection: "row",
                  // justifyContent: "space-between",
                  // borderWidth : 1
                }}
              >
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    navigation.navigate("AddAddress", {
                      edit: true,
                      index,
                      item,
                    })
                  }
                >
                  <Icon name="dots-horizontal" size={22} color="#2956A3" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setSelectedAddress(item);
                    navigation.goBack();
                  }}
                >
                  <Icon name="send" size={22} color="#2956A3" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => deleteAddress(index)}
              >
                <Icon name="trash-can" size={22} color="#E11D48" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      <CustomNavBar isLocal />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: scale(16), backgroundColor: "#ffffff10" },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: scale(14),
    borderRadius: scale(10),
    marginBottom: verticalScale(14),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  addRowText: {
    fontSize: moderateScale(16),
    marginLeft: scale(12),
    fontWeight: "600",
  },
  currentRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: scale(14),
    borderRadius: scale(10),
    marginBottom: verticalScale(20),
  },
  currentRowText: { fontSize: moderateScale(16), marginLeft: scale(12) },
  addAddress: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF10",
    padding: moderateScale(16),
    // borderRadius: scale(12),
    height: verticalScale(56),
    borderBottomWidth: 1,
    borderColor: "#fff",
    borderBottomColor: "#0000001A",
    // marginBottom: verticalScale(12),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    // elevation: 3,
  },
  addAddressIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    // backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
  },
  addAddressText: {
    flex: 1,
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: "#1F2937",
  },
  currentLocationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF10",
    padding: moderateScale(16),
    // borderRadius: scale(12),
    // marginBottom: verticalScale(20),
    height: verticalScale(67),
    // borderWidth: 1,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    // elevation: 3,
  },
  currentLocationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EBF4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
  },
  currentLocationInfo: {
    flex: 1,
  },
  currentTitle: {
    fontWeight: "600",
    fontSize: moderateScale(16),
    color: "#1F2937",
    marginBottom: 2,
  },
  currentSubtitle: {
    fontSize: moderateScale(12),
    fontWeight: "400",
    color: "#6B7280",
  },
  savedTitle: {
    fontSize: moderateScale(12),
    color: "#9CA3AF",
    fontWeight: "700",
    marginBottom: verticalScale(12),
    letterSpacing: 1,
  },
  card: {
    backgroundColor: "#d1d0d010",
    padding: scale(16),
    borderRadius: scale(14),
    marginBottom: verticalScale(16),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    // elevation: 3,
    borderWidth: 1,
    borderColor: "#ffffff",
  },
  topRow: { flexDirection: "row", justifyContent: "space-between" },
  leftRow: { flexDirection: "row", flex: 1 },
  label: { fontSize: moderateScale(16), fontWeight: "700", color: "#2956A3" },
  address: { marginTop: 4, color: "#444" },
  phone: { marginTop: 4, color: "#444" },
  zipChip: {
    backgroundColor: "#027CC7",
    // paddingVertical: scale(6),

    // paddingHorizontal: scale(12),
    borderRadius: scale(4),
    width: scale(63),
    height: verticalScale(22),
    justifyContent: "center",
    alignItems: "center",
  },
  zipText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: moderateScale(12),
    lineHeight: 12,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: verticalScale(14),
    // borderWidth: 1,
  },
  actionButton: {
    marginLeft: scale(12),
    height: 32,
    width: 32,
    borderWidth: 0.7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor : '#ffffff10',
    borderColor : '#ffffff',
    borderRadius : 4
  },
});
