import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
} from "react-native";
import { Ionicons as Icon } from "@expo/vector-icons";
import { moderateScale, scale, verticalScale } from "../../utils/scaling";
import GradientBorder from "../components/GradientBorder";
import ScreenWrapper from "../components/ScreenWrapper";
import ServiceBottomSheet from "../components/BottomSheet";
import Header from "../components/Header";
import CustomNavBar from "../components/CustomNavBar";
import BottomSheet from "../components/BottomSheet";
import BookingBottomSheet from "../components/BookingLogic";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import { useAddress } from "../../hooks/useAddress";
import { useServices } from "../../hooks/useServices";
import {
  fetchBrandsByZip,
  fetchServiceDetails,
  fetchServicesByZip,
  getServiceConversationDetails,
} from "../../utils/servicesApi";
import { ServiceData } from "../../constants/types";
import { innerColors, outerColors } from "../../constants/colors";
import Tooltip from "../components/Tooltip";
import { iconMap, IconName } from "../../utils/iconMap";
import ServiceOfTheWeek from "../components/Slider";
import BookingChatBot from "../components/BookingChatBot";
import Recorder from "../components/BookingChatBot";
import ChatbotBooking from "../components/ChatBot";
import CB1 from "../components/CB1";
import ChatbotBooking_NewFlow from "../components/ChatBot2";
import ChatbotBooking3 from "../components/CC4";
import ChatbotEngine from "../components/cbbcc/CB5";
import ChatbotBooking4 from "../components/CC4";
import ChatbotBookingSimpleRewind from "../components/CC5";
import ChatbotBookingManualUI from "../components/CC5";
import Chatbot6 from "../components/CC6";

const categories = ["Popular", "Emergency", "Seasonal", "Daily Use"];

interface Service {
  name: string;
  icon: IconName;
}
type ServiceObject = {
  data: ServiceData;
  zipcode: string;
};

const HomeScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const { setIsLoading } = useAuth();
  const {} = useProfile();
  const { selectedAddress, setZipcode } = useAddress();
  const [userAddresses] = useState([
    "123 Main Street, New York, NY 10001",
    "456 Park Avenue, Brooklyn, NY 11201",
    "789 Broadway, Queens, NY 11355",
  ]);
  const {
    setBrands,
    setServices,
    services,
    brands,
    popularServices,
    dailyNeedServices,
    quickPickServices,
    mostBookedServices,
  } = useServices();
  const [pinVisible, setPinVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  // const [selectedService, setSelectedService] = useState<ServiceData>();
  const [selectedServiceObject, setSelectedServiceObject] =
    useState<ServiceObject>();
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  const servicess =
    selectedCategory === "Popular"
      ? popularServices
      : selectedCategory === "Daily Use"
      ? dailyNeedServices
      : selectedCategory === "Seasonal"
      ? quickPickServices
      : services;

  const zipcode = selectedAddress.address.zipcode;
  // console.log("services fetched");

  const serviceOfTheWeek = useMemo(() => {
    return mostBookedServices.length > 0 ? mostBookedServices[0] : null;
  }, [mostBookedServices]);

  useEffect(() => {
    console.log(selectedAddress);

    async function getAllServices() {
      if (!zipcode) return; // safety

      try {
        setIsLoading(true);
        console.log("fetching services");

        const servicesRes = await fetchServicesByZip(zipcode);
        const brandsRes = await fetchBrandsByZip(zipcode);

        console.log(servicesRes ? "🔧 Services fetched:" : "services failed");

        setServices(servicesRes.data);
        setBrands(brandsRes.data);

        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error("❌ Failed to get services:", error);
      }
    }

    getAllServices();
  }, [zipcode]);

  const ChangePinCode = () => {
    const [pin, setPin] = useState("");
    return (
      <ImageBackground
        source={require("../../../assets/bottomWrapper.png")}
        style={{ width: "100%", alignSelf: "flex-start" }}
        resizeMode="cover"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Change Pin Code</Text>

          <View style={styles.inputContainer}>
            <Icon
              name="location-sharp"
              size={moderateScale(16)}
              color="#FF3B30"
              style={{ marginRight: scale(6) }}
            />

            <TextInput
              style={styles.input}
              value={pin}
              placeholder="Enter Pin Code"
              keyboardType="numeric"
              maxLength={6}
              onChangeText={setPin}
            />
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={() => {
              console.log("pin", pin);

              setZipcode(pin);

              setPinVisible(false);
            }}
          >
            <Text style={styles.submitText}>SUBMIT</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  };

  // async function serviceDetails(id: string) {
  //   // const data =   await getServiceConversationDetails(id,'140802')
  //   const data = await fetchServiceDetails(id, "140802");
  //   console.log("data2", data);
  // }

  async function selectBrand(service: ServiceData) {
    const clickedService = await fetchServiceDetails(service._id, "140802");
    if (clickedService) {
      console.log("service : ", clickedService);

      setSelectedServiceObject(clickedService);
      setVisible(true);
    }
  }

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container}>
        {/* Top Bar */}
        <Header />

        {/* Pin Section */}
        <TouchableOpacity
          onPress={() => setPinVisible((prev) => !prev)}
          style={styles.pinContainer}
        >
          <Text style={styles.pinText}>
            Pin - {selectedAddress.address.zipcode}
          </Text>
          <Icon
            name="pencil-outline"
            size={moderateScale(16)}
            color="#1E1E1E80"
          />
        </TouchableOpacity>
        <View
          style={{
            borderWidth: 0.7,
            borderColor: "#ffffffcd",
            paddingHorizontal: scale(11),
            borderRadius: moderateScale(12),
            marginTop: verticalScale(9),
            paddingTop: verticalScale(16),
            paddingBottom: verticalScale(10),
            backgroundColor: "#FFFFFF1A",
            // height: verticalScale(353),
          }}
        >
          {/* Category Tabs */}
          <View style={styles.categoriesContainer}>
            {categories.map((cat) => (
              <GradientBorder
                borderRadius={scale(23.6)}
                outerWidth={0.2}
                innerWidth={0.8}
                innerColors={outerColors}
                outerColors={innerColors}
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
          {/* Services Grid */}
          <View style={styles.gridContainer}>
            {servicess.length === 0 ? (
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
              servicess.map((service) => (
                //   <View  key={service._id} style={{ borderWidth:0,  height: verticalScale(94), width : scale(85)}}>
                //  {/* Tooltip */}
                //     {activeTooltipId === service._id && (
                //       <Tooltip text={service.name} />
                //     )}
                //   <ImageBackground
                //     key={service._id}
                //     source={require("../../../assets/vv.png")}
                //     resizeMode="contain"
                //     style={{
                //       height: verticalScale(140),
                //       width: scale(110),
                //       // borderWidth: 1,
                //       alignItems: "center",
                //       marginHorizontal: -12,

                //       // marginLeft : -14,
                //       // marginRight : -10,
                //       // marginVertical: -10,
                //       // marginTop : verticalScale(2),

                //     }}
                //   >

                //     <TouchableOpacity
                //       style={styles.serviceCard}
                //       onPress={() => selectBrand(service)}
                //       onLongPress={() => setActiveTooltipId(service._id)}
                //       onPressOut={() => setActiveTooltipId(null)}
                //       delayLongPress={300}
                //     >
                //       <View style={styles.serviceIcon}>
                //         <Image
                //           source={
                //             iconMap[service.icon as IconName] ??
                //             iconMap["default"]
                //           }
                //           style={{
                //             height: "100%",
                //             width: "100%",
                //             minHeight: verticalScale(39),
                //             minWidth: scale(39),
                //             resizeMode: "contain",
                //           }}
                //         />
                //       </View>

                //       <Text
                //         numberOfLines={1}
                //         ellipsizeMode="tail"
                //         style={styles.serviceText}
                //       >
                //         {service.name}
                //       </Text>
                //     </TouchableOpacity>
                //   </ImageBackground>
                //   </View>
                <View
                  key={service._id}
                  style={{
                    shadowColor: "#000",
                    shadowOpacity: 0.05,
                    shadowRadius: 3,
                    paddingBottom: verticalScale(10),
                  }}
                >
                  <GradientBorder
                    key={service._id}
                    gradientStyle={{}}
                    style={{
                      width: scale(80),
                      height: scale(80),
                      backgroundColor: "#E8E8E8",
                      alignItems: "center",
                      justifyContent: "center",
                      // borderWidth: 1,

                      // elevation: 7,
                      position: "relative",
                      //                 shadowColor: "#000",
                      // shadowOpacity: 0.05,
                      // shadowRadius: 3,
                      // elevation: 2,
                    }}
                  >
                    {/* Tooltip */}
                    {activeTooltipId === service._id && (
                      <Tooltip text={service.name} />
                    )}

                    <TouchableOpacity
                      style={styles.serviceCard}
                      onPress={() => selectBrand(service)}
                      // onPress={() => serviceDetails(service._id)}
                      // onPress={() => setVisible(!visible)}
                      onLongPress={() => setActiveTooltipId(service._id)}
                      onPressOut={() => setActiveTooltipId(null)}
                      delayLongPress={300}
                    >
                      <View style={styles.serviceIcon}>
                        <Image
                          source={
                            iconMap[service.icon as IconName] ??
                            iconMap["default"]
                          }
                          style={{
                            height: "100%",
                            width: "100%",
                            minHeight: verticalScale(39),
                            minWidth: scale(39),
                            resizeMode: "contain",
                          }}
                        />
                      </View>

                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={styles.serviceText}
                      >
                        {service.name}
                      </Text>
                    </TouchableOpacity>
                  </GradientBorder>
                </View>
              ))
            )}
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
        <Text style={styles.techHeader}>Service Of The Week</Text>

        <ServiceOfTheWeek
          onPressService={(serviceOfTheWeek) => selectBrand(serviceOfTheWeek)}
        />
      </ScrollView>
      <CustomNavBar isLocal={"Home"} />
      {/* <BottomSheet visible={visible} onClose={() => setVisible(false)}> */}
      {visible && (
        <View style={{ height: "100%" }}>
          {/* <ChatbotBooking3
            serviceObject={selectedServiceObject!}
            close={() => setVisible(false)}
          />   */}
          {/* <ChatbotEngine  backend={{
    service: selectedServiceObject?.data,
    conversationSteps: selectedServiceObject?.data?.conversationSteps,
    conversationSettings: selectedServiceObject?.data?.conversationSettings
  }}/> */}
          {/* <ChatbotBooking4
            serviceObject={selectedServiceObject!}
            close={() => setVisible(false)}
          /> */}

          {/* <ChatbotBookingManualUI serviceObject={selectedServiceObject!}
            onClose={() => setVisible(false)} /> */}
          
          <Chatbot6 serviceObject={selectedServiceObject!}
            onClose={() => setVisible(false)} />
          {/* <ChatbotEngine
        serviceData={selectedServiceObject?.data!}
        userAddresses={userAddresses}
        onComplete={()=>{}}
        onCancel={()=> setVisible(false)}
      /> */}

          {/* <ChatbotBooking_NewFlow
            serviceObject={selectedServiceObject!}
            close={() => setVisible(false)}
          />   */}
        </View>
      )}
      {/* <View
        style={{
          height: "100%",
          opacity: 1,
          display: visible ? "flex" : "none",
          // borderWidth: 1,
        }}
      > */}
      {/* <Recorder /> */}
      {/* {selectedService && <CB1 service={selectedService} close={() => setVisible(false)} />} */}
      {/* {selectedService && <ChatbotBooking service={selectedService} close={() => setVisible(false)} />} */}
      {/* {selectedService && (
          <ChatbotBooking_NewFlow
            service={selectedService}
            close={() => setVisible(false)}
          />
        )} */}
      {/* {selectedService && (
          <BookingBottomSheet
            close={() => setVisible(false)}
            service={selectedService}
          />

         
        )} */}
      {/* </View> */}
      {/* </BottomSheet> */}
      <BottomSheet visible={pinVisible} onClose={() => setPinVisible(false)}>
        <ChangePinCode />
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
    elevation: 8,
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
    // paddingBottom : verticalScale(20),
    // gap : scale(3)
    // borderWidth : 1,
    // paddingTop: verticalScale(25),
  },
  serviceCard: {
    width: "100%",
    height: "100%",
    // aspectRatio: 1,
    // backgroundColor: "#E8E8E8",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: moderateScale(12),
    // paddingVertical: verticalScale(8),
    // marginBottom: verticalScale(12),
    // shadowColor: "#000",
    // shadowOpacity: 0.05,
    // shadowRadius: 3,
    // elevation: 2,
    // borderWidth: 1,
    // flex : 1
  },
  serviceIcon: {
    // marginBottom: verticalScale(6),

    height: verticalScale(41),
    width: scale(50),
    marginTop: verticalScale(6),
    marginBottom: verticalScale(2),
  },
  iconText: { fontSize: moderateScale(24) },
  serviceText: {
    fontSize: moderateScale(12),
    color: "#000",
    textAlign: "center",
    fontWeight: "400",
    marginHorizontal: scale(6),
    // borderWidth: 1,
  },

  badgesRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: verticalScale(20),
    borderWidth: 0.7,
    borderColor: "#fff",
    height: verticalScale(100),
    width: scale(373),
    alignSelf: "center",
    alignItems: "center",
    gap: scale(32),
    borderRadius: scale(12),
    backgroundColor: "#FFFFFF1A",
  },
  badgeIcon: {
    width: moderateScale(73),
    height: moderateScale(73),
    resizeMode: "contain",
  },
  techHeader: {
    fontWeight: "600",
    fontSize: moderateScale(16),
    marginBottom: verticalScale(8),
    marginTop: verticalScale(12),
    marginLeft: scale(1),
  },

  card: {
    width: "100%",
    paddingVertical: verticalScale(20),
    paddingHorizontal: scale(18),
    // backgroundColor: "#FFFFFF10",
    // borderRadius: moderateScale(14),
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: moderateScale(18),
    fontWeight: "600",
    color: "#027CC7",
    marginBottom: verticalScale(12),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D0D0D0",
    backgroundColor: "#FFFFFF",
    height: verticalScale(45),
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(12),
    marginBottom: verticalScale(18),
  },
  input: {
    flex: 1,
    fontSize: moderateScale(14),
    color: "#000",
  },
  submitBtn: {
    backgroundColor: "#027CC7",
    height: verticalScale(42),
    borderRadius: moderateScale(10),
    justifyContent: "center",
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
});
