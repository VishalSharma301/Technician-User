import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { ConversationBookingResponse } from "../../utils/bookingApi";

export default function ProviderCard({
  res,
}: {
  res: ConversationBookingResponse;
}) {
  const [activeTab, setActiveTab] = useState<"about" | "services" | "ratings">(
    "about",
  );

   const name = res?.data.provider?.companyName || "Company Name";
  const providerStats = res?.providerStats


  const reviews = [
    {
      id: "1",
      name: "Gurpreet S.",
      rating: 5,
      text: "Very professional, fixed my AC quickly. Reasonable price.",
      date: "2 days ago",
    },
    {
      id: "2",
      name: "Neha V.",
      rating: 4,
      text: "Geyser service was good, but response took a bit longer.",
      date: "1 week ago",
    },
  ];

  const renderStars = (count: number) => {
    return "★".repeat(count) + "☆".repeat(5 - count);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={{ fontSize: 28 }}>🔧</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.providerName}>{name}</Text>

            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={14} color="#2870b0" />
              <Text style={styles.locationText}>{res.data.address.city}, {res.data.address.state}</Text>
            </View>

            <View style={styles.badgeRow}>
              <View style={styles.successChip}>
                <Ionicons name="trophy" size={12} color="#0e6245" />
                <Text style={styles.successText}>Job success {98}%</Text>
              </View>

              <View style={styles.topRatedChip}>
                <Ionicons name="star" size={12} color="#a45f15" />
                <Text style={styles.topRatedText}>TOP RATED</Text>
              </View>
            </View>
          </View>
        </View>

        {/* TEAM STATS */}
        <View style={styles.teamStats}>
          <Text style={styles.statText}>👥 Team size: {providerStats.totalTechnicians}</Text>
          <Text style={styles.statText}>📋 Jobs done: {providerStats.totalCompletedJobs}</Text>
        </View>

        {/* TABS */}
        <View style={styles.tabs}>
          {["about", "services", "ratings"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab as any)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* PANELS */}
        {activeTab === "about" && (
          <View style={styles.panel}>
            <View style={styles.descriptionCard}>
  <Text style={styles.descriptionTitle}>
    About {name}
  </Text>

  <Text style={styles.descriptionText}>
    <Text style={{ fontWeight: "600" }}>
      Company description:
    </Text>{" "}
    With over a decade of experience, we specialize in
    comprehensive home appliance repair and maintenance —
    AC, chimney, geyser, and more. Our certified technicians
    ensure prompt, reliable service with a 96-hour turnaround.
    We proudly serve Bassi Pathana and surrounding areas,
    maintaining a fully stocked inventory for quick fixes.
    Customer satisfaction and background-verified staff are our
    top priorities.
  </Text>

  <View style={styles.badgeRowWrap}>
    <View style={styles.greenBadge}>
      <Text style={styles.greenBadgeText}>
        ✔ 100% background checked
      </Text>
    </View>

    <View style={styles.grayBadge}>
      <Text style={styles.grayBadgeText}>
        ● since 2010
      </Text>
    </View>
  </View>
</View>
            <AboutRow icon="map-pin" label="Zip code" value={res.data.address.zipcode} />
            <AboutRow
              icon="hourglass-half"
              label="Service done in"
              value="within 96 hours"
            />
            <AboutRow icon="box" label="Inventory" value="Available" />
            <AboutRow
              icon="calendar"
              label="Founded · GST"
              value="2010 · 5372772728288"
            />
            <AboutRow icon="stopwatch" label="Response" value="30 min" />
            <AboutRow icon="globe" label="Website" value="abc@hhh.com" />
            <AboutRow icon="map-marker-alt" label="Service area" value={res.data.address.city+" & nearby"} />

{/* Certified + Background checked chips */}
<View style={styles.aboutRow}>
  <FontAwesome5 name="shield-alt" size={16} color="#1f4970" />
  <View style={{ marginLeft: 12, flexDirection: "row", flexWrap: "wrap" }}>
    <View style={styles.chip}>
      <Text style={styles.chipText}>Certified</Text>
    </View>

    <View style={[styles.chip, { marginLeft: 8 }]}>
      <Text style={styles.chipText}>Background checked</Text>
    </View>
  </View>
</View>

<AboutRow icon="globe" label="Website" value="abc@hhh.com" />
<AboutRow icon="envelope" label="Email" value={res.data.provider?.email} />

{/* Payment */}
<View style={styles.aboutRow}>
  <FontAwesome5 name="credit-card" size={16} color="#1f4970" />
  <View style={{ marginLeft: 12 }}>
    <Text style={styles.label}>Payment</Text>

    <View style={{ flexDirection: "row", marginTop: 6 }}>
      <View style={styles.paymentChip}>
        <Text>💵 cash</Text>
      </View>

      <View style={[styles.paymentChip, { marginLeft: 8 }]}>
        <Text>📱 UPI</Text>
      </View>
    </View>
  </View>
</View>

{/* Languages */}
<View style={styles.aboutRow}>
  <FontAwesome5 name="language" size={16} color="#1f4970" />
  <View style={{ marginLeft: 12 }}>
    <Text style={styles.label}>We speak</Text>

    <View style={{ flexDirection: "row", marginTop: 6 }}>
      <View style={styles.languageChip}>
        <Text>Punjabi</Text>
      </View>

      <View style={[styles.languageChip, { marginLeft: 8 }]}>
        <Text>Hindi</Text>
      </View>
    </View>
  </View>
</View>
          </View>
        )}

        {activeTab === "services" && (
          <View style={styles.panel}>
            <ServiceSection
              title="Cooling & ventilation"
              items={["AC service", "Chimney clean", "Geyser repair"]}
            />
            <ServiceSection
              title="Additional repairs"
              items={[
                "Water heater",
                "Ventilation",
                "Washing machine",
                "Microwave",
              ]}
            />
          </View>
        )}

        {activeTab === "ratings" && (
          <View style={styles.panel}>
            {/* Rating Header */}
            <View style={styles.ratingHeader}>
              <View style={styles.averageBox}>
                <Text style={styles.avgNumber}>{providerStats.rating}</Text>
                <Text style={styles.avgStars}>★★★★☆</Text>
                <Text style={styles.reviewCount}>247 reviews</Text>
              </View>

              <View style={{ flex: 1 }}>
                <RatingBar label="5★" percent={70} />
                <RatingBar label="4★" percent={18} />
                <RatingBar label="3★" percent={7} />
                <RatingBar label="2★" percent={3} />
                <RatingBar label="1★" percent={2} />
              </View>
            </View>

            {/* Reviews */}
            {reviews.map((item) => (
              <View key={item.id} style={styles.reviewItem}>
                <Text style={styles.reviewAuthor}>
                  {item.name}{" "}
                  <Text style={{ color: "#f5b342" }}>
                    {renderStars(item.rating)}
                  </Text>
                </Text>
                <Text style={styles.reviewText}>{item.text}</Text>
                <Text style={styles.reviewDate}>{item.date}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const AboutRow = ({ icon, label, value }: any) => (
  <View style={styles.aboutRow}>
    <FontAwesome5 name={icon} size={16} color="#1f4970" />
    <View style={{ marginLeft: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
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
      <View style={[styles.barFill, { width: `${percent}%` }]} />
    </View>
    <Text style={styles.barPercent}>{percent}%</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#fff",
  },

  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#0a3350",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },

  providerName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0c2b44",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  locationText: {
    marginLeft: 6,
    color: "#4b657f",
  },

  badgeRow: {
    flexDirection: "row",
    marginTop: 8,
  },

  successChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e2f0e8",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 8,
  },

  successText: { marginLeft: 4, fontSize: 12 },

  topRatedChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#feeed7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  topRatedText: { marginLeft: 4, fontSize: 12 },

  teamStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f2f8ff",
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 12,
    borderRadius: 30,
  },

  statText: { fontWeight: "600" },

  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#e4ebf3",
  },

  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
  },

  tabText: { color: "#62748b", fontWeight: "600" },

  activeTab: {
    borderBottomWidth: 3,
    borderColor: "#1d4e7c",
  },

  activeTabText: {
    color: "#1d4e7c",
  },

  panel: {
    padding: 20,
    backgroundColor: "#fff",
  },

  aboutRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
descriptionCard: {
  backgroundColor: "#f1f6fb",
  padding: 16,
  borderRadius: 18,
  marginBottom: 20,
},

descriptionTitle: {
  fontSize: 16,
  fontWeight: "700",
  marginBottom: 8,
  color: "#1a3852",
},

descriptionText: {
  fontSize: 14,
  color: "#2b4e6e",
  lineHeight: 20,
},

badgeRowWrap: {
  flexDirection: "row",
  marginTop: 12,
},

greenBadge: {
  backgroundColor: "#e2f0e8",
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
},

greenBadgeText: {
  fontSize: 12,
  color: "#0e6245",
  fontWeight: "600",
},

grayBadge: {
  backgroundColor: "#e9edf2",
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
  marginLeft: 8,
},

grayBadgeText: {
  fontSize: 12,
  color: "#3d4f63",
},

chip: {
  backgroundColor: "#e9f0f8",
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
},

chipText: {
  fontSize: 12,
  color: "#15456b",
},

paymentChip: {
  backgroundColor: "#faf2ea",
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
},

languageChip: {
  backgroundColor: "#e3ecf5",
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
},
  label: { fontWeight: "600", color: "#657e9c" },

  value: { color: "#0d2d48", marginTop: 2 },

  serviceTitle: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 10,
  },

  serviceWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  serviceChip: {
    backgroundColor: "#f4f9ff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },

  ratingHeader: {
    flexDirection: "row",
    marginBottom: 20,
  },

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

  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  barLabel: { width: 35 },

  barBg: {
    flex: 1,
    height: 8,
    backgroundColor: "#e2eaf3",
    borderRadius: 20,
    marginHorizontal: 6,
  },

  barFill: {
    height: 8,
    backgroundColor: "#ffb443",
    borderRadius: 20,
  },

  barPercent: { width: 40 },

  reviewItem: {
    borderTopWidth: 1,
    borderColor: "#e5edf5",
    paddingVertical: 12,
  },

  reviewAuthor: { fontWeight: "600" },

  reviewText: { marginVertical: 4 },

  reviewDate: { fontSize: 12, color: "#7893af" },
});
