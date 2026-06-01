import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  ImageBackground,
} from "react-native";
import { useServiceRequests } from "../../store/ServiceRequestContext";
import { ServiceRequestCard } from "../components/ServiceRequestCard";
import {
  ServiceRequest,
  ServiceRequestStatus,
} from "../../constants/serviceRequestTypes";
import { useNavigation } from "@react-navigation/native";
import { moderateScale, scale, verticalScale } from "../../utils/scaling";
import { StackNavigationProp } from "@react-navigation/stack";
import { OrderStackParamList } from "../../constants/navigation";
import { Ionicons as Icon } from "@expo/vector-icons";
import CustomView from "../components/CustomView";
import ReviewModal from "../components/ReviewModal";
import CustomNavBar from "../components/CustomNavBar";

const STATUS_TABS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
];

type NavigationProp = StackNavigationProp<OrderStackParamList, "OrderScreen">;

const PROGRESS_STAGES = [
  "assigned",
  "in_progress",
  "completed",
  "warranty",
  "job_closed",
] as const;

const PROGRESS_COLORS = {
  assigned: "#194594",
  in_progress: "#F59E0B",
  completed: "#22C55E",
  // warranty: "#dbd1d1",
  // job_closed: "#dbd1d1",
  warranty: "#8B5CF6",
  job_closed: "#64748B",
} as const;

// 🔥 FIX: Normalize ANY backend status to a valid progress stage
const STATUS_TO_PROGRESS: Record<string, (typeof PROGRESS_STAGES)[number]> = {
  // Backend → Progress Stage

  booked: "assigned", // booking created
  technician_assigned: "in_progress", // technician allocated

  assigned: "assigned",
  in_progress: "in_progress",
  completed: "completed",
  warranty: "completed",
  job_closed: "job_closed",

  pending: "assigned",
  cancelled: "job_closed",
};
export default function OrderScreen() {
  const {
    serviceRequests,
    stats,
    pagination,
    loading,
    error,
    currentFilters,
    fetchServiceRequests,
    refreshServiceRequests,
    loadMoreServiceRequests,
    updateFilters,
  } = useServiceRequests();

  // console.log("serviceRequests : ", serviceRequests);

  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const navigation = useNavigation<NavigationProp>();

  const currentTab =
    STATUS_TABS.find((tab) => tab.value === selectedTab) ?? STATUS_TABS[0];

  const getTabCount = (value: string) => {
    if (!stats) return 0;

    switch (value) {
      case "booked":
        return stats.booked || 0;
      case "completed":
        return stats.completed || 0;
      case "cancelled":
        return stats.cancelled || 0;
      case "all":
        return stats.totalRequests || 0;
      default:
        return 0;
    }
  };
  // Debounce ref
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchServiceRequests();

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

 const handleTabChange = (tab: (typeof STATUS_TABS)[0]) => {
  setSelectedTab(tab.value);

  if (tab.value === "all" || tab.value === "active") {
    updateFilters({ status: undefined });
  } else {
    updateFilters({ status: tab.value as ServiceRequestStatus });
  }
};

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (searchQuery.length > 2) {
      searchTimeoutRef.current = setTimeout(() => {
        const filters: any = {
          page: 1,
          limit: 10,
          search: searchQuery,
        };

        if (selectedTab !== "all") {
          filters.status = selectedTab;
        }

        fetchServiceRequests(filters);
      }, 800);
    }

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, selectedTab]);

  const refreshWithFilters = () => {
    const filters: any = { page: 1, limit: 10 };

    if (selectedTab !== "all") {
      filters.status = selectedTab;
    }

    if (searchQuery.length > 2) {
      filters.search = searchQuery;
    }

    fetchServiceRequests(filters);
  };



  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* <Header /> */}
      <View>
        {/* <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={moderateScale(22)} color={"#717A7E"} />
        </TouchableOpacity> */}
        <Text
          style={{
            fontSize: moderateScale(20),
            fontWeight: "600",
            marginBottom: verticalScale(12),
            color: "#864C2D",
          }}
        >
          My Bookings
        </Text>
      </View>
      
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_TABS}
          keyExtractor={(item, index) => item.value}
          contentContainerStyle={{
            gap: scale(12),
            alignItems: "center",
            // justifyContent: "space-between",
            width: scale(370),
            // borderWidth : 1,
            marginVertical: verticalScale(0),
          }}
          renderItem={({ item, index }) => {
            const isActive = selectedTab === item.value;

            return (
              <TouchableOpacity
                onPress={() => handleTabChange(item)}
                style={[
                  styles.tabButton,
                  {
                    // borderColor: item.color,
                    backgroundColor: isActive ? "#FB8264" : "",
                    borderWidth: moderateScale(1),
                    borderColor: "#F07D62",
                    // borderRightWidth: moderateScale(1),
                  },
                ]}
              >
                <Text
                  style={[styles.tabText, { color: isActive ? "#FFF" : "#FB8264", fontWeight: "700" }]}
                >
                  {item.label}
                </Text>

                {/* <View
                  style={[styles.countCircle, { backgroundColor: item.color }]}
                >
                  <Text
                    style={[
                      styles.tabCount,
                      { color: index == 1 ? "#000" : "#fff" },
                    ]}
                  >
                    {getTabCount(item.value)}
                  </Text>
                </View> */}
              </TouchableOpacity>
            );
          }}
        />
     
    </View>
  );

  const renderFooter = () => {
    if (!loading || serviceRequests.length === 0) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#153B93" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading && serviceRequests.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#153B93" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={refreshWithFilters}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No service requests found</Text>
      </View>
    );
  };

  const getProgressStage = (item: ServiceRequest) => {
    const rawStatus = item.status;
    const completedStatus = item.statusHistory?.find(
      (item) => item.status === "completed",
    );
    // console.log(completedStatus);

    // Hard mapping first
    const baseStage = STATUS_TO_PROGRESS[rawStatus];

    // If already job closed → done
    if (baseStage === "job_closed") return "job_closed";

    // Handle completed → warranty logic
    if (
      rawStatus === "completed" &&
      (item.serviceCompletedAt || completedStatus)
    ) {
      const completedTime = new Date(
        item.serviceCompletedAt || completedStatus?.timestamp || 0,
      ).getTime();
      const now = Date.now();

      const DAYS_5 = 1 * 24 * 60 * 60 * 1000;

      if (now - completedTime < DAYS_5) {
        return "warranty";
      }

      return "job_closed";
    }

    return baseStage;
  };

  const filteredRequests = serviceRequests.filter((item) => {
  if (selectedTab === "active") {
    const normalized = getProgressStage(item);

    return !["completed", "job_closed"].includes(normalized);
  }

  if (selectedTab === "completed") {
    const normalized = getProgressStage(item);

    return ["completed", "job_closed"].includes(normalized);
  }

  return true;
});

  function OrderCard({ item }: { item: ServiceRequest }) {
    const normalizedStatus = getProgressStage(item);

    // console.log("item :",item);

    const getStatusConfig = () => {
      switch (normalizedStatus) {
        case "in_progress":
          return {
            label: "In Progress",
            bg: "#FEF3C7",
            text: "#DD851C",
            progress: 0.75,
            bottomText: "In Progress",
          };

        case "completed":
        case "job_closed":
          return {
            label: "Completed",
            bg: "#D1FAE5",
            text: "#1CA177",
            progress: 1,
            bottomText: "Done",
          };

        case "assigned":
        default:
          return {
            label: "Scheduled",
            bg: "#EDE9FE",
            text: "#7D3FDE",
            progress: 0,
            bottomText: "Booked",
          };
      }
    };

    const status = getStatusConfig();

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.bookingCard}
        onPress={() => navigation.navigate("OrderDetailsScreen", { item })}
      >
        {/* Top Row */}
        <View style={styles.bookingTopRow}>
          <View style={styles.leftSection}>
            <View style={styles.serviceIconBox}>
              <Icon name="construct-outline" size={22} color="#864C2D" />
            </View>

            <View>
              <Text style={styles.serviceTitle}>{item.service?.name}</Text>

              <Text style={styles.serviceSubtitle}>
                {item.service?.category.name || "Service"}
              </Text>
            </View>
          </View>

          <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.text }]}>
              {status.label}
            </Text>
          </View>
        </View>

        {/* Date + Time */}
        <View style={styles.dateTimeRow}>
          <View style={styles.dateItem}>
            <Icon name="calendar-outline" size={16} color="#864C2D" />
            <Text style={styles.dateText}>
              {new Date(item.bookedAt!).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>

          <View style={styles.dateItem}>
            <Icon name="time-outline" size={16} color="#864C2D" />
            <Text style={styles.dateText}>
              {item.timeSlot || "2:00-5:00 PM"}
            </Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${status.progress * 100}%`,
              },
            ]}
          />
        </View>

        {/* Bottom */}
        <View style={styles.bottomRow}>
          <Text style={styles.bottomStatus}>{status.bottomText}</Text>

          <Text style={styles.priceText}>₹{item.inspection?.totals.grandTotal ?? item.finalPrice}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredRequests}
        keyExtractor={(item, index) => `${item._id}_${index}`}
        renderItem={({ item }) => <OrderCard item={item} />}
        
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={loading && currentFilters.page === 1}
            onRefresh={refreshWithFilters}
            colors={["#153B93"]}
          />
        }
        onEndReached={loadMoreServiceRequests}
        onEndReachedThreshold={0.5}
        contentContainerStyle={[
          serviceRequests.length === 0 && styles.emptyContainer,
          { gap: verticalScale(10), paddingBottom: verticalScale(300),   },
        ]}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
      />
      <CustomNavBar isLocal="Order" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // marginBottom : verticalScale(100)
    backgroundColor: "#FFF5EB",
    // paddingHorizontal: scale(8.8),
  },
  headerContainer: {
    backgroundColor: "#F6EBDE",
    paddingTop: 16,
    paddingBottom: verticalScale(20),
    marginBottom : verticalScale(16),
      paddingHorizontal: scale(10),
    // width: scale(400),
    // marginHorizontal: scale(-8.8),
  },
  tabCount: {
    fontWeight: "700",
    fontSize: moderateScale(8),
    alignSelf: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#F8F9FA",
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  bookingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(11),
    paddingVertical: verticalScale(18),
    marginBottom: verticalScale(14),
    borderWidth: 1,
    borderColor: "#EFD5B7",
      marginHorizontal: scale(10),
  },

  bookingTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  serviceIconBox: {
    width: scale(43),
    height: scale(43),
    borderRadius: moderateScale(8),
    backgroundColor: "#864C2D1A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
  },

  serviceTitle: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: "#864C2D",
  },

  serviceSubtitle: {
    fontSize: moderateScale(14),
    color: "#864C2D",
    marginTop: verticalScale(2),
  },

  statusPill: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(7),
    borderRadius: moderateScale(20),
  },

  statusText: {
    fontSize: moderateScale(13),
    fontWeight: "600",
  },

  dateTimeRow: {
    flexDirection: "row",
    marginTop: verticalScale(18),
  },

  dateItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: scale(18),
  },

  dateText: {
    marginLeft: scale(6),
    fontSize: moderateScale(13),
    color: "#864C2D",
  },

  progressTrack: {
    height: verticalScale(6),
    backgroundColor: "#F1E3DD",
    borderRadius: 20,
    overflow: "hidden",
    marginTop: verticalScale(18),
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#FB8264",
    borderRadius: scale(20),
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: verticalScale(14),
  },

  bottomStatus: {
    fontSize: moderateScale(15),
    color: "#000000B2",
  },

  priceText: {
    fontSize: moderateScale(28),
    fontWeight: "700",
    color: "#864C2D",
  },
  card: {
    // backgroundColor: "#FFFFFF1A",
    // borderRadius: moderateScale(14),
    // // padding: scale(14),
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.05,
    // shadowRadius: 6,
    // borderWidth: 1,
    // borderColor: "#ffffff",
    // overflow: "hidden",
    // elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    // borderWidth: 1,
    // borderColor: "#fff",
    backgroundColor: "#027CC7",
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(21),
    // borderRadius: moderateScale(12),
  },
  iconCircle: {
    width: scale(46),
    height: scale(46),
    borderRadius: 50,
    alignItems: "center",
    // position: "relative",
    // bottom: verticalScale(-4),
    borderColor: "#1A98E5",
    borderWidth: 1,
    justifyContent: "center",
  },
  iconText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: moderateScale(14),
  },
  orderHeaderRight: {
    flex: 1,
    marginLeft: scale(10),
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heading: {
    color: "#fff",
    fontSize: moderateScale(10),
    fontWeight: "500",
  },
  orderNo: {
    fontSize: moderateScale(14),
    color: "#fff",
    fontWeight: "500",
  },
  price: {
    fontSize: moderateScale(14),
    color: "#ffffff",
    fontWeight: "500",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    // marginTop: verticalScale(12),
    borderWidth: 1,
    borderColor: "#F2D6B5",
    backgroundColor: "#fff",
    paddingTop: verticalScale(19),
    paddingBottom: verticalScale(15),
    paddingHorizontal: scale(21),
    borderRadius: moderateScale(12),
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#000",
  },
  subLabel: {
    fontSize: moderateScale(11),
    color: "#888",
  },
  boxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(12.62),
  },
  progressContainer: {
    paddingVertical: verticalScale(8),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: "#F2D6B5",
    backgroundColor: "#fff",
    marginTop: verticalScale(10),
  },
  progressBar: {
    flexDirection: "row",
    height: verticalScale(6),
    borderRadius: moderateScale(6),
    overflow: "hidden",
    marginTop: verticalScale(14),
    marginHorizontal: scale(20),
    // paddingHorizontal: scale(20),
    // borderWidth : 1
  },
  progressSegment: {
    flex: 1,
  },
  verifyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: verticalScale(10),
    // borderWidth : 1
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
    justifyContent: "space-between",
    paddingHorizontal: scale(16),
    borderTopWidth: moderateScale(1),
    borderColor: "#E5DFDF",
    paddingBottom: verticalScale(14),
    paddingTop: verticalScale(8),
    // borderWidth : 1
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

  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  searchInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    fontSize: 15,
  },
  tabContainer: {
    // paddingHorizontal: 16,
    // marginBottom: 8,
    // marginTop: verticalScale(12),
    // width: scale(393),
    // gap : scale(1.5)
    // borderWidth : 1
  },
  tabButton: {
    // flex: 1,
    // flexGrow : 0.1,
    // flexWrap : 'wrap',
    flexDirection: "row",
    // marginHorizontal: scale(3),
    borderRadius: moderateScale(30),
    // borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    height: verticalScale(40.66),
    gap: scale(4),
    paddingHorizontal: scale(16),
  },
  tabButtonActive: {
    backgroundColor: "#153B93",
  },
  tabText: {
    fontSize: moderateScale(12),
    fontWeight: "400",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  countCircle: {
    width: scale(19.44),
    height: scale(19.44),
    // backgroundColor: "#fff",
    borderRadius: scale(20),
    borderWidth: moderateScale(1),
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#DC143C",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#153B93",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
