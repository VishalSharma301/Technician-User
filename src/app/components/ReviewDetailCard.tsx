import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "../../utils/scaling";
import { LinearGradient } from "expo-linear-gradient";
import CustomView from "./CustomView";

type Props = {
  onBookNow?: () => void;
};

export default function ReviewDetailCard({ onBookNow }: Props) {
  const [activeTab, setActiveTab] = useState<"basic" | "problem">("basic");

  return (
    <ImageBackground
      source={
        activeTab == "basic"
          ? require("../../../assets/ReviewBG.png")
          : require("../../../assets/ReviewBG2.png")
      }
      style={{
        height: activeTab == "basic" ? verticalScale(360+34) : verticalScale(645),
        width: scale(350),
        marginLeft: scale(5),
        // alignItems: "center",
        justifyContent: "center",
        padding: scale(16),
        paddingTop: scale(23),
      }}
      resizeMode="stretch"
    >
            <LinearGradient colors={["#006E7B", "#006E7B"]} style={styles.header}>
          <Text style={styles.headerText}>🧾 Review Detail</Text>
        </LinearGradient>

      <View style={styles.outer}>
        {/* HEADER */}
        

        {/* TAB SWITCH */}
        <CustomView
          height={verticalScale(38)}
          shadowStyle={{width : scale(287), marginBottom: verticalScale(12), alignSelf : 'center' }}
          radius={scale(16)}
          boxStyle={styles.tabWrap}
          width={scale(286)}
        >
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "basic" && styles.activeTab]}
            onPress={() => setActiveTab("basic")}
          >
            <Feather name="tool" size={14} color="#0B7C86" />
            <Text style={styles.tabText}>Basic Info</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "problem" && styles.activeTab]}
            onPress={() => setActiveTab("problem")}
          >
            <Feather name="alert-circle" size={14} color="#0B7C86" />
            <Text style={styles.tabText}>Problem info</Text>
          </TouchableOpacity>
        </CustomView>

        <ScrollView
          contentContainerStyle={{
            paddingBottom: verticalScale(0),
            // borderWidth: 1,
            width: "100%",
          }}
        >
          {/* BASIC INFO */}
          {activeTab === "basic" && (
            <View style={styles.card}>
              <LinearGradient
                colors={["#006E7BC2", "#00A4B8"]}
                //   locations={[0, 0.2]}
                //   start={{ x: 0, y: 0 }}
                //   end={{ x: 0, y: 1 }}
                style={styles.sectionHeader}
              >
                <Text style={styles.sectionTitle}>🔧 Basic Info</Text>
              </LinearGradient>

              <InfoRow label="Zip code" value="250401" />
              <InfoRow label="Service Time" value="Service within 24 hour" />
              <InfoRow label="Address" value="Sector 70, Mohali" />
            </View>
            
          )}

          {/* PROBLEM INFO */}
          {activeTab === "problem" && (
            <>
              <View style={styles.card}>
                <LinearGradient
                  colors={["#006E7BC2", "#00A4B8"]}
                  //   locations={[0, 0.2]}
                  //   start={{ x: 0, y: 0 }}
                  //   end={{ x: 0, y: 1 }}
                  style={styles.sectionHeader}
                >
                  <Text style={styles.sectionTitle}>🔧 AC Not Cooling</Text>
                </LinearGradient>

                <InfoRow label="Brand" value="Samsung | Split | 1.5Ton" />
                <InfoRow label="Problem Duration" value="2–3 Days" />
                <InfoRow label="AC Type" value="Window" />
              </View>

              <View style={styles.card}>
                <LinearGradient
                  colors={["#006E7BC2", "#00A4B8"]}
                  //   locations={[0, 0.2]}
                  //   start={{ x: 0, y: 0 }}
                  //   end={{ x: 0, y: 1 }}
                  style={styles.sectionHeader}
                >
                  <Text style={styles.sectionTitle}>💰 Price</Text>
                </LinearGradient>
                <InfoRow label="Qty" value="02" />
                <InfoRow label="Price" value="₹5025" />
                <InfoRow label="Visit Charges" value="₹150" />
                <InfoRow label="Additional Charges" value="₹200" />
              </View>

              
            </>
          )}
        </ScrollView>
<View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Price</Text>
                <Text style={styles.totalValue}>₹5475</Text>
              </View>
        {/* BOOK NOW */}
        <TouchableOpacity style={styles.bookBtn} onPress={onBookNow}>
          <Text style={styles.bookText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

/* ---------- SMALL REUSABLE ROW ---------- */

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <CustomView
      radius={scale(25)}
      height={verticalScale(36)}
      boxStyle={styles.row}
      shadowStyle={{ marginBottom: verticalScale(6) }}
      gradientColors={['#E2FAFD','#E2FAFD']}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </CustomView>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  outer: {
    // backgroundColor: "#E6F8FB",
    // borderRadius: scale(24),
    // padding: scale(12),
    // borderWidth: 2,
    // borderColor: "#00A4B8",
  },

  /* ---------- HEADER ---------- */
  header: {
    // alignSelf: "center",
    borderRadius: scale(20),
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(6),
    marginBottom: verticalScale(10),
    position: "absolute",
    top: verticalScale(-19),
    left: "31%",
    height : verticalScale(40),
    justifyContent : 'center'
  },
  headerText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: moderateScale(14),
  },

  /* ---------- TABS ---------- */
  tabWrap: {
    flexDirection: "row",
    borderWidth: moderateScale(0.7),
    borderColor: "#fff",
    overflow : 'hidden'
    // backgroundColor: "#fff",
    // borderRadius: scale(25),
    // padding: scale(4),
    // marginBottom: verticalScale(12),
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    gap: scale(6),
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(6),
    backgroundColor: "#fff",
    // borderRadius: scale(20),
  },
  activeTab: {
    backgroundColor: "#D5E9EB",
  },
  tabText: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    color: "#0B7C86",
  },

  /* ---------- INFO CARD ---------- */
  card: {
    backgroundColor: "#AFDBE0",
    borderRadius: scale(12),
    padding: scale(12),
    marginBottom: verticalScale(10),
    borderWidth: moderateScale(0.7),
    borderColor: "#006E7B",
  },

  sectionHeader: {
    alignSelf: "flex-start",
    backgroundColor: "#00A4B8",
    paddingHorizontal: scale(24),
    justifyContent: "center",
    // paddingVertical: verticalScale(8),
    borderRadius: scale(45),
    marginBottom: verticalScale(8),
    height: verticalScale(37.5),
  },
  sectionTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: moderateScale(12),
  },

  /* ---------- ROW ---------- */
  row: {
    // backgroundColor: "#EFFFFF",
    // borderRadius: scale(20),
    paddingLeft: scale(15),
    paddingRight : scale(30),
    // paddingVertical: verticalScale(8),
    // marginBottom: verticalScale(6),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: moderateScale(0.7),
    borderColor: "#fff",
  },
  rowLabel: {
    fontSize: moderateScale(12),
    color: "#000000",
    fontWeight: "400",
  },
  rowValue: {
    fontSize: moderateScale(12),
    color: "#000",
    fontWeight: "400",
  },

  /* ---------- TOTAL PRICE ---------- */
  totalRow: {
    backgroundColor: "#0A4950",
    // borderRadius: scale(25),
    borderBottomLeftRadius: scale(25),
    borderBottomRightRadius: scale(25),
    // paddingVertical: verticalScale(8),
    paddingHorizontal: scale(18),
    flexDirection: "row",
    justifyContent: "center",
    gap: scale(50),
    marginBottom: verticalScale(10),
    height: verticalScale(36),
    width: scale(295),
    alignSelf: "center",
    alignItems: "center",
    marginTop: verticalScale(-10),
  },
  totalLabel: {
    color: "#fff",
    fontWeight: "700",
    fontSize: moderateScale(18),
  },
  totalValue: {
       color: "#fff",
    fontWeight: "700",
    fontSize: moderateScale(18),
  },

  /* ---------- BOOK NOW ---------- */
  bookBtn: {
    backgroundColor: "#006E7B",
    borderRadius: scale(30),
    // paddingVertical: verticalScale(12),
    alignItems: "center",
    height : verticalScale(36),
    justifyContent : 'center'
  },
  bookText: {
    color: "#fff",
    fontSize: moderateScale(15),
    fontWeight: "700",
  },
});
