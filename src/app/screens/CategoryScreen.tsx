import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useServices } from "../../hooks/useServices";
import { moderateScale, scale, verticalScale } from "../../utils/scaling";
import { iconMap, IconName } from "../../utils/iconMap";
import GradientBorder from "../components/GradientBorder";
import ScreenWrapper from "../components/ScreenWrapper";
import Header from "../components/Header";
import Tooltip from "../components/Tooltip";
import { useState } from "react";
import CustomNavBar from "../components/CustomNavBar";
import BottomSheet from "../components/BottomSheet";
import BookingBottomSheet from "../components/BookingLogic";
import { ServiceData } from "../../constants/types";
import BadgeCard from "../components/BadgeCard";

export default function CategoryScreen() {
  const { services } = useServices();
  const [showAll, setShowAll] = useState(false);
  const displayedServices = showAll ? services : services.slice(0, 12);
    const [visible, setVisible] = useState(false);
    const [selectedService, setSelectedService] = useState<ServiceData>();
    const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

   function selectBrand(service: ServiceData) {
      setVisible(true);
      setSelectedService(service);
    }

  return (
    <ScreenWrapper >
      <ScrollView style={styles.container}>
      <Header />
      <Text
        style={{
          fontSize: moderateScale(16),
          fontWeight: "500",
          marginTop: verticalScale(20),
        }}
      >
        Browse All Categories
      </Text>
      <View style={{ position: "relative" }}>
        <View style={styles.gridContainer}>
          {services.length === 0 ? (
            <View
              style={{
                alignItems: "center",
                marginTop: verticalScale(20),
                height: verticalScale(150),
                justifyContent: "center",
                // borderWidth : 1,
                alignSelf: "center",
                width: "100%",
              }}
            >
              <Text
                style={{
                  fontSize: moderateScale(14),
                  fontWeight: "600",
                  color: "#000",
                  alignSelf: "center",
                }}
              >
                No Service Provider Available in this area
              </Text>
            </View>
          ) : (
            displayedServices.map((service) => (
              <View
                style={{
                  width: scale(71),
                  marginBottom: verticalScale(17),
                  backgroundColor: "#FFFFFF1A",
                }}
                key={service._id}
              >
                <TouchableOpacity  onPress={() => selectBrand(service)}
                      onLongPress={() => setActiveTooltipId(service._id)}
                      onPressOut={() => setActiveTooltipId(null)}
                      delayLongPress={300}>
                <View
                  key={service._id}
                  style={{
                    width: scale(71),
                    height: scale(67),
                    backgroundColor: "#FFFFFF1A",
                    borderRadius: moderateScale(9),
                    borderWidth: 0.9,
                    borderColor: "#ffffff",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View style={styles.serviceIcon}>
                    <Image
                      source={
                        iconMap[service.icon as IconName] ?? iconMap["default"]
                      }
                      style={{
                        height: "100%",
                        width: "100%",
                        // minHeight: verticalScale(39),
                        // minWidth: scale(39),
                        resizeMode: "contain",
                      }}
                    />
                  </View>
                </View>
                <Text
                  numberOfLines={1}
                  style={{
                    fontWeight: "400",
                    fontSize: moderateScale(14),
                    marginHorizontal: scale(4),
                    marginTop: verticalScale(5),
                  }}
                >
                  {service.name}
                </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
        {/* Expand Button */}
        {/* {services.length > 8 && (
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => setShowAll((prev) => !prev)}
          >
            <ImageBackground
              source={require("../../../assets/expandButton.png")}
              style={styles.buttonImage}
              resizeMode="contain"
            >
              <Text style={[styles.floatingButtonText, showAll && {   bottom: verticalScale(5),}]}>
                {showAll ? "︿" : "﹀"}
              </Text>
              <Text style={[styles.floatingButtonText, showAll && {   bottom: verticalScale(5),}]}>
                {showAll ? "︿" : "﹀"}
              </Text>
            </ImageBackground>
          </TouchableOpacity>
        )} */}
      </View>
      <BadgeCard />
      </ScrollView>
      <CustomNavBar isLocal={'Category'} />
      <BottomSheet visible={visible} onClose={() => setVisible(false)}>
        {selectedService && (
          <BookingBottomSheet
            close={() => setVisible(false)}
            service={selectedService}
          />
        )}
      </BottomSheet>
    </ScreenWrapper>
  );
}
// ˅
const styles = StyleSheet.create({
   container: {
    padding: scale(9),
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    // alignItems : 'center',
    gap: scale(3),
    height: "auto",
    width: scale(375),
    borderWidth: 1,
    borderColor: "#fff",
    paddingHorizontal: scale(19),
    paddingTop: verticalScale(20),
    borderRadius: moderateScale(12),
    marginTop: verticalScale(14),
    backgroundColor: "#FFFFFF1A  ",
  },
  serviceIcon: {
    // marginBottom: verticalScale(6),
    height: verticalScale(50),
    width: scale(59),
    // marginTop: verticalScale(6),
    // marginBottom: verticalScale(2),
  },
  expandButton: {
    // width: scale(46),
    // height : scale(46),
    alignItems: "center",
    paddingVertical: verticalScale(10),
    marginTop: verticalScale(10),
    backgroundColor: "#FFFFFF22",
    borderRadius: moderateScale(46),
  },

  expandButtonText: {
    fontSize: moderateScale(20),
    // borderWidth : 1,
    lineHeight: moderateScale(20),
    fontWeight: "600",
    color: "#fff",
    marginTop: -12,
    position: "relative",
    left: -1,
    bottom: -5,
  },
floatingButton: {
  position: "absolute",
  bottom: verticalScale(-30),      // scaled
  left: "50%",
  transform: [{ translateX: -scale(25) }], // scaled
  width: scale(50),
  height: scale(50),
  zIndex: 10,
  alignItems: "center",
  justifyContent: "center",
},

buttonImage: {
  width: scale(50),
  height: scale(50),
  justifyContent: "center",
  alignItems: "center",
},

floatingButtonText: {
  color: "#fff",
  fontSize: moderateScale(14),
  fontWeight: "700",
  // marginBottom : verticalScale(-12),
  marginTop: verticalScale(-12), // scaled
  lineHeight: moderateScale(20),
  bottom: verticalScale(-5),     // scaled
  left: -1,
},
});
