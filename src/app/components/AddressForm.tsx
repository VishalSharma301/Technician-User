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
  onAddressSaved: (address: any) => void;
}) {
  const { setAddresses, setSelectedAddress, selectedAddress } = useAddress();
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
        coordinates: { lat: 0, lon: 0 },
      },
    };

    // 🟢 FIRST: notify chatbot synchronously
    onAddressSaved(newAddress);

    // 🟢 SECOND: defer global state updates
    // setTimeout(() => {
    //   setAddresses((prev) => [...prev, newAddress]);
    //   setSelectedAddress(newAddress);
    // }, 0);

    // Reset fields
    setStreetAddress("");
    setCity("");
    setZipcode("");
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
            // style={[styles.AddressForm, ]}
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
            // style={[styles.AddressForm, { width: scale(176) }]}
          />
        </CustomView>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <CustomView
          radius={scale(25)}
          width={scale(167)}
          boxStyle={styles.AddressForm}
        >
          <TextInput
          style={styles.input}
            placeholder={selectedAddress.address.zipcode}
            // value={label}
            // onChangeText={setLabel}
            editable={false}
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
            // style={[styles.AddressForm, { width: scale(176) }]}
          />
        </CustomView>
      </View>
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
          height={verticalScale(36)}
          width={scale(108)}
          radius={scale(25)}
          gradientColors={isSelected ? ['#C8E6F9','#C8E6F9'] : undefined}
          boxStyle={{
            borderWidth: moderateScale(0.7),
            borderColor: '#fff',
            // backgroundColor: isSelected ? "#E6F4FF" : "#C8E6FF1A",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color:  "#000",
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
            // paddingHorizontal: scale(16),
            borderRadius: scale(25),
            //   borderWidth: 1,
            justifyContent: "center",
          },
          { backgroundColor: "#077DC6", alignItems: "center" },
          {
            marginTop: verticalScale(2),
            opacity: !streetAddress || !city || !state ? 0.5 : 1,
          },
        ]}
        disabled={!streetAddress || !city || !state}
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
    // height: verticalScale(48),
    // width: "100%",
    paddingHorizontal: scale(16),
    borderWidth: 1,
    justifyContent: "center",
    backgroundColor: "#C8E6FF1A",
    borderColor: "#C8E6FF80",
  },
  input:{
    fontSize : moderateScale(12),
    fontWeight : '400'
  },
  optionText: {
    color: "#fff",
    fontSize: moderateScale(14),
    fontWeight: "600",
    textAlign: "left",
  },
});
