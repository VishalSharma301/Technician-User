import React, { useContext } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Button,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { moderateScale, scale, verticalScale } from "../../utils/scaling";
import { useNavigation } from "@react-navigation/native";

import { AuthContext } from "../../store/AuthContext";
import { ProfileContext } from "../../store/ProfileContext";
import ScreenWrapper from "../components/ScreenWrapper";

export default function ProfileScreen() {
  const { logout } = useContext(AuthContext);

  const { firstName, lastName, email, phoneNumber, picture } =
    useContext(ProfileContext);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenWrapper>
        <ScrollView contentContainerStyle={styles.container}>
          
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <Text style={styles.sectionTitle}>Profile</Text>

            <View style={styles.avatarWrapper}>
              <Image source={{ uri: picture }} style={styles.avatar} />
              <LinearGradient
                colors={["#DB9F00", "#FFB800"]}
                style={styles.imageGradient}
              />
            </View>

            <TouchableOpacity
              style={styles.editAvatarBtn}
              onPress={() =>{ }}
            >
              <Icon name="pencil" size={16} color="#FFB800" />
            </TouchableOpacity>

            <Text style={styles.name}>{firstName + " " + lastName}</Text>
          </View>

          {/* Personal Information Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>PERSONAL INFORMATION</Text>
              <TouchableOpacity
                onPress={() => {}}
              >
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.infoText}>{email}</Text>
            <Text style={[styles.infoText, styles.infoSpacing]}>
              {phoneNumber}
            </Text>
          </View>

          <Button title="Logout" onPress={logout} color={"#027CC7"} />
        </ScrollView>
      </ScreenWrapper>
    </SafeAreaView>
  );
}

/* -------------------------------- Styles ------------------------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    paddingBottom: verticalScale(80),
    paddingHorizontal: scale(16),
    marginVertical: verticalScale(16),
    borderRadius: moderateScale(8),
  },

  /* Profile */
  profileSection: {
    alignItems: "center",
    marginBottom: verticalScale(20),
  },

  sectionTitle: {
    fontSize: moderateScale(20),
    fontWeight: "600",
    marginBottom: verticalScale(8),
  },

  avatarWrapper: {
    height: scale(105),
    width: scale(105),
    borderRadius: scale(105 / 2),
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  avatar: {
    width: scale(104),
    height: scale(104),
    borderRadius: scale(52),
    zIndex: 1,
  },

  imageGradient: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  editAvatarBtn: {
    backgroundColor: "#153B93",
    borderRadius: scale(12),
    padding: scale(4),
    position: "absolute",
    top: verticalScale(125),
    right: scale(105),
  },

  name: {
    marginTop: verticalScale(10),
    fontSize: moderateScale(24),
    fontWeight: "600",
  },

  /* Card */
  card: {
    backgroundColor: "#FFFFFF1A",
    borderRadius: scale(8),
    padding: scale(16),
    borderWidth: 1,
    borderColor: "#D9D9D9",
    marginBottom: verticalScale(16),
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(10),
  },

  cardTitle: {
    fontSize: moderateScale(18),
    fontWeight: "500",
  },

  editText: {
    color: "#153B93",
    fontSize: moderateScale(16),
    fontWeight: "500",
  },

  infoText: {
    fontSize: moderateScale(16),
    fontWeight: "400",
  },

  infoSpacing: {
    marginTop: verticalScale(10),
  },
});
