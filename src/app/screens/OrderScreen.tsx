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
import { ItemData } from "../../constants/types";
import { formatDate } from "../../utils/date";
import ScreenWrapper from "../components/ScreenWrapper";
import Header from "../components/Header";
import { moderateScale, scale, verticalScale } from "../../utils/scaling";
import { StackNavigationProp } from "@react-navigation/stack";
import { OrderStackParamList } from "../../constants/navigation";
import { Ionicons as Icon } from "@expo/vector-icons";
import CustomView from "../components/CustomView";

const STATUS_TABS = [
  { label: "Active", value: "all", color: "#027CC7" },
  { label: "Pending", value: "booked", color: "#FFD768" },
  { label: "Completed", value: "completed", color: "#027CC7" },
  { label: "Cancelled", value: "cancelled", color: "#FF0000" },
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
  assigned: "#3B82F6",
  in_progress: "#F59E0B",
  completed: "#22C55E",
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

    if (tab.value === "all") {
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
        <TouchableOpacity onPress={()=>navigation.goBack()} >
        
        <Icon name="arrow-back" size={moderateScale(22)} color={"#717A7E"} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: moderateScale(14),
            fontWeight: "600",
            marginVertical: verticalScale(6),
            color: "#1A1A1A",
          }}
        >
          Orders
        </Text>
      </View>
      <CustomView radius={scale(14.84)} boxStyle={{ overflow: "hidden" }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_TABS}
          keyExtractor={(item) => item.value}
          contentContainerStyle={{
            // gap: scale(3.5),
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
                    backgroundColor: isActive ? "#DCECFE" : "#ffffff00",
                    borderRightWidth:
                      index == STATUS_TABS.length - 1 ? 0 : moderateScale(1),
                    borderColor: "#BCBBC580",
                  },
                ]}
              >
                <Text
                  style={[styles.tabText, { color: "#000", fontWeight: "600" }]}
                >
                  {item.label}
                </Text>

                <View
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
                </View>
              </TouchableOpacity>
            );
          }}
         
        />
      </CustomView>
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

  function OrderCard({ item }: { item: ServiceRequest }) {
    const normalizedStatus = STATUS_TO_PROGRESS[item.status];

    return (
      <CustomView
        radius={scale(16)}
        boxStyle={{
          overflow: "hidden",
          paddingHorizontal: scale(12.6),
          paddingVertical: verticalScale(18),
        }}
      >
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("OrderDetailsScreen", { item })}
          // onPress={() => console.log("STATUS FROM API:", item.status)}
        >
          <Text
            style={{
              textTransform: "uppercase",
              fontSize: moderateScale(16),
              fontWeight: "700",
              marginBottom: verticalScale(12),
            }}
          >
            {item.service.name} REPAIR
          </Text>

          <CustomView radius={scale(16.3)}>
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
          <CustomView
            radius={scale(16.13)}
            shadowStyle={{ marginTop: verticalScale(10) }}
          >
            <View>
              <View style={styles.boxRow}>
                <Text style={styles.label}>1 Window AC</Text>
                <Text style={[styles.label, { color: currentTab.color }]}>
                  <Icon
                    name="ellipse"
                    size={moderateScale(10)}
                    color={currentTab.color}
                  />{" "}
                  {currentTab.label}
                </Text>
              </View>
              <View
                style={[
                  styles.boxRow,
                  {
                    borderTopWidth: moderateScale(1),
                    borderBottomWidth: moderateScale(1),
                    borderColor: "#E0E0E0",
                  },
                ]}
              >
                <Text style={styles.label}>Problem Type</Text>
                <Text style={styles.label}>Active</Text>
              </View>
              <View style={styles.boxRow}>
                <Text style={styles.label}>Price</Text>
                <Text style={styles.label}>{item.finalPrice}</Text>
              </View>
            </View>
          </CustomView>
          <CustomView
            radius={scale(16.13)}
            shadowStyle={{ marginTop: verticalScale(10) }}
          >
            <View style={styles.progressContainer}>
              {/* 🔥 FIXED PROGRESS BAR */}
              <View style={styles.progressBar}>
                {PROGRESS_STAGES.map((stage) => {
                  const isActive =
                    PROGRESS_STAGES.indexOf(normalizedStatus) >=
                    PROGRESS_STAGES.indexOf(stage);

                  return (
                    <View
                      key={stage}
                      style={[
                        styles.progressSegment,
                        {
                          backgroundColor: isActive
                            ? PROGRESS_COLORS[stage]
                            : "#D1D5DB",
                        },
                      ]}
                    />
                  );
                })}
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
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: item.color },
                      ]}
                    />
                    <Text style={styles.legendText}>{item.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          </CustomView>
        </TouchableOpacity>
      </CustomView>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={serviceRequests}
        keyExtractor={(item) => item._id + item.bookedAt}
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
          { gap: verticalScale(10), paddingBottom: verticalScale(300) },
        ]}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // marginBottom : verticalScale(100)
    backgroundColor: "#F0EFF8",
    paddingHorizontal: scale(8.8),
  },
  headerContainer: {
    // backgroundColor: "#FFFFFF",
    paddingTop: 16,
    paddingBottom: 12,
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
    // borderWidth: 1,
    // borderColor: "#fff",
    backgroundColor: "#FFFFFF1A",
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
    // borderRadius: moderateScale(12),
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
    flexDirection: "row",
    // marginHorizontal: scale(3),
    // borderRadius: moderateScale(30),
    // borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    height: verticalScale(40.66),
    gap: scale(4),
    paddingHorizontal: scale(12),
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
