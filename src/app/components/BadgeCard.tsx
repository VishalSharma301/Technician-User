import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ConversationBookingResponse } from "../../utils/bookingApi";
import { moderateScale, scale, verticalScale } from "../../utils/scaling";

const BadgeCard = ({ response }: { response: ConversationBookingResponse }) => {
  const data = response.data;
  const provider = data.provider;

  return (
    <View
      style={{
        // backgroundColor: "#DAF1FF",
        paddingHorizontal: scale(8),
        paddingTop: verticalScale(50),
        // borderWidth : 1
      }}
    >
      <View style={styles.cardContainer}>
        {/* Badge */}
        <Image
          source={require("../../../assets/TCBadge.png")}
          style={styles.badgeImage}
        />

        {/* Provider */}
        <Text style={styles.title}>{provider?.name}</Text>
        <Text style={styles.rating}>⭐⭐ {provider?.rating}/5 (240 reviews)</Text>

        {/* Tags */}
        <View style={styles.row}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{data.service.name}</Text>
            <Text style={styles.tagSubText}>Expert (4 years)</Text>
          </View>

          <View style={styles.tag}>
            <Text style={styles.tagText}>200+</Text>
            <Text style={styles.tagSubText}>
              {data.selectedOption.name}s serviced
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.subtitle}>
          Specializes in {data.selectedOption.name} issues{"\n"}
          Carries {data.selectedOption.name} specific parts
        </Text>

        {/* Booking Details */}
        <Text style={[styles.title, { marginTop: verticalScale(10) }]}>
          Your Booking Detail
        </Text>
        <Text style={styles.rating}>⭐⭐ {provider?.rating}/5 (240 reviews)</Text>

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text numberOfLines={1} style={styles.infoLabel}>{data.service.name} Type</Text>
            <Text numberOfLines={1} style={styles.infoValue}>
              {data.selectedOption.name} (2 units)
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Brand</Text>
            <Text style={styles.infoValue}>{data.selectedBrand?.brandId.name}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Service</Text>
            <Text style={styles.infoValue}>Standard Service</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>
              {data.address.street}, {data.address.city}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>Today, 2–4 PM slot</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Total</Text>
            <Text style={styles.infoValue}>
              ₹{data.finalPrice} (You saved ₹100!)
            </Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>
            {provider?.name} will bring:
          </Text>

          {[
            "Window AC gas refill kit",
            "Window AC capacitor stock",
            "Special Window AC cleaning tools",
            "Window AC mounting safety gear",
          ].map((item, index) => (
            <View key={index} style={styles.listItem}>
              <Ionicons
                name="checkmark-circle"
                size={moderateScale(14)}
                color="#4AD791"
              />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    paddingHorizontal: scale(16),
    backgroundColor: "#E8F6FF",
    borderRadius: scale(16),
    width: "100%",
    alignSelf: "center",
    marginVertical: verticalScale(20),
    borderColor: "#C7E6F9",
    borderWidth: scale(1),
    paddingBottom : verticalScale(21)
  },

  badgeImage: {
    width: scale(110),
    height: scale(98),
    resizeMode: "contain",
    alignSelf: "center",
    position: "absolute",
    top: verticalScale(-45),
  },

  title: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    textAlign: "center",
    marginTop: verticalScale(69),
  },

  rating: {
    fontSize: moderateScale(16),
    textAlign: "center",
    marginTop: verticalScale(4),
  },

  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: verticalScale(10),
    
  },

  tag: {
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(10),
    backgroundColor: "#C8E6FF66",
    borderRadius: scale(10),
    margin: scale(4),
    width : scale(130)
  },

  tagText: {
    fontSize: moderateScale(13),
    fontWeight: "500",
  },

  tagSubText: {
    fontSize: moderateScale(11),
    fontWeight: "300",
  },

  subtitle: {
    textAlign: "center",
    marginTop: verticalScale(8),
    fontSize: moderateScale(14),
    color: "#444",
  },

  infoGrid: {
    marginTop: verticalScale(9),
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  infoBox: {
    width: "49.5%",
    backgroundColor: "#C8E6FF66",
    padding: scale(4),
    borderRadius: scale(10),
    marginVertical: verticalScale(6),
    // height: verticalScale(38),
    justifyContent: "center",
    
  },

  infoLabel: {
    fontSize: moderateScale(13),
    fontWeight: "500",
    
  },

  infoValue: {
    fontSize: moderateScale(11),
    fontWeight: "300",
  },

  sectionBox: {
    backgroundColor: "#C8E6FF80",
    borderRadius: scale(12),
    padding: scale(14),
    marginTop: verticalScale(14),
    borderWidth: scale(1),
    borderColor: "#C8E6FF80",
  },

  sectionTitle: {
    fontWeight: "700",
    marginBottom: verticalScale(6),
    fontSize: moderateScale(17),
  },

  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: verticalScale(3),
    gap: scale(4),
  },

  listText: {
    fontSize: moderateScale(15),
    color: "#333",
  },
});

export default BadgeCard;
