import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import {Ionicons} from "@expo/vector-icons"
import { ConversationBookingResponse } from "../../utils/bookingApi";

const BadgeCard = ( {response} : {response : ConversationBookingResponse} ) => {
  const data = response.data
  const provider = data.provider

  return (
    <View style={{backgroundColor : '#DAF1FF', padding : 16, paddingTop : 50}}>
    <View style={styles.cardContainer}>

      {/* Badge Placeholder */}
      <Image
        source={require("../../../assets/TCBadge.png")} // <<< Replace with your PNG
        style={styles.badgeImage}
        // resizeMode="contain"
      />

      {/* Business Name */}
      <Text style={styles.title}>{provider?.name}</Text>
      <Text style={styles.rating}>⭐⭐ {provider?.rating}/5 (240 reviews)</Text>

      {/* Expertise Tags */}
      <View style={styles.row}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{data.service.name}</Text>
          <Text style={styles.tagSubText}>Expert (4 years)</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>200+</Text>
          <Text style={styles.tagSubText}>{data.selectedOption.name}s serviced</Text>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.subtitle}>
        Specializes in {data.selectedOption.name} issues{"\n"}
        Carries {data.selectedOption.name} specific parts
      </Text>

      {/* Booking Detail */}
      <Text style={[styles.title, { marginTop: 10 }]}>Your Booking Detail</Text>
      <Text style={styles.rating}>⭐⭐ 4.9/5 (240 reviews)</Text>

      {/* Booking Info Boxes */}
      <View style={styles.infoGrid}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>{data.service.name} Type</Text>
          <Text style={styles.infoValue}>{data.selectedOption.name} (2 units)</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Brand</Text>
          <Text style={styles.infoValue}>{data.selectedBrand?.name}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Service</Text>
          <Text style={styles.infoValue}>Standard Service</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Address</Text>
          <Text style={styles.infoValue}>{data.address.street}, {}{data.address.city} (Home)</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Date</Text>
          <Text style={styles.infoValue}>Today, 2–4 PM slot</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Total</Text>
          <Text style={styles.infoValue}>₹{data.finalPrice} (You saved ₹100!)</Text>
        </View>
      </View>

      {/* Items Rajesh Will Bring */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>{provider?.name} will bring:</Text>

        {[
          "Window AC gas refill kit",
          "Window AC capacitor stock",
          "Special Window AC cleaning tools",
          "Window AC mounting safety gear",
        ].map((item, index) => (
          <View key={index} style={styles.listItem}>
            <Ionicons name="checkmark-circle" size={14} color={'#4AD791'}/>
            {/* <Text style={styles.check}>✔</Text> */}
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
    paddingHorizontal: 16,
    backgroundColor: "#E8F6FF",
    borderRadius: 16,
    width: '91.4%',
    // height : 582,
    alignSelf: "center",
    marginVertical: 20,
    // overflow: "hidden",
    borderColor : '#C7E6F9',
    borderWidth : 1
  },

  badgeImage: {
    width: 110,
    height: 98,
    resizeMode : 'contain',
    alignSelf: "center",
    // marginBottom: 10,
    position : 'absolute',
    top : '-6%'
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    color: "#000",
    marginTop : 69
  },

  rating: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },

  row: {
    flexDirection: "row",
    justifyContent: "center",
    // flexWrap: "wrap",
    marginTop: 10,
  },

  tag: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#C8E6FF66",
    borderRadius: 10,
    margin: 4,
  },

  tagText: {
    fontSize: 11,
    fontWeight : '500',
    // color: "#0057B8",
  },
  tagSubText: {
    fontSize: 9,
    fontWeight : '300',
    // color: "#0057B8",
  },

  subtitle: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 13,
    color: "#444",
  },

  infoGrid: {
    marginTop: 9,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  infoBox: {
    width: "49.5%",
    backgroundColor: "#C8E6FF66",
    padding: 4,
    borderRadius: 10,
    marginVertical: 6,
    height : 38,
    justifyContent : 'center'
  },

  infoLabel: {
    // color: "#0057B8",
    fontSize: 11,
    fontWeight : '500'
  },

  infoValue: {
    // marginTop: 4,
    fontSize: 9,
    fontWeight: "300",
    color: "#000",
  },

  sectionBox: {
    backgroundColor: "#C8E6FF80",
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
    borderWidth : 1,
    borderColor : '#C8E6FF80'
  },

  sectionTitle: {
    fontWeight: "700",
    marginBottom: 6,
    fontSize: 15,
  },

  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 3,
    gap : 4
  },

  check: {
    color: "green",
    marginRight: 8,
    fontSize: 16,
  },

  listText: {
    fontSize: 13,
    color: "#333",
  },
});

export default BadgeCard;
