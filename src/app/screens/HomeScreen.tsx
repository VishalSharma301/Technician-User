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
  newServiceDetails,
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
import ChatScreen from "../components/CC7";
import Chatbot8 from "../components/CC8";
// import Chatbot8 from "../components/ChatBot";
import CustomView from "../components/CustomView";

const categories = ["Popular", "Emergency", "Seasonal", "Daily Use"];

interface Service {
  name: string;
  icon: IconName;
}
type ServiceObject = {
  data: ServiceData;
  zipcode: string;
};

// hiwIcons.ts
export const HIW_ICONS: Record<string, any> = {
  1: require("../../../assets/HIW/1.png"),
  2: require("../../../assets/HIW/2.png"),
  3: require("../../../assets/HIW/3.png"),
  4: require("../../../assets/HIW/4.png"),
};

const HomeScreen = () => {
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
    servicesByCategory,
  } = useServices();

  const [pinVisible, setPinVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  // const [selectedService, setSelectedService] = useState<ServiceData>();
  const [selectedServiceObject, setSelectedServiceObject] =
    useState<ServiceObject>();
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  const categories = useMemo(() => {
    return servicesByCategory ? Object.keys(servicesByCategory) : [];
  }, [servicesByCategory]);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      setSelectedCategory(categories[0]);
    }
  }, [categories]);

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

        if (servicesRes) {
          console.log("🔧 Services fetched:", servicesRes);
        } else {
          console.log("❌ Services failed");
        }

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

  // console.log(quickPickServices);

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
    // const clickedService = await fetchServiceDetails(service._id, "140802");
    const clickedService = await newServiceDetails(service._id, "140802");
    if (clickedService) {
      console.log("service : ", clickedService);

      setSelectedServiceObject(clickedService);
      setVisible(true);
    }
  }

  if (!services || categories.length === 0) {
    return (
      <ScreenWrapper>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Loading services...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F0EFF8" }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <CustomView
          width={scale(374.68)}
          height={verticalScale(109)}
          radius={scale(11.35)}
          boxStyle={[
            {
              borderWidth: moderateScale(0.7),
              borderColor: "#fff",
              paddingVertical: verticalScale(7.85),
              paddingHorizontal: scale(8.96),
            },
          ]}
        >
          <View style={styles.topBar}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Icon
                name="location-outline"
                size={moderateScale(18)}
                color={"#1E1E1E"}
              />
              <Text style={styles.pinText}>
                {selectedAddress.address.zipcode}
              </Text>
            </View>

            <CustomView
              height={verticalScale(28)}
              width={scale(60)}
              radius={scale(25)}
              boxStyle={[styles.points]}
            >
              <Image
                source={require("../../../assets/points.png")}
                style={{
                  width: scale(20),
                  height: verticalScale(20),
                  resizeMode: "contain",
                }}
              />
              {/* <Icon name="trophy" size={moderateScale(16)} color={"gold"} /> */}
              <Text style={styles.pointsText}>100</Text>
            </CustomView>
          </View>
        </CustomView>

        {/* TOP CATEGORIES */}

        <CustomView
          height={verticalScale(95.68)}
          radius={scale(11.35)}
          width={scale(354.33)}
          shadowStyle={{
            marginVertical: verticalScale(12),
            alignSelf: "center",
            marginTop: verticalScale(-65),
          }}
          boxStyle={[styles.topCategoryRow]}
        >
          {quickPickServices.map((item, index) => (
            <CustomView
              key={index}
              height={verticalScale(79.97)}
              width={scale(79.39)}
              radius={scale(14.88)}
              boxStyle={[styles.topCategoryCard]}
            >
              <Image
                source={iconMap[item.icon as IconName] || iconMap["default"]}
                style={styles.topCategoryImage}
              />
              <Text numberOfLines={1} style={styles.topCategoryText}>
                {item.name}
              </Text>
            </CustomView>
          ))}
        </CustomView>

        {/* SERVICE FILTER CHIPS */}
        {categories.length > 0 && (
          <CustomView
            height={verticalScale(37.59)}
            radius={scale(14.84)}
            width={scale(370)}
            boxStyle={styles.chipsRow}
          >
            {categories.map((item, index) => {
              const chipLabels = ["Installation", "Service", "Repair", "Maintenance"];

              return (
                
                  <View
                  key={index}
                    style={[
                      styles.chip,
                      selectedCategory === item && {
                        backgroundColor: "#DCECFE",
                      },
                    ]}
                  >
                    <TouchableOpacity
                  
                  onPress={() => setSelectedCategory(item)}
                >
                    <Text numberOfLines={1} style={styles.chipText}>
                        {chipLabels[index] ?? item}
                    </Text>
                </TouchableOpacity>
                  </View>
              );
            })}
          </CustomView>
        )}

        {/* SERVICES GRID */}
        {selectedCategory &&
          servicesByCategory?.[selectedCategory]?.length > 0 && (
            <View
              style={[
                styles.grid,
                servicesByCategory?.[selectedCategory]?.length > 3
                  ? { marginBottom: verticalScale(10) }
                  : { marginBottom: verticalScale(10) },
              ]}
            >
              {servicesByCategory[selectedCategory].map((item, index) => (
                <View key={index}>
                  <TouchableOpacity
                    style={{ borderWidth: 0 }}
                    onPress={() => selectBrand(item)}
                    onLongPress={() => setActiveTooltipId(item._id)}
                    onPressOut={() => setActiveTooltipId(null)}
                    delayLongPress={300}
                  >
                    <CustomView
                      height={verticalScale(95)}
                      width={scale(119)}
                      radius={scale(14)}
                      key={index}
                      boxStyle={styles.serviceCard}
                    >
                      <Image
                        source={
                          iconMap[item.icon as IconName] || iconMap["default"]
                        }
                        style={styles.serviceImage}
                      />
                      <Text numberOfLines={1} style={styles.serviceText}>
                        {item.name}
                      </Text>
                    </CustomView>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

        {/* HOW IT WORKS */}

        <CustomView
          height={verticalScale(132.72)}
          radius={scale(12)}
          width={scale(374.68)}
          shadowStyle={{ marginTop: verticalScale(21) }}
          boxStyle={[
            styles.howItWorks,
            {
              alignSelf: "center",
              width: scale(374.68),
              height: verticalScale(132.72),
            },
          ]}
        >
          <Text style={styles.sectionTitle}>How it Work</Text>
          <CustomView
            height={verticalScale(91.71)}
            width={scale(355.19)}
            radius={scale(12)}
            boxStyle={[
              styles.howItWorks,

              {
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: scale(9.16),
              },
            ]}
          >
            {[
              {
                name: "Book Service",
                color: "#6488BD",
                secColor: "#7AA5F9",
                iconName: "1",
              },
              {
                name: "Meet Pro",
                color: "#896DCB",
                secColor: "#B292FF",
                iconName: "2",
              },
              {
                name: "Service",
                color: "#9CBE76",
                secColor: "#C3E2A2",
                iconName: "3",
              },
              {
                name: "Finished",
                color: "#82BFEC",
                secColor: "#B3DFFF",
                iconName: "4",
              },
            ].map((item, index) => (
              <CustomView
                height={verticalScale(73.47)}
                width={scale(78.75)}
                radius={scale(9.11)}
                key={index}
                boxStyle={[
                  {
                    borderWidth: moderateScale(1),
                    borderColor: "#fff",
                    justifyContent: "center",
                    paddingHorizontal: scale(2.88),
                    paddingVertical: verticalScale(2.88),
                  },
                ]}
              >
                <View
                  style={{
                    borderWidth: moderateScale(0.9),
                    borderColor: item.color,
                    height: "100%",
                    borderRadius: scale(9.11),
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      width: scale(20.24),
                      height: verticalScale(12.67),
                      backgroundColor: item.color,
                      borderRadius: moderateScale(3.86),
                      borderWidth: moderateScale(1),
                      borderColor: item.secColor,
                      position: "absolute",
                      top: verticalScale(-7),
                      left: scale(10.12),
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: moderateScale(7.44),
                        fontWeight: 600,
                        alignSelf: "center",
                        color: "#fff",
                        lineHeight: verticalScale(10),
                      }}
                    >
                      {index + 1}
                    </Text>
                  </View>
                  <Image
                    source={HIW_ICONS[item.iconName]}
                    style={[
                      {
                        width: scale(43.49),
                        height: verticalScale(34),
                        resizeMode: "center",
                      },
                    ]}
                  />
                  <Text
                    style={{ fontSize: moderateScale(7.44), fontWeight: 600 }}
                  >
                    {item.name}
                  </Text>
                </View>
              </CustomView>
            ))}
          </CustomView>
        </CustomView>
        {/* SERVICE OF THE WEEK */}
        <CustomView
          width={scale(375)}
          height={verticalScale(116)}
          radius={scale(16.59)}
          shadowStyle={{ marginTop: verticalScale(13) }}
          boxStyle={[
            {
              borderWidth: moderateScale(0.7),
              paddingVertical: verticalScale(7.85),
              // paddingHorizontal: scale(8.96),
              borderColor: "#fff",

              justifyContent: "center",
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Service Of the Week</Text>

          <ServiceOfTheWeek
            onPressService={(serviceOfTheWeek) => selectBrand(serviceOfTheWeek)}
          />
        </CustomView>
        {/* SERVICE OF THE WEEK */}
        {selectedCategory &&
          servicesByCategory?.[selectedCategory]?.length < 4 && (
            <CustomView
              width={scale(375)}
              height={verticalScale(116)}
              radius={scale(16.59)}
              shadowStyle={{ marginTop: verticalScale(13) }}
              boxStyle={[
                {
                  borderWidth: moderateScale(0.7),
                  paddingVertical: verticalScale(7.85),
                  // paddingHorizontal: scale(8.96),
                  borderColor: "#fff",

                  justifyContent: "center",
                },
              ]}
            >
              <Text style={styles.sectionTitle}>Service Of the Week</Text>

              <ServiceOfTheWeek
                onPressService={(serviceOfTheWeek) =>
                  selectBrand(serviceOfTheWeek)
                }
              />
            </CustomView>
          )}
      </ScrollView>
      {visible && (
        <View style={{ height: "100%", zIndex: 999999 }}>
          <Chatbot8
            serviceObject={selectedServiceObject?.data!}
            onClose={() => setVisible(false)}
          />
        </View>
      )}
      <CustomNavBar isLocal="Home" />
    </View>
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
    color: "#1E1E1E",
    fontSize: moderateScale(14),
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
  serviceCard1: {
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
    fontSize: moderateScale(11),
    color: "#000",
    textAlign: "center",
    fontWeight: "400",
    marginHorizontal: scale(6),
    marginTop: verticalScale(3),
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
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(12),
  },

  points: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: scale(6),
    borderRadius: scale(12),
    borderWidth: moderateScale(0.7),
    borderColor: "#fff",
    justifyContent: "center",
  },

  pointsText: {
    // marginLeft: scale(6),
    // alignSelf : 'center',
    fontSize: moderateScale(12),
    // borderWidth : 1,
    lineHeight: verticalScale(13),
  },

  topCategoryRow: {
    flexDirection: "row",
    gap: scale(7),
    paddingVertical: verticalScale(7.85),
    paddingHorizontal: scale(8.96),
    alignItems: "center",
    justifyContent: "space-around",
    borderWidth: moderateScale(0.7),
    borderColor: "#fff",

    // position : 'relative',
    // top : verticalScale(-70)
  },

  topCategoryCard: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.6,
    borderColor: "#ffffff",
  },

  topCategoryImage: {
    width: scale(50),
    height: scale(50),
    marginBottom: verticalScale(6),
  },

  topCategoryText: {
    fontSize: moderateScale(11),
    fontWeight: "400",
    marginHorizontal: scale(4),
    textAlign: "center",
  },

  chipsRow: {
    flexDirection: "row",
    // justifyContent: "space-between",
    // gap: scale(40),
    // marginVertical: verticalScale(10),

    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ffffff",
  },

  chip: {
    flex : 1,
// borderWidth : 1,
    // backgroundColor: "#ea1313ff",
    // paddingVertical: verticalScale(6),
    // paddingHorizontal: scale(14),
    // borderRadius: scale(20),
    // minWidth: scale(80),
    // maxWidth: scale(98),
    height: "100%",
    // width : '100%',
    // alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderColor: "#BCBBC580",
    paddingHorizontal: scale(5),
  },

  chipText: {
    fontSize: moderateScale(12),
    paddingLeft: scale(4),
    // width: "100%",
    textAlign: "center",
    // borderWidth : 1,
    // paddingHorizontal : scale(6)
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginTop: verticalScale(14),
    gap: scale(5),
  },

  serviceCard: {
    width: scale(119),
    height: verticalScale(95),
    backgroundColor: "#FFFFFF",
    borderRadius: scale(14),
    alignItems: "center",
    justifyContent: "center",

    /* ---------------- ANDROID ---------------- */
    // elevation: 5,

    /* ---------------- iOS OUTER SHADOW ---------------- */

    /* ---------------- iOS SOFT INNER FEEL (HACK) ---------------- */
    borderWidth: 0.7,
    borderColor: "#fff", // #D3D3D340 feel

    /* ---------------- POLISH ---------------- */
    overflow: "hidden",
  },
  serviceImage: {
    width: scale(75),
    height: scale(60),
    resizeMode: "contain",
    // borderWidth : 1
  },

  sectionTitle: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    // marginTop: verticalScale(7.84),
    color: "#000000A6",
    alignSelf: "flex-start",
    marginLeft: scale(9.94),
    marginBottom: verticalScale(4),
  },

  howItWorks: {
    alignItems: "center",
    justifyContent: "center",
    // elevation: 2,
    borderWidth: 0.7,
    borderColor: "#ffffff",
  },

  howStep: {
    alignItems: "center",
  },

  circle: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(6),
  },

  howText: {
    fontSize: moderateScale(11),
  },

  weekCard: {
    backgroundColor: "#fff",
    borderRadius: scale(14),
    padding: scale(12),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(20),
  },

  weekImage: {
    width: scale(50),
    height: scale(50),
  },

  weekTitle: {
    fontSize: moderateScale(14),
    fontWeight: "600",
  },

  weekSub: {
    fontSize: moderateScale(12),
    color: "#777",
  },
});

// return (
//   <ScreenWrapper>
//     <ScrollView style={styles.container}>
//       {/* Top Bar */}
//       <Header />

//       {/* Pin Section */}
//       <TouchableOpacity
//         onPress={() => setPinVisible((prev) => !prev)}
//         style={styles.pinContainer}
//       >
//         <Text style={styles.pinText}>
//           Pin - {selectedAddress.address.zipcode}
//         </Text>
//         <Icon
//           name="pencil-outline"
//           size={moderateScale(16)}
//           color="#1E1E1E80"
//         />
//       </TouchableOpacity>
//       <View
//         style={{
//           borderWidth: 0.7,
//           borderColor: "#ffffffcd",
//           paddingHorizontal: scale(11),
//           borderRadius: moderateScale(12),
//           marginTop: verticalScale(9),
//           paddingTop: verticalScale(16),
//           paddingBottom: verticalScale(10),
//           backgroundColor: "#FFFFFF1A",
//           // height: verticalScale(353),
//         }}
//       >
//         {/* Category Tabs */}
//         <View style={styles.categoriesContainer}>
//           {categories.map((cat) => (
//             <GradientBorder
//               borderRadius={scale(23.6)}
//               outerWidth={0.2}
//               innerWidth={0.8}
//               innerColors={outerColors}
//               outerColors={innerColors}
//               style={[
//                 styles.categoryButton,
//                 selectedCategory === cat && styles.activeCategory,
//               ]}
//               key={cat}
//             >
//               <TouchableOpacity onPress={() => setSelectedCategory(cat)}>
//                 <Text
//                   style={[
//                     styles.categoryText,
//                     selectedCategory === cat && styles.activeCategoryText,
//                   ]}
//                 >
//                   {cat}
//                 </Text>
//               </TouchableOpacity>
//             </GradientBorder>
//           ))}
//         </View>

//         {/* Services Grid */}
//         {/* Services Grid */}
//         <View style={styles.gridContainer}>
//           {servicess.length === 0 ? (
//             <View
//               style={{
//                 alignItems: "center",
//                 marginTop: verticalScale(20),
//                 height: verticalScale(150),
//                 justifyContent: "center",
//                 // borderWidth : 1,
//                 alignSelf: "center",
//                 width: "100%",
//               }}
//             >
//               <Text
//                 style={{
//                   fontSize: moderateScale(14),
//                   fontWeight: "600",
//                   color: "#000",
//                   alignSelf: "center",
//                 }}
//               >
//                 No Service Provider Available in this area
//               </Text>
//             </View>
//           ) : (
//             servicess.map((service) => (
//               //   <View  key={service._id} style={{ borderWidth:0,  height: verticalScale(94), width : scale(85)}}>
//               //  {/* Tooltip */}
//               //     {activeTooltipId === service._id && (
//               //       <Tooltip text={service.name} />
//               //     )}
//               //   <ImageBackground
//               //     key={service._id}
//               //     source={require("../../../assets/vv.png")}
//               //     resizeMode="contain"
//               //     style={{
//               //       height: verticalScale(140),
//               //       width: scale(110),
//               //       // borderWidth: 1,
//               //       alignItems: "center",
//               //       marginHorizontal: -12,

//               //       // marginLeft : -14,
//               //       // marginRight : -10,
//               //       // marginVertical: -10,
//               //       // marginTop : verticalScale(2),

//               //     }}
//               //   >

//               //     <TouchableOpacity
//               //       style={styles.serviceCard}
//               //       onPress={() => selectBrand(service)}
//               //       onLongPress={() => setActiveTooltipId(service._id)}
//               //       onPressOut={() => setActiveTooltipId(null)}
//               //       delayLongPress={300}
//               //     >
//               //       <View style={styles.serviceIcon}>
//               //         <Image
//               //           source={
//               //             iconMap[service.icon as IconName] ??
//               //             iconMap["default"]
//               //           }
//               //           style={{
//               //             height: "100%",
//               //             width: "100%",
//               //             minHeight: verticalScale(39),
//               //             minWidth: scale(39),
//               //             resizeMode: "contain",
//               //           }}
//               //         />
//               //       </View>

//               //       <Text
//               //         numberOfLines={1}
//               //         ellipsizeMode="tail"
//               //         style={styles.serviceText}
//               //       >
//               //         {service.name}
//               //       </Text>
//               //     </TouchableOpacity>
//               //   </ImageBackground>
//               //   </View>
//               <View
//                 key={service._id}
//                 style={{
//                   shadowColor: "#000",
//                   shadowOpacity: 0.05,
//                   shadowRadius: 3,
//                   paddingBottom: verticalScale(10),
//                 }}
//               >
//                 <GradientBorder
//                   key={service._id}
//                   gradientStyle={{}}
//                   style={{
//                     width: scale(80),
//                     height: scale(80),
//                     backgroundColor: "#E8E8E8",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     // borderWidth: 1,

//                     // elevation: 7,
//                     position: "relative",
//                     //                 shadowColor: "#000",
//                     // shadowOpacity: 0.05,
//                     // shadowRadius: 3,
//                     // elevation: 2,
//                   }}
//                 >
//                   {/* Tooltip */}
//                   {activeTooltipId === service._id && (
//                     <Tooltip text={service.name} />
//                   )}

//                   <TouchableOpacity
//                     style={styles.serviceCard}
//                     onPress={() => selectBrand(service)}
//                     // onPress={() => serviceDetails(service._id)}
//                     // onPress={() => setVisible(!visible)}
//                     onLongPress={() => setActiveTooltipId(service._id)}
//                     onPressOut={() => setActiveTooltipId(null)}
//                     delayLongPress={300}
//                   >
//                     <View style={styles.serviceIcon}>
//                       <Image
//                         source={
//                           iconMap[service.icon as IconName] ??
//                           iconMap["default"]
//                         }
//                         style={{
//                           height: "100%",
//                           width: "100%",
//                           minHeight: verticalScale(39),
//                           minWidth: scale(39),
//                           resizeMode: "contain",
//                         }}
//                       />
//                     </View>

//                     <Text
//                       numberOfLines={1}
//                       ellipsizeMode="tail"
//                       style={styles.serviceText}
//                     >
//                       {service.name}
//                     </Text>
//                   </TouchableOpacity>
//                 </GradientBorder>
//               </View>
//             ))
//           )}
//         </View>
//       </View>
//       {/* Badges Section */}
//       <View style={styles.badgesRow}>
//         <Image
//           source={require("../../../assets/badges/badge2.png")}
//           style={styles.badgeIcon}
//         />
//         <Image
//           source={require("../../../assets/badges/badge3.png")}
//           style={styles.badgeIcon}
//         />
//         <Image
//           source={require("../../../assets/badges/badge1.png")}
//           style={styles.badgeIcon}
//         />
//       </View>

//       {/* Technician of the Week */}
//       <Text style={styles.techHeader}>Service Of The Week</Text>

//       <ServiceOfTheWeek
//         onPressService={(serviceOfTheWeek) => selectBrand(serviceOfTheWeek)}
//       />
//     </ScrollView>
//     <CustomNavBar isLocal={"Home"} />
//     {/* <BottomSheet visible={visible} onClose={() => setVisible(false)}> */}
//     {visible && (
//       <View style={{ height: "100%" }}>
//         {/* <ChatbotBooking3
//           serviceObject={selectedServiceObject!}
//           close={() => setVisible(false)}
//         />   */}
//         {/* <ChatbotEngine  backend={{
//   service: selectedServiceObject?.data,
//   conversationSteps: selectedServiceObject?.data?.conversationSteps,
//   conversationSettings: selectedServiceObject?.data?.conversationSettings
// }}/> */}
//         {/* <ChatbotBooking4
//           serviceObject={selectedServiceObject!}
//           close={() => setVisible(false)}
//         /> */}

//         {/* <ChatbotBookingManualUI serviceObject={selectedServiceObject!}
//           onClose={() => setVisible(false)} /> */}

//           {/* <ChatScreen /> */}

//         {/* <Chatbot6 serviceObject={selectedServiceObject!}
//           onClose={() => setVisible(false)} /> */}

//         <Chatbot8 serviceObject={selectedServiceObject?.data!}
//           onClose={() => setVisible(false)} />
//         {/* <ChatbotEngine
//       serviceData={selectedServiceObject?.data!}
//       userAddresses={userAddresses}
//       onComplete={()=>{}}
//       onCancel={()=> setVisible(false)}
//     /> */}

//         {/* <ChatbotBooking_NewFlow
//           serviceObject={selectedServiceObject!}
//           close={() => setVisible(false)}
//         />   */}
//       </View>
//     )}
//     {/* <View
//       style={{
//         height: "100%",
//         opacity: 1,
//         display: visible ? "flex" : "none",
//         // borderWidth: 1,
//       }}
//     > */}
//     {/* <Recorder /> */}
//     {/* {selectedService && <CB1 service={selectedService} close={() => setVisible(false)} />} */}
//     {/* {selectedService && <ChatbotBooking service={selectedService} close={() => setVisible(false)} />} */}
//     {/* {selectedService && (
//         <ChatbotBooking_NewFlow
//           service={selectedService}
//           close={() => setVisible(false)}
//         />
//       )} */}
//     {/* {selectedService && (
//         <BookingBottomSheet
//           close={() => setVisible(false)}
//           service={selectedService}
//         />

//       )} */}
//     {/* </View> */}
//     {/* </BottomSheet> */}
//     <BottomSheet visible={pinVisible} onClose={() => setPinVisible(false)}>
//       <ChangePinCode />
//     </BottomSheet>
//   </ScreenWrapper>
// );
