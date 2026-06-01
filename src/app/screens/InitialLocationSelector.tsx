/**
 * InitialLocationSelector
 *
 * Shown on first launch (after login) when the backend response has NO saved address.
 * Flow: Search city OR drag pin OR use GPS  →  fill Zip + Phone  →  Confirm
 *       → calls fetchServicesApi(lat, lng, zip, phone) → replaces stack with main app.
 *
 * SETUP REQUIRED (run once):
 *   npx expo install expo-maps expo-location
 *
 * Google Maps API Key (Android):
 *   In app.json → expo.android.config.googleMaps.apiKey: "YOUR_KEY"
 *
 * iOS uses Apple Maps — no key needed.
 *
 * Add to your root/auth navigator param list:
 *   InitialLocationSelector: undefined;
 *
 * Usage (call from your post-login logic):
 *   if (!user.address) navigation.replace("InitialLocationSelector");
 */

import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
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
import { useNavigation, CommonActions } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { moderateScale, scale, verticalScale } from "../../utils/scaling";
import { AddressContext } from "../../store/AddressContext";

// ─── Uncomment after running: npx expo install expo-maps ─────────
// import { GoogleMaps, AppleMaps } from "expo-maps";

/* ─── Types ─────────────────────────────────────────────────── */
type Coords = { latitude: number; longitude: number };

interface CitySuggestion {
  id: string;
  label: string; // display text shown in dropdown
  coords: Coords;
  zipcode?: string; // pre-fill zip when available from geocoder
}

/* ─── Design tokens ─────────────────────────────────────────── */
const C = {
  bg: "#FFF8F2",
  card: "#FFFFFF",
  border: "#EFD5B7",
  borderFocus: "#C07A4A",
  brown: "#864C2D",
  brownLight: "#864C2D1A",
  txt: "#2D1F0F",
  txt2: "#6B5744",
  txt3: "#4D4D4D",
  placeholder: "#B0A090",
  green: "#1CA177",
  greenBg: "#1CA1771A",
  greenBorder: "#1CA17740",
  headerBg: "#F6EBDE",
  overlayDark: "rgba(30,20,10,0.72)",
  shadow: "#93614040",
  suggestionHover: "#FFF3EA",
  errorBg: "#FFF0F0",
  errorBorder: "#FFBBBB",
  errorTxt: "#CC2222",
};

/** Default map center – Chandigarh Sector 17 */
const DEFAULT_COORDS: Coords = { latitude: 30.7394, longitude: 76.7849 };

/* ─── FloatField ─────────────────────────────────────────────── */
interface FloatFieldProps {
  label: string;
  icon: string;
  value: string;
  onChangeText?: (v: string) => void;
  placeholder?: string;
  editable?: boolean;
  keyboardType?: any;
  error?: string;
  maxLength?: number;
}
function FloatField({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  editable = true,
  keyboardType,
  error,
  maxLength,
}: FloatFieldProps) {
  const [focused, setFocused] = useState(false);
  const borderColor = error
    ? C.errorBorder
    : focused
      ? C.borderFocus
      : C.border;
  const bgColor = error ? C.errorBg : C.card;

  return (
    <View style={fStyles.wrap}>
      <View style={[fStyles.box, { borderColor, backgroundColor: bgColor }]}>
        <Text style={[fStyles.label, error ? { color: C.errorTxt } : {}]}>
          {error || label}
        </Text>
        <View style={fStyles.row}>
          <Icon
            name={icon as any}
            size={moderateScale(16)}
            color={error ? C.errorTxt : focused ? C.brown : C.txt3}
          />
          <TextInput
            style={fStyles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={C.placeholder}
            editable={editable}
            keyboardType={keyboardType}
            maxLength={maxLength}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </View>
      </View>
    </View>
  );
}
const fStyles = StyleSheet.create({
  wrap: { marginBottom: verticalScale(10) },
  box: {
    borderWidth: 1.5,
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(12),
    paddingTop: verticalScale(6),
    paddingBottom: verticalScale(8),
  },
  label: {
    fontSize: moderateScale(11),
    color: C.txt3,
    marginBottom: verticalScale(3),
    fontWeight: "500",
  },
  row: { flexDirection: "row", alignItems: "center", gap: scale(8) },
  input: { flex: 1, fontSize: moderateScale(14), color: C.txt, padding: 0 },
});

/* ─── Main Screen ────────────────────────────────────────────── */
export default function InitialLocationSelector() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const {
    setAddresses,
    setSelectedAddress,
    generateAddressId,
    isLoadingAddresses,
    addresses,
  } = useContext(AddressContext);

  /* ── Map / pin state ── */
  const [pinCoords, setPinCoords] = useState<Coords>(DEFAULT_COORDS);
  const [cameraCoords, setCameraCoords] = useState<Coords>(DEFAULT_COORDS);
  const [showTooltip, setShowTooltip] = useState(true);

  /* ── City search ── */
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCityLabel, setSelectedCityLabel] = useState("");
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Reverse-geocoded city (from pin drags / GPS) ── */
  const [resolvedCity, setResolvedCity] = useState("");
  const [geocoding, setGeocoding] = useState(false);

  /* ── Form fields ── */
  const [streetAddress, setStreetAddress] = useState("");
  const [addressLabel, setAddressLabel] = useState<
    "Home" | "Office" | "Others"
  >("Home");
  const [zipcode, setZipcode] = useState("");
  const [phone, setPhone] = useState("");
  const [zipcodeError, setZipcodeError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  /* ── GPS ── */
  const [gpsLoading, setGpsLoading] = useState(false);

  /* ── Confirm ── */
  const [confirming, setConfirming] = useState(false);

 

  /* ── Tooltip pulse ── */
  const tooltipPulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(tooltipPulse, {
          toValue: 1.04,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(tooltipPulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  /* ── Auto-request GPS on mount ── */
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") silentlySetCurrentLocation();
    })();
  }, []);

  /* ── Reverse geocode coords → set resolvedCity ── */
  const reverseGeocode = useCallback(
    async (coords: Coords) => {
      setGeocoding(true);
      try {
        const [result] = await Location.reverseGeocodeAsync({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        if (result) {
          const city = result.city ?? result.subregion ?? result.region ?? "";
          setResolvedCity(city);
          const street = [result.name, result.street, result.district]
            .filter(Boolean)
            .join(", ");

          if (street) {
            setStreetAddress(street);
          }
          // Pre-fill zipcode only if not already filled
          // if (result.postalCode && !zipcode) setZipcode(result.postalCode);
          if (result.postalCode) setZipcode(result.postalCode);
        }
      } catch {
        /* ignore */
      } finally {
        setGeocoding(false);
      }
    },
    [zipcode],
  );

  /* ── GPS silent ── */
  const silentlySetCurrentLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords: Coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setPinCoords(coords);
      setCameraCoords(coords);
      setShowTooltip(false);
      setSelectedCityLabel("");
      reverseGeocode(coords);
    } catch {
      /* ignore */
    }
  };

  /* ── GPS user-triggered ── */
  const handleUseCurrentLocation = async () => {
    try {
      setGpsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location permission needed",
          "Please allow location access in your device settings.",
        );
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
      setCameraCoords(coords);
      setShowTooltip(false);
      setSelectedCityLabel("");
      setSearchQuery("");
      setSuggestions([]);
      await reverseGeocode(coords);
    } catch {
      Alert.alert("Error", "Could not fetch your location. Please try again.");
    } finally {
      setGpsLoading(false);
    }
  };

  /* ── Marker drag end ── */
  const handleMarkerDragEnd = useCallback(
    async (event: any) => {
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
      setSelectedCityLabel("");
      setSearchQuery("");
      await reverseGeocode(coords);
    },
    [reverseGeocode],
  );

  /* ── City search – debounced geocode ── */
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setSelectedCityLabel("");

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (text.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        // Location.geocodeAsync returns an array of matching results
        const results = await Location.geocodeAsync(text.trim());
        const seen = new Set<string>();
        const mapped: CitySuggestion[] = results
          .slice(0, 6)
          .map((r, i) => ({
            id: `${i}`,
            label: text.trim(), // expo-location doesn't return display name; use query as label
            coords: { latitude: r.latitude, longitude: r.longitude },
          }))
          .filter((s) => {
            // deduplicate by rounded coords
            const key = `${s.coords.latitude.toFixed(2)},${s.coords.longitude.toFixed(2)}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });

        // For richer suggestions (city name + region), reverse-geocode each result
        const enriched: CitySuggestion[] = await Promise.all(
          mapped.map(async (s) => {
            try {
              const [r] = await Location.reverseGeocodeAsync(s.coords);
              if (!r) return s;
              const parts = [r.city ?? r.subregion, r.region, r.country].filter(
                Boolean,
              );
              return {
                ...s,
                label: parts.join(", ") || s.label,
                zipcode: r.postalCode ?? undefined,
              };
            } catch {
              return s;
            }
          }),
        );

        // Deduplicate again by label after enrichment
        const labelSeen = new Set<string>();
        const final = enriched.filter((s) => {
          if (labelSeen.has(s.label)) return false;
          labelSeen.add(s.label);
          return true;
        });

        setSuggestions(final);
        setShowSuggestions(final.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 500);
  };

  /* ── Select a city from suggestions ── */
  const handleSelectSuggestion = (suggestion: CitySuggestion) => {
    setSelectedCityLabel(suggestion.label);
    setSearchQuery(suggestion.label);
    setResolvedCity(suggestion.label);
    setPinCoords(suggestion.coords);
    setCameraCoords(suggestion.coords);
    setShowTooltip(false);
    setSuggestions([]);
    setShowSuggestions(false);
    // if (suggestion.zipcode && !zipcode) setZipcode(suggestion.zipcode);
    if (suggestion.zipcode) setZipcode(suggestion.zipcode);
  };

  /* ── Field validation ── */
  const validate = (): boolean => {
    let valid = true;
    if (!zipcode.trim() || zipcode.trim().length < 4) {
      setZipcodeError("Enter a valid zip / pincode");
      valid = false;
    } else {
      setZipcodeError("");
    }
    const digits = phone.replace(/\D/g, "");
    if (!digits || digits.length < 7) {
      setPhoneError("Enter a valid phone number");
      valid = false;
    } else {
      setPhoneError("");
    }
    return valid;
  };

  /* ── Confirm → fetchServices → navigate ── */
  const handleConfirm = async () => {
    if (!validate()) return;
    setConfirming(true);
    try {
      const newAddress = {
        id: generateAddressId(),
        label: addressLabel,
        address: {
          street: streetAddress || selectedCityLabel || resolvedCity,
          city: resolvedCity,
          state: "",
          zipcode: zipcode.trim(),
          coordinates: {
            lat: pinCoords.latitude,
            lon: pinCoords.longitude,
          },
        },
        phone: phone.trim(),
      };
      // ── Step 1: call your fetchServices API ──────────────────────────────────
      //
      //   const res = await fetch("https://your-api.com/services", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({
      //       lat: pinCoords.latitude,
      //       lng: pinCoords.longitude,
      //       zipcode: zipcode.trim(),
      //       phone: phone.trim(),
      //     }),
      //   });
      //   if (!res.ok) throw new Error("Failed to fetch services");
      //   const services = await res.json();

      // ── Step 2: persist the chosen address locally ───────────────────────────
      setSelectedAddress(newAddress);
      setAddresses((prev) => [...prev, newAddress]);

      // ── Step 3: replace the stack (user can't go back to this screen) ─────────
      // Swap "MainApp" with your actual main route name:
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "AuthenticatedTabs" }],
        }),
      );
    } catch {
      Alert.alert(
        "Could not load services",
        "Please check your internet connection and try again.",
      );
    } finally {
      setConfirming(false);
    }
  };

  /* ── Current location label shown in the bottom sheet ── */
  const locationLabel = selectedCityLabel || resolvedCity;

  /* ── Platform map ── */
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
      style: StyleSheet.absoluteFill,
      cameraPosition: {
        coordinates: {
          latitude: cameraCoords.latitude,
          longitude: cameraCoords.longitude,
        },
        zoom: 14,
      },
    };

    // Uncomment after installing expo-maps:
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
    return (
      <View style={styles.mapPlaceholder}>
        <Icon name="map-outline" size={moderateScale(48)} color={C.border} />
        <Text style={styles.mapPlaceholderText}>Map loads here</Text>
      </View>
    );
  };

  const AddressTypeButton = ({
    title,
  }: {
    title: "Home" | "Office" | "Others";
  }) => (
    <TouchableOpacity
      onPress={() => setAddressLabel(title)}
      style={[styles.labelBtn, addressLabel === title && styles.labelBtnActive]}
    >
      <Text
        style={[
          styles.labelBtnText,
          addressLabel === title && styles.labelBtnTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  /* ─────────────────────────────────── render ─── */

  if (isLoadingAddresses) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={C.brown} />

          <Text style={styles.loadingTitle}>Loading Addresses</Text>

          <Text style={styles.loadingSubtitle}>
            Please wait while we restore your saved locations...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerIconWrap}>
          <Icon
            name="map-marker-radius-outline"
            size={moderateScale(22)}
            color={C.brown}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Where do we deliver to you?</Text>
          <Text style={styles.headerSub}>
            Search a city, drag the pin, or use GPS
          </Text>
        </View>
      </View>

      {/* ── Map area ── */}
      <View style={styles.mapWrapper}>
        <MapView />

        {/* ── City search bar overlaid on map ── */}
        <View style={styles.searchOverlay} pointerEvents="box-none">
          {/* Input row */}
          <View style={styles.searchBox}>
            <Icon name="magnify" size={moderateScale(18)} color={C.brown} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholder="Search city, area or locality…"
              placeholderTextColor={C.placeholder}
              returnKeyType="search"
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
            />
            {searchLoading ? (
              <ActivityIndicator size="small" color={C.brown} />
            ) : searchQuery.length > 0 ? (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setSuggestions([]);
                  setShowSuggestions(false);
                  setSelectedCityLabel("");
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon
                  name="close-circle"
                  size={moderateScale(17)}
                  color={C.placeholder}
                />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestionsBox}>
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={[
                      styles.suggestionRow,
                      index < suggestions.length - 1 &&
                        styles.suggestionRowBorder,
                    ]}
                    onPress={() => handleSelectSuggestion(item)}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name="map-marker-outline"
                      size={moderateScale(15)}
                      color={C.brown}
                    />
                    <Text style={styles.suggestionText} numberOfLines={1}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>

        {/* Tooltip */}
        {showTooltip && (
          <Animated.View
            style={[
              styles.tooltipWrap,
              { transform: [{ scale: tooltipPulse }] },
            ]}
            pointerEvents="none"
          >
            <View style={styles.tooltip}>
              <Icon name="gesture-tap" size={moderateScale(14)} color="#fff" />
              <Text style={styles.tooltipText}>
                Drag the pin to your exact address
              </Text>
            </View>
            <View style={styles.tooltipArrow} />
          </Animated.View>
        )}

        {/* GPS button */}
        <TouchableOpacity
          style={styles.gpsBtn}
          onPress={handleUseCurrentLocation}
          activeOpacity={0.85}
          disabled={gpsLoading}
        >
          {gpsLoading ? (
            <ActivityIndicator size="small" color={C.green} />
          ) : (
            <>
              <Icon
                name="crosshairs-gps"
                size={moderateScale(17)}
                color={C.green}
              />
              <Text style={styles.gpsBtnText}>Use my location</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Bottom sheet ── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.bottomSheetKAV}
      >
        <ScrollView
          style={styles.bottomSheet}
          contentContainerStyle={styles.bottomSheetContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Detected location + coords row */}
          <View style={styles.coordRow}>
            {/* Resolved city label */}
            <View style={styles.cityChip}>
              {geocoding ? (
                <ActivityIndicator size="small" color={C.brown} />
              ) : (
                <>
                  <Icon
                    name={
                      locationLabel
                        ? "map-marker-check-outline"
                        : "map-marker-outline"
                    }
                    size={moderateScale(14)}
                    color={locationLabel ? C.brown : C.placeholder}
                  />
                  <Text
                    style={[
                      styles.cityChipText,
                      !locationLabel && { color: C.placeholder },
                    ]}
                    numberOfLines={1}
                  >
                    {locationLabel || "No city selected"}
                  </Text>
                </>
              )}
            </View>

            <View style={styles.coordDivider} />

            {/* Lat / Lng mini chips */}
            <View style={styles.latlngWrap}>
              <View style={styles.latlngChip}>
                <Text style={styles.latlngLabel}>LAT</Text>
                <Text style={styles.latlngValue}>
                  {pinCoords.latitude.toFixed(4)}
                </Text>
              </View>
              <View style={styles.latlngChip}>
                <Text style={styles.latlngLabel}>LNG</Text>
                <Text style={styles.latlngValue}>
                  {pinCoords.longitude.toFixed(4)}
                </Text>
              </View>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.sectionDivider} />

          {/* Form fields */}
          <Text style={styles.formSectionLabel}>Delivery Details</Text>

          <Text style={styles.fieldTitle}>Address Label</Text>

          <View style={styles.labelRow}>
            <AddressTypeButton title="Home" />
            <AddressTypeButton title="Office" />
            <AddressTypeButton title="Others" />
          </View>

          <FloatField
            label="Street Address"
            icon="home-outline"
            value={streetAddress}
            onChangeText={setStreetAddress}
            placeholder="Enter complete street address"
          />

          {/* Zip + Phone in two columns */}
          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <FloatField
                label="Zip / Pincode"
                icon="map-marker-outline"
                value={zipcode}
                onChangeText={(v) => {
                  setZipcode(v);
                  if (zipcodeError) setZipcodeError("");
                }}
                placeholder="e.g. 160017"
                keyboardType="numeric"
                maxLength={10}
                error={zipcodeError}
              />
            </View>
            <View style={{ flex: 1 }}>
              <FloatField
                label="Phone Number"
                icon="phone-outline"
                value={phone}
                onChangeText={(v) => {
                  setPhone(v);
                  if (phoneError) setPhoneError("");
                }}
                placeholder="+91-XXXXXXXXXX"
                keyboardType="phone-pad"
                maxLength={15}
                error={phoneError}
              />
            </View>
          </View>

          {/* Privacy note */}
          {/* <View style={styles.privacyRow}>
            <Icon
              name="shield-check-outline"
              size={moderateScale(13)}
              color={C.green}
            />
            <Text style={styles.privacyText}>
              Your location and contact details are encrypted and never shared
              with third parties.
            </Text>
          </View> */}

          {/* Confirm CTA */}
          <TouchableOpacity
            onPress={handleConfirm}
            activeOpacity={0.88}
            disabled={confirming}
            style={styles.confirmBtnOuter}
          >
            <LinearGradient
              colors={["#BF7D5A", "#733A1C"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.confirmBtn}
            >
              {confirming ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.confirmBtnText}>Finding services…</Text>
                </>
              ) : (
                <>
                  <Icon
                    name="check-decagram-outline"
                    size={moderateScale(18)}
                    color="#fff"
                  />
                  <Text style={styles.confirmBtnText}>
                    Confirm & Find Services
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ─── Styles ─────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.65)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },

  loadingCard: {
    backgroundColor: "#fff",
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(20),
    borderRadius: moderateScale(16),
    alignItems: "center",
    minWidth: scale(220),

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },

  loadingTitle: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: C.brown,
  },

  loadingSubtitle: {
    marginTop: verticalScale(6),
    fontSize: moderateScale(12),
    color: C.txt3,
    textAlign: "center",
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: C.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  /* ── header ── */
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    backgroundColor: C.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerIconWrap: {
    width: scale(44),
    height: scale(44),
    borderRadius: moderateScale(14),
    backgroundColor: C.brownLight,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: C.brown,
    marginBottom: verticalScale(2),
  },
  headerSub: {
    fontSize: moderateScale(11),
    color: C.txt3,
    lineHeight: moderateScale(15),
  },

  /* ── map ── */
  mapWrapper: {
    flex: 1,
    position: "relative",
    backgroundColor: "#EDE0D0",
  },
  mapPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: verticalScale(8),
  },
  mapPlaceholderText: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: C.txt2,
  },
  mapPlaceholderSub: {
    fontSize: moderateScale(12),
    color: C.txt3,
    textAlign: "center",
    lineHeight: moderateScale(18),
    paddingHorizontal: scale(32),
  },

  /* ── search overlay ── */
  searchOverlay: {
    position: "absolute",
    top: verticalScale(14),
    left: scale(14),
    right: scale(14),
    zIndex: 30,
    // borderWidth : 5
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(9),
    backgroundColor: C.card,
    borderRadius: moderateScale(14),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(10),
    borderWidth: 1.5,
    borderColor: C.border,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 3 },
    // shadowOpacity: 0.13,
    // shadowRadius: 8,
    // elevation: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(13),
    color: C.txt,
    padding: 0,
  },
  suggestionsBox: {
    backgroundColor: C.card,
    borderRadius: moderateScale(12),
    marginTop: verticalScale(4),
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    maxHeight: verticalScale(220),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(11),
    backgroundColor: C.card,
  },
  suggestionRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  suggestionText: {
    fontSize: moderateScale(13),
    color: C.txt,
    flex: 1,
  },

  /* ── tooltip ── */
  tooltipWrap: {
    position: "absolute",
    bottom: verticalScale(60),
    alignSelf: "center",
    alignItems: "center",
    zIndex: 20,
  },
  tooltip: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    backgroundColor: C.overlayDark,
    borderRadius: moderateScale(22),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(9),
  },
  tooltipText: {
    color: "#fff",
    fontSize: moderateScale(12),
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: scale(7),
    borderRightWidth: scale(7),
    borderTopWidth: scale(8),
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: C.overlayDark,
  },

  /* ── GPS button ── */
  gpsBtn: {
    position: "absolute",
    bottom: verticalScale(14),
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: scale(7),
    backgroundColor: C.card,
    borderRadius: moderateScale(22),
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(9),
    borderWidth: 1.5,
    borderColor: C.greenBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  gpsBtnText: {
    fontSize: moderateScale(13),
    fontWeight: "700",
    color: C.green,
    letterSpacing: 0.2,
  },

  /* ── bottom sheet ── */
  bottomSheetKAV: { backgroundColor: C.card },
  fieldTitle: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    color: C.txt,
    marginBottom: verticalScale(8),
  },

  labelRow: {
    flexDirection: "row",
    gap: scale(10),
    marginBottom: verticalScale(14),
  },

  labelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(10),
    alignItems: "center",
    backgroundColor: C.card,
  },

  labelBtnActive: {
    backgroundColor: C.brown,
    borderColor: C.brown,
  },

  labelBtnText: {
    color: C.brown,
    fontWeight: "600",
  },

  labelBtnTextActive: {
    color: "#fff",
  },
  bottomSheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  bottomSheetContent: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(14),
  },

  /* coords / city row */
  coordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
    marginBottom: verticalScale(12),
  },
  cityChip: {
    flex: 1.4,
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    backgroundColor: C.headerBg,
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(7),
    borderWidth: 1,
    borderColor: C.border,
  },
  cityChipText: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    color: C.brown,
    flex: 1,
  },
  coordDivider: {
    width: 1,
    height: verticalScale(30),
    backgroundColor: C.border,
  },
  latlngWrap: {
    flex: 1,
    gap: verticalScale(4),
  },
  latlngChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(5),
  },
  latlngLabel: {
    fontSize: moderateScale(9),
    fontWeight: "800",
    color: C.txt3,
    letterSpacing: 0.8,
    width: scale(24),
  },
  latlngValue: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    color: C.txt,
    letterSpacing: 0.2,
  },

  /* section divider */
  sectionDivider: {
    height: 1,
    backgroundColor: C.border,
    marginBottom: verticalScale(14),
  },
  formSectionLabel: {
    fontSize: moderateScale(13),
    fontWeight: "700",
    color: C.brown,
    marginBottom: verticalScale(10),
  },

  /* two-col */
  twoCol: {
    flexDirection: "row",
    gap: scale(10),
  },

  /* privacy */
  privacyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: scale(7),
    marginBottom: verticalScale(14),
    marginTop: verticalScale(2),
  },
  privacyText: {
    flex: 1,
    fontSize: moderateScale(11),
    color: C.txt3,
    lineHeight: moderateScale(16),
  },

  /* confirm button */
  confirmBtnOuter: {
    borderRadius: moderateScale(14),
    overflow: "hidden",
    elevation: 4,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(8),
    paddingVertical: verticalScale(15),
    borderRadius: moderateScale(14),
  },
  confirmBtnText: {
    color: "#fff",
    fontSize: moderateScale(15),
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
