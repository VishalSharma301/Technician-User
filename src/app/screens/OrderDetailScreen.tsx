import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageBackground,
} from "react-native";
import { moderateScale, scale, verticalScale } from "../../utils/scaling";
import ScreenWrapper from "../components/ScreenWrapper";
import Header from "../components/Header";
import { RouteProp, useRoute } from "@react-navigation/native";
import { OrderStackParamList } from "../../constants/navigation";
import { ServiceRequest } from "../../constants/serviceRequestTypes";

type NavigationProp = RouteProp<OrderStackParamList, "OrderDetailsScreen">;

const OrderDetailsScreen: React.FC = () => {
  const route = useRoute<NavigationProp>();
  const item: ServiceRequest = route.params?.item;

  // -----------------------------
  // 🔥 Dynamic Timeline Logic
  // -----------------------------
  const timeline = useMemo(() => {
    if (!item) return [];

    const createdDate = new Date(item.createdAt);

    const formatDate = (dateInput: string | Date | null | undefined) => {
      if (!dateInput) return "";
      const date =
        typeof dateInput === "string" ? new Date(dateInput) : dateInput;
      return date.toLocaleDateString("en-GB");
    };

    const formatTime = (dateInput: string | Date | null | undefined) => {
      if (!dateInput) return "";
      const date =
        typeof dateInput === "string" ? new Date(dateInput) : dateInput;
      return date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const addDays = (date: Date, days: number) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    const status = item.status?.toLowerCase() || "pending";

    return [
      {
        date: formatDate(item.createdAt),
        time: formatTime(item.createdAt),
        title: "Assigned",
        desc: item.provider?.name || "Provider",
        active: true,
      },
      {
        date: formatDate(item.bookedAt || addDays(createdDate, 1)),
        time: formatTime(item.bookedAt || addDays(createdDate, 1)),
        title: "In-Progress",
        desc: "Technician Working",
        active: ["accepted", "technician_assigned", "in_progress", "ongoing", "completed"].includes(status),
      },
      {
        date: formatDate(item.serviceCompletedAt || addDays(createdDate, 3)),
        time: formatTime(item.serviceCompletedAt || addDays(createdDate, 3)),
        title: "Done",
        desc: "Fixed Issue",
        active: ["completed"].includes(status),
      },
      {
        date: formatDate(item.serviceCompletedAt || addDays(createdDate, 4)),
        time: formatTime(item.serviceCompletedAt || addDays(createdDate, 4)),
        title: "Warranty",
        desc: "5 Days Left",
        highlight: true,
        active: ["completed"].includes(status),
      },
      {
        date: formatDate(item.updatedAt || addDays(createdDate, 5)),
        time: formatTime(item.updatedAt || addDays(createdDate, 5)),
        title: "Job Closed",
        desc: "😊",
        active: ["completed"].includes(status),
      },
    ];
  }, [item]);

  // ------------------------------------------------------

  const statusTabs = [
    { title: "Active", count: 25, color: "#027CC7" },
    { title: "Pending", count: 125, color: "#FFD768" },
    { title: "Completed", count: 145, color: "#22C55E" },
    { title: "Cancel", count: 100, color: "#FF0000" },
  ];

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Header />

        {/* Tabs */}
        {/* <View style={styles.tabContainer}>
          {statusTabs.map((tab, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.tabButton,
                {
                  borderColor: tab.color,
                  backgroundColor:
                    tab.title === "Active"
                      ? `${tab.color}15`
                      : tab.title === "Cancel"
                      ? `${tab.color}10`
                      : `${tab.color}08`,
                },
              ]}
            >
              <Text
                style={[styles.tabText, { color: "#000", fontWeight: "600" }]}
              >
                {tab.title}
              </Text>
              <View
                style={{
                  width: scale(21),
                  height: scale(21),
                  backgroundColor: "#fff",
                  borderRadius: scale(20),
                  justifyContent: "center",
                }}
              >
                <Text style={[styles.tabCount, { color: tab.color }]}>
                  {tab.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View> */}

        {/* Order Info */}
        <View
          style={{
            borderWidth: 1,
            borderRadius: moderateScale(8),
            borderColor: "#fff",
            marginBottom: 200,
            backgroundColor: "#FFFFFF1A",
            marginTop : verticalScale(12)
          }}
        >
          <View style={styles.card}>
            <View style={styles.orderHeader}>
              <ImageBackground
                source={require("../../../assets/iconBG.png")}
                style={styles.iconCircle}
              >
                <Text style={styles.iconText}>GE</Text>
              </ImageBackground>

              <View
                style={{
                  flex: 1,
                  marginLeft: scale(10),
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View>
                  <Text style={styles.heading}>Order No.</Text>
                  <Text style={styles.orderNo}>{item._id}</Text>
                </View>

                <View>
                  <Text style={styles.heading}>Price</Text>
                  <Text style={styles.price}>₹{item.finalPrice}</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View>
                <Text style={styles.label}>{item.service.name}</Text>
                <Text style={styles.subLabel}>Type Of Service</Text>
              </View>
              <View>
                <Text style={styles.label}>{item.provider?.name}</Text>
                <Text style={styles.subLabel}>Service Provider</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View
              style={{
                borderWidth: 1,
                borderColor: "#fff",
                backgroundColor: "#FFFFFF1A",
                paddingVertical: verticalScale(14),
                borderRadius: moderateScale(12),
                marginTop: verticalScale(15),
              }}
            >
              <View style={styles.progressBar}>
                <View style={[styles.progressSegment, { backgroundColor: "#0083D3" }]} />
                <View style={[styles.progressSegment, { backgroundColor: "#E6B325" }]} />
                <View style={[styles.progressSegment, { backgroundColor: "#4CAF50" }]} />
                <View style={[styles.progressSegment, { backgroundColor: "#9C27B0" }]} />
                <View style={[styles.progressSegment, { backgroundColor: "#9E9E9E" }]} />
              </View>

              <View style={styles.verifyRow}>
                <Text style={styles.deviceText}>1 WINDOW AC</Text>
              </View>

              <View style={styles.legendRow}>
                {[
                  { color: "#3B82F6", text: "Assigned" },
                  { color: "#F59E0B", text: "In Progress" },
                  { color: "#22C55E", text: "Done" },
                  { color: "#8B5CF6", text: "Warranty" },
                  { color: "#64748B", text: "Job Closed" },
                ].map((item, i) => (
                  <View key={i} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <Text style={styles.legendText}>{item.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* ------------------------- */}
          {/* 🔥 Dynamic Timeline UI */}
          {/* ------------------------- */}
          <View style={styles.timelineContainer}>
            {timeline.map((step, index) => (
             <View key={index} style={styles.timelineItem}>
  {/* LEFT TIME BOX */}
  <View
    style={[
      styles.timeColumn,
      !step.active && { opacity: 0.4 }
    ]}
  >
    <Text
      style={[
        styles.timeText,
        !step.active && { color: "#777" }
      ]}
    >
      {step.date}
    </Text>

    <Text
      style={[
        styles.timeSubText,
        !step.active && { color: "#777" }
      ]}
    >
      {step.time}
    </Text>
  </View>

  {/* MIDDLE ARROW */}
  <View style={styles.arrowColumn}>
    <View
      style={[
        styles.arrowCircle,
        { backgroundColor: step.active ? "#0083D3" : "#9CA3AF" }
      ]}
    />

    {index !== timeline.length - 1 && (
      <View
        style={[
          styles.arrowLine,
          { backgroundColor: step.active ? "#0083D3" : "#9CA3AF" }
        ]}
      />
    )}
  </View>

  {/* RIGHT DETAIL BOX */}
  <View
    style={[
      styles.detailColumn,
      !step.active && { opacity: 0.4 }
    ]}
  >
    <View style={styles.detailBox}>
      <Text
        style={[
          styles.detailTitle,
          !step.active && { color: "#777" }
        ]}
      >
        {step.title}
      </Text>

      {step.highlight ? (
        <View
          style={[
            styles.badge,
            !step.active && { backgroundColor: "#E5E7EB" }
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              !step.active && { color: "#555" }
            ]}
          >
            {step.desc}
          </Text>
        </View>
      ) : (
        <Text
          numberOfLines={1}
          style={[
            styles.detailDesc,
            !step.active && { color: "#777" }
          ]}
        >
          {step.desc}
        </Text>
      )}
    </View>
  </View>
</View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default OrderDetailsScreen;




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF1A",
    padding: scale(16),
  },
  tabContainer: {
    flexDirection: "row",
    // justifyContent: "space-between",
    marginBottom: verticalScale(12),
    marginTop: verticalScale(16),
    gap: scale(4),
  },
  tabButton: {
    // flex: 1,
    flexDirection: "row",
    // marginHorizontal: scale(3),
    borderRadius: moderateScale(30),
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    height: verticalScale(40.66),
    gap: scale(2),
    paddingHorizontal: scale(7),
  },
  tabText: {
    fontSize: moderateScale(12),
    fontWeight: "400",
  },
  tabCount: {
    fontWeight: "700",
    fontSize: moderateScale(8),
    alignSelf: "center",
  },
  card: {
    backgroundColor: "#FFFFFF1A",
    borderRadius: moderateScale(14),
    padding: scale(14),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    // elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fff",
    backgroundColor: "#FFFFFF1A",
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(21),
    borderRadius: moderateScale(12),
  },
  iconCircle: {
    width: scale(46),
    height: scale(46),
    borderRadius: 50,
    // backgroundColor: "#0083D320",
    // justifyContent: "center",
    alignItems: "center",
    position: "relative",
    bottom: verticalScale(-4),
  },
  iconText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: moderateScale(14),
    position: "relative",
    bottom: verticalScale(-11),
    left: scale(-1),
  },
  heading :{
    color : '#939393',
    fontSize : moderateScale(10),
    fontWeight : '500'
  },
  orderNo: {
    fontSize: moderateScale(14),
    color: "#333",
    fontWeight: "500",
  },
  price: {
    fontSize: moderateScale(14),
    color: "#2E2E2E",
    fontWeight: "500",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: verticalScale(12),
    borderWidth: 1,
    borderColor: "#fff",
    backgroundColor: "#FFFFFF1A",
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(21),
    borderRadius: moderateScale(12),
  },
  label: {
    fontSize: moderateScale(12.5),
    fontWeight: "600",
    color: "#2E2E2E",
  },
  subLabel: {
    fontSize: moderateScale(11),
    color: "#888",
  },
  progressBar: {
    flexDirection: "row",
    height: verticalScale(6),
    borderRadius: moderateScale(6),
    overflow: "hidden",
    marginTop: verticalScale(14),
    paddingHorizontal: scale(20),
  },
  progressSegment: {
    flex: 1,
  },
  verifyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: verticalScale(10),
  },
  deviceText: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    paddingHorizontal: scale(20),
  },
  verifyBtn: {
    backgroundColor: "#0083D3",
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(6),
  },
  verifyText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: moderateScale(12),
  },
  legendRow: {
    flexDirection: "row",
    // flexWrap: "wrap",
    marginTop: verticalScale(10),
    // justifyContent: "space-between",
    paddingHorizontal: scale(10),
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: scale(6),
    marginTop: verticalScale(4),
  },
  legendDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: 8,
    marginRight: scale(4),
  },
  legendText: {
    fontSize: moderateScale(10.5),
    color: "#666",
  },
  timelineContainer: {
    marginTop: verticalScale(16),
    backgroundColor: "#FFFFFF1A",
    borderRadius: moderateScale(14),
    padding: scale(14),
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // gap : 10,
    marginBottom: verticalScale(29),
    // borderWidth : 1,
    marginHorizontal: scale(16),
    // borderColor : 'red'
  },
  timeColumn: {
    width: scale(121),
    height: verticalScale(56),
    borderWidth: 1,
    backgroundColor: "#FFFFFF1A",
    borderRadius: moderateScale(12),
    borderColor: "#fff",
    justifyContent: "center",
    gap: verticalScale(4),
    alignItems: "flex-end",
    paddingRight: scale(25),
  },
  timeText: {
    fontSize: moderateScale(11),
    fontWeight: "600",
    color: "#2E2E2E",
  },
  timeSubText: {
    fontSize: moderateScale(10),
    color: "#777",
  },
  arrowColumn: {
    width: scale(20),
    alignItems: "center",
  },
  arrowCircle: {
    width: scale(10),
    height: scale(10),
    borderRadius: 10,
    backgroundColor: "#0083D3",
  },
  arrowLine: {
    width: scale(2),
    height: verticalScale(40),
    backgroundColor: "#0083D3",
    marginTop: verticalScale(4),
  },
  detailColumn: {
    width: scale(121),
    height: verticalScale(56),
    borderWidth: 1,
    backgroundColor: "#FFFFFF1A",
    borderRadius: moderateScale(12),
    borderColor: "#fff",
    justifyContent: "center",
    overflow: "hidden", // important!
  },
  detailBox: {
    paddingLeft: scale(23), // short text → 23 left padding
    paddingRight: scale(5),
  },
  detailTitle: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    color: "#2E2E2E",
  },
  detailDesc: {
    fontSize: moderateScale(10),
    color: "#777",
    marginTop: verticalScale(2),
  },
  badge: {
    backgroundColor: "#FFCDD2",
    borderRadius: moderateScale(6),
    alignSelf: "flex-start",
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(3),
    marginTop: verticalScale(4),
  },
  badgeText: {
    color: "#D32F2F",
    fontWeight: "600",
    fontSize: moderateScale(10.5),
  },
});
