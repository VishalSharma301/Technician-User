import React, { useContext, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "../../utils/scaling";
import { useNavigation } from "@react-navigation/native";
import { ProfileContext } from "../../store/ProfileContext";
import { AuthContext } from "../../store/AuthContext";
import { updateProfile } from "../../utils/verificationApis";
import { saveProfileData } from "../../utils/setAsyncStorage";
import { AddressContext } from "../../store/AddressContext";

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
};

const GENDERS = ["Male", "Female", "Unknown"] as const;

/* ── Labelled field wrapper ── */
function FieldWrap({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

/* ── Single input row ── */
function InputRow({
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  editable = true,
}: {
  icon: string;
  value: string;
  onChangeText?: (v: string) => void;
  placeholder?: string;
  keyboardType?: any;
  autoCapitalize?: any;
  editable?: boolean;
}) {
  return (
    <View style={styles.inputRow}>
      <View
        style={{
          width: scale(24),
          height: scale(24),
          backgroundColor: C.brownLight,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: moderateScale(6),
        }}
      >
        <Icon name={icon as any} size={moderateScale(16)} color={C.brown} />
      </View>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.placeholder}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
      />
    </View>
  );
}

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { token } = useContext(AuthContext);
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    picture,
    gender,
    setFirstName,
    setLastName,
    setEmail,
    setGender,
  } = useContext(ProfileContext);
  const { selectedAddress } = useContext(AddressContext);

  const [loading, setLoading] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);

  /* Local draft — only commit to context on save */
  const [draft, setDraft] = useState({
    firstName,
    lastName,
    email,
    gender,
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = {
        firstName: draft.firstName,
        lastName: draft.lastName,
        email: draft.email,
        zipcode: selectedAddress?.address?.zipcode || "",
      };
      await updateProfile(payload, token);
      setFirstName(draft.firstName);
      setLastName(draft.lastName);
      setEmail(draft.email);
      setGender(draft.gender);
      await saveProfileData({ gender: draft.gender } as any);
      navigation.goBack();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {loading && (
        <ActivityIndicator
          size="large"
          color={C.brown}
          style={styles.loadingOverlay}
        />
      )}

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", borderWidth: 0, width: "100%" }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Icon name="arrow-left" size={moderateScale(20)} color={C.txt} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: scale(40) }} />
        </View>
        {/* ── Avatar ── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            {picture ? (
              <Image source={{ uri: picture }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Icon
                  name="account-outline"
                  size={moderateScale(36)}
                  color="#fff"
                />
              </View>
            )}
            <TouchableOpacity style={styles.editBadge}>
              <Icon name="pencil" size={moderateScale(12)} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.changePhoto}>Change Photo</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Personal Information ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Information</Text>

          <FieldWrap label="Full Name">
            <InputRow
              icon="account-outline"
              value={`${draft.firstName} ${draft.lastName}`}
              onChangeText={(v) => {
                const [fn, ...rest] = v.split(" ");
                setDraft((d) => ({
                  ...d,
                  firstName: fn,
                  lastName: rest.join(" "),
                }));
              }}
              placeholder="Full Name"
              autoCapitalize="words"
            />
          </FieldWrap>

          <FieldWrap label="Email">
            <InputRow
              icon="email-outline"
              value={draft.email}
              onChangeText={(v) => setDraft((d) => ({ ...d, email: v }))}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </FieldWrap>

          <FieldWrap label="Phone">
            <InputRow
              icon="phone-outline"
              value={phoneNumber || ""}
              placeholder="Phone"
              keyboardType="phone-pad"
              editable={false}
            />
          </FieldWrap>

          <FieldWrap label="Gender">
            <TouchableOpacity
              style={styles.inputRow}
              onPress={() => setShowGenderModal(true)}
              activeOpacity={0.7}
            >
                 <View
        style={{
          width: scale(24),
          height: scale(24),
          backgroundColor: C.brownLight,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: moderateScale(6),
        }}
      >
              <Icon
                name="gender-male-female"
                size={moderateScale(16)}
                color={C.brown}
              />
              </View>
              <Text style={[styles.textInput, { paddingTop: 0 }]}>
                {draft.gender}
              </Text>
              <Icon
                name="chevron-down"
                size={moderateScale(18)}
                color={C.txt3}
              />
            </TouchableOpacity>
          </FieldWrap>
        </View>

       

        {/* ── Save Button ── */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Gender Picker Modal ── */}
      <Modal
        visible={showGenderModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.genderModal}>
            <Text style={styles.genderModalTitle}>Select Gender</Text>
            {GENDERS.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.genderOption}
                onPress={() => {
                  setDraft((d) => ({ ...d, gender: item }));
                  setShowGenderModal(false);
                }}
              >
                <Text style={styles.genderOptionText}>{item}</Text>
                {draft.gender === item && (
                  <Icon name="check" size={moderateScale(18)} color={C.brown} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowGenderModal(false)}
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
  loadingOverlay: {
    position: "absolute",
    inset: 0,
    zIndex: 999,
    backgroundColor: "rgba(255,255,255,0.6)",
  },

  /* header */
  header: {
    // flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    backgroundColor: "#F6EBDE",
    borderBottomLeftRadius: moderateScale(26),
    borderBottomRightRadius: moderateScale(26),
    borderBottomColor: C.border,
    marginBottom: verticalScale(20),
    // backgroundColor: C.bg,
  },
  headerTitle: { fontSize: moderateScale(17), fontWeight: "700", color: C.txt },
  backBtn: { width: scale(40) },

  /* avatar */
  avatarSection: { alignItems: "center", paddingVertical: verticalScale(20) },
  avatarWrap: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    overflow: "visible",
    marginBottom: verticalScale(8),
  },
  avatar: { width: scale(80), height: scale(80), borderRadius: scale(40) },
  avatarPlaceholder: {
    backgroundColor: "#C9A87C",
    alignItems: "center",
    justifyContent: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: C.brown,
    width: scale(26),
    height: scale(26),
    borderRadius: scale(13),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  changePhoto: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: C.brown,
  },

  /* card */
  card: {
    backgroundColor: C.card,
    marginHorizontal: scale(16),
    marginBottom: verticalScale(12),
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: C.border,
    padding: scale(16),
  },
  cardTitle: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: C.brown,
    marginBottom: verticalScale(14),
  },

  /* fields */
  fieldWrap: { marginBottom: verticalScale(12) },
  fieldLabel: {
    fontSize: moderateScale(12),
    color: C.txt3,
    marginBottom: verticalScale(5),
    fontWeight: "500",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
    backgroundColor: C.field,
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(11),
  },
  textInput: {
    flex: 1,
    fontSize: moderateScale(14),
    color: C.txt,
    padding: 0,
  },
  twoCol: { flexDirection: "row", gap: scale(10) },

  /* save button */
  saveBtn: {
    backgroundColor: C.brown,
    marginHorizontal: scale(16),
    marginTop: verticalScale(4),
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: moderateScale(15),
    fontWeight: "600",
  },

  /* gender modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: scale(24),
  },
  genderModal: {
    backgroundColor: C.card,
    borderRadius: moderateScale(16),
    padding: scale(20),
    borderWidth: 1,
    borderColor: C.border,
  },
  genderModalTitle: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: C.txt,
    marginBottom: verticalScale(12),
  },
  genderOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: verticalScale(14),
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  genderOptionText: { fontSize: moderateScale(15), color: C.txt },
  cancelBtn: { paddingTop: verticalScale(14), alignItems: "center" },
  cancelText: {
    fontSize: moderateScale(14),
    color: C.brown,
    fontWeight: "600",
  },
});
