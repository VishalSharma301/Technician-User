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

const STATUS_TABS: {
  label: string;
  value: ServiceRequestStatus | "all" | "upcoming" | "past";
  color: string;
}[] = [
  // { label: "All", value: "all" },
  { label: "Active", value: "in_progress", color: "#027CC7" },
  { label: "Pending", value: "pending", color: "#FFD768" },
  { label: "Completed", value: "completed", color: "#22C55E" },
  { label: "Cancelled", value: "cancelled", color: "#FF0000" },
];

type NavigationProp = StackNavigationProp<OrderStackParamList, "OrderScreen">;

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

  // Debounce timer ref
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchServiceRequests();

    // Cleanup debounce on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleTabChange = (tab: (typeof STATUS_TABS)[0]) => {
    setSelectedTab(tab.value);

    // Update filters to include upcoming if tab is upcoming
    if (tab.value === "upcoming") {
      updateFilters({ upcoming: true, status: undefined, past: undefined });
    } else if (tab.value === "past") {
      updateFilters({ past: true, upcoming: undefined, status: undefined });
    } else if (tab.value === "all") {
      updateFilters({
        status: undefined,
        upcoming: undefined,
        past: undefined,
      });
    } else {
      updateFilters({
        status: tab.value as ServiceRequestStatus,
        upcoming: undefined,
        past: undefined,
      });
    }
  };

  useEffect(() => {
    // Clear any previous timer
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Only run search when query has at least 3 characters
    if (searchQuery.length > 2) {
      searchTimeoutRef.current = setTimeout(() => {
        console.log("Debounced search for:", searchQuery);

        let filters: any = {
          page: 1,
          limit: 10,
          search: searchQuery,
        };

        // Apply current tab filters
        if (selectedTab === "upcoming") {
          filters.upcoming = true;
        } else if (selectedTab === "past") {
          filters.past = true;
        } else if (selectedTab !== "all") {
          filters.status = selectedTab;
        }

        fetchServiceRequests(filters);
      }, 800); // delay before calling API
    }

    // Cleanup on re-run
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, selectedTab]); // run

  // Refresh with current tab filters
  const refreshWithFilters = () => {
    let filters: any = { page: 1, limit: 10 };

    if (selectedTab === "upcoming") {
      filters.upcoming = true;
    } else if (selectedTab === "past") {
      filters.past = true;
    } else if (selectedTab !== "all") {
      filters.status = selectedTab;
    }

    // Include search query if present
    if (searchQuery && searchQuery.length > 2) {
      filters.search = searchQuery;
    }

    fetchServiceRequests(filters);
  };

  // const handleCardPress = (item: ServiceRequest) => {
  //   const data: ItemData = {
  //     _id: item._id,
  //     name: item.service?.name || "Service",
  //     createdAt: formatDate(item.createdAt),
  //     description: item.notes || "No description",
  //     price: item.finalPrice || "unavailable",
  //     subType: "General",
  //     notes: item.notes || "No additional notes",
  //     image: "https://via.placeholder.com/150",
  //     isMakingNoise: "false",
  //     mainType: "General",
  //     phone: "N/A",
  //     address: item.address,
  //     quantity: item.quantity || 1,
  //   };

  //   // Navigate to detail screen
  //   // console.log("Service Request pressed:", item);
  //   navigation.navigate("OrderDetailsScreen", {
  //     data: data,
  //     pin: item.completionPin,
  //     item: item,
  //   });
  // };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Header />

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={STATUS_TABS}
        keyExtractor={(item) => item.value}
        contentContainerStyle={{ gap : scale(3.5)}}
        renderItem={({ item }) => {
          const isActive = selectedTab === item.value;

          return (
            <TouchableOpacity
              onPress={() => handleTabChange(item)}
              style={[
                styles.tabButton,
                {
                  borderColor: item.color,
                  backgroundColor: isActive
                    ? `${item.color}15` // active transparency
                    : `${item.color}08`, // normal state
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: "#000",
                    fontWeight: "600",
                  },
                ]}
              >
                {item.label}
              </Text>

              <View
                style={{
                  width: scale(21),
                  height: scale(21),
                  backgroundColor: "#fff",
                  borderRadius: scale(20),
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={[styles.tabCount, { color: item.color }]}>
                  {"10"}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        style={styles.tabContainer}
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

  function OrderCard({ item }: { item: ServiceRequest }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("OrderDetailsScreen", { item })}
      >
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

        <View
          style={{
            borderWidth: 1,
            borderColor: "#fff",
            backgroundColor: "#FFFFFF1A",
            paddingVertical: verticalScale(14),
            // paddingHorizontal: scale(21),
            borderRadius: moderateScale(12),
            marginTop: verticalScale(15),
          }}
        >
          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <View
              style={[styles.progressSegment, { backgroundColor: "#0083D3" }]}
            />
            <View
              style={[styles.progressSegment, { backgroundColor: "#E6B325" }]}
            />
            <View
              style={[styles.progressSegment, { backgroundColor: "#4CAF50" }]}
            />
            <View
              style={[styles.progressSegment, { backgroundColor: "#9C27B0" }]}
            />
            <View
              style={[styles.progressSegment, { backgroundColor: "#9E9E9E" }]}
            />
          </View>

          <View style={styles.verifyRow}>
            <Text style={styles.deviceText}>1 WINDOW AC</Text>
          </View>

          {/* Legend */}
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
                  style={[styles.legendDot, { backgroundColor: item.color }]}
                />
                <Text style={styles.legendText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <ScreenWrapper style={{ paddingHorizontal: scale(9) }}>
      <View style={styles.container}>
        <FlatList
          data={serviceRequests}
          keyExtractor={(item) => item._id + item.bookedAt}
          renderItem={({ item }) => (
            // <ServiceRequestCard request={item} onPress={handleCardPress} />
            <OrderCard item={item} />
          )}
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
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // marginBottom : verticalScale(100)
    // backgroundColor: "#F5F5F5",
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
    backgroundColor: "#FFFFFF1A",
    borderRadius: moderateScale(14),
    padding: scale(14),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "#ffffff",
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
    marginBottom: 8,
    marginTop: verticalScale(12),
    width : scale(393),
    // gap : scale(1.5)
    // borderWidth : 1
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
    paddingHorizontal: scale(6),
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
