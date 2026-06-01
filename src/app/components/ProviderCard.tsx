import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { ConversationBookingResponse } from "../../utils/bookingApi";
import AutoAssignLoader from "./AutoAssignLoader";
import CustomView from "./CustomView";
import { scale, verticalScale } from "../../utils/scaling";

export default function ProviderCard({
  res,
}: {
  res: ConversationBookingResponse;
}) {
  const [activeTab, setActiveTab] = useState<"about" | "services" | "ratings">(
    "about",
  );
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const MAX_LENGTH = 180;

  const provider = res?.data?.provider;
  const providerProfile = res?.providerProfile;
  const badges = providerProfile?.badges || [];
  const providerStats = res?.providerStats;
  const ratings = providerProfile?.ratings;

  const name = provider?.companyName || "Company Name";
  const description =
    providerProfile?.about.description || "No description available";

  const jobSuccess = providerProfile?.jobSuccessScore || 0;
  const teamSize = providerProfile?.teamSize || 0;
  const jobsDone = providerStats?.totalCompletedJobs || 0;
  const responseTime = providerProfile?.about.responseTime || "N/A";

  const avgRating = ratings?.averageRating || 0;
  const totalReviews = ratings?.totalReviews || 0;
  const ratingDistribution = ratings?.distribution || {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const reviews = ratings?.recentReviews || [];

  const renderStars = (count: number) =>
    "★".repeat(count) + "☆".repeat(5 - count);

  if (loading) {
    return <AutoAssignLoader onFinish={() => setLoading(false)} name={name} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{backgroundColor : '#FFF5EB'}}>
        {/* ── HEADER ── */}
        <CustomView radius={8}>
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={{ fontSize: 28 }}>🔧</Text>
          </View>

          <View style={{ flex: 1 }}>
            {/* Name + verified */}
            <View style={styles.nameRow}>
              <Text style={styles.providerName}>{name}</Text>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color="#2870b0"
                style={{ marginLeft: 6, marginTop: 2 }}
              />
            </View>

            {/* Location */}
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={14} color="#2870b0" />
              <Text style={styles.locationText}>
                {providerProfile.about.serviceArea}, {providerProfile.about.zipcode}
              </Text>
            </View>

            {/* Badges */}
            <View style={styles.badgeRow}>
              {badges.map((badge: any) => (
                <View style={styles.topRatedChip} key={badge._id}>
                  <Ionicons name="ribbon-outline" size={13} color="#fff" />
                  <Text style={styles.topRatedText}> {badge.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        </CustomView>

        {/* ── JOB SUCCESS SCORE ── */}
       <CustomView radius={8}>
  <View style={styles.successSection}>
    <View style={styles.successLabelRow}>
      <Text style={styles.successLabel}>Job Success Score</Text>
      <Text style={styles.successPercent}>{jobSuccess}%</Text>
    </View>
    <View style={styles.progressBg}>
      <View
        style={[styles.progressFill, { width: `${jobSuccess}%` as any }]}
      />
    </View>
  </View>
</CustomView>

        {/* ── STAT CARDS ── */}
        <View style={styles.statRow}>
          <StatCard value={`0${teamSize}`} label="Team Size" color="#D9B298" />
          <View style={styles.statDivider} />
          <StatCard value={`0${jobsDone}`} label="Jobs done" color="#AB9DA8" />
          <View style={styles.statDivider} />
          <StatCard
            value={responseTime}
            label="Response Time"
            color="#94C2B8"
            isBlue
          />
        </View>

        {/* ── TABS ── */}
        <View style={styles.tabs}>
          <TabItem
            id="about"
            label="About"
            icon="information-circle-outline"
            active={activeTab === "about"}
            onPress={() => setActiveTab("about")}
          />
          <TabItem
            id="services"
            label="Services"
            icon="briefcase-outline"
            active={activeTab === "services"}
            onPress={() => setActiveTab("services")}
          />
          <TabItem
            id="ratings"
            label="Rating"
            icon="star-outline"
            active={activeTab === "ratings"}
            onPress={() => setActiveTab("ratings")}
          />
        </View>

        {/* ── ABOUT PANEL ── */}
        {activeTab === "about" && (
          <View style={styles.panel}>
            {/* About card */}
            <View style={styles.aboutCard}>
              <View style={styles.aboutCardHeader}>
                <Text style={styles.aboutCardTitle}>About {name}</Text>
                <View style={styles.sinceChip}>
                  <Ionicons name="time-outline" size={12} color="#2870b0" />
                  <Text style={styles.sinceText}>
                    {" "}
                    Since {providerProfile?.about.foundedYear || "2010"}
                  </Text>
                </View>
              </View>

              {/* Description */}
              <Text style={styles.descriptionText}>
                <Text style={{ fontWeight: "600" }}>Company description: </Text>
                {showFullDescription
                  ? description
                  : description.slice(0, MAX_LENGTH)}
                {description.length > MAX_LENGTH && (
                  <Text
                    style={{ color: "#1d4e7c", fontWeight: "600" }}
                    onPress={() => setShowFullDescription((p) => !p)}
                  >
                    {showFullDescription ? "  Read less" : "...  Read more"}
                  </Text>
                )}
              </Text>

              {/* Trust badges */}
              <View style={styles.trustRow}>
                <TrustChip
                  icon="refresh-circle-outline"
                  label="Background checked"
                  color="#DAB298"
                  textColor="#fff"
                />
                <TrustChip
                  icon="shield-checkmark-outline"
                  label="Certified"
                  color="#96AEA4"
                  textColor="#fff"
                />
              </View>
            </View>

            {/* Business Information */}
            <SectionCard title="Business Information">
              <View style={styles.infoGrid}>
                <InfoCell
                  label="Founded"
                  value={`${providerProfile?.about.foundedYear || "N/A"}`}
                />
                <InfoCell
                  label="GST"
                  value={providerProfile?.about.gstNumber || "N/A"}
                  badge="Verified"
                  badgeColor="#e6f2eb"
                  badgeTextColor="#1a6b40"
                />
                <InfoCell
                  label="Phone no"
                  value={providerProfile?.about.phone || "N/A"}
                  badge={providerProfile?.about.phone}
                  badgeColor="#fde8e8"
                  badgeTextColor="#c0392b"
                  isPhone
                />
                <InfoCell
                  label="Email"
                  value={providerProfile?.about.email || "N/A"}
                />
                <InfoCell
                  label="Website"
                  value={providerProfile?.about.website || "N/A"}
                  fullWidth
                />
              </View>
            </SectionCard>

            {/* Service Details */}
            <SectionCard title="Service Details">
              <View style={styles.infoGrid}>
                <InfoCell
                  label="Service done in"
                  value={providerProfile?.about.serviceDoneIn || "N/A"}
                  badge={providerProfile?.about.serviceDoneIn}
                  badgeColor="#eaf3fd"
                  badgeTextColor="#1d4e7c"
                  hasClockIcon
                />
                <InfoCell
                  label="Response"
                  value={providerProfile?.about.responseTime || "N/A"}
                />
                <InfoCell
                  label="Service area"
                  value={providerProfile?.about.serviceArea || "N/A"}
                />
                <InfoCell
                  label="Working Hour"
                  value="9am - 6pm"
                  badge="9am - 6pm"
                  badgeColor="#eaf3fd"
                  badgeTextColor="#1d4e7c"
                  hasClockIcon
                />

                {/* Payment Methods */}
                <View style={styles.infoCellWrap}>
                  <Text style={styles.infoCellLabel}>Payment Methods</Text>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      marginTop: 6,
                      gap: 6,
                    }}
                  >
                    {(providerProfile?.about.acceptedPayments || []).map(
                      (p: string) => (
                        <View key={p} style={styles.methodChip}>
                          <Ionicons
                            name="wallet-outline"
                            size={13}
                            color="#555"
                          />
                          <Text style={styles.methodChipText}> {p}</Text>
                        </View>
                      ),
                    )}
                  </View>
                </View>

                {/* Languages */}
                <View style={styles.infoCellWrap}>
                  <Text style={styles.infoCellLabel}>Regional Language</Text>
                  <Text style={styles.infoCellValue}>
                    {(providerProfile?.about.languages || []).join(", ") ||
                      "N/A"}
                  </Text>
                </View>
              </View>
            </SectionCard>
          </View>
        )}

        {/* ── SERVICES PANEL ── */}
        {activeTab === "services" && (
          <View style={styles.panel}>
            {providerProfile?.services?.byCategory &&
              Object.entries(providerProfile.services.byCategory).map(
                ([category, services]: any) => (
                  <ServiceSection
                    key={category}
                    title={category}
                    items={services.map((s: any) => s.name)}
                  />
                ),
              )}
          </View>
        )}

        {/* ── RATINGS PANEL ── */}
        {activeTab === "ratings" && (
          <View style={styles.panel}>
            <View style={styles.ratingHeader}>
              <View style={styles.averageBox}>
                <Text style={styles.avgNumber}>{providerStats.rating}</Text>
                <Text style={styles.avgStars}>★★★★☆</Text>
                <Text style={styles.reviewCount}>{totalReviews} reviews</Text>
              </View>
              <View style={{ flex: 1 }}>
                <RatingBar label="5★" percent={ratingDistribution[5]} />
                <RatingBar label="4★" percent={ratingDistribution[4]} />
                <RatingBar label="3★" percent={ratingDistribution[3]} />
                <RatingBar label="2★" percent={ratingDistribution[2]} />
                <RatingBar label="1★" percent={ratingDistribution[1]} />
              </View>
            </View>

            {reviews.map((item: any) => (
              <View key={item.reviewId} style={styles.reviewItem}>
                <Text style={styles.reviewAuthor}>
                  {item.userName}{" "}
                  <Text style={{ color: "#f5b342" }}>
                    {renderStars(Math.round(item.averageRating))}
                  </Text>
                </Text>
                <Text style={styles.reviewText}>{item.feedback}</Text>
                <Text style={styles.reviewDate}>
                  {new Date(item.createdAt).toDateString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 70 }} />
      </ScrollView>

      {/* ── BOTTOM BAR ── */}
      <View style={styles.bottomBar}>
        <Text style={styles.bottomBarText}>
          Hi {firstName}, We will contact you shortly
        </Text>
      </View>
    </SafeAreaView>
  );
}

/* ─── Sub-components ─── */

const StatCard = ({ value, label, color, isBlue }: any) => (
  <CustomView radius={8}>
  <View style={styles.statCard}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
  </CustomView>
);

const TabItem = ({ id, label, icon, active, onPress }: any) => (
  <TouchableOpacity
    style={[styles.tabItem, active && styles.activeTab]}
    onPress={onPress}
  >
    <Ionicons name={icon} size={16} color={active ? "#1d4e7c" : "#8ca5bf"} />
    <Text style={[styles.tabText, active && styles.activeTabText]}>
      {" "}
      {label}
    </Text>
  </TouchableOpacity>
);

const TrustChip = ({ icon, label, color, textColor }: any) => (
  <View style={[styles.trustChip, { backgroundColor: color }]}>
    <Ionicons name={icon} size={14} color={textColor} />
    <Text style={[styles.trustChipText, { color: textColor }]}> {label}</Text>
  </View>
);

const SectionCard = ({ title, children }: any) => (
  <View style={styles.sectionCard}>
    <Text style={styles.sectionCardTitle}>{title}</Text>
    {children}
  </View>
);

const InfoCell = ({
  label,
  value,
  badge,
  badgeColor,
  badgeTextColor,
  isPhone,
  hasClockIcon,
  fullWidth,
}: any) => (
  <View style={[styles.infoCellWrap, fullWidth && { width: "100%" }]}>
    <Text style={styles.infoCellLabel}>{label}</Text>
    {badge ? (
      <View style={[styles.infoBadge, { backgroundColor: badgeColor }]}>
        {hasClockIcon && (
          <Ionicons name="time-outline" size={12} color={badgeTextColor} />
        )}
        {isPhone && (
          <Ionicons name="time-outline" size={12} color={badgeTextColor} />
        )}
        <Text style={[styles.infoBadgeText, { color: badgeTextColor }]}>
          {isPhone
            ? value
            : hasClockIcon
              ? value
              : label === "GST"
                ? "✔ Verified"
                : badge}
        </Text>
      </View>
    ) : (
      <Text style={styles.infoCellValue}>{value}</Text>
    )}
  </View>
);

const ServiceSection = ({ title, items }: any) => (
  <View style={{ marginBottom: 20 }}>
    <Text style={styles.serviceTitle}>{title}</Text>
    <View style={styles.serviceWrap}>
      {items.map((item: string) => (
        <View key={item} style={styles.serviceChip}>
          <Text>{item}</Text>
        </View>
      ))}
    </View>
  </View>
);

const RatingBar = ({ label, percent }: any) => (
  <View style={styles.barRow}>
    <Text style={styles.barLabel}>{label}</Text>
    <View style={styles.barBg}>
      <View style={[styles.barFill, { width: `${percent}%` as any }]} />
    </View>
    <Text style={styles.barPercent}>{percent}%</Text>
  </View>
);

/* ─── Styles ─── */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFF5EB" },

  /* Header */
  header: {
    flexDirection: "row",
    padding: 18,
    paddingBottom: 13,
    // backgroundColor: "#fff",
    // borderWidth : 1
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: "#0a1f3c",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  nameRow: { flexDirection: "row", alignItems: "center" },
  providerName: { fontSize: 20, fontWeight: "700", color: "#0c2b44" },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  locationText: { marginLeft: 4, color: "#4b657f", fontSize: 13 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, gap: 6 },
  topRatedChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#C702B3",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  topRatedText: { fontSize: 12, color: "#fff", fontWeight: "600" },

  /* Job Success */
  successSection: {
    // backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  successLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  successLabel: { fontSize: 14, fontWeight: "600", color: "#1a3852" },
  successPercent: { fontSize: 14, fontWeight: "700", color: "#2870b0" },
  progressBg: {
    height: 8,
    backgroundColor: "#e2eaf3",
    borderRadius: 10,
  },
  progressFill: {
    height: 8,
    backgroundColor: "#2870b0",
    borderRadius: 10,
  },

  /* Stat cards */
  statRow: {
    flexDirection: "row",
    // backgroundColor: "#fff",
    marginTop: 1,
    paddingVertical: 14,
    justifyContent :'space-between',
    paddingHorizontal: 4,
  },
  statCard: { flex: 1, alignItems: "center", width: scale(110), paddingVertical : verticalScale(7) },
  statValue: { fontSize: 16, fontWeight: "700" },
  statLabel: { fontSize: 12, color: "#7893af", marginTop: 2 },
  statDivider: { width: 1, backgroundColor: "#e4ebf3", marginVertical: 4 },

  /* Tabs */
  tabs: {
    flexDirection: "row",
    // backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#e4ebf3",
    marginTop: 1,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 13,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  tabText: { color: "#8ca5bf", fontWeight: "600", fontSize: 13 },
  activeTab: { borderBottomWidth: 3, borderColor: "#1d4e7c" },
  activeTabText: { color: "#1d4e7c" },

  /* Panel */
  panel: { padding: 14, backgroundColor: "#FFF5EB" },

  /* About card */
  aboutCard: {
    // backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  aboutCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  aboutCardTitle: { fontSize: 15, fontWeight: "700", color: "#1a3852" },
  sinceChip: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "#eaf3fd",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  sinceText: { fontSize: 12, color: "#1d4e7c", fontWeight: "600" },
  descriptionText: { fontSize: 13.5, color: "#2b4e6e", lineHeight: 20 },
  trustRow: { flexDirection: "row", marginTop: 12, gap: 8 },
  trustChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  trustChipText: { fontSize: 12, fontWeight: "600" },

  /* Section card */
  sectionCard: {
    // backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  sectionCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a3852",
    marginBottom: 14,
  },

  /* Info grid */
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 0,
  },
  infoCellWrap: {
    width: "50%",
    paddingRight: 8,
    marginBottom: 16,
  },
  infoCellLabel: { fontSize: 12, color: "#8ca5bf", marginBottom: 4 },
  infoCellValue: { fontSize: 14, fontWeight: "600", color: "#0d2d48" },
  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
    gap: 4,
  },
  infoBadgeText: { fontSize: 12, fontWeight: "600" },
  methodChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f4f8",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  methodChipText: { fontSize: 12, color: "#3d4f63", fontWeight: "600" },

  /* Services */
  serviceTitle: {
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 10,
    color: "#1a3852",
  },
  serviceWrap: { flexDirection: "row", flexWrap: "wrap" },
  serviceChip: {
    backgroundColor: "#f4f9ff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },

  /* Ratings */
  ratingHeader: { flexDirection: "row", marginBottom: 20 },
  averageBox: {
    backgroundColor: "#1d4e7c",
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    marginRight: 16,
  },
  avgNumber: { fontSize: 26, fontWeight: "800", color: "#fff" },
  avgStars: { color: "#ffcd7e" },
  reviewCount: { color: "#fff", fontSize: 12 },
  barRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  barLabel: { width: 35, fontSize: 12 },
  barBg: {
    flex: 1,
    height: 8,
    backgroundColor: "#e2eaf3",
    borderRadius: 20,
    marginHorizontal: 6,
  },
  barFill: { height: 8, backgroundColor: "#ffb443", borderRadius: 20 },
  barPercent: { width: 40, fontSize: 12, color: "#7893af" },
  reviewItem: {
    borderTopWidth: 1,
    borderColor: "#e5edf5",
    paddingVertical: 12,
  },
  reviewAuthor: { fontWeight: "600" },
  reviewText: { marginVertical: 4, color: "#2b4e6e" },
  reviewDate: { fontSize: 12, color: "#7893af" },

  /* Bottom bar */
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1D365D',
    paddingVertical: 16,
    alignItems: "center",
  },
  bottomBarText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
