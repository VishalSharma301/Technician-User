import React, { useContext } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  ImageBackground,
  Button,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { moderateScale, scale, verticalScale } from "../../utils/scaling";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
// import IconBox from "../components/IconBox";
// import CustomSwitch from '../../components/CustomSwitch';

import { AuthContext } from "../../store/AuthContext";
import { ProfileContext } from "../../store/ProfileContext";

import { ServicesContext } from "../../store/ServicesContext";

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { logout } = useContext(AuthContext);
  const { services } = useContext(ServicesContext);
  const { firstName, lastName, email, phoneNumber, picture, userId } =
    useContext(ProfileContext);

  const testZip = async () => {
    console.log("pressed :", services[0].options[0]);

    // const { status } = await Location.requestForegroundPermissionsAsync();

    // if (status === "granted") {
    //   const location = await Location.getCurrentPositionAsync({});
    //   console.log("location :::", location);
    // }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}

      {/* <View style={styles.header}>
        <Text style={styles.back}>{'< Back'}</Text>
        <Text style={styles.title}>Profile</Text>
        <Icon name="cog-outline" size={24} color="#000" />
      </View> */}

      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Picture */}
        <View style={styles.profileSection}>
          <Text
            style={{
              fontSize: moderateScale(20),
              fontWeight: "600",
              marginBottom: verticalScale(7),
            }}
          >
            Profile
          </Text>
          <View style={styles.imageSection}>
            <Image source={{ uri: picture }} style={styles.avatar} />
            <LinearGradient
              // Background Linear Gradient
              colors={["#DB9F00", "#FFB800"]}
              style={styles.background}
            />
          </View>
          <TouchableOpacity style={styles.editAvatar}>
            <Icon name="pencil" size={16} color="#FFB800" />
          </TouchableOpacity>
          <Text style={styles.name}>{firstName + " " + lastName}</Text>
          {/* <Text style={styles.role}>HVAC Technician</Text> */}
        </View>

        {/* Personal Info */}
        <View style={styles.card}>
          <View
            style={{
              marginBottom: verticalScale(10),
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.cardTitle}>PERSONAL INFORMATION</Text>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("EditProfileScreen");
              }}
            >
              <Text style={styles.edit}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoRow}>
            {/* <IconBox name="email-outline" style={styles.icon} /> */}
            {/* <Icon name="email-outline" size={20} style={styles.icon} /> */}
            <Text style={styles.infoText}>{email}</Text>
          </View>

          <View style={[styles.infoRow, { marginTop: verticalScale(12) }]}>
            {/* <IconBox name="phone-outline" style={styles.icon} /> */}
            <Text style={styles.infoText}>{phoneNumber}</Text>
          </View>
        </View>

        <Button title="Logout" onPress={logout} disabled={false} />

       
      </ScrollView>
    </SafeAreaView>
  );
}
const shadowStyle = {
  shadowColor: "#ADADAD",
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.09, // approx '17' in hex
  shadowRadius: 5,
  elevation: 5, // Android
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    // justifyContent: "center",
    alignItems: "center",
    // padding: 16,
    // backgroundColor: "#fff",
    // height: verticalScale(28),
    marginTop: verticalScale(10),
    marginBottom: verticalScale(10),
    paddingHorizontal: 22,
    // borderWidth : 1
  },
  back: {
    fontSize: moderateScale(12),
    fontWeight: "500",
    // lineHeight : 16,
    // borderWidth : 1,
    // verticalAlign : 'middle',
    justifyContent: "center",
    width: scale(43),

    // color: "#007bff",
  },
  title: {
    fontSize: moderateScale(20),
    fontWeight: "600",
    marginLeft: scale(38),
    marginRight: scale(127),
    width: scale(114),
    // borderWidth : 1,
    // textAlignVertical : 'center',
    // padding : 0,
    lineHeight: verticalScale(25),
  },
  container: {
    paddingBottom: verticalScale(100),
    paddingHorizontal: scale(20),
  },
  profileSection: {
    alignItems: "center",
    // justifyContent : 'center',
    marginTop: verticalScale(8),
    marginBottom: verticalScale(16),
    // borderWidth : 1

    // elevation : 500,
    // zIndex : 1200,
    // overflow : 'hidden'
  },
  imageSection: {
    height: scale(105),
    width: scale(105),
    borderRadius: scale(105 / 2),
    overflow: "hidden",
    // zIndex : -1
    // borderWidth : 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: scale(104),
    height: scale(104),
    borderRadius: scale(104 / 2),
    elevation: 10,
    zIndex: 1,
    // borderWidth : 1,
    // backgroundColor : 'red',
  },
  background: {
    position: "static",
    left: 0,
    right: 0,
    top: 0,
  },
  editAvatar: {
    backgroundColor: "#153B93",
    borderRadius: scale(12),
    padding: scale(4),
    position: "absolute",
    right: scale(120),
    top: verticalScale(110),
    zIndex: 33,
  },
  name: {
    marginTop: verticalScale(7),
    fontSize: moderateScale(24),
    fontWeight: "600",
    // borderWidth : 1,
    lineHeight: verticalScale(33.6),
  },
  role: {
    fontSize: moderateScale(12),
    fontWeight: "500",
    color: "#666",
    marginTop: verticalScale(3),
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: scale(8),
    paddingRight: scale(16),
    paddingLeft: scale(13),
    paddingVertical: verticalScale(20),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: "#D9D9D9",
  },
  cardTitle: {
    fontWeight: "500",
    fontSize: moderateScale(18),
    // ,
    // borderWidth : 1
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    // justifyContent : 'center'
    // marginBottom: verticalScale(10),
  },
  icon: {
    marginRight: scale(10),
    // color: '#555',
  },
  infoText: {
    // flex: 1,
    fontSize: moderateScale(16),
    fontWeight: "400",
  },
  edit: {
    color: "#153B93",
    fontSize: moderateScale(18),
    fontWeight: "500",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addText: {
    color: "#153B93",
    fontWeight: "500",
    fontSize: moderateScale(18),
  },
  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(9),
    marginTop: verticalScale(10),
    marginBottom: verticalScale(14),
  },
  badge: {
    width: scale(100),
    aspectRatio: 100 / 41,
    // height: 41,
    paddingVertical: verticalScale(12.5),
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: "#B7C8B6",
    backgroundColor: "#F1F6F0",
    alignItems: "center",
    justifyContent: "center",
    ...shadowStyle,
  },
  badgeText: {
    fontSize: moderateScale(12),
    fontWeight: "500",
    color: "#000",
  },
  certRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(4),
  },
  certText: {
    marginLeft: scale(8),
    fontSize: moderateScale(12),
    fontWeight: "500",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(12),
    // borderWidth : 1,
    height: moderateScale(32),
  },
});
