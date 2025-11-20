// AddAddressScreen.tsx
import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Image,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "../../../utils/scaling";
// import * as ImagePicker from "expo-image-picker";
import { AddressContext } from "../../../store/AddressContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { HomeStackParamList } from "../../../constants/navigation";


type NavigationProp = StackNavigationProp<HomeStackParamList, "AddAddress">

export default function AddAddressScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { setAddresses, addresses } = useContext(AddressContext);

  const editMode = (route.params as any)?.edit || false;
  const editIndex = (route.params as any)?.index;
  const editItem = (route.params as any)?.item;

  const [street, setStreet] = useState(editMode ? editItem.address.street : "");
  const [details, setDetails] = useState(
    editMode ? editItem.address?.details || "" : ""
  );
  const [receiver, setReceiver] = useState(editMode ? editItem.phone : "");
  const [label, setLabel] = useState(editMode ? editItem.label : "Home");
  const [city, setCity] = useState(editMode ? editItem.address.city : "");
  const [stateName, setStateName] = useState(
    editMode ? editItem.address.state : ""
  );
  const [zipcode, setZipcode] = useState(
    editMode ? editItem.address.zipcode : ""
  );

  const [image, setImage] = useState<string | null>(null);

//   const pickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//     });
//     if (!result.canceled) {
//       setImage(result.assets[0].uri);
//     }
//   };

  const saveAddress = () => {
    const newEntry = {
      label,
      phone: receiver,
      address: {
        street,
        city,
        state: stateName,
        zipcode,
        coordinates: { lat: 0, lon: 0 },
      },
      image,
    };

    if (editMode) {
      const updated = [...addresses];
      updated[editIndex] = newEntry;
      setAddresses(updated);
    } else {
      setAddresses((prev) => [newEntry, ...prev]);
    }

    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.useLocationButton}>
        <Icon name="crosshairs-gps" size={22} color="#007BFF" />
        <Text style={styles.useLocationText}>Use Current Location</Text>
      </TouchableOpacity>

      <View style={styles.formCard}>
        <TextInput
          placeholder="Street Address"
          placeholderTextColor="#9CA3AF"
          value={street}
          onChangeText={setStreet}
          style={styles.input}
        />

        <TextInput
          placeholder="Address details (Floor, House no.)"
          placeholderTextColor="#9CA3AF"
          value={details}
          onChangeText={setDetails}
          style={styles.input}
        />

        <TextInput
          placeholder="City"
          placeholderTextColor="#9CA3AF"
          value={city}
          onChangeText={setCity}
          style={styles.input}
        />

        <TextInput
          placeholder="State"
          placeholderTextColor="#9CA3AF"
          value={stateName}
          onChangeText={setStateName}
          style={styles.input}
        />

        <TextInput
          placeholder="ZIP Code"
          placeholderTextColor="#9CA3AF"
          value={zipcode}
          onChangeText={setZipcode}
          style={styles.input}
        />

        <TextInput
          placeholder="Receiver details"
          placeholderTextColor="#9CA3AF"
          value={receiver}
          onChangeText={setReceiver}
          style={styles.input}
        />

        <View style={styles.labelRow}>
          {["Home", "Work", "Other"].map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.labelButton,
                label === t && styles.labelButtonActive,
              ]}
              onPress={() => setLabel(t)}
            >
              <Text
                style={label === t ? styles.labelTextActive : styles.labelText}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          <Icon name="camera" size={26} color="#999" />
          <Text style={styles.imagePickerText}>Add an image</Text>
        </TouchableOpacity> */}

        {image && <Image source={{ uri: image }} style={styles.previewImage} />}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveAddress}>
        <Text style={styles.saveButtonText}>
          {editMode ? "Save Changes" : "Save Address"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: scale(16), backgroundColor: "#F5F7FB" },
  useLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: scale(14),
    borderRadius: scale(12),
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: verticalScale(20),
  },
  useLocationText: {
    marginLeft: scale(10),
    color: "#007BFF",
    fontWeight: "600",
  },
  formCard: {
    backgroundColor: "#fff",
    padding: scale(16),
    borderRadius: scale(16),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    backgroundColor: "#F3F4F6",
    padding: scale(12),
    borderRadius: scale(10),
    fontSize: moderateScale(15),
    marginBottom: verticalScale(14),
    color: "#111827",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: verticalScale(14),
  },
  labelButton: {
    flex: 1,
    marginHorizontal: scale(4),
    paddingVertical: scale(10),
    borderRadius: scale(10),
    backgroundColor: "#E5E7EB",
    alignItems: "center",
  },
  labelButtonActive: { backgroundColor: "#007BFF" },
  labelText: { color: "#374151", fontWeight: "600" },
  labelTextActive: { color: "#fff", fontWeight: "700" },
  imagePicker: {
    marginTop: verticalScale(10),
    padding: scale(20),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    alignItems: "center",
  },
  imagePickerText: { marginTop: scale(8), color: "#6B7280" },
  previewImage: {
    width: "100%",
    height: verticalScale(200),
    borderRadius: scale(12),
    marginTop: verticalScale(12),
  },
  saveButton: {
    backgroundColor: "#007BFF",
    padding: scale(16),
    borderRadius: scale(12),
    marginVertical: verticalScale(20),
  },
  saveButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: moderateScale(16),
    fontWeight: "700",
  },
});
