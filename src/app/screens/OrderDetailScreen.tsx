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
import { Ionicons as Icon, Ionicons } from "@expo/vector-icons";
import { JobStatusHistoryItem } from "../../constants/timelineTypes";

import { JobStatus } from "../../constants/timelineTypes";
import { LinearGradient } from "expo-linear-gradient";
import { blue } from "react-native-reanimated/lib/typescript/Colors";
import ReviewModal from "../components/ReviewModal";

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
  const [tab, setTab] = useState<TabType>("problem");
  const additionalCharges = 200;
  const [reviewVisible, setReviewVisible] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  // -----------------------------

  const statusHistory: JobStatusHistoryItem[] = item.statusHistory || [];
  // const inspection = item.inspection;
  const inspection = item.computedInvoice;
  console.log("item : ", item);
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

  type TabType = "problem" | "basic" | "price";

  const handleCloseReviewModal = () => {
    setReviewVisible(false);

    // 👇 show reminder
    setShowReminder(true);

    setTimeout(() => {
      setShowReminder(false);
    }, 5000);
  };

  function InfoCard({ pin, item }: { pin: string; item: any }) {
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
                label="Total Price"
                value={`₹${item.priceBreakdown.total + additionalCharges + 150}`}
              />
              <Row
                icon={require("../../../assets/clock.png")}
                label="Qty"
                value={item.quantity}
              />
              <Divider />
              <Row
                icon={require("../../../assets/clock.png")}
                label="Price"
                value={`₹${item.priceBreakdown.total}`}
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
                value={`₹${additionalCharges}`}
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ marginBottom: verticalScale(16) }}
      >
        <Icon name="arrow-back" size={moderateScale(22)} color={"#717A7E"} />
      </TouchableOpacity>

      <View
        style={{
          marginBottom: 200,
          // borderWidth : 1
        }}
      >
        <View style={{ paddingVertical: verticalScale(14) }}>
          <InfoCard pin={item.completionPin} item={item} />

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

          {item.status == "completed" && (
            <TouchableOpacity
              style={{ alignSelf: "flex-end", margin: 10 }}
              onPress={() => setReviewVisible(true)}
            >
              <Text style={{ color: "blue" }}> Give Rating </Text>
            </TouchableOpacity>
          )}
        </View>

        {tab == "price" && (
          <View>
            {/* Additional Services */}
            {inspection?.additionalServices &&
              inspection.additionalServices.count > 0 && (
                <CCView>
                  <View style={styles.card}>
                    <View style={styles.spaceBetween}>
                      <Text style={styles.cardTitle}>Additional Services</Text>
                      <Text style={styles.amount}>
                        ₹{inspection?.totals.additionalServices}
                      </Text>
                    </View>

                    {inspection?.additionalServices.items.map((item, index) => (
                      <ServiceRow
                        key={index}
                        name={item.serviceName}
                        brand={item.serviceName}
                        price={item.unitPrice}
                        qty={item.quantity}
                      />
                    ))}
                  </View>
                </CCView>
              )}

            {/* Parts List */}
            {inspection?.parts && inspection.parts.count > 0 && (
              <CCView>
                <View style={styles.card}>
                  <View style={styles.spaceBetween}>
                    <Text style={styles.cardTitle}>Parts List</Text>
                    <Text style={styles.amount}>
                      ₹ {inspection?.totals.parts.toFixed(2)}
                    </Text>
                  </View>
                  <PriceRow2
                    label={"Part Name"}
                    warranty={"Warranty"}
                    value={`Price`}
                    bold={true}
                  />

                  {inspection?.parts.items.map((part) => {
                    const name = part.productName || "part";

                    const price = part.totalWithGst || 0;

                    return (
                      <PriceRow2
                        key={part.partId}
                        label={name}
                        value={`₹ ${price.toFixed(2)}`}
                        warranty={"3 weeks"}
                      />
                    );
                  })}
                </View>
              </CCView>
            )}

            {/* Part Not Available / Workshop */}
            {inspection?.pendingEstimates?.requiredParts && (
              <CCView>
                <View style={styles.card}>
                  <View style={styles.spaceBetween}>
                    <Text style={styles.cardTitle}>Pending Part</Text>
                    <Text style={styles.amount}>
                      {/* ₹ {inspection?.totals.parts} */}
                    </Text>
                  </View>
                  <PriceRow2
                    label={"Part Name"}
                    // warranty= {'Warranty'}
                    value={`Est. Price`}
                    bold={true}
                  />

                  {inspection?.pendingEstimates?.requiredParts.map(
                    (part, ind) => {
                      const name = part.partName;

                      const price = part.estimatedCost || 0;

                      return (
                        <PriceRow2
                          key={ind}
                          label={name}
                          value={`₹ ${price}`}
                        />
                      );
                    },
                  )}
                </View>
              </CCView>
            )}
            {/* {inspection?.workshopDetails && (() => {
  const { day, time } = formatDateTime(inspection.workshopDetails?.expectedReturnDate);

  return (
    <CCView>
      <View style={styles.card}>
        <View style={styles.spaceBetween}>
          <Text style={styles.cardTitle}>Workshop Details</Text>
        </View>

        <View style={{ marginBottom: verticalScale(6), flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.label}>Item Description :</Text>
          <Text style={styles.label}>
            {inspection.workshopDetails.itemDescription}
          </Text>
        </View>

        <View style={{ marginBottom: verticalScale(6), flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.label}>Est. Return Date :</Text>
          <Text style={styles.label}>
            {day}
          </Text>
        </View>

        <View style={{ marginBottom: verticalScale(6), flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.label}>Est. Cost :</Text>
          <Text style={styles.label}>
            {inspection.workshopDetails.estimatedCost}
          </Text>
        </View>
      </View>
    </CCView>
  );
})()} */}

            {/* Price Summary */}
            <CCView>
              <View style={styles.card}>
                <View style={styles.spaceBetween}>
                  <Text style={styles.cardTitle}>Service Detail</Text>
                  <Text style={styles.cardTitle}>Price</Text>
                </View>

                {/* Custom Services */}
                <PriceRow
                  label="Original Service Price"
                  value={`₹ ${inspection?.totals.originalService || 0}`}
                />
                <PriceRow
                  label="Additional Service Price"
                  value={`₹ ${inspection?.totals.additionalServices || 0}`}
                />
                {/* <PriceRow
        label="Custom Service Price"
        value={`₹ ${121}`}
      /> */}
                <PriceRow
                  label="Part Price With Gst"
                  value={`₹ ${inspection?.totals.parts.toFixed(2) || 0}`}
                />
                {/* Parts */}
                {/* {!!addedParts.length && (
      <PriceRow
        label="Parts"
        value={`₹ ${calculatePartsTotal()}`}
      />
    )} */}

                <View style={styles.divider} />

                <View style={styles.spaceBetween}>
                  <Text style={styles.total}>Total Service Price</Text>
                  <Text style={styles.total}>
                    ₹ {inspection?.totals.grandTotal}
                  </Text>
                </View>
              </View>
            </CCView>
          </View>
        )}

        <View style={styles.timelineContainer}>
          {sortedHistory.map((item, index) => {
            const isLast = index === sortedHistory.length - 1;
            const config = STATUS_CONFIG[item.status] || {
              title: item.status,
              color: "#999",
            };

            const { day, time } = formatDateTime(item.timestamp);

            function CCView({ children }: { children: React.ReactNode }) {
              return <CustomView radius={scale(4)}>{children}</CustomView>;
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
      {showReminder && (
        <View style={styles.reminderBox}>
          <Text style={styles.reminderText}>
            🔔 We'll remind you after 1 hour. Your feedback helps technicians
            grow!
          </Text>
        </View>
      )}

      <ReviewModal
        visible={reviewVisible}
        onClose={handleCloseReviewModal}
        serviceRequestId={item._id}
      />
    </ScrollView>
  );
};

type CCViewProps = {
  children: React.ReactNode;
  style?: any;
};

function CCView({ children, style }: CCViewProps) {
  return (
    <CustomView
      radius={scale(12)}
      shadowStyle={{ marginBottom: verticalScale(14) }}
      boxStyle={style}
    >
      {children}
    </CustomView>
  );
}
function ReviewRow({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) {
  if (!value) return null;
  return (
    <View style={{ flexDirection: "row", marginBottom: 6 }}>
      <Text style={{ fontWeight: "600", width: 140 }}>{label}</Text>
      <Text style={{ flex: 1 }}>{value}</Text>
    </View>
  );
}

const ServiceRow = ({ name, brand, price, qty }: any) => (
  <View style={{ marginBottom: 10 }}>
    <View style={styles.serviceTitleRow}>
      <Text style={styles.text}>{name}</Text>
      <View style={styles.brandChip}>
        <Text style={styles.brandText}>{brand}</Text>
      </View>
    </View>
    <Text style={styles.calc}>
      ₹ {price} × {qty} = ₹ {price * qty}
    </Text>
  </View>
);

const PriceRow = ({ label, value }: any) => (
  <View style={styles.spaceBetween}>
    <Text style={styles.text}>{label}</Text>
    <Text style={styles.text}>{value}</Text>
  </View>
);
const PriceRow2 = ({ label, value, warranty, bold }: any) => (
  <View style={styles.spaceBetween}>
    <Text
      numberOfLines={1}
      style={[styles.text, bold && { fontWeight: "600" }, { width: "55%" }]}
    >
      {label}
    </Text>
    <Text
      style={[styles.text, bold && { fontWeight: "600" }, { width: "20%" }]}
    >
      {warranty}
    </Text>
    <Text
      style={[styles.text, bold && { fontWeight: "600" }, { width: "20%" }]}
    >
      {value}
    </Text>
  </View>
);

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
    padding: scale(22),
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
  reminderBox: {
    position: "absolute",
    // bottom: 500,
    top: verticalScale(650),
    left: 20,
    right: 20,

    backgroundColor: "#000",
    borderLeftWidth: 4,
    // borderLeftColor: "#2196f3",
    padding: 16,
    borderRadius: 16,

    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },

  reminderText: {
    fontSize: moderateScale(13),
    color: "#fff",
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
    // borderWidth: 1
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // gap : 10,
    // marginBottom: verticalScale(16),
    // borderWidth : 1,
    marginHorizontal: scale(2),
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
  serviceTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  total: {
    fontSize: moderateScale(15),
    fontWeight: "700",
  },

  brandChip: {
    backgroundColor: "#BED2F4",
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: scale(20),
    marginLeft: scale(8),
  },

  calc: {
    fontSize: moderateScale(12),
    color: "#000",
    marginTop: verticalScale(4),
  },

  serviceItem: {
    paddingVertical: verticalScale(12),
    borderTopWidth: scale(1),
    borderColor: "#eee",
  },

  serviceTitle: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    marginBottom: verticalScale(6),
    width: scale(300),
    // borderWidth : 1
  },

  brandBadge: {
    backgroundColor: "#E3EAFB",
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(3),
    borderRadius: scale(10),
  },

  brandText: {
    fontSize: moderateScale(11),
    color: "#2764E7",
  },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  qtyBtn: {
    backgroundColor: "#F2F4F7",
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(3),
    borderRadius: scale(6),
  },
  spaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(8),
  },
  cardTitle: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    marginBottom: verticalScale(10),
  },
  amount: {
    fontWeight: "700",
    fontSize: moderateScale(14),
  },

  dropRow: {
    borderWidth: scale(1),
    height: verticalScale(32),
    width: "47%",
    backgroundColor: "#F6F5F9",
    borderColor: "#DEDEDE",
    justifyContent: "center",
    paddingHorizontal: scale(8),
  },
  dropdown: {},
  dropBox: {
    position: "absolute",
    top: verticalScale(50),
    width: "100%",
    backgroundColor: "#fff",
    borderWidth: scale(1),
    borderColor: "#DEDEDE",
    zIndex: 10,
  },

  dropdownItem: {
    backgroundColor: "#fff",
    padding: scale(12),
    borderBottomWidth: scale(1),
    borderColor: "#eee",
  },

  rowLabel: {
    fontSize: moderateScale(12),
    fontWeight: "700",
    color: "#000",
  },

  status: {
    fontSize: moderateScale(12),
    fontWeight: "700",
    color: "#004DBD",
  },

  coveredRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: verticalScale(10),
  },

  coveredItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },

  checkbox: {
    width: scale(14),
    height: scale(14),
    borderRadius: scale(3),
    backgroundColor: "#2F80ED",
    marginRight: scale(8),
  },

  coveredText: {
    fontSize: moderateScale(13),
    fontWeight: "500",
    color: "#000",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  text: {
    fontSize: moderateScale(14),
    color: "#000000",
    fontWeight: "400",
    // borderWidth : 1
  },

  subText: {
    fontSize: moderateScale(12),
    color: "#000",
    marginTop: verticalScale(8),
  },

  link: {
    fontSize: moderateScale(12),
    fontWeight: "700",
    color: "#004DBD",
    marginTop: verticalScale(4),
  },

  // divider: {
  //   height: verticalScale(1),
  //   backgroundColor: "#EEE",
  //   marginVertical: verticalScale(10),
  // },
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
