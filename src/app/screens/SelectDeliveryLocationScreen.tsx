/**
 * SelectDeliveryLocationScreen
 *
 * SETUP REQUIRED (run once):
 *   npx expo install expo-maps expo-location
 *
 * Google Maps API Key (Android):
 *   In app.json → expo.android.config.googleMaps.apiKey: "YOUR_KEY"
 *   Get a key at: https://console.cloud.google.com → Maps SDK for Android
 *
 * iOS uses Apple Maps — no key needed.
 *
 * Add to ProfileStackParamList:
 *   SelectDeliveryLocationScreen: { address?: AddressCardType; isEditing?: boolean } | undefined;
 */

import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { moderateScale, scale, verticalScale } from "../../utils/scaling";
import { AddressContext, AddressCardType } from "../../store/AddressContext";
import { ProfileStackParamList } from "../../constants/navigation";

// expo-maps — install via: npx expo install expo-maps
// import { GoogleMaps, AppleMaps } from "expo-maps";

/* ─── Types ─────────────────────────────────────────────────── */
type Coords = { latitude: number; longitude: number };
type Nav = StackNavigationProp<ProfileStackParamList>;
type RouteProps = RouteProp<
  ProfileStackParamList,
  "SelectDeliveryLocationScreen"
>;
type AddressTypeKey = "Home" | "Work" | "Other";

/* ─── Constants ─────────────────────────────────────────────── */
const C = {
  bg: "#FFF8F2",
  card: "#FFFFFF",
  border: "#EFD5B7",
  brown: "#864C2D",
  brownLight: "#864C2D1A",
  txt: "#2D1F0F",
  txt2: "#6B5744",
  txt3: "#4D4D4D",
  placeholder: "#B0A090",
  red: "#FF0004",
  green: "#1CA177",
  greenBg: "#1CA1771A",
  greenBorder: "#1CA17740",
  headerBg: "#F6EBDE",
};

/** Default map center – Chandigarh Sector 17 */
const DEFAULT_COORDS: Coords = { latitude: 30.7394, longitude: 76.7849 };

const ADDRESS_TYPES: AddressTypeKey[] = ["Home", "Work", "Other"];
const TYPE_ICONS: Record<AddressTypeKey, string> = {
  Home: "home-outline",
  Work: "briefcase-outline",
  Other: "map-marker-outline",
};

/* ─── Floating label input ──────────────────────────────────── */
interface FloatFieldProps {
  label: string;
  icon: string;
  value: string;
  onChangeText?: (v: string) => void;
  placeholder?: string;
  editable?: boolean;
  keyboardType?: any;
}
function FloatField({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  editable = true,
  keyboardType,
}: FloatFieldProps) {
  return (
    <View style={fieldStyles.wrap}>
      <View style={fieldStyles.box}>
        <Text style={fieldStyles.label}>{label}</Text>
        <View style={fieldStyles.row}>
          <Icon name={icon as any} size={moderateScale(16)} color={C.txt3} />
          <TextInput
            style={fieldStyles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={C.placeholder}
            editable={editable}
            keyboardType={keyboardType}
          />
        </View>
      </View>
    </View>
  );
}
const fieldStyles = StyleSheet.create({
  wrap: { marginBottom: verticalScale(10) },
  box: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: moderateScale(10),
    backgroundColor: C.card,
    paddingHorizontal: scale(12),
    paddingTop: verticalScale(6),
    paddingBottom: verticalScale(8),
  },
  label: {
    fontSize: moderateScale(11),
    color: C.txt3,
    marginBottom: verticalScale(3),
  },
  row: { flexDirection: "row", alignItems: "center", gap: scale(8) },
  input: { flex: 1, fontSize: moderateScale(14), color: C.txt, padding: 0 },
});

/* ─── Main Screen ────────────────────────────────────────────── */
export default function SelectDeliveryLocationScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProps>();
  const { addresses, setAddresses, selectedAddress } =
    useContext(AddressContext);

  const existing = route.params?.address;
  const isEditing = route.params?.isEditing ?? false;

  /* ── Map state ── */
  const initialCoords: Coords = {
    latitude: existing?.address?.coordinates?.lat || DEFAULT_COORDS.latitude,
    longitude: existing?.address?.coordinates?.lon || DEFAULT_COORDS.longitude,
  };
  const [pinCoords, setPinCoords] = useState<Coords>(initialCoords);
  const [cameraCoords, setCameraCoords] = useState<Coords>(initialCoords);
  const [showTooltip, setShowTooltip] = useState(true);
  const [loadingLocation, setLoadingLocation] = useState(false);

  /* ── Form state ── */
  const [street, setStreet] = useState(existing?.address?.street ?? "");
  const [city, setCity] = useState(existing?.address?.city ?? "");
  const [addrState, setAddrState] = useState(existing?.address?.state ?? "");
  const [zipcode] = useState(
    existing?.address?.zipcode ?? selectedAddress?.address?.zipcode ?? "",
  );
  const [phone, setPhone] = useState(existing?.phone ?? "");
  const [addressType, setAddressType] = useState<AddressTypeKey>(
    ["Home", "Work", "Other"].includes(existing?.label ?? "")
      ? (existing!.label as AddressTypeKey)
      : "Home",
  );
  const addressId =
    existing?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  /* ── Request location permission on mount (auto-center if adding new) ── */
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted" && !isEditing) {
        getCurrentLocation(false); // silent – no alert if fails
      }
    })();
  }, []);

  /* ── Reverse geocode coords → fill form fields ── */
  const reverseGeocode = useCallback(async (coords: Coords) => {
    try {
      const [result] = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      if (result) {
        const streetParts = [result.streetNumber, result.street].filter(
          Boolean,
        );
        setStreet(streetParts.join(" ") || result.name || "");
        setCity(result.city ?? result.subregion ?? "");
        setAddrState(result.region ?? "");
      }
    } catch (e) {
      console.log("Reverse geocoding error:", e);
    }
  }, []);

  /* ── Get current GPS location ── */
  const getCurrentLocation = async (showAlert = true) => {
    try {
      setLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        if (showAlert)
          Alert.alert("Permission denied", "Location permission is required.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const coords: Coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setPinCoords(coords);
      setCameraCoords(coords); // moves the map camera
      await reverseGeocode(coords);
      setShowTooltip(false);
    } catch (e) {
      if (showAlert)
        Alert.alert("Error", "Could not get your current location.");
    } finally {
      setLoadingLocation(false);
    }
  };

  /* ── Handle marker drag end ── */
  const handleMarkerDragEnd = useCallback(
    async (event: any) => {
      // expo-maps may deliver coords in different shapes – handle all known cases
      let lat: number | undefined;
      let lon: number | undefined;

      if (event?.latitude != null) {
        lat = event.latitude;
        lon = event.longitude;
      } else if (event?.nativeEvent?.latitude != null) {
        lat = event.nativeEvent.latitude;
        lon = event.nativeEvent.longitude;
      } else if (event?.coordinates?.latitude != null) {
        lat = event.coordinates.latitude;
        lon = event.coordinates.longitude;
      }

      if (lat == null || lon == null) return;

      const coords: Coords = { latitude: lat, longitude: lon };
      setPinCoords(coords);
      setShowTooltip(false);
      await reverseGeocode(coords);
    },
    [reverseGeocode],
  );

  /* ── Save address ── */
  const handleSave = () => {
    if (!street.trim())
      return Alert.alert("Required", "Please enter or pick a street address.");

    const newAddr: AddressCardType = {
      id: addressId,
      label: addressType,
      address: {
        street: street.trim(),
        city: city.trim(),
        state: addrState.trim(),
        zipcode,
        coordinates: { lat: pinCoords.latitude, lon: pinCoords.longitude },
      },
      phone: phone.trim(),
    };

    if (isEditing && existing) {
      setAddresses((prev) =>
        prev.map((a) => (a.id === existing.id ? newAddr : a)),
      );
    } else {
      setAddresses((prev) => [...prev, newAddr]);
    }
    navigation.goBack();
  };

  /* ── Platform-split map component ── */
  const MapView = () => {
    const sharedMarkerProps = {
      coordinates: {
        latitude: pinCoords.latitude,
        longitude: pinCoords.longitude,
      },
      draggable: true,
      onDragEnd: handleMarkerDragEnd,
    };

    const sharedMapProps = {
      style: styles.map,
      // cameraPosition controls where the camera sits.
      // Only update cameraCoords when you want the map to jump (e.g. "Use current location").
      // Drag events update pinCoords only, so the map stays panned where the user left it.
      cameraPosition: {
        coordinates: {
          latitude: cameraCoords.latitude,
          longitude: cameraCoords.longitude,
        },
        zoom: 15,
      },
    };

    // if (Platform.OS === "android") {
    //   return (
    //     <GoogleMaps.View {...sharedMapProps}>
    //       <GoogleMaps.Marker {...sharedMarkerProps} />
    //     </GoogleMaps.View>
    //   );
    // }

    // return (
    //   <AppleMaps.View {...sharedMapProps}>
    //     <AppleMaps.Marker {...sharedMarkerProps} />
    //   </AppleMaps.View>
    // );
  };

  /* ─────────────────────────────────── render ─── */
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Icon name="arrow-left" size={moderateScale(20)} color={C.brown} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select delivery location</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Safety Banner ── */}
        <View style={styles.banner}>
          <View style={styles.bannerIconWrap}>
            <Icon
              name="home-city-outline"
              size={moderateScale(22)}
              color={C.brown}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>
              Your addresses are safe with us
            </Text>
            <Text style={styles.bannerSub}>
              We use secure encryption to protect your saved addresses.
            </Text>
          </View>
        </View>

        {/* ── Map Container ── */}
        <View style={styles.mapContainer}>
          {/* <MapView /> */}

          {/* Tooltip */}
          {showTooltip && (
            <View style={styles.tooltipWrap} pointerEvents="none">
              <View style={styles.tooltip}>
                <Icon name="map-marker" size={moderateScale(13)} color="#fff" />
                <Text style={styles.tooltipText}>
                  Move pin to your exact delivery location
                </Text>
              </View>
              {/* Arrow */}
              <View style={styles.tooltipArrow} />
            </View>
          )}

          {/* Use current location button */}
          <TouchableOpacity
            style={styles.currentLocBtn}
            onPress={() => getCurrentLocation(true)}
            activeOpacity={0.85}
          >
            {loadingLocation ? (
              <ActivityIndicator size="small" color={C.green} />
            ) : (
              <>
                <Icon
                  name="crosshairs-gps"
                  size={moderateScale(16)}
                  color={C.green}
                />
                <Text style={styles.currentLocText}>Use current location</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Delivery Detail ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Detail</Text>

          {selectedAddress?.address?.street ? (
            <View style={styles.deliveryCard}>
              {/* Address row */}
              <View style={styles.delTop}>
                <View style={styles.delIconWrap}>
                  <Icon
                    name="home-outline"
                    size={moderateScale(20)}
                    color={C.brown}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.delLabelRow}>
                    <Text style={styles.delLabel}>
                      {selectedAddress.label || "Home"}
                    </Text>
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  </View>
                  <Text style={styles.delAddress}>
                    {selectedAddress.address.street},{"\n"}
                    {selectedAddress.address.city},{" "}
                    {selectedAddress.address.zipcode}, India
                  </Text>
                </View>
                <Icon
                  name="dots-vertical"
                  size={moderateScale(18)}
                  color={C.txt3}
                />
              </View>

              {/* Distance note */}
              <View style={styles.distanceRow}>
                <Text style={styles.distanceTxt}>
                  This address is 14.8 km away from your current location
                </Text>
                <TouchableOpacity onPress={() => getCurrentLocation(true)}>
                  <Text style={styles.useCurrentLink}>
                    Use current location ▶
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.deliveryCard}>
              <Text style={styles.noAddressTxt}>
                Drag the pin or use current location to set your delivery point.
              </Text>
            </View>
          )}
        </View>

        {/* ── Address Form ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          <View style={styles.formCard}>
            <FloatField
              label="Address"
              icon="map-marker-outline"
              value={street}
              onChangeText={setStreet}
              placeholder="Street address"
            />

            {/* City + Pincode two-column */}
            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <FloatField
                  label="City"
                  icon="city-variant-outline"
                  value={city}
                  onChangeText={setCity}
                  placeholder="City"
                />
              </View>
              <View style={{ flex: 1 }}>
                <FloatField
                  label="Pincode"
                  icon="map-marker-outline"
                  value={zipcode}
                  editable={false}
                  placeholder="Pincode"
                />
              </View>
            </View>

            <Text style={styles.receiverLabel}>
              Receiver details for this address
            </Text>
            <FloatField
              label="Phone"
              icon="phone-outline"
              value={phone}
              onChangeText={setPhone}
              placeholder="+91-XXXXXXXXXX"
              keyboardType="phone-pad"
            />

            {/* Save Address As */}
            <Text style={styles.saveAsLabel}>Save Address As</Text>
            <View style={styles.typeRow}>
              {ADDRESS_TYPES.map((type) => {
                const active = addressType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeBtn, active && styles.typeBtnActive]}
                    onPress={() => setAddressType(type)}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name={TYPE_ICONS[type] as any}
                      size={moderateScale(14)}
                      color={active ? C.green : C.txt3}
                    />
                    <Text
                      style={[
                        styles.typeBtnText,
                        active && styles.typeBtnTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── Save Button ── */}
        <TouchableOpacity
          onPress={handleSave}
          activeOpacity={0.85}
          style={styles.saveBtnWrapper}
        >
          <LinearGradient
            colors={["#BF7D5A", "#733A1C"]}
            style={styles.saveBtn}
          >
            <Text style={styles.saveBtnText}>Save Address</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─── Styles ─────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingBottom: verticalScale(40) },

  /* header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    backgroundColor: C.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { padding: scale(2) },
  headerTitle: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: C.brown,
  },

  /* banner */
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
    backgroundColor: C.headerBg,
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(14),
    paddingBottom: verticalScale(40),
    borderBottomLeftRadius: moderateScale(24),
    borderBottomRightRadius: moderateScale(24),
    marginBottom: verticalScale(12),
  },
  bannerIconWrap: {
    width: scale(42),
    height: scale(42),
    borderRadius: moderateScale(12),
    backgroundColor: C.brownLight,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerTitle: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: C.brown,
    marginBottom: verticalScale(2),
  },
  bannerSub: {
    fontSize: moderateScale(11),
    color: C.txt3,
    lineHeight: moderateScale(16),
  },

  /* map */
  mapContainer: {
    marginHorizontal: scale(16),
    borderRadius: moderateScale(16),
    overflow: "hidden",
    height: verticalScale(240),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: C.border,
  },
  map: { flex: 1 },

  /* tooltip */
  tooltipWrap: {
    position: "absolute",
    top: verticalScale(20),
    alignSelf: "center",
    alignItems: "center",
    zIndex: 10,
  },
  tooltip: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    backgroundColor: "rgba(30,30,30,0.85)",
    borderRadius: moderateScale(20),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(8),
  },
  tooltipText: {
    color: "#fff",
    fontSize: moderateScale(12),
    fontWeight: "500",
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: scale(7),
    borderRightWidth: scale(7),
    borderTopWidth: scale(8),
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "rgba(30,30,30,0.85)",
  },

  /* current location button */
  currentLocBtn: {
    position: "absolute",
    bottom: verticalScale(12),
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    backgroundColor: C.card,
    borderRadius: moderateScale(20),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderWidth: 1,
    borderColor: C.greenBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentLocText: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: C.green,
  },

  /* section */
  section: { marginHorizontal: scale(16), marginBottom: verticalScale(12) },
  sectionTitle: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: C.brown,
    marginBottom: verticalScale(10),
  },

  /* delivery detail card */
  deliveryCard: {
    backgroundColor: C.card,
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  delTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: scale(10),
    padding: scale(14),
  },
  delIconWrap: {
    width: scale(36),
    height: scale(36),
    borderRadius: moderateScale(10),
    backgroundColor: C.brownLight,
    alignItems: "center",
    justifyContent: "center",
  },
  delLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    marginBottom: verticalScale(3),
  },
  delLabel: { fontSize: moderateScale(14), fontWeight: "700", color: C.txt },
  defaultBadge: {
    backgroundColor: "#F0EAE3",
    borderRadius: moderateScale(20),
    paddingHorizontal: scale(7),
    paddingVertical: verticalScale(1),
    borderWidth: 1,
    borderColor: C.border,
  },
  defaultBadgeText: {
    fontSize: moderateScale(10),
    color: C.brown,
    fontWeight: "500",
  },
  delAddress: {
    fontSize: moderateScale(12),
    color: C.txt3,
    lineHeight: moderateScale(18),
  },
  distanceRow: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(10),
    gap: verticalScale(4),
  },
  distanceTxt: { fontSize: moderateScale(12), color: C.txt3 },
  useCurrentLink: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: C.brown,
  },
  noAddressTxt: {
    padding: scale(14),
    fontSize: moderateScale(13),
    color: C.txt3,
    lineHeight: moderateScale(20),
  },

  /* form card */
  formCard: {
    backgroundColor: C.card,
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: C.border,
    padding: scale(14),
  },
  twoCol: {
    flexDirection: "row",
    gap: scale(10),
  },
  receiverLabel: {
    fontSize: moderateScale(13),
    color: C.txt3,
    fontWeight: "500",
    marginBottom: verticalScale(10),
    marginTop: verticalScale(4),
  },

  /* save address as */
  saveAsLabel: {
    fontSize: moderateScale(13),
    color: C.txt3,
    fontWeight: "500",
    marginBottom: verticalScale(10),
    marginTop: verticalScale(4),
  },
  typeRow: {
    flexDirection: "row",
    gap: scale(10),
  },
  typeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(5),
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(7),
    backgroundColor: C.card,
  },
  typeBtnActive: {
    borderColor: C.greenBorder,
    backgroundColor: C.greenBg,
  },
  typeBtnText: {
    fontSize: moderateScale(13),
    color: C.txt3,
    fontWeight: "500",
  },
  typeBtnTextActive: { color: C.green, fontWeight: "600" },

  /* save button */
  saveBtnWrapper: { marginHorizontal: scale(16), marginTop: verticalScale(6) },
  saveBtn: {
    borderRadius: moderateScale(14),
    paddingVertical: verticalScale(15),
    alignItems: "center",
    elevation: 3,
    shadowColor: "#93614040",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: moderateScale(15),
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
