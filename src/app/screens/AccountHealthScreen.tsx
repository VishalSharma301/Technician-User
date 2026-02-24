import React, { use } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "../../utils/scaling";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import CustomView from "../components/CustomView";

type CCViewProps = {
  children: React.ReactNode;
  style?: any;
};

function CCView({ children, style }: CCViewProps) {
  return (
    <CustomView
      radius={scale(12)}
      shadowStyle={{
        marginBottom: verticalScale(14),
        marginHorizontal: scale(16),
      }}
    >
      {children}
    </CustomView>
  );
}

const AccountHealthScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-left" size={moderateScale(22)} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Account Health</Text>

          <TouchableOpacity style={{opacity : 0}}>
            <Icon name="cog-outline" size={moderateScale(22)} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: verticalScale(200) }}>
          {/* SPEEDOMETER */}
          <View style={styles.gaugeWrapper}>
            <View style={styles.gaugeBackground}>
              <LinearGradient
                colors={["#F44336", "#FF9800", "#FFEB3B", "#4CAF50"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gaugeGradient}
              />
            </View>

            {/* Needle */}
            <View style={styles.needleWrapper}>
              <View style={styles.needle} />
              <View style={styles.needleDot} />
            </View>
          </View>

          <CustomView radius={scale(9)}>
            {/* ACCOUNT HEALTH CARD */}
            <View style={[styles.card, { padding: 0 }]}>
              <Text
                style={[
                  styles.sectionTitle,
                  { marginTop: verticalScale(18), marginLeft: scale(16) },
                ]}
              >
                Account Health
              </Text>

              <CCView>
                <View style={styles.healthBox}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.healthPercent}>88%</Text>
                    <View style={styles.row}>
                      {[...Array(5)].map((_, i) => (
                        <Icon
                          key={i}
                          name="star"
                          size={moderateScale(20)}
                          color="#FFC107"
                        />
                      ))}
                    </View>
                  </View>

                        <View style={{ flexDirection : 'row', alignItems : 'center', }}>
                  <Text style={styles.excellentText}>Excellent</Text>

                  <View style={[styles.progressBg, { width: scale(210),height : verticalScale(10), marginLeft : scale(20) }]}>
                    <View style={[styles.progressFill, { width: "88%" }]} />
                  </View>
                  </View>
                </View>
              </CCView>
            </View>

            {/* BREAKDOWN */}
            <CCView>
              <View style={styles.card}>
                <View style={styles.row}>
                  <Icon name="chart-bar" size={moderateScale(20)} />
                  <Text style={styles.sectionTitle}> Breakdown</Text>
                </View>

                {renderItem("Payment Reliability", "100%", "100%", "#4CAF50")}
                {renderItem("Cancellation Rate", "5%", "30%", "#FFC107")}
                {renderItem("No-Show Rate", "2%", "20%", "#FFC107")}
                {renderItem("Disputes", "1", "10%", "#BDBDBD")}
                {renderItem("Booking Frequency", "2X", "80%", "#4CAF50")}
              </View>
            </CCView>

            {/* WARNING */}
            <CCView>
              <View style={styles.card}>
                <View style={styles.row}>
                  <Icon
                    name="alert-circle-outline"
                    size={moderateScale(20)}
                    color="#FFC107"
                  />
                  <Text style={styles.sectionTitle}> Warning</Text>
                </View>

                <Text style={styles.bullet}>
                  • One dispute active (resolving)
                </Text>
                <Text style={styles.bullet}>
                  • Resolve to restore full benefits
                </Text>
                <Text style={styles.bullet}>• Exclusive offer</Text>
              </View>
            </CCView>

            {/* BENEFITS */}
            <CCView>
              <View style={styles.card}>
                <View style={styles.row}>
                  <Icon
                    name="gift-outline"
                    size={moderateScale(20)}
                    color="#F44336"
                  />
                  <Text style={styles.sectionTitle}> Your Benefit</Text>
                </View>

                <Text style={styles.bullet}>✓ No advance payment required</Text>
                <Text style={styles.bullet}>✓ Priority customer support</Text>
                <Text style={styles.bullet}>✓ Exclusive offers</Text>
              </View>
            </CCView>

            {/* BUTTONS */}
            {/* <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.outlineBtn}>
                <Text style={styles.outlineText}>Add Address</Text>
              </TouchableOpacity>

              <LinearGradient
                colors={["#36DFF1", "#2764E7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.editBtn}
              >
                <Text style={styles.editText}>Edit</Text>
              </LinearGradient>
            </View> */}
          </CustomView>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const renderItem = (
  title: string,
  value: string,
  width: number | `${number}%`
,
  color: string,
) => (
  <View style={styles.breakdownItem}>
    <View style={[styles.rowBetween, {}]}>
      <Text style={styles.breakdownText}>
        {title} 
      </Text>
      <Text style={{ fontWeight: "600" }}>{value}</Text>
    </View>
    <View style={[styles.progressBg, {width : scale(73)}]}>
      <View style={[styles.progressFill, { width, backgroundColor: color }]} />
    </View>
  </View>
);



export default AccountHealthScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F2F4F7",
  },
  container: {
    flex: 1,
    paddingHorizontal: scale(9),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: verticalScale(10),
  },
  backText: {
    marginLeft: scale(4),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: "600",
  },

  gaugeWrapper: {
    alignItems: "center",
    marginVertical: verticalScale(20),
  },
  gaugeBackground: {
    width: scale(260),
    height: verticalScale(130),
    borderTopLeftRadius: scale(130),
    borderTopRightRadius: scale(130),
    overflow: "hidden",
  },
  gaugeGradient: {
    flex: 1,
  },
  needleWrapper: {
    position: "absolute",
    bottom: 0,
    alignItems: "center",
  },
  needle: {
    width: scale(4),
    height: verticalScale(100),
    backgroundColor: "#1E3A8A",
    transform: [{ rotate: "10deg" }],
  },
  needleDot: {
    width: scale(18),
    height: scale(18),
    borderRadius: scale(9),
    backgroundColor: "#1E3A8A",
    marginTop: -scale(10),
  },

  card: {
    // backgroundColor: "#FFF",
    padding: scale(14),
    // borderRadius: scale(12),
    // marginBottom: verticalScale(14),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    // marginBottom: verticalScale(8),
  },

  healthBox: {
    // backgroundColor: "#F7F9FC",
    padding: scale(12),
    borderRadius: scale(10),
  },
  healthPercent: {
    fontSize: moderateScale(42),
    fontWeight: "600",
    marginRight : scale(20)
  },
  excellentText: {
    color: "#000",
    fontSize : moderateScale(14),
    fontWeight : '400'
    // marginBottom: verticalScale(6),
  },

  progressBg: {
    height: verticalScale(8),
    backgroundColor: "#E0E0E0",
    borderRadius: scale(6),
    overflow: "hidden",
    // borderWidth : 1,
    
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: scale(6),
  },

  breakdownItem: {
    flexDirection : 'row',
    marginBottom: verticalScale(12),
    // borderWidth  : 1,
    alignItems : 'center',
    justifyContent : 'space-between'
  },
  breakdownText: {
    fontSize : moderateScale(14),
    fontWeight : '400',
    marginBottom: verticalScale(4),
    width : scale(130)
  },

  bullet: {
    fontSize: moderateScale(12),
    marginBottom: verticalScale(6),
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(20),
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: "#2764E7",
    paddingVertical: verticalScale(10),
    borderRadius: scale(8),
    width: "48%",
    alignItems: "center",
  },
  outlineText: {
    color: "#2764E7",
    fontWeight: "600",
  },
  editBtn: {
    width: "48%",
    paddingVertical: verticalScale(10),
    borderRadius: scale(8),
    alignItems: "center",
  },
  editText: {
    color: "#FFF",
    fontWeight: "600",
  },

  bottomTab: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: verticalScale(10),
    borderTopWidth: 1,
    borderColor: "#EEE",
  },
  tabItem: {
    alignItems: "center",
    flex: 1,
  },
  tabLabel: {
    fontSize: moderateScale(12),
    marginTop: verticalScale(4),
    color: "#999",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(6),
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
});
