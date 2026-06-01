import React, { useContext } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "../../utils/scaling";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ProfileStackParamList } from "../../constants/navigation";
import { ProfileContext } from "../../store/ProfileContext";
import { AuthContext } from "../../store/AuthContext";
import CustomNavBar from "../components/CustomNavBar";

type Nav = StackNavigationProp<ProfileStackParamList>;

const C = {
  bg: "#FFF8F2",
  card: "#FFFFFF",
  border: "#EFD5B7",
  brown: "#864C2D",
  brownLight: "#864C2D1A",
  txt: "#864C2D",
  txt2: "#864C2D",
  txt3: "#4D4D4D",
};

/* ── Reusable menu row ── */
type MenuItemProps = {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  last?: boolean;
};

function MenuItem({ icon, iconBg, iconColor, title, subtitle, onPress, last }: MenuItemProps) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, !last && styles.menuItemBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIcon, { backgroundColor: C.brownLight }]}>
        <Icon name={icon as any} size={moderateScale(20)} color={C.brown} />
      </View>
      <View style={styles.menuTxt}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSub}>{subtitle}</Text>
      </View>
      <Icon name="chevron-right" size={moderateScale(20)} color={C.txt3} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { firstName, lastName, phoneNumber, picture } = useContext(ProfileContext);
  const { logout } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        {/* <View style={styles.header}>
          <View style={{ width: scale(48) }} />
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("AccountHealthScreen")}
            style={{ width: scale(48), alignItems: "flex-end" }}
          >
            <Icon name="cog-outline" size={moderateScale(22)} color={C.txt2} />
          </TouchableOpacity>
        </View> */}

        {/* ── Avatar ── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            {picture ? (
              <Image source={{ uri: picture }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Icon name="account-outline" size={moderateScale(38)} color="#fff" />
              </View>
            )}
          </View>
          <Text style={styles.name}>
            {firstName} {lastName}
          </Text>
          <View style={styles.infoRow}>
            <Icon name="phone-outline" size={moderateScale(14)} color={C.txt2} />
            <Text style={styles.infoText}>{phoneNumber || "+91 98765 43210"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="map-marker-outline" size={moderateScale(14)} color={C.txt2} />
            <Text style={styles.infoText}>Sector 17, Chandigarh</Text>
          </View>
        </View>

        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: "#864C2D1F", borderColor: "#864C2D80" }]}>
            <Text style={[styles.statNum, { color: C.brown }]}>03</Text>
            <Text style={[styles.statLbl, { color: C.brown }]}>Bookings</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: "#FEF3C7", borderColor: "#DD851C" }]}>
            <Text style={[styles.statNum, { color: "#DD851C" }]}>320</Text>
            <Text style={[styles.statLbl, { color: "#DD851C" }]}>Coins</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: "#D1FAE5", borderColor: "#1CA177" }]}>
            <Text style={[styles.statNum, { color: "#1CA177" }]}>4.9 ⭐</Text>
            <Text style={[styles.statLbl, { color: "#1CA177" }]}>Rating</Text>
          </View>
        </View>

        {/* ── Account ── */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <MenuItem
            icon="account-circle-outline"
            iconBg="#F0E8FF"
            iconColor="#7B5EA7"
            title="Edit Profile"
            subtitle="Name, email, gender"
            onPress={() => navigation.navigate("EditProfileScreen")}
          />
          <MenuItem
            icon="map-marker-outline"
            iconBg="#FFF0E8"
            iconColor={C.brown}
            title="My Addresses"
            subtitle="Saved locations"
            onPress={() => navigation.navigate("MyAddressesScreen")}
            last
          />
        </View>

        {/* ── Support ── */}
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.card}>
          <MenuItem
            icon="lifebuoy"
            iconBg="#FFF0E8"
            iconColor={C.brown}
            title="Help & Support"
            subtitle="FAQs & contact"
            onPress={() => navigation.navigate("HelpAndSupportScreen")}
          />
          <MenuItem
            icon="star-outline"
            iconBg="#FFF8E7"
            iconColor="#C9851A"
            title="Rate Fuvay App"
            subtitle="Share feedback"
            onPress={() => {}}
            last
          />
        </View>

        {/* ── Logout ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
      <CustomNavBar isLocal="Profile" />
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
    justifyContent: "space-between",
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(6),
    // backgroundColor : '#F6EBDE'
  },
  headerTitle: { fontSize: moderateScale(18), fontWeight: "700", color: C.txt },

  /* avatar */
  avatarSection: { alignItems: "center", paddingVertical: verticalScale(14) , backgroundColor : '#F6EBDE'},
  avatarWrap: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    borderWidth: 2,
    borderColor: "#D4A57C",
    overflow: "hidden",
    marginBottom: verticalScale(8),
  },
  avatar: { width: "100%", height: "100%" },
  avatarPlaceholder: {
    backgroundColor: "#C9A87C",
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: moderateScale(18), fontWeight: "700", color: C.txt, marginBottom: verticalScale(4) },
  infoRow: { flexDirection: "row", alignItems: "center", gap: scale(5), marginBottom: verticalScale(2) },
  infoText: { fontSize: moderateScale(13), color: C.txt2 },

  /* stats */
  statsRow: {
    flexDirection: "row",
    justifyContent : 'center',
    alignItems: "center",
    gap: scale(8),
    paddingHorizontal: scale(16),
    paddingBottom : verticalScale(31),
    
    marginBottom: verticalScale(16),
    backgroundColor : '#F6EBDE',
    borderBottomLeftRadius : moderateScale(26),
    borderBottomRightRadius : moderateScale(26)
  },
  statBox: {
    // flex: 1,
    width : '28%',
    borderRadius: moderateScale(10),
    borderWidth: 1,
    paddingVertical: verticalScale(10),
    alignItems: "center",
  },
  statNum: { fontSize: moderateScale(20), fontWeight: "700" },
  statLbl: { fontSize: moderateScale(11), fontWeight: "500", marginTop: verticalScale(2) },

  /* section */
  sectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: C.txt2,
    marginHorizontal: scale(20),
    marginBottom: verticalScale(8),
    marginTop: verticalScale(4),
  },

  /* card */
  card: {
    backgroundColor: C.card,
    marginHorizontal: scale(16),
    marginBottom: verticalScale(12),
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  menuIcon: {
    width: scale(38),
    height: scale(38),
    borderRadius: moderateScale(10),
    alignItems: "center",
    justifyContent: "center",
  },
  menuTxt: { flex: 1 },
  menuTitle: { fontSize: moderateScale(14), fontWeight: "600", color: '#000', marginBottom: verticalScale(2) },
  menuSub: { fontSize: moderateScale(12), color: C.txt3 },

  /* logout */
  logoutBtn: {
    backgroundColor: C.brown,
    marginHorizontal: scale(16),
    marginTop: verticalScale(8),
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    alignItems: "center",
  },
  logoutText: { color: "#fff", fontSize: moderateScale(15), fontWeight: "600" },
});