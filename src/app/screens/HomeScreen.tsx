import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  ImageBackground,
} from "react-native";
import { Ionicons as Icon } from "@expo/vector-icons";
import { moderateScale, scale, verticalScale } from "../../utils/scaling";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import GradientBorder from "../components/GradientBorder";
import { iconMap, IconName } from "../../utils/iconMap2";
import ScreenWrapper from "../components/ScreenWrapper";
import ServiceBottomSheet from "../components/BottomSheet";
import Header from "../components/Header";
import CustomNavBar from "../components/CustomNavBar";
import BottomSheet from "../components/BottomSheet";
import BookingBottomSheet from "../components/BookingLogic";

const { height, width } = Dimensions.get("screen");
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const categories = ["Popular", "Emergency", "Seasonal", "Daily Use"];

interface Service {
  name: string;
  icon: IconName;
}

const services: Service[] = [
  { name: "Plumbing", icon: "plumbing" },
  { name: "Electricity", icon: "electricity" },
  { name: "Drywall Rep", icon: "drywall" },
  { name: "Painting", icon: "painting" },
  { name: "Roof Clearn", icon: "roof" },
  { name: "Moving", icon: "moving" },
  { name: "HVAC", icon: "hvac" },
  { name: "Fencing", icon: "fencing" },
  { name: "Appliances", icon: "appliances" },
  { name: "Water Heat", icon: "water" },
  { name: "Painting", icon: "painting" },
  { name: "Plumbing", icon: "plumbing" },
];

const HomeScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
    const bottomSheetRef = useRef<React.ComponentRef<typeof BottomSheet> | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);

    const [visible, setVisible] = useState(false);

  


  return (
    <ScreenWrapper>
      <ScrollView style={styles.container}>
        {/* Top Bar */}
       <Header />

        {/* Pin Section */}
        <View style={styles.pinContainer}>
          <Text style={styles.pinText}>Pin - 210210</Text>
          <Icon
            name="pencil-outline"
            size={moderateScale(16)}
            color="#1E1E1E80"
          />
        </View>
        <View
          style={{
            borderWidth: 0.7,
            borderColor: "#ffffffcd",
            paddingHorizontal: scale(11),
            borderRadius: moderateScale(12),
            marginTop: verticalScale(9),
            paddingTop: verticalScale(16),
            paddingBottom: verticalScale(8),
            backgroundColor: "#FFFFFF1A",
            //   height: verticalScale(353),
          }}
        >
          {/* Category Tabs */}
          <View style={styles.categoriesContainer}>
            {categories.map((cat) => (
              <GradientBorder
                borderRadius={scale(23.6)}
                borderWidth={scale(0.98)}
                style={[
                  styles.categoryButton,
                  selectedCategory === cat && styles.activeCategory,
                ]}
                key={cat}
              >
                <TouchableOpacity onPress={() => setSelectedCategory(cat)}>
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === cat && styles.activeCategoryText,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              </GradientBorder>
            ))}
          </View>

          {/* Services Grid */}
          <View style={styles.gridContainer}>
            {services.map((service, index) => (
              <GradientBorder
                key={index}
                gradientStyle={{ marginBottom: verticalScale(10) }}
                style={{
                  width: scale(74.75),
                  aspectRatio: 1,
                  backgroundColor: "#E8E8E8",
                  shadowColor: "#000",
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 3,
                }}
              >
                <TouchableOpacity
                  key={index}
                  style={styles.serviceCard}
                  onPress={() =>{
                  setVisible(true)
                    }}
                >
                  <View style={styles.serviceIcon}>
                    <Image
                      source={iconMap[service.icon]}
                      style={{
                        height: "100%",
                        width: "100%",
                        minHeight: verticalScale(39),
                        minWidth: scale(39),
                        resizeMode: "contain",
                        //   borderWidth: 1,
                      }}
                    />
                  </View>
                  <Text style={styles.serviceText}>{service.name}</Text>
                </TouchableOpacity>
              </GradientBorder>
            ))}
          </View>
        </View>
        {/* Badges Section */}
        <View style={styles.badgesRow}>
          <Image
            source={require("../../../assets/badges/badge2.png")}
            style={styles.badgeIcon}
          />
          <Image
            source={require("../../../assets/badges/badge3.png")}
            style={styles.badgeIcon}
          />
          <Image
            source={require("../../../assets/badges/badge1.png")}
            style={styles.badgeIcon}
          />
        </View>

        {/* Technician of the Week */}
        <Text style={styles.techHeader}>Technician Of The Week</Text>
        <View style={styles.techCard}>
          <View style={styles.techInfo}>
            <View
              style={{
                width: scale(45),
                aspectRatio: 1,
                borderWidth: 1,
                borderColor: "#fff",
                borderRadius: moderateScale(10),
                alignItems: "center",
                justifyContent: "center",
                marginRight: scale(10),
              }}
            >
              <Image
                source={require("../../../assets/AcOut.png")}
                style={styles.techImage}
              />
            </View>
            <View>
              <Text style={styles.techName}>Single Ac Service 🛡️</Text>
              <Text style={styles.techDesc}>Ac Services • 4.5 ⭐</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.cartButton}>
            <Image
              source={require("../../../assets/cart.png")}
              style={{
                width: scale(22),
                height: scale(22),
                resizeMode: "cover",
              }}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
        <CustomNavBar isLocal={true}/>
        <BottomSheet visible={visible} >
        <BookingBottomSheet close={()=>setVisible(false)} />
      </BottomSheet>
    </ScreenWrapper>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    padding: scale(9),
  },

 

  pinContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: verticalScale(8),
    marginLeft: scale(3),
  },
  pinText: {
    color: "#1e1e1ead",
    fontSize: moderateScale(12),
    fontWeight: "600",
    marginRight: scale(5),
  },

  categoriesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(8),
    gap: scale(3.93),
  },
  categoryButton: {
    backgroundColor: "#F1F1F1",
    borderRadius: moderateScale(23.6),
    height: verticalScale(36.66),
    width: scale(80),
    alignItems: "center",
    justifyContent: "center",
  },
  activeCategory: {
    backgroundColor: "#027CC7",
  },
  categoryText: {
    color: "#000",
    fontSize: moderateScale(13.77),
    fontWeight: "400",
  },
  activeCategoryText: {
    color: "#fff",
  },

  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  serviceCard: {
    width: scale(74.75),
    aspectRatio: 1,
    backgroundColor: "#E8E8E8",
    alignItems: "center",
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(8),
    marginBottom: verticalScale(12),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  serviceIcon: {
    // marginBottom: verticalScale(6),
    height: verticalScale(41),
    width: scale(50),
  },
  iconText: { fontSize: moderateScale(24) },
  serviceText: {
    fontSize: moderateScale(12),
    color: "#000",
    textAlign: "center",
    fontWeight: "400",
    // borderWidth: 1,
  },

  badgesRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: verticalScale(20),
    borderWidth: 0.7,
    borderColor: "#fff",
    height: verticalScale(113),
    width: scale(373),
    alignSelf: "center",
    alignItems: "center",
    gap: scale(32),
    borderRadius: scale(12),
    backgroundColor: "#FFFFFF1A",
  },
  badgeIcon: { width: scale(73), height: scale(73), resizeMode: "contain" },
  techHeader: {
    fontWeight: "600",
    fontSize: moderateScale(16),
    marginBottom: verticalScale(8),
    marginTop: verticalScale(16),
    marginLeft: scale(1),
  },
  techCard: {
    backgroundColor: "#D4D4D440",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: scale(12),
    borderRadius: moderateScale(16),
    borderWidth: 2,
    borderColor: "#fff",
    height: verticalScale(74),
    // shadowColor: "#000",
    // shadowOpacity: 0.05,
    // shadowRadius: 3,
    // elevation: 2,
    marginBottom: verticalScale(20),
  },
  techInfo: { flexDirection: "row", alignItems: "center" },
  techImage: {
    width: scale(33),
    height: scale(31),
    borderRadius: moderateScale(10),

    resizeMode: "cover",
  },
  techName: { fontWeight: "600", fontSize: moderateScale(14) },
  techDesc: { color: "#555", fontSize: moderateScale(12) },
  cartButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: moderateScale(10),
    padding: scale(6),
  },
});
