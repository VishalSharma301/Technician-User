import React, { useState, useMemo, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  FlatList,
  ActivityIndicator,
  Button,
} from "react-native";
import { fetchzipcodes } from "../../utils/servicesApi";
import { SafeAreaView } from "react-native-safe-area-context";
// import BookNowButton from "../../ui/BookNowButton";
import { useNavigation } from "@react-navigation/native";
import { AddressContext } from "../../store/AddressContext";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../constants/navigation";

type Location = {
  _id: string;
  city: string;
  code: string; // zipcode
  country: string;
  createdAt: string;
  description: string;
  isActive: boolean;
  serviceProviderCount: number;
  state: string;
  userCount: number;
};

interface Props {
  locations: Location[];
}

type NavigationProp = StackNavigationProp<RootStackParamList, "SelectLocationScreen">

export default function SelectLocationScreen() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedZip, setSelectedZip] = useState<string>("");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<string[]>([]);
  const [modalType, setModalType] = useState<"state" | "city" | "zip" | null>(
    null
  );
  const navigation = useNavigation<NavigationProp>()
  const {setSelectedAddress} = useContext(AddressContext)

  useEffect(() => {
    async function fetchAvailableLocations() {
      try {
        const availableLocations = await fetchzipcodes();
        setLocations(availableLocations.data);
      } catch (err) {
        console.error("Unable to fetch Locations : ", err);
        throw new Error("Error Occured");
      }
    }
    fetchAvailableLocations();
  }, []);

  const states = useMemo(
    () => Array.from(new Set(locations.map((loc) => loc.state))),
    [locations]
  );

  const cities = useMemo(() => {
    return locations
      .filter((loc) => loc.state === selectedState)
      .map((loc) => loc.city)
      .filter((v, i, self) => self.indexOf(v) === i)
      .sort((a, b) => a.localeCompare(b)); // <-- sort alphabetically
  }, [locations, selectedState]);

  const zipcodes = useMemo(() => {
    return locations
      .filter((loc) => loc.state === selectedState && loc.city === selectedCity)
      .map((loc) => loc.code);
  }, [locations, selectedState, selectedCity]);

  const openModal = (type: "state" | "city" | "zip") => {
    if (type === "state") setModalData(states);
    if (type === "city") setModalData(cities);
    if (type === "zip") setModalData(zipcodes);
    setModalType(type);
    setModalVisible(true);
  };

  const handleSelect = (value: string) => {
    if (modalType === "state") {
      setSelectedState(value);
      setSelectedCity("");
      setSelectedZip("");
    } else if (modalType === "city") {
      setSelectedCity(value);
      setSelectedZip("");
    } else if (modalType === "zip") {
      setSelectedZip(value);
    }
    setModalVisible(false);
  };


    const handleSaveAddress = () => {
    if (selectedState && selectedCity && selectedZip) {
      setSelectedAddress({
        label: selectedCity, // could be "Home"/"Work" later
        address: {
          street: "", // keep empty for now
          city: selectedCity,
          state: selectedState,
          zipcode: selectedZip,
          coordinates: { lat: 0, lon: 0 }, // default until you fetch coords
        },
        phone: "", // optional
      });
      navigation.navigate("AuthenticatedTabs")
    }
  };

  function skip (){
    setSelectedAddress({
        label: "Sanghol", // could be "Home"/"Work" later
        address: {
          street: "", // keep empty for now
          city: "Sanghol",
          state: "Punjab",
          zipcode: "140802",
          coordinates: { lat: 0, lon: 0 }, // default until you fetch coords
        },
        phone: "", // optional
      });
      navigation.navigate("AuthenticatedTabs")
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {locations.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="red" />
          <Text>Fetching Available Locations...</Text>
        </View>
      ) : (
        <View style={styles.container}>
          <Text style={styles.label}>Select State</Text>
          <Pressable style={styles.selector} onPress={() => openModal("state")}>
            <Text>{selectedState || "-- Select State --"}</Text>
          </Pressable>

          {selectedState ? (
            <>
              <Text style={styles.label}>Select City</Text>
              <Pressable
                style={styles.selector}
                onPress={() => openModal("city")}
              >
                <Text>{selectedCity || "-- Select City --"}</Text>
              </Pressable>
            </>
          ) : null}

          {selectedCity ? (
            <>
              <Text style={styles.label}>Select Zipcode</Text>
              <Pressable
                style={styles.selector}
                onPress={() => openModal("zip")}
              >
                <Text>{selectedZip || "-- Select Zipcode --"}</Text>
              </Pressable>
            </>
          ) : null}

          {selectedZip ? (
            <Text style={styles.result}>
              ✅ Selected: {selectedState}, {selectedCity}, {selectedZip}
            </Text>
          ) : null}

          {/* Modal for selection */}
          <Modal visible={modalVisible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <FlatList
                  data={modalData}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <Pressable
                      style={styles.modalItem}
                      onPress={() => handleSelect(item)}
                    >
                      <Text style={{ fontSize: 16 }}>{item}</Text>
                    </Pressable>
                  )}
                />
                <Pressable
                  style={[styles.selector, { marginTop: 10 }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={{ color: "red" }}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
          <Button
            onPress={() => {handleSaveAddress()}}
            title="Continue"
          />
          <Button title="Skip" onPress={skip}/>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  label: { fontSize: 16, fontWeight: "600", marginTop: 20 },
  selector: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  result: { marginTop: 30, fontSize: 18, fontWeight: "700", color: "green" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "white",
    width: "80%",
    maxHeight: "60%",
    borderRadius: 10,
    padding: 20,
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  button: {
    alignSelf: "center",
    marginTop: 120,
    borderRadius: 8,
    height: 40,
    aspectRatio: 3,
  },
});
