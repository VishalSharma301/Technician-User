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
import CustomView from "./CustomView";

export default function AddressComponent({
  onAddressSaved,
}: {
  // ✅ callback now only signals "address was added", no auto-advance
  onAddressSaved: (address: any) => void;
}) {
  const { selectedAddress } = useAddress();
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
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
        // ✅ always inherit zipcode from current selected address — never editable
        zipcode: selectedAddress?.address?.zipcode || "",
        coordinates: { lat: 0, lon: 0 },
      },
    };

    onAddressSaved(newAddress);

    // Reset fields
    setStreetAddress("");
    setCity("");
    setState("");
    setLabel("");
    setPhone("");
  }

  return (
    <View style={{ gap: verticalScale(9), marginTop: verticalScale(16) }}>
      <CustomView radius={scale(25)} boxStyle={styles.AddressForm}>
        <TextInput
          style={styles.input}
          placeholder="Enter Your ward no and House No"
          value={streetAddress}
          onChangeText={setStreetAddress}
        />
      </CustomView>

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <CustomView
          radius={scale(25)}
          width={scale(167)}
          boxStyle={styles.AddressForm}
        >
          <TextInput
            style={styles.input}
            placeholder="City"
            value={city}
            onChangeText={setCity}
          />
        </CustomView>
        <CustomView
          radius={scale(25)}
          width={scale(167)}
          boxStyle={styles.AddressForm}
        >
          <TextInput
            style={styles.input}
            placeholder="State"
            value={state}
            onChangeText={setState}
          />
        </CustomView>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {/* Zipcode — always locked to selected address */}
        <CustomView
          radius={scale(25)}
          width={scale(167)}
          boxStyle={styles.AddressForm}
        >
          <TextInput
            style={[styles.input, styles.readonlyInput]}
            placeholder={selectedAddress?.address?.zipcode || "Zipcode"}
            editable={false}
            selectTextOnFocus={false}
          />
        </CustomView>
        <CustomView
          radius={scale(25)}
          width={scale(167)}
          boxStyle={styles.AddressForm}
        >
          <TextInput
            style={styles.input}
            placeholder="Phone no."
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </CustomView>
      </View>

      {/* Label selector */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {["Home", "Office", "Others"].map((item) => {
          const isSelected = label === item;
          return (
            <TouchableOpacity
              key={item}
              onPress={() => setLabel(item)}
              activeOpacity={0.8}
            >
              <CustomView
                height={verticalScale(50)}
                width={scale(108)}
                radius={scale(25)}
                gradientColors={isSelected ? ["#C8E6F9", "#C8E6F9"] : undefined}
                boxStyle={{
                  borderWidth: moderateScale(0.7),
                  borderColor: "#fff",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: "#000",
                    fontWeight: isSelected ? "600" : "400",
                    fontSize: moderateScale(13),
                  }}
                >
                  {item}
                </Text>
              </CustomView>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[
          {
            height: verticalScale(44),
            width: "100%",
            borderRadius: scale(25),
            justifyContent: "center",
            backgroundColor: "#077DC6",
            alignItems: "center",
            marginTop: verticalScale(2),
          },
          { opacity: !streetAddress || !city || !state ? 0.5 : 1 },
        ]}
        disabled={!streetAddress || !city || !state}
        onPress={handleConfirm}
      >
        <Text style={styles.optionText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  AddressForm: {
    paddingHorizontal: scale(16),
    borderWidth: 1,
    justifyContent: "center",
    backgroundColor: "#C8E6FF1A",
    borderColor: "#C8E6FF80",
  },
  input: {
    fontSize: moderateScale(12),
    fontWeight: "400",
    height: verticalScale(50),
  },
  readonlyInput: {
    color: "#9CA3AF",
  },
  optionText: {
    color: "#fff",
    fontSize: moderateScale(14),
    fontWeight: "600",
    textAlign: "left",
  },
});
