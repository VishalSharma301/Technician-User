// LocationScreen.tsx
import React, { useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "../../../utils/scaling";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { HomeStackParamList } from "../../../constants/navigation";
import Header from "../../components/Header";
import ScreenWrapper from "../../components/ScreenWrapper";
import CustomNavBar from "../../components/CustomNavBar";
import { AddressContext } from "../../../store/AddressContext";

type NavigationProp = StackNavigationProp<HomeStackParamList, "Location">;

export default function LocationScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { selectedAddress } = useContext(AddressContext);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Header />

        <View style={styles.mapCard}>
          {/* <Image
          source={require("../assets/map-placeholder.png")}
          style={styles.mapImage}
        /> */}

          <TouchableOpacity style={styles.locationButton}>
            <Icon name="crosshairs-gps" size={22} color="#007BFF" />
            <Text style={styles.locationButtonText}>Use Current Location</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.deliveryCard}>
          <Text style={styles.sectionTitle}>DELIVERING YOUR ORDER TO</Text>
          {selectedAddress &&<>
            <View style={styles.selectedAddressRow}>
              <View>
                <Text style={styles.addressTitle}>{selectedAddress.address.street}</Text>
                <Text style={styles.addressSub}>{selectedAddress.address.city}</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate("Addresses" as never)}
              >
                <Text style={styles.changeText}>CHANGE</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.distanceText}>
              The address is 255 m away from your current location
            </Text>
          </>}

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={() => navigation.navigate("Addresses")}
          >
            <Text style={styles.submitText}>Add New Address</Text>
          </TouchableOpacity>
        </View>
      </View>
      <CustomNavBar isLocal={true} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: scale(9),
    // backgroundColor: "#F5F7FB"
  },
  header: {
    fontSize: moderateScale(22),
    fontWeight: "700",
    marginTop: verticalScale(10),
  },
  subHeader: {
    fontSize: moderateScale(14),
    color: "#6B7280",
    marginBottom: verticalScale(20),
  },
  mapCard: {
    backgroundColor: "#fff",
    borderRadius: scale(16),
    padding: scale(20),
    alignItems: "center",
    marginBottom: verticalScale(20),
    width: scale(375),
    height: verticalScale(403),
    marginTop: verticalScale(21),
  },
  mapImage: {
    width: "100%",
    height: verticalScale(220),
    borderRadius: scale(12),
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: scale(12),
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: verticalScale(16),
  },
  locationButtonText: {
    color: "#007BFF",
    fontWeight: "600",
    marginLeft: scale(6),
  },
  deliveryCard: {
    backgroundColor: "#ffffff10",
    padding: scale(16),
    borderRadius: scale(16),
    // height : verticalScale(148)
  },
  sectionTitle: {
    fontSize: moderateScale(12),
    color: "#9CA3AF",
    marginBottom: verticalScale(10),
    fontWeight: "700",
  },
  selectedAddressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addressTitle: { fontSize: moderateScale(16), fontWeight: "700" },
  addressSub: { fontSize: moderateScale(13), color: "#6B7280" },
  changeText: { color: "#FF7A00", fontWeight: "700" },
  distanceText: {
    marginTop: verticalScale(8),
    color: "#6B7280",
    fontSize: moderateScale(13),
  },
  submitBtn: {
    backgroundColor: "#027CC7",
    height: verticalScale(36),
    marginTop: verticalScale(12),
    borderRadius: moderateScale(10),
    justifyContent: "center",
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
});
