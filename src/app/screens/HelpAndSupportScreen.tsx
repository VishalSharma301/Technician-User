import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "../../utils/scaling";
import { useNavigation } from "@react-navigation/native";

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

/* ── Reusable menu row ── */
type MenuRowProps = {
  icon: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  last?: boolean;
};

function MenuRow({ icon, title, subtitle, onPress, last }: MenuRowProps) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, !last && styles.menuBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuIcon}>
        <Icon name={icon as any} size={moderateScale(16)} color={C.brown} />
      </View>
      <View style={styles.menuTxt}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSub}>{subtitle}</Text>
      </View>
      <Icon name="chevron-right" size={moderateScale(20)} color={C.txt3} />
    </TouchableOpacity>
  );
}

export default function HelpSupportScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Icon name="arrow-left" size={moderateScale(20)} color={C.brown} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: scale(40) }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ── How can we help banner ── */}
        <View style={styles.helpBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.helpTitle}>How can we help you?</Text>
            <Text style={styles.helpSub}>
              We're here to assist you with any{"\n"}questions or issues
            </Text>
          </View>
          {/* Layered speech-bubble icon */}
          <View style={styles.bubbleWrap}>
            <View style={styles.bubbleSmall}>
              <Icon name="question" size={moderateScale(14)} color="#fff" />
            </View>
            <View style={styles.bubbleLarge}>
              <Icon name="help" size={moderateScale(24)} color="#fff" />
            </View>
          </View>
        </View>

        {/* ── Quick Support ── */}
        <Text style={styles.sectionTitle}>Quick Support</Text>
        <View style={styles.card}>
          <MenuRow
            icon="frequently-asked-questions"
            title="FAQs"
            subtitle="Find answers to common questions"
            onPress={() => {}}
          />
          <MenuRow
            icon="message-outline"
            title="Contact Us"
            subtitle="Get in touch with our support team"
            onPress={() => {}}
          />
          <MenuRow
            icon="phone-in-talk-outline"
            title="Call Support"
            subtitle="Talk to our support executive"
            onPress={() => Linking.openURL("tel:+918008001234")}
          />
          <MenuRow
            icon="alert-circle-outline"
            title="Report an Issue"
            subtitle="Let us know if something isn't working"
            onPress={() => {}}
            last
          />
        </View>

        {/* ── Helpful Resources ── */}
        <Text style={styles.sectionTitle}>Helpful Resources</Text>
        <View style={styles.card}>
          <MenuRow
            icon="shield-check-outline"
            title="Safety & Security"
            subtitle="Learn how we keep you safe"
            onPress={() => {}}
          />
          <MenuRow
            icon="file-document-outline"
            title="Terms & Policies"
            subtitle="Read our terms, privacy & policies"
            onPress={() => {}}
            last
          />
        </View>

        {/* ── Need more help banner ── */}
        <View style={styles.needHelpBanner}>
            <Icon name="headset" size={moderateScale(22)} color={C.brown} />
          <View style={{ flex: 1 }}>
            <Text style={styles.needHelpTitle}>Need more help?</Text>
            <Text style={styles.needHelpSub}>
              Our support team is available 24/7 to assist you.
            </Text>
          </View>
        </View>
      </ScrollView>
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
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: '#F6EBDE',
  },
  headerTitle: { fontSize: moderateScale(17), fontWeight: "700", color: C.brown },
  backBtn: { width: scale(40), color : C.brown },

  /* help banner */
  helpBanner: {
    flexDirection: "row",
    alignItems: "center",
     backgroundColor: '#F6EBDE',
  borderColor: C.border,
      paddingHorizontal: scale(16),
      paddingTop : verticalScale(16),
      paddingBottom : verticalScale(42),
      borderBottomLeftRadius: moderateScale(26),
      borderBottomRightRadius: moderateScale(26),
      marginBottom : verticalScale(16)
  },
  helpTitle: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: C.brown,
    marginBottom: verticalScale(4),
  },
  helpSub: {
    fontSize: moderateScale(12),
    color: C.txt3,
    lineHeight: moderateScale(18),
  },

  /* layered bubble icons */
  bubbleWrap: {
    width: scale(56),
    height: scale(56),
    position: "relative",
  },
  bubbleSmall: {
    position: "absolute",
    top: 0,
    left: 0,
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    backgroundColor: "#C9956C",
    alignItems: "center",
    justifyContent: "center",
  },
  bubbleLarge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: C.brown,
    alignItems: "center",
    justifyContent: "center",
  },

  /* section */
  sectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: C.brown,
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
  menuBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  menuIcon: {
    width: scale(34),
    height: scale(34),
    borderRadius: moderateScale(10),
    backgroundColor: C.brownLight,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTxt: { flex: 1 },
  menuTitle: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: C.txt,
    marginBottom: verticalScale(2),
  },
  menuSub: { fontSize: moderateScale(12), color: C.txt3 },

  /* need more help banner */
  needHelpBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
    backgroundColor: "#F6EBDE",
    marginHorizontal: scale(16),
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: C.border,
    padding: scale(16),
  },
  headsetIcon: {
    width: scale(42),
    height: scale(42),
    borderRadius: scale(21),
    backgroundColor: C.brownLight,
    alignItems: "center",
    justifyContent: "center",
  },
  needHelpTitle: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: C.brown,
    marginBottom: verticalScale(2),
  },
  needHelpSub: { fontSize: moderateScale(12), color: C.txt3 },
});
