import React, { useMemo, useState } from "react";
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
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { OrderStackParamList } from "../../constants/navigation";
import { ServiceRequest } from "../../constants/serviceRequestTypes";
import CustomView from "../components/CustomView";
import { Ionicons as Icon } from "@expo/vector-icons";
import { JobStatusHistoryItem } from "../../constants/timelineTypes";

import { JobStatus } from "../../constants/timelineTypes";

const STATUS_CONFIG: Record<string, { title: string; color: string }> = {
  technician_assigned: { title: "Technician Assigned", color: "#4A90E2" },
  confirmed_scheduled: { title: "Schedule Confirmed", color: "#F5A623" },
  on_way: { title: "On The Way", color: "#2F80ED" },
  arrived: { title: "Arrived", color: "#00A8E8" },
  in_progress: { title: "In Progress", color: "#F2994A" },
  parts_pending: { title: "Parts Pending", color: "#6C5CE7" },
  at_workshop: { title: "At Workshop", color: "#8E44AD" },
  verification_requested: { title: "Verification Requested", color: "#EB5757" },
  completed: { title: "Completed", color: "#27AE60" },
  cancelled: { title: "Cancelled", color: "#D32F2F" },
};

type NavigationProp = RouteProp<OrderStackParamList, "OrderDetailsScreen">;

const OrderDetailsScreen: React.FC = () => {
  const route = useRoute<NavigationProp>();
  const item: ServiceRequest = route.params?.item;
  const navigation = useNavigation();
  // -----------------------------

  const statusHistory: JobStatusHistoryItem[] = item.statusHistory || [];
  console.log(statusHistory);
  const formatDateTime = (iso: string) => {
    const date = new Date(iso);

    const day = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const time = date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return { day, time };
  };
  const sortedHistory = useMemo(() => {
    return [...statusHistory].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  }, [statusHistory]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ marginBottom: verticalScale(16) }}
      >
        <Icon name="arrow-back" size={moderateScale(22)} color={"#717A7E"} />
      </TouchableOpacity>

      <CustomView radius={scale(16.59)}>
        <View
          style={{
            marginBottom: 200,
          }}
        >
          <View style={styles.card}>
            <InfoCard pin={item.completionPin} />

            <CustomView
              radius={scale(16.59)}
              shadowStyle={{ marginTop: verticalScale(10) }}
            >
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
            </CustomView>
          </View>

          <View style={styles.timelineContainer}>
            {sortedHistory.map((item, index) => {
              const isLast = index === sortedHistory.length - 1;
              const config = STATUS_CONFIG[item.status] || {
                title: item.status,
                color: "#999",
              };

              const { day, time } = formatDateTime(item.timestamp);

              function CCView({ children }: { children: React.ReactNode }) {
                // return <CustomView radius={scale(0)}>{children}</CustomView>;
                return <View>{children}</View>;
              }

              return (
                <View key={item._id} style={styles.timelineItem}>
                  {/* LEFT TIME COLUMN */}
                  <CCView>
                    <View style={styles.timeColumn}>
                      <Text style={styles.timeText}>{day}</Text>
                      <Text style={styles.timeSubText}>{time}</Text>
                    </View>
                  </CCView>

                  {/* CENTER LINE + DOT */}
                  <View style={styles.arrowColumn}>
                    <View
                      style={[
                        styles.arrowCircle,
                        { backgroundColor: config.color },
                      ]}
                    />
                    {true && (
                      <View
                        style={[
                          styles.arrowLine,
                          {
                            backgroundColor: config.color,
                            height: isLast
                              ? verticalScale(55)
                              : verticalScale(70),
                          },
                        ]}
                      />
                    )}
                    {isLast && (
                      <View
                        style={[
                          {
                            width: scale(17),
                            height: scale(17),
                            borderRadius: scale(21),
                            backgroundColor: config.color,
                            marginTop: verticalScale(-10),
                          },
                        ]}
                      />
                    )}
                  </View>

                  {/* RIGHT DETAIL BOX */}
                  <CCView>
                    <View style={styles.detailColumn}>
                      <View style={styles.detailBox}>
                        <Text style={styles.detailTitle}>{config.title}</Text>

                        {!!item.notes && (
                          <Text style={styles.detailDesc}>{item.notes}</Text>
                        )}
                      </View>
                    </View>
                  </CCView>
                </View>
              );
            })}
          </View>
        </View>
      </CustomView>
    </ScrollView>
  );
};

type TabType = "problem" | "basic" | "price";

function InfoCard({ pin }: { pin: string }) {
  const [tab, setTab] = useState<TabType>("problem");

  const renderContent = () => {
    switch (tab) {
      case "problem":
        return (
          <>
            <Row
              label="Brand"
              value="Samsung | Split | 1.5 Ton"
              icon={require("../../../assets/clock.png")}
            />
            <Divider />
            <Row
              icon={require("../../../assets/clock.png")}
              label="Problem Duration"
              value="2–3 Days "
            />
            <Divider />
            <Row
              icon={require("../../../assets/clock.png")}
              label="AC Type"
              value="Window"
            />
          </>
        );

      case "basic":
        return (
          <>
            <Row
              icon={require("../../../assets/loc.png")}
              label="Zip code"
              value="250401"
            />
            <Divider />
            <Row
              icon={require("../../../assets/clock.png")}
              label="Service Time"
              value="Service within  24 hour"
            />
            <Divider />
            <Row
              icon={require("../../../assets/home.png")}
              label="Address"
              value="Sector 70,  Mohali"
            />
          </>
        );

      case "price":
        return (
          <>
            <Row
              icon={require("../../../assets/clock.png")}
              label="Qty"
              value="02"
            />
            <Divider />
            <Row
              icon={require("../../../assets/clock.png")}
              label="Price"
              value="₹5025"
            />
            <Divider />
            <Row
              icon={require("../../../assets/clock.png")}
              label="Visit Charges"
              value="₹150"
            />
            <Divider />
            <Row
              icon={require("../../../assets/clock.png")}
              label="Additional Charges"
              value="₹200"
            />
          </>
        );
    }
  };

  return (
    <>
      {/* Tabs */}
      <CustomView radius={scale(24)} boxStyle={{ overflow: "hidden" }}>
        <View style={styles.tabContainer}>
          <TabButton
            title="Problem info"
            icon={require("../../../assets/drill.png")}
            active={tab === "problem"}
            onPress={() => setTab("problem")}
          />
          <TabButton
            title="Basic Info"
            icon={require("../../../assets/setting.png")}
            active={tab === "basic"}
            onPress={() => setTab("basic")}
          />
          <TabButton
            title="Price"
            icon={require("../../../assets/setting.png")}
            active={tab === "price"}
            onPress={() => setTab("price")}
          />
        </View>
      </CustomView>

      {/* Card Content */}
      <CustomView
        radius={scale(16)}
        shadowStyle={{ marginTop: verticalScale(10) }}
      >
        <View style={styles.content}>{renderContent()}</View>
        <Divider />
        <Row
          icon={require("../../../assets/clock.png")}
          label="Completion PIN"
          value={pin}
        />
      </CustomView>
    </>
  );
}

const TabButton = ({ title, icon, active, onPress }: any) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tabButton, active && styles.activeTabButton]}
    >
      <Image source={icon} style={styles.tabIcon} />
      <Text style={[styles.tabText, active && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const Row = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: any;
}) => (
  <View style={styles.row}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: scale(6) }}>
      <Image source={icon} style={styles.tabIcon} />
      <Text style={styles.label}>{label}</Text>
    </View>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const Divider = () => <View style={styles.divider} />;

export default OrderDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0EFF8",
    padding: scale(16),
  },
  boxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(12.62),
  },
  tabContainer: {
    flexDirection: "row",
    // justifyContent: "space-between",
    // marginBottom: verticalScale(12),
    // marginTop: verticalScale(16),
    // gap: scale(4),
    // borderWidth : 1
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    // marginHorizontal: scale(3),
    // borderRadius: moderateScale(30),
    // borderWidth: 1,
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
    // backgroundColor: "#FFFFFF1A",
    // borderRadius: moderateScale(14),
    padding: scale(14),
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.05,
    // shadowRadius: 6,
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
  heading: {
    color: "#939393",
    fontSize: moderateScale(10),
    fontWeight: "500",
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
    // marginTop: verticalScale(12),
    // borderWidth: 1,
    // borderColor: "#fff",
    // backgroundColor: "#FFFFFF1A",
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(21),
    // borderRadius: moderateScale(12),
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
    // borderWidth : 1,
    marginRight: scale(20),
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
    paddingVertical: verticalScale(14),
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // gap : 10,
    // marginBottom: verticalScale(16),
    // borderWidth : 1,
    marginHorizontal: scale(16),
    // borderColor : 'red'
  },
  timeColumn: {
    width: scale(148),
    height: verticalScale(56),
    // borderWidth: 1,
    // backgroundColor: "#FFFFFF1A",
    // borderRadius: moderateScale(12),
    // borderColor: "#fff",
    justifyContent: "center",
    gap: verticalScale(4),
    alignItems: "center",
    paddingRight: scale(25),
    borderRadius: scale(4),
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
    width: scale(17),
    height: scale(17),
    borderRadius: scale(21),
    backgroundColor: "#0083D3",
    borderWidth: 1,
    borderColor: "#fff",
  },
  arrowLine: {
    width: scale(6),
    height: verticalScale(70),
    backgroundColor: "#0083D3",
    marginTop: verticalScale(-3),
  },
  detailColumn: {
    width: scale(148),
    height: verticalScale(56),
    // borderWidth: 1,
    // backgroundColor: "#FFFFFF1A",
    // borderRadius: moderateScale(4),
    borderColor: "#000",
    justifyContent: "center",
    // overflow: "hidden", // important!
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

  activeTabButton: {
    backgroundColor: "#EAF7FF",
  },

  tabIcon: {
    width: scale(16),
    height: scale(16),
    resizeMode: "contain",
  },

  activeTabText: {
    color: "#2F80ED",
    fontWeight: "600",
  },

  content: {
    // paddingVertical: verticalScale(12),
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(14),
  },

  value: {
    fontSize: moderateScale(13),
    color: "#111",
    fontWeight: "500",
    maxWidth: "55%",
    textAlign: "right",
  },

  divider: {
    height: moderateScale(1),
    backgroundColor: "#E8E6EE",
    // marginHorizontal: scale(14),
  },
});
