import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "../../utils/scaling";
import { useNavigation } from "@react-navigation/native";
import { AddressContext, AddressCardType } from "../../store/AddressContext";
import { LinearGradient } from "expo-linear-gradient";
import { StackNavigationProp } from "@react-navigation/stack";
import { ProfileStackParamList } from "../../constants/navigation";

const C = {
  bg: "#FFF8F2",
  card: "#FFFFFF",
  field: "#fff",
  border: "#EFD5B7",
  brown: "#864C2D",
  brownLight: "#864C2D1A",
  txt: "#2D1F0F",
  txt2: "#6B5744",
  txt3: "#4D4D4D",
  placeholder: "#B0A090",
  red: "#FF0004",
};

/* Icon config per address label */
const ICON_PRESETS: Record<
  string,
  { icon: string; bg: string; color: string }
> = {
  Home: { icon: "home-outline", bg: "#864C2D1A", color: C.brown },
  Work: { icon: "briefcase-outline", bg: "#FF00041A", color: C.red },
  "Parent House": {
    icon: "map-marker-outline",
    bg: "#1CA1771A",
    color: "#3A7F4B",
  },
  "Friend's Place": {
    icon: "account-group-outline",
    bg: "#FB826433",
    color: "#FB8264",
  },
};
const DEFAULT_ICON = {
  icon: "map-marker-outline",
  bg: C.brownLight,
  color: C.brown,
};

const EMPTY_ADDRESS: AddressCardType = {
  id: "",
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

type Nav = StackNavigationProp<ProfileStackParamList, "MyAddressesScreen">;

export default function MyAddressesScreen() {
  const navigation = useNavigation<Nav>();
  const { addresses, setAddresses, selectedAddress, currentZipcodeAddresses } =
    useContext(AddressContext);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAddr, setEditingAddr] =
    useState<AddressCardType>(EMPTY_ADDRESS);

  // const openAdd = () => {
  //   setEditingAddr({
  //     ...EMPTY_ADDRESS,
  //     address: {
  //       ...EMPTY_ADDRESS.address,
  //       zipcode: selectedAddress?.address?.zipcode || "",
  //     },
  //   });
  //   setIsEditing(false);
  //   setShowModal(true);
  // };

  /* ── Navigate to full-screen picker ── */
  const openAdd = () => {
    navigation.navigate("SelectDeliveryLocationScreen", { isEditing: false });
  };

  const openEdit = (addr: AddressCardType) => {
    navigation.navigate("SelectDeliveryLocationScreen", {
      address: addr,
      isEditing: true,
    });
  };

  // const openEdit = (addr: AddressCardType) => {
  //   setEditingAddr({ ...addr });
  //   setIsEditing(true);
  //   setShowModal(true);
  // };

  const handleDelete = (addr: AddressCardType) => {
    Alert.alert("Delete Address", `Remove "${addr.label}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          setAddresses((prev) => prev.filter((a) => a.id !== addr.id)),
      },
    ]);
  };

  const handleSave = () => {
    if (!editingAddr.label.trim()) return Alert.alert("Label required");
    if (isEditing) {
      setAddresses((prev) =>
        prev.map((a) =>
          a.label === editingAddr.label &&
          a.address.street === editingAddr.address.street
            ? editingAddr
            : a,
        ),
      );
    } else {
      setAddresses((prev) => [...prev, editingAddr]);
    }
    setShowModal(false);
  };

  const updateField = (key: keyof AddressCardType["address"], val: string) =>
    setEditingAddr((prev) => ({
      ...prev,
      address: { ...prev.address, [key]: val },
    }));

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Icon name="arrow-left" size={moderateScale(20)} color={C.txt} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <TouchableOpacity
          style={styles.addHeaderBtn}
          onPress={openAdd}
          activeOpacity={0.8}
        >
          <Icon name="plus" size={moderateScale(14)} color="#fff" />
          <Text style={styles.addHeaderBtnText}>Add New Address</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Security Banner ── */}
        <View style={styles.banner}>
          <Icon name="home-outline" size={moderateScale(22)} color={C.brown} />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>
              Your addresses are safe with us
            </Text>
            <Text style={styles.bannerSub}>
              We use secure encryption to protect your saved addresses.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Saved Address</Text>

        {/* ── Address Cards ── */}
        {currentZipcodeAddresses.map((item, index) => {
          const preset = ICON_PRESETS[item.label] || DEFAULT_ICON;
          const isDefault = index === 0;
          return (
            <View key={`${item.label}-${index}`} style={styles.card}>
              {/* Top row */}
              <View style={styles.cardTop}>
                <View
                  style={[styles.addrIconWrap, { backgroundColor: preset.bg }]}
                >
                  <Icon
                    name={preset.icon as any}
                    size={moderateScale(20)}
                    color={preset.color}
                  />
                </View>
                <View style={styles.addrInfo}>
                  <View style={styles.labelRow}>
                    <Text style={styles.addrLabel}>{item.label}</Text>
                    {isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addrStreet}>
                    {item.address.street}
                    {"\n"}
                    {item.address.city}
                    {item.address.city && item.address.zipcode ? ", " : ""}
                    {item.address.zipcode}, India
                  </Text>
                </View>
                <TouchableOpacity style={styles.threeDot}>
                  <Icon
                    name="dots-vertical"
                    size={moderateScale(18)}
                    color={C.txt3}
                  />
                </TouchableOpacity>
              </View>

              {/* Bottom row */}
              <View style={styles.cardBottom}>
                <View style={styles.phoneRow}>
                  <Icon
                    name="phone-outline"
                    size={moderateScale(13)}
                    color={C.txt3}
                  />
                  <Text style={styles.phoneText}>
                    {item.phone || "+91 98765 43210"}
                  </Text>
                </View>
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => openEdit(item)}
                  >
                    <Icon
                      name="pencil-outline"
                      size={moderateScale(13)}
                      color={C.brown}
                    />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.delBtn}
                    onPress={() => handleDelete(item)}
                  >
                    <Icon
                      name="trash-can-outline"
                      size={moderateScale(13)}
                      color={C.red}
                    />
                    <Text style={styles.delBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        {/* ── Promo Card ── */}
        <View style={styles.promoCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.promoTitle}>Add delivery addresses easily</Text>
            <Text style={styles.promoSub}>
              Save multiple addresses and get your orders delivered where it
              matters.
            </Text>
          </View>
          <Text style={{ fontSize: moderateScale(40) }}>🗺️</Text>
        </View>

        {/* ── Bottom CTA ── */}
        <TouchableOpacity onPress={openAdd} activeOpacity={0.8}>
          <LinearGradient colors={["#BF7D5A", "#733A1C"]} style={styles.addBtn}>
            <Text style={styles.addBtnText}>Add New Address</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Add / Edit Modal ── */}
      <Modal
        visible={false}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <Icon
                  name="map-marker-outline"
                  size={moderateScale(20)}
                  color={C.brown}
                />
              </View>
              <Text style={styles.modalTitle}>
                {isEditing ? "Edit Address" : "Add New Address"}
              </Text>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Label */}
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Label (e.g. Home, Work)</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter label"
                    placeholderTextColor={C.placeholder}
                    value={editingAddr.label}
                    onChangeText={(v) =>
                      setEditingAddr((p) => ({ ...p, label: v }))
                    }
                    editable={!isEditing}
                  />
                </View>
              </View>

              {/* Street */}
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Street Address</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter street"
                    placeholderTextColor={C.placeholder}
                    value={editingAddr.address.street}
                    onChangeText={(v) => updateField("street", v)}
                  />
                </View>
              </View>

              {/* City */}
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>City</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter city"
                    placeholderTextColor={C.placeholder}
                    value={editingAddr.address.city}
                    onChangeText={(v) => updateField("city", v)}
                  />
                </View>
              </View>

              {/* State */}
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>State / Province</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter state"
                    placeholderTextColor={C.placeholder}
                    value={editingAddr.address.state}
                    onChangeText={(v) => updateField("state", v)}
                  />
                </View>
              </View>

              {/* Zipcode — locked */}
              <View style={styles.inputWrap}>
                <View style={styles.zipLabelRow}>
                  <Text style={styles.inputLabel}>Postal Code / Zip</Text>
                  <View style={styles.lockedBadge}>
                    <Icon
                      name="lock-outline"
                      size={moderateScale(11)}
                      color={C.txt3}
                    />
                    <Text style={styles.lockedText}>Auto-filled</Text>
                  </View>
                </View>
                <View style={[styles.inputRow, { opacity: 0.6 }]}>
                  <TextInput
                    style={styles.textInput}
                    value={editingAddr.address.zipcode}
                    editable={false}
                  />
                  <Icon
                    name="lock-outline"
                    size={moderateScale(15)}
                    color={C.placeholder}
                  />
                </View>
                <Text style={styles.zipHint}>
                  Locked to your selected area (
                  {selectedAddress?.address?.zipcode || "—"})
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>Save Address</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { paddingBottom: verticalScale(40) },

  /* header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
    paddingHorizontal: scale(16),
    // marginHorizontal : scale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: "#F6EBDE",
  },
  headerTitle: {
    flex: 1,
    fontSize: moderateScale(17),
    fontWeight: "700",
    color: C.txt,
  },
  backBtn: { padding: scale(2) },
  addHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    backgroundColor: C.brown,
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(8),
  },
  addHeaderBtnText: {
    color: "#fff",
    fontSize: moderateScale(12),
    fontWeight: "600",
  },

  /* banner */
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
    // margin: scale(16),
    backgroundColor: "#F6EBDE",
    // borderRadius: moderateScale(14),
    // borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: scale(14),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(42),
    borderBottomLeftRadius: moderateScale(26),
    borderBottomRightRadius: moderateScale(26),
    marginBottom: verticalScale(16),
  },
  bannerIcon: {
    width: scale(44),
    height: scale(44),
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

  /* section */
  sectionTitle: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: C.brown,
    marginHorizontal: scale(20),
    marginBottom: verticalScale(8),
  },

  /* address card */
  card: {
    backgroundColor: C.card,
    marginHorizontal: scale(16),
    marginBottom: verticalScale(10),
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: C.border,
    padding: scale(14),
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: scale(10) },
  addrIconWrap: {
    width: scale(38),
    height: scale(38),
    borderRadius: moderateScale(10),
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  addrInfo: { flex: 1 },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(7),
    marginBottom: verticalScale(3),
  },
  addrLabel: { fontSize: moderateScale(14), fontWeight: "700", color: C.txt },
  defaultBadge: {
    backgroundColor: C.brownLight,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: moderateScale(20),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(1),
  },
  defaultBadgeText: {
    fontSize: moderateScale(11),
    color: C.brown,
    fontWeight: "500",
  },
  addrStreet: {
    fontSize: moderateScale(12),
    color: C.txt3,
    lineHeight: moderateScale(18),
  },
  threeDot: { padding: scale(2) },

  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: verticalScale(10),
    paddingTop: verticalScale(10),
    // borderTopWidth: 1,
    borderTopColor: C.border,
  },
  phoneRow: { flexDirection: "row", alignItems: "center", gap: scale(4) },
  phoneText: { fontSize: moderateScale(12), color: C.txt3 },
  actionsRow: { flexDirection: "row", gap: scale(14) },
  editBtn: { flexDirection: "row", alignItems: "center", gap: scale(3) },
  editBtnText: {
    fontSize: moderateScale(13),
    fontWeight: "500",
    color: C.brown,
  },
  delBtn: { flexDirection: "row", alignItems: "center", gap: scale(3) },
  delBtnText: { fontSize: moderateScale(13), fontWeight: "500", color: C.red },

  /* promo card */
  promoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF4F0",
    marginHorizontal: scale(16),
    marginBottom: verticalScale(12),
    marginTop: verticalScale(4),
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: C.border,
    padding: scale(14),
    gap: scale(12),
  },
  promoTitle: {
    fontSize: moderateScale(13),
    fontWeight: "700",
    color: C.txt,
    marginBottom: verticalScale(4),
  },
  promoSub: {
    fontSize: moderateScale(11),
    color: C.txt3,
    lineHeight: moderateScale(17),
  },

  /* add button */
  addBtn: {
    // backgroundColor: C.brown,
    marginHorizontal: scale(16),
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    alignItems: "center",
    elevation: 2,
    shadowColor: "#93614026",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addBtnText: { color: "#fff", fontSize: moderateScale(15), fontWeight: "600" },

  /* modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: C.card,
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    padding: scale(20),
    maxHeight: "85%",
    borderTopWidth: 1,
    borderColor: C.border,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
    marginBottom: verticalScale(18),
  },
  modalIconWrap: {
    width: scale(36),
    height: scale(36),
    borderRadius: moderateScale(10),
    backgroundColor: C.brownLight,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: { fontSize: moderateScale(17), fontWeight: "700", color: C.txt },

  inputWrap: { marginBottom: verticalScale(14) },
  inputLabel: {
    fontSize: moderateScale(13),
    color: C.txt2,
    fontWeight: "500",
    marginBottom: verticalScale(6),
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.field,
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
  },
  textInput: { flex: 1, fontSize: moderateScale(14), color: C.txt, padding: 0 },

  zipLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(6),
  },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(3),
    backgroundColor: "#F3F4F6",
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(10),
  },
  lockedText: { fontSize: moderateScale(11), color: C.txt3 },
  zipHint: {
    fontSize: moderateScale(11),
    color: C.placeholder,
    marginTop: verticalScale(4),
  },

  saveBtn: {
    backgroundColor: C.brown,
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    alignItems: "center",
    marginTop: verticalScale(14),
  },
  saveBtnText: {
    color: "#fff",
    fontSize: moderateScale(15),
    fontWeight: "600",
  },
  cancelBtn: { paddingVertical: verticalScale(12), alignItems: "center" },
  cancelText: {
    fontSize: moderateScale(14),
    color: C.brown,
    fontWeight: "600",
  },
});
