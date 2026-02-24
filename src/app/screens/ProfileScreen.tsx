import React, { useContext, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  ViewStyle,
  Modal,
  TextInput,
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
import { StackNavigationProp  } from "@react-navigation/stack";


type CCViewProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};
type ProfileScreenNavigationProp =
  StackNavigationProp<ProfileStackParamList>;



function CCView({ children, style }: CCViewProps) {
  return (
    <CustomView
      radius={scale(8)}
      shadowStyle={[{ marginBottom: verticalScale(8) }, style]}
    >
      {children}
    </CustomView>
  );
}

export default function ProfileScreen() {
  const { logout } = useContext(AuthContext);
  const { firstName, lastName, email, phoneNumber, picture } =
    useContext(ProfileContext);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const navigation = useNavigation<ProfileScreenNavigationProp>();

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
              <Icon name="pencil-outline" size={moderateScale(18)} />
            </View>

            <CCView>
              <View style={styles.fieldBox}>
                <Icon name="account-outline" size={18} color="#386CD0" />
                <Text style={styles.fieldText}>
                  {firstName} {lastName}
                </Text>
              </View>
            </CCView>
            <CCView>
              <View style={styles.fieldBox}>
                <Icon name="email-outline" size={18} color="#386CD0" />
                <Text style={styles.fieldText}>{email}</Text>
              </View>
            </CCView>

            <CCView>
              <View style={styles.fieldBox}>
                <Icon name="phone-outline" size={18} color="#386CD0" />
                <Text style={styles.fieldText}>{phoneNumber}</Text>
              </View>
            </CCView>

            <CCView>
              <View style={styles.fieldBox}>
                <Icon name="gender-male-female" size={18} color="#386CD0" />
                <Text style={styles.fieldText}>Gender</Text>
                <Icon name="chevron-down" size={18} />
              </View>
            </CCView>
          </View>
        </CCView>

        {/* Customer Address */}
        <CCView>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Customer Address</Text>

            {[1, 2].map((item) => (
              <CCView key={item}>
                <View style={styles.addressCard}>
                  <Icon
                    name="map-marker-outline"
                    size={20}
                    color="#386CD0"
                    style={{ borderWidth: 0, alignSelf: "baseline" }}
                  />
                  <View style={{ flex: 1, marginLeft: scale(6) }}>
                    <Text style={styles.addressText}>
                      123 Main Street, Apt 4B,
                      {"\n"}New York, NY
                      {"\n"}United States
                    </Text>
                  </View>

                  <LinearGradient
                    style={styles.zipBadge}
                    colors={["#027CC7", "#004DBD"]}
                  >
                    <Text style={styles.zipText}>10001</Text>
                  </LinearGradient>
                </View>
              </CCView>
            ))}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.outlineBtn}
                onPress={() => setShowAddressModal(true)}
              >
                <Text style={styles.outlineText}>Add New Address</Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <LinearGradient
                  style={styles.primaryBtn}
                  colors={["#027CC7", "#004DBD"]}
                >
                  <Text style={styles.primaryText}>Edit</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </CCView>

        <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => logout()}
      >
        <Text style={styles.closeText}>Logout</Text>
      </TouchableOpacity>
      </ScrollView>
      <Modal
  visible={showAddressModal}
  animationType="slide"
  transparent
  onRequestClose={() => setShowAddressModal(false)}
>
  <View style={styles.modalOverlay}>
    <CCView>
    <View style={styles.modalContainer}>
      
      {/* Header */}
      <View style={styles.modalHeader}>
        <View style={styles.modalIcon}>
          <Icon name="map-marker-outline" size={moderateScale(20)} color="#386CD0" />
        </View>
        <Text style={styles.modalTitle}>Address</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {[
          "Street Address",
          "Apartment / Suite",
          "City",
          "State / Province",
          "Postal Code / Zip",
          "Country",
        ].map((label, index) => (
          <View key={index} style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>{label}</Text>
            <CCView>
            <TextInput
              placeholder={`Enter ${label}`}
              placeholderTextColor="#9CA3AF"
              style={styles.textInput}
            />
          </CCView>
          </View>
        ))}
      </ScrollView>

      {/* Close Button */}
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => setShowAddressModal(false)}
      >
        <Text style={styles.closeText}>Save Address</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => setShowAddressModal(false)}
      >
        <Text style={styles.closeText}>Cancel</Text>
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
    backgroundColor: "#F0EFF8",
  },
  container: {
    paddingHorizontal: scale(9),
    paddingBottom: verticalScale(140),
  },
modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.4)",
  justifyContent: "center",
  paddingHorizontal : scale(9),
  // borderWidth : 1
},

modalContainer: {
  // backgroundColor: "#fff",
  // borderTopLeftRadius: scale(20),
  // borderTopRightRadius: scale(20),
  padding: scale(16),
  // margin : scale(9),
  // maxHeight: "85%",
  borderRadius : scale(8)
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
  borderWidth : 1,
  borderColor : '#1553CD'
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
  // backgroundColor: "#F9FAFB",
},

closeBtn: {
  backgroundColor: "#004DBD",
  borderRadius: scale(10),
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: verticalScale(12),
  marginTop: verticalScale(10),
},

closeText: {
  color: "#fff",
  fontSize: moderateScale(15),
  fontWeight: "600",
},

  /* Header */
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: verticalScale(10),
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: "600",
  },

  /* Avatar */
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
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: verticalScale(10),
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

  // headerTitle: {
  //   fontSize: moderateScale(20),
  //   fontWeight: "600",
  // },

  // avatarWrapper: {
  //   width: scale(110),
  //   height: scale(110),
  //   borderRadius: scale(55),
  //   borderWidth: 2,
  //   borderColor: "#386CD0",
  //   justifyContent: "center",
  //   alignItems: "center",
  // },

  fieldBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: scale(10),
    padding: scale(12),
    // height: verticalScale(49),
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
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: verticalScale(10),
  },

  outlineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#027CC7",
    borderRadius: scale(8),
    alignItems: "center",
    justifyContent: "center",
    width: scale(167),
    height: verticalScale(31),
    marginRight: scale(8),
  },

  outlineText: {
    color: "#0164C2",
    fontSize: moderateScale(14),
  },

  primaryBtn: {
    borderRadius: scale(8),
    alignItems: "center",
    justifyContent: "center",
    width: scale(167),
    height: verticalScale(31),
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

  zipBadge: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: scale(8),
  },

  zipText: {
    color: "#fff",
    fontSize: moderateScale(12),
  },

  /* Card */
  card: {
    borderRadius: scale(8),
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(13),
  },
  cardTitle: {
    fontSize: moderateScale(20),
    fontWeight: "600",
    marginBottom: verticalScale(6),
    // borderWidth : 1
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "#F3F4F6",?
    borderRadius: scale(8),
    padding: scale(12),
    // marginBottom: verticalScale(10),
  },
  inputText: {
    flex: 1,
    marginLeft: scale(10),
    fontSize: moderateScale(14),
  },
  editBtn: {
    fontSize: moderateScale(13),
    color: "#000",
  },

  addressBox: {
    flexDirection: "row",
    borderRadius: scale(8),
    padding: scale(12),
  },
  addressText: {
    marginLeft: scale(4),
    fontSize: moderateScale(16),
    color: "#000",
  },

  addressBtnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  addBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#004DBD",
    borderRadius: scale(8),
    padding: scale(10),
    alignItems: "center",
    marginRight: scale(8),
  },
  addBtnText: {
    color: "#004DBD",
    fontSize: moderateScale(14),
  },

  primaryBtnText: {
    color: "#fff",
    fontSize: moderateScale(14),
  },

  /* Settings */
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(15),
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    marginLeft: scale(10),
    fontSize: moderateScale(14),
  },

  logoutBtn: {
    marginTop: verticalScale(20),
    alignItems: "center",
  },
  logoutText: {
    color: "red",
    fontSize: moderateScale(14),
  },
});
