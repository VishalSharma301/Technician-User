import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "../../utils/scaling";
import CustomView from "./CustomView";
import { useServices } from "../../hooks/useServices";
import { iconMap, IconName } from "../../utils/iconMap";

export default function ProviderCard() {
  const [activeTab, setActiveTab] = useState<"provider" | "customer">(
    "provider"
  );
  const { quickPickServices } = useServices();

  return (
    // <CustomView
    //   isGradient={false}
    //   radius={scale(14.9)}
    //   width={scale(370)}
    //   boxStyle={styles.container}
    //   shadowStyle={{ backgroundColor: "#8092ac68" }}
    // >
    <View style={styles.container}>
      {/* ---------- PROVIDER HEADER ---------- */}
      <View style={styles.providerCard}>
        <View style={styles.providerHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>VS</Text>
          </View>

          <View style={{ flex: 1 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Text style={styles.providerName}>Vishal Enterprises</Text>
              <Feather name="check-circle" size={14} color="#1DA1F2" />
            </View>
            <Text style={styles.location}>📍 Mohali India</Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            gap: scale(8),
            alignItems: "center",
            marginVertical: verticalScale(10),
          }}
        >
          <View
            style={{
              flexDirection: "row",
              gap: scale(8),
              alignItems: "center",
            }}
          >
            <Feather name="gift" color={"gold"} />
            <Text>96% Job Success</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              gap: scale(8),
              alignItems: "center",
            }}
          >
            <Feather name="thumbs-up" color={"red"} />
            <Text>Top Rated Plus</Text>
          </View>
        </View>
        <CustomView
          isGradient={false}
          radius={scale(8)}
          boxStyle={styles.statsRow}
        >
          <StatItem label="Team Size" value="15" />
          <StatItem label="Job Done" value="1200" />
          <StatItem label="Rating" value="4.9/5" />
        </CustomView>

        <CustomView
          shadowStyle={{ marginTop: verticalScale(15) }}
          radius={scale(8)}
          boxStyle={{
            borderWidth: moderateScale(0.7),
            borderColor: "#fff",
            overflow: "hidden",
          }}
        >
          <View style={styles.descBox}>
            <Text style={styles.descText}>
              An expert in resolving problems related to window air conditioning
              units, ensuring optimal cooling performance, comfort, and energy
              efficiency for all users. This professional not only addresses
              technical issues but also provides valuable advice on maintenance
              and usage tips to enhance the longevity and effectiveness of the
              units.
            </Text>
          </View>
        </CustomView>
      </View>

      {/* ---------- TOGGLE BUTTONS ---------- */}
      <CustomView
        height={verticalScale(38)}
        shadowStyle={{
          width: scale(337),
          marginBottom: verticalScale(12),
          alignSelf: "center",
        }}
        radius={scale(16)}
        boxStyle={styles.toggleRow}
        width={scale(336)}
      >
        <ToggleButton
          active={activeTab === "provider"}
          label="Provider Detail"
          icon="user"
          onPress={() => setActiveTab("provider")}
          activeColor="#68467B"
        />
        <ToggleButton
          active={activeTab === "customer"}
          label="Customer Detail"
          icon="users"
          onPress={() => setActiveTab("customer")}
          activeColor="#F15762"
        />
      </CustomView>

      {/* ---------- CUSTOMER DETAIL ---------- */}
      {activeTab === "customer" && (
        <>
          <Section title="Basic Detail">
            <InfoRow icon="map-pin" label="Zip code" value="250401" />
            <InfoRow
              icon="clock"
              label="Service Time"
              value="Service within 24 hour"
            />
            <InfoRow
              icon="home"
              label="Service Time"
              value="Sector 70, Mohali"
            />
          </Section>
        </>
      )}

      {/* ---------- PROVIDER DETAIL ---------- */}
      {activeTab === "provider" && (
        <>
          <Section title="Basic Detail">
            <InfoRow icon="map-pin" label="Zip code" value="250401" />
            <InfoRow
              icon="clock"
              label="Service Time"
              value="Service within 24 hour"
            />
            <InfoRow
              icon="home"
              label="Service Time"
              value="Sector 70, Mohali"
            />
          </Section>
          <Section title="Service Offered">
            <View style={styles.serviceGrid}>
              {quickPickServices.map((item, index) => (
                <CustomView
                  key={index}
                  height={verticalScale(73.97)}
                  width={scale(73.39)}
                  radius={scale(13.71)}
                  boxStyle={[styles.serviceItem]}
                  shadowStyle={{ marginTop: verticalScale(4) }}
                >
                  <Image
                    source={
                      iconMap[item.icon as IconName] || iconMap["default"]
                    }
                    style={styles.serviceIcon}
                  />
                  <Text numberOfLines={1} style={styles.serviceText}>
                    {item.name}
                  </Text>
                </CustomView>
              ))}
            </View>
          </Section>

          <Section title="Provider Reviews">
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <ReviewCard
                rating="4.9/5"
                text="Thanks for the recording! I understand – cooling issue with your Voltas Window AC."
                author="Ravinder"
              />
              <ReviewCard
                rating="4.9/5"
                text="Thanks for the recording! I understand – cooling issue with your Voltas Window AC."
                author="Canady"
              />
            </View>
          </Section>
        </>
      )}
    </View>
    // </CustomView>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ToggleButton({
  active,
  label,
  icon,
  onPress,
  activeColor,
}: {
  active: boolean;
  label: string;
  icon: any;
  onPress: () => void;
  activeColor: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.toggleBtn,
        { backgroundColor: active ? activeColor : "#E6E6E6" },
      ]}
    >
      <Feather name={icon} size={14} color={active ? "#fff" : "#555"} />
      <Text
        style={{
          color: active ? "#fff" : "#555",
          fontWeight: "600",
          fontSize: moderateScale(12),
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View
        style={{
          borderWidth: 0,
          gap: verticalScale(8),
          marginHorizontal: scale(14),
        }}
      >
        {children}
      </View>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <CustomView
      height={verticalScale(37)}
      radius={scale(25)}
      boxStyle={styles.infoRow}
      width={scale(300)}
      shadowStyle={{ alignSelf: "flex-start", width: scale(301) }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          borderWidth: 0,
        }}
      >
        <Feather name={icon} size={14} color="#f50000ff" />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </CustomView>
  );
}

function ReviewCard({
  rating,
  text,
  author,
}: {
  rating: string;
  text: string;
  author: string;
}) {
  return (
    <CustomView
      width={scale(152)}
      radius={scale(8)}
      boxStyle={styles.reviewCard}
      shadowStyle={{ width: scale(153) }}
    >
      <Text style={styles.reviewRating}>⭐ {rating}</Text>
      <Text style={styles.reviewText}>{text}</Text>
      <Text style={styles.reviewAuthor}>👤 {author}</Text>
    </CustomView>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: {
    // backgroundColor: "#F2F4F7",
    // padding: scale(10),
    width: scale(350),
    // borderWidth : 1
  },

  providerCard: {
    backgroundColor: "#fff",
    borderRadius: scale(14),
    padding: scale(12),
    marginBottom: verticalScale(10),
  },

  providerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
  },

  avatar: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: "#0159D4",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "700",
  },

  providerName: {
    fontSize: moderateScale(14),
    fontWeight: "700",
  },

  location: {
    fontSize: moderateScale(11),
    color: "#777",
  },

  statsRow: {
    flexDirection: "row",
    gap: moderateScale(1.5),
    borderWidth: moderateScale(0.7),
    borderColor: "#fff",
    overflow: "hidden",
    // justifyContent: "space-between",
    // marginVertical: verticalScale(10),
  },

  statBox: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F7F6FA",
    // borderRadius: scale(10),
    paddingVertical: verticalScale(8),
    // marginHorizontal: scale(3),
  },

  statValue: {
    fontWeight: "700",
    fontSize: moderateScale(13),
  },

  statLabel: {
    fontSize: moderateScale(10),
    color: "#666",
  },

  descBox: {
    backgroundColor: "#FFF4F3",
    // borderRadius: scale(10),
    padding: scale(10),
  },

  descText: {
    fontSize: moderateScale(11),
    color: "#444",
  },

  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    overflow: "hidden",
    borderWidth: moderateScale(0.7),
    borderColor: "#fff",
    // marginBottom: verticalScale(10),
  },

  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    gap: scale(6),
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(8),
    // borderRadius: scale(10),
    // marginHorizontal: scale(3),
  },

  section: {
    backgroundColor: "#FCFAFC",
    borderRadius: scale(12),
    // paddingHorizontal: scale(20),
    paddingBottom: verticalScale(19),
    marginBottom: verticalScale(10),
    borderWidth: moderateScale(0.7),
    borderColor: "#BFBFBF",
    overflow: "hidden",
  },

  sectionHeader: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#DEE6F7",
    // borderRadius: scale(10),
    paddingHorizontal: scale(14),
    // paddingVertical: verticalScale(4),
    height: verticalScale(36),
    width: "100%",
    marginBottom: verticalScale(8),
  },

  sectionTitle: {
    fontWeight: "700",
    fontSize: moderateScale(12),
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    // backgroundColor: "#F4F6F9",
    // borderRadius: scale(10),
    paddingHorizontal: scale(10),
    overflow: "hidden",
    borderWidth: moderateScale(0.7),
    borderColor: "#ffffff",
    alignItems: "center",
    // marginBottom: verticalScale(6),
  },

  infoLabel: {
    fontSize: moderateScale(12),
    fontWeight: "400",
    color: "#000",
    // lineHeight : moderateScale(14)
  },

  infoValue: {
    fontSize: moderateScale(12),
    fontWeight: "400",
    color: "#000",
  },

  serviceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: scale(3),
  },

  serviceItem: {
    // width: "48%",
    // backgroundColor: "#F4F6F9",
    // borderRadius: scale(10),
    paddingTop: verticalScale(3),
    // gap : scale(4),

    // borderWidth : 1,
    justifyContent: "flex-start",

    alignItems: "center",
    // marginBottom: verticalScale(8),
  },

  serviceIcon: {
    width: scale(48),
    height: scale(48),
    // backgroundColor: "#E6E6E6",
    borderRadius: scale(6),
    // marginBottom: verticalScale(4),
    //  borderWidth : 1
  },

  serviceText: {
    fontSize: moderateScale(10),
    marginHorizontal: scale(8),
  },

  reviewCard: {
    // backgroundColor: "#F4F6F9",
    // borderRadius: scale(10),
    padding: scale(10),
    borderWidth: moderateScale(0.7),
    borderColor: "#fff",
    // marginBottom: verticalScale(8),
  },

  reviewRating: {
    fontSize: moderateScale(11),
    fontWeight: "600",
  },

  reviewText: {
    fontSize: moderateScale(11),
    marginVertical: verticalScale(4),
  },

  reviewAuthor: {
    fontSize: moderateScale(10),
    color: "#555",
  },
});
