import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "../../utils/scaling";
import { AuthContext } from "../../store/AuthContext";
import { ProfileContext } from "../../store/ProfileContext";
import CustomView from "../components/CustomView";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { ProfileStackParamList } from "../../constants/navigation";
import { StackNavigationProp } from "@react-navigation/stack";
import { updateProfile } from "../../utils/verificationApis";
import { AddressContext, AddressCardType } from "../../store/AddressContext";
import { getProfileData, saveProfileData } from "../../utils/setAsyncStorage";

type CCViewProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};
type ProfileScreenNavigationProp = StackNavigationProp<ProfileStackParamList>;

function CCView({ children, style }: CCViewProps) {
  return (
    <CustomView
      radius={scale(8)}
      shadowColor={"#FFF5EB"}
      borderColor={"#F2D6B5"}
      gradientColors={["#F2D7B840", "#E8CDAE"]}
      shadowStyle={[
        { marginBottom: verticalScale(8), borderRadius: scale(8) },
        style,
      ]}
      gradientStart={{ x: 0, y: 0 }}
      gradientEnd={{ x: 1, y: 1 }}
    >
      {children}
    </CustomView>
  );
}
function CCView1({ children, style }: CCViewProps) {
  return (
    <CustomView
      radius={scale(8)}
      gradientColors={["#FFF5EA", "#FBE8D1"]}
      shadowStyle={[{ marginBottom: verticalScale(8) }, style]}
      gradientStart={{ x: 0, y: 0 }}
      gradientEnd={{ x: 1, y: 1 }}
    >
      {children}
    </CustomView>
  );
}

const EMPTY_ADDRESS: AddressCardType = {
  label: "",
  address: {
    street: "",
    city: "",
    state: "",
    zipcode: "",
    coordinates: { lat: 0, lon: 0 },
  },
  phone: "",
};

export default function ProfileScreen() {
  const { logout, token } = useContext(AuthContext);
  const { addresses, selectedAddress, setAddresses, setSelectedAddress } =
    useContext(AddressContext);

  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    picture,
    setEmail,
    setFirstName,
    setLastName,
    gender,
    setGender,
  } = useContext(ProfileContext);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Address form state
  const [editingAddress, setEditingAddress] =
    useState<AddressCardType>(EMPTY_ADDRESS);
  const [isEditingExisting, setIsEditingExisting] = useState(false);

  const navigation = useNavigation<ProfileScreenNavigationProp>();

  // Addresses that share the same zipcode as the currently selected address
  const filteredAddresses = selectedAddress?.address?.zipcode
    ? addresses.filter(
        (a) => a.address.zipcode === selectedAddress.address.zipcode,
      )
    : addresses;

  useEffect(() => {
    const loadGender = async () => {
      const profile = await getProfileData();
      if (profile?.gender) {
        setGender(profile.gender);
      }
    };
    loadGender();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const payload = {
        firstName,
        lastName,
        email,
        zipcode: selectedAddress?.address?.zipcode || "",
      };
      const res = await updateProfile(payload, token);
      setShowEditModal(false);
      console.log("User updated:", res);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddNewAddress = () => {
    // Pre-fill zipcode from the currently selected address — user cannot change it
    setEditingAddress({
      ...EMPTY_ADDRESS,
      address: {
        ...EMPTY_ADDRESS.address,
        zipcode: selectedAddress?.address?.zipcode || "",
      },
    });
    setIsEditingExisting(false);
    setShowAddressModal(true);
  };

  const openEditAddress = (addr: AddressCardType) => {
    setEditingAddress({ ...addr });
    setIsEditingExisting(true);
    setShowAddressModal(true);
  };

  const handleSaveAddress = () => {
    if (isEditingExisting) {
      setAddresses((prev) =>
        prev.map((a) =>
          a.address.street === editingAddress.address.street &&
          a.label === editingAddress.label
            ? editingAddress
            : a,
        ),
      );
    } else {
      setAddresses((prev) => [...prev, editingAddress]);
    }
    setShowAddressModal(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity style={styles.backRow}>
            <Icon name="chevron-left" size={moderateScale(22)} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("AccountHealthScreen")}
          >
            <Icon name="cog-outline" size={moderateScale(22)} />
          </TouchableOpacity>
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: picture }} style={styles.avatar} />
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Icon name="pencil" size={moderateScale(12)} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>
            {firstName} {lastName}
          </Text>
          <Text style={styles.role}>HVAC Technician</Text>
        </View>

        {/* Professional Information */}
        <CCView>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Professional Information</Text>
              <TouchableOpacity onPress={() => setShowEditModal(true)}>
                <Icon name="pencil-outline" size={moderateScale(18)} />
              </TouchableOpacity>
            </View>

            <CCView1>
              <View style={styles.fieldBox}>
                <Icon name="account-outline" size={18} color="#656565" />
                <Text style={styles.fieldText}>
                  {firstName} {lastName}
                </Text>
              </View>
            </CCView1>
            <CCView1>
              <View style={styles.fieldBox}>
                <Icon name="email-outline" size={18} color="#656565" />
                <Text style={styles.fieldText}>{email}</Text>
              </View>
            </CCView1>
            <CCView1>
              <View style={styles.fieldBox}>
                <Icon name="phone-outline" size={18} color="#656565" />
                <Text style={styles.fieldText}>{phoneNumber}</Text>
              </View>
            </CCView1>
            <CCView1>
              <View style={styles.fieldBox}>
                <Icon name="gender-male-female" size={18} color="#656565" />
                <Text style={styles.fieldText}>{gender}</Text>
              </View>
            </CCView1>
          </View>
        </CCView>

        {/* Customer Address */}
        <CCView>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Customer Address</Text>

            {filteredAddresses.length === 0 ? (
              <Text style={styles.emptyText}>No addresses found.</Text>
            ) : (
              filteredAddresses.map((item, index) => (
                <CCView1 key={`${item.label}-${index}`}>
                  <View style={styles.addressCard}>
                    <Icon
                      name="map-marker-outline"
                      size={20}
                      color="#656565"
                      style={{ alignSelf: "baseline" }}
                    />
                    <View style={{ flex: 1, marginLeft: scale(6) }}>
                      <Text style={styles.addressLabel}>{item.label}</Text>
                      <Text style={styles.addressText}>
                        {item.address.street},{"\n"}
                        {item.address.city}, {item.address.state}
                        {"\n"}
                        {item.address.zipcode}
                      </Text>
                    </View>

                    <View style={styles.addressRightCol}>
                      <TouchableOpacity
                        onPress={() => openEditAddress(item)}
                        style={styles.selectBtn}
                      >
                        <Icon
                          name="pencil-outline"
                          size={moderateScale(18)}
                          color="#656565"
                        />
                      </TouchableOpacity>
                      <LinearGradient
                        style={styles.zipBadge}
                        colors={["#9E805E", "#9E805E"]}
                      >
                        <Text style={styles.zipText}>
                          {item.address.zipcode}
                        </Text>
                      </LinearGradient>

                      {/* Select as default */}
                    </View>
                  </View>
                </CCView1>
              ))
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                // style={styles.outlineBtn}
                onPress={openAddNewAddress}
              >
                 <CustomView
                                radius={moderateScale(8)}
                                gradientColors={['#729869','#729869']}
                                shadowColor={'#77966F'}
                                boxStyle={{
                                  paddingVertical: verticalScale(8),
                                  alignItems: "center",
                                }}
                                shadowStyle={{ marginVertical: verticalScale(10) }}
                              >
                <Text style={styles.outlineText}>Add New Address</Text>
              </CustomView>
              </TouchableOpacity>
            </View>
          </View>
        </CCView>

        <TouchableOpacity style={styles.closeBtn} onPress={() => logout()}>
          <CustomView
                                radius={moderateScale(8)}
                                gradientColors={['#729869','#729869']}
                                shadowColor={'#77966F'}
                                boxStyle={{
                                  paddingVertical: verticalScale(8),
                                  alignItems: "center",
                                }}
                                shadowStyle={{ marginVertical: verticalScale(10) }}
                              >
          <Text style={styles.closeText}>Logout</Text>
          </CustomView>
        </TouchableOpacity>
      </ScrollView>

      {/* ─── Add / Edit Address Modal ─── */}
      <Modal
        visible={showAddressModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddressModal(false)}
      >
        <View style={styles.modalOverlay}>
          <CCView>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View style={styles.modalIcon}>
                  <Icon
                    name="map-marker-outline"
                    size={moderateScale(20)}
                    color="#656565"
                  />
                </View>
                <Text style={styles.modalTitle}>
                  {isEditingExisting ? "Edit Address" : "Add New Address"}
                </Text>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Label */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Label (e.g. Home, Work)</Text>
                  <CCView1>
                    <TextInput
                      placeholder="Enter Label"
                      placeholderTextColor="#9CA3AF"
                      style={styles.textInput}
                      value={editingAddress.label}
                      onChangeText={(val) =>
                        setEditingAddress((prev) => ({ ...prev, label: val }))
                      }
                    />
                  </CCView1>
                </View>

                {/* Street */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Street Address</Text>
                  <CCView1>
                    <TextInput
                      placeholder="Enter Street Address"
                      placeholderTextColor="#9CA3AF"
                      style={styles.textInput}
                      value={editingAddress.address.street}
                      onChangeText={(val) =>
                        setEditingAddress((prev) => ({
                          ...prev,
                          address: { ...prev.address, street: val },
                        }))
                      }
                    />
                  </CCView1>
                </View>

                {/* City */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>City</Text>
                  <CCView1>
                    <TextInput
                      placeholder="Enter City"
                      placeholderTextColor="#9CA3AF"
                      style={styles.textInput}
                      value={editingAddress.address.city}
                      onChangeText={(val) =>
                        setEditingAddress((prev) => ({
                          ...prev,
                          address: { ...prev.address, city: val },
                        }))
                      }
                    />
                  </CCView1>
                </View>

                {/* State */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>State / Province</Text>
                  <CCView1>
                    <TextInput
                      placeholder="Enter State"
                      placeholderTextColor="#9CA3AF"
                      style={styles.textInput}
                      value={editingAddress.address.state}
                      onChangeText={(val) =>
                        setEditingAddress((prev) => ({
                          ...prev,
                          address: { ...prev.address, state: val },
                        }))
                      }
                    />
                  </CCView1>
                </View>

                {/* Zipcode — READ ONLY */}
                <View style={styles.inputWrapper}>
                  <View style={styles.zipLabelRow}>
                    <Text style={styles.inputLabel}>Postal Code / Zip</Text>
                    <View style={styles.lockedBadge}>
                      <Icon
                        name="lock-outline"
                        size={moderateScale(12)}
                        color="#6B7280"
                      />
                      <Text style={styles.lockedText}>Auto-filled</Text>
                    </View>
                  </View>
                  <CCView1>
                    <View style={styles.zipcodeField}>
                      <TextInput
                        style={[styles.textInput, styles.readonlyInput]}
                        value={editingAddress.address.zipcode}
                        editable={false}
                        selectTextOnFocus={false}
                      />
                      <Icon
                        name="lock-outline"
                        size={moderateScale(16)}
                        color="#9CA3AF"
                        style={styles.lockIcon}
                      />
                    </View>
                  </CCView1>
                  <Text style={styles.zipHint}>
                    Zipcode is locked to your current selected area (
                    {selectedAddress?.address?.zipcode || "—"})
                  </Text>
                </View>

                {/* Phone */}
                {/* <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Phone</Text>
                  <CCView>
                    <TextInput
                      placeholder="Enter Phone"
                      placeholderTextColor="#9CA3AF"
                      style={styles.textInput}
                      keyboardType="phone-pad"
                      value={editingAddress.phone}
                      onChangeText={(val) =>
                        setEditingAddress((prev) => ({ ...prev, phone: val }))
                      }
                    />
                  </CCView>
                </View> */}
              </ScrollView>

              <TouchableOpacity
                // style={styles.closeBtn}
                onPress={handleSaveAddress}
              >
                  <CustomView
                                radius={moderateScale(8)}
                                gradientColors={['#729869','#729869']}
                                shadowColor={'#77966F'}
                                boxStyle={{
                                  paddingVertical: verticalScale(8),
                                  alignItems: "center",
                                }}
                                shadowStyle={{ marginVertical: verticalScale(10) }}
                              >
                <Text style={styles.closeText}>Save Address</Text>
                </CustomView>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowAddressModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </CCView>
        </View>
      </Modal>

      {/* ─── Edit Profile Modal ─── */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        {loading && (
          <ActivityIndicator
            size={42}
            color={"red"}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              zIndex: 99999,
              elevation: 1,
            }}
          />
        )}
        <View style={styles.modalOverlay}>
          <CCView>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                Edit Professional Information
              </Text>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>First Name</Text>
                <CCView1>
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    style={styles.textInput}
                  />
                </CCView1>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <CCView1>
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    style={styles.textInput}
                  />
                </CCView1>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Email</Text>
                <CCView1>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.textInput}
                  />
                </CCView1>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Gender</Text>
                <CCView1>
                  <TouchableOpacity onPress={() => setShowGenderModal(true)}>
                    <View style={styles.fieldBox}>
                      <Icon
                        name="gender-male-female"
                        size={18}
                        color="#656565"
                      />
                      <Text style={styles.fieldText}>{gender}</Text>
                      <Icon name="chevron-down" size={18} />
                    </View>
                  </TouchableOpacity>
                </CCView1>
              </View>

              <TouchableOpacity
                // style={styles.closeBtn}
                onPress={handleUpdateProfile}
              >
                <CustomView
                                radius={moderateScale(8)}
                                gradientColors={['#729869','#729869']}
                                shadowColor={'#77966F'}
                                boxStyle={{
                                  paddingVertical: verticalScale(8),
                                  alignItems: "center",
                                }}
                                shadowStyle={{ marginVertical: verticalScale(10) }}
                              >
                <Text style={styles.closeText}>Save Changes</Text>
              </CustomView>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </CCView>
        </View>
      </Modal>

      {/* ─── Gender Picker Modal ─── */}
      <Modal
        visible={showGenderModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <CCView>
            <View style={styles.genderModalContainer}>
              <Text style={styles.modalTitle}>Select Gender</Text>

              {["Male", "Female", "Unknown"].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.genderOption}
                  onPress={async () => {
                    setGender(item);
                    setShowGenderModal(false);
                    await saveProfileData({ gender: item } as any);
                  }}
                >
                  <Text style={styles.genderOptionText}>{item}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowGenderModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </CCView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ----------------------------- Styles ----------------------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF5EB",
  },
  container: {
    paddingHorizontal: scale(9),
    paddingBottom: verticalScale(140),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: scale(9),
    elevation: 99999,
    zIndex: 9999999,
  },
  genderModalContainer: {
    padding: scale(16),
    borderRadius: scale(10),
  },
  genderOption: {
    paddingVertical: verticalScale(12),
    borderBottomWidth: 0.5,
    borderColor: "#E5E7EB",
  },
  genderOptionText: {
    fontSize: moderateScale(16),
  },
  cancelBtn: {
    marginTop: verticalScale(10),
    paddingVertical: verticalScale(12),
    alignItems: "center",
  },
  cancelText: {
    color: "#9E805E",
    fontWeight: "600",
  },
  modalContainer: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    borderRadius: scale(8),
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(16),
  },
  modalIcon: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(8),
    backgroundColor: "#E8F0FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(10),
    borderWidth: 1,
    borderColor: "#1553CD",
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: "600",
  },
  inputWrapper: {
    marginBottom: verticalScale(14),
  },
  inputLabel: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    marginBottom: verticalScale(8),
  },
  textInput: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    fontSize: moderateScale(14),
  },
  readonlyInput: {
    color: "#9CA3AF",
    flex: 1,
  },
  zipcodeField: {
    flexDirection: "row",
    alignItems: "center",
  },
  lockIcon: {
    paddingRight: scale(12),
  },
  zipLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(8),
  },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(2),
    borderRadius: scale(10),
    gap: scale(3),
  },
  lockedText: {
    fontSize: moderateScale(11),
    color: "#6B7280",
    marginLeft: scale(3),
  },
  zipHint: {
    fontSize: moderateScale(11),
    color: "#9CA3AF",
    marginTop: verticalScale(4),
  },
  closeBtn: {
    // backgroundColor: "#004DBD",
    // borderRadius: scale(10),
    // alignItems: "center",
    // justifyContent: "center",
    // paddingVertical: verticalScale(12),
    marginTop: verticalScale(10),
  },
  closeText: {
    color: "#fff",
    fontSize: moderateScale(15),
    fontWeight: "600",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: verticalScale(10),
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: "600",
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    opacity: 0,
  },
  backText: {
    fontSize: moderateScale(14),
    marginLeft: scale(4),
  },
  avatarSection: {
    alignItems: "center",
    marginVertical: verticalScale(10),
  },
  avatarWrapper: {
    width: scale(110),
    height: scale(110),
    borderRadius: scale(55),
    borderWidth: 2,
    borderColor: "#004DBD",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#004DBD",
    borderRadius: scale(12),
    padding: scale(6),
  },
  name: {
    marginTop: verticalScale(10),
    fontSize: moderateScale(22),
    fontWeight: "600",
  },
  role: {
    fontSize: moderateScale(14),
    color: "#6B7280",
    marginTop: verticalScale(4),
  },
  fieldBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: scale(10),
    padding: scale(12),
  },
  fieldText: {
    flex: 1,
    marginLeft: scale(10),
    fontSize: moderateScale(16),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(10),
  },
  buttonRow: {
    // flexDirection: "row",
    // justifyContent: "space-between",
    marginTop: verticalScale(10),
  },
  outlineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#027CC7",
    borderRadius: scale(8),
    alignItems: "center",
    justifyContent: "center",
    height: verticalScale(38),
    marginRight: scale(8),
  },
  outlineText: {
    color: "#fff",
    fontSize: moderateScale(12),
    fontWeight: "700",
  },
  primaryBtn: {
    borderRadius: scale(8),
    alignItems: "center",
    justifyContent: "center",
    width: scale(130),
    height: verticalScale(38),
  },
  primaryText: {
    color: "#fff",
    fontSize: moderateScale(14),
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: scale(14),
  },
  addressRightCol: {
    alignItems: "center",
    gap: verticalScale(6),
  },
  addressLabel: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#656565",
    marginBottom: verticalScale(2),
  },
  zipBadge: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: scale(8),
  },
  zipText: {
    color: "#fff",
    fontSize: moderateScale(12),
  },
  selectBtn: {
    padding: scale(4),
  },
  card: {
    borderRadius: scale(8),
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(13),
  },
  cardTitle: {
    fontSize: moderateScale(20),
    fontWeight: "600",
    marginBottom: verticalScale(6),
  },
  addressText: {
    fontSize: moderateScale(14),
    color: "#374151",
    lineHeight: moderateScale(20),
  },
  emptyText: {
    fontSize: moderateScale(14),
    color: "#9CA3AF",
    textAlign: "center",
    paddingVertical: verticalScale(12),
  },
});
