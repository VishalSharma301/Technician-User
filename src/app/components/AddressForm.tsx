import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "../../utils/scaling";
import { useAddress } from "../../hooks/useAddress";

export default function AddressComponent() {
  const { setAddresses, setSelectedAddress } = useAddress();
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [state, setState] = useState("");
  const [label, setLabel] = useState("");
  const [phone, setPhone] = useState("");

  function handleConfirm() {
    const newAddress = {
      label,
      phone,
      address: {
        street: streetAddress,
        city,
        state,
        zipcode,
        coordinates: { lat: 0, lon: 0 }, // You can update later if needed
      },
    };

    // 1️⃣ Add to global address list
    setAddresses((prev) => [...prev, newAddress]);

    // 2️⃣ Set as selected
    setSelectedAddress(newAddress);

    // 3️⃣ Reset fields
    setStreetAddress("");
    setCity("");
    setZipcode("");
    setState("");
    setLabel("");
    setPhone("");

    // (optional) Alert
    // Alert.alert("Success", "Address added successfully");
  }

  return (
    <View style={{ gap: verticalScale(8), marginTop: verticalScale(8) }}>
      <TextInput
        placeholder="Enter Your ward no and House No"
        value={streetAddress}
        onChangeText={setStreetAddress}
        style={styles.AddressForm}
      />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <TextInput
          placeholder="City"
          value={city}
          onChangeText={setCity}
          style={[styles.AddressForm, { width: scale(192) }]}
        />
        <TextInput
          placeholder="Zip Code"
          value={zipcode}
          onChangeText={setZipcode}
          style={[styles.AddressForm, { width: scale(176) }]}
        />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <TextInput
          placeholder="lable"
          value={label}
          onChangeText={setLabel}
          style={[styles.AddressForm, { width: scale(192) }]}
        />
        <TextInput
          placeholder="Phone no."
          value={phone}
          onChangeText={setPhone}
          style={[styles.AddressForm, { width: scale(176) }]}
        />
      </View>
      <TextInput
        placeholder="State"
        value={state}
        onChangeText={setState}
        style={styles.AddressForm}
      />
      <TouchableOpacity
        style={[
          {
            height: verticalScale(52),
            width: "100%",
            // paddingHorizontal: scale(16),
            // borderRadius: scale(8),
            //   borderWidth: 1,
            justifyContent: "center",
          },
          { backgroundColor: "#014e0789", alignItems: "center" },
          {
            marginTop: verticalScale(10),
            opacity: !streetAddress || !city || !zipcode || !state ? 0.3 : 1,
          },
        ]}
        disabled={!streetAddress || !city || !zipcode || !state}
        onPress={() => {
          handleConfirm();
        }}
      >
        <Text style={[styles.optionText]}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  AddressForm: {
    height: verticalScale(48),
    width: "100%",
    paddingHorizontal: scale(16),
    borderRadius: scale(8),
    borderWidth: 1,
    justifyContent: "center",
    backgroundColor: "#C8E6FF1A",
    borderColor: "#C8E6FF80",
  },
  optionText: {
    color: "#000",
    fontSize: moderateScale(14),
    fontWeight: "500",
    textAlign: "left",
  },
});
