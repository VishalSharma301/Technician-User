import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { scale, verticalScale, moderateScale } from "../../utils/scaling";
import { LinearGradient } from "expo-linear-gradient";
import { iconMap } from "../../utils/iconMap";
import { useAddress } from "../../hooks/useAddress";
import { useProfile } from "../../hooks/useProfile";
import CustomView from "./CustomView";
import { useWallet } from "../../store/WalletContext";

type Props = {
  onBookNow?: () => void;
  onEdit?: () => void;
  problemTitle?: string;
  brand: string;
  problemDuration: string;
  acType: string;
  qty: string | number;
  price: number;
  visitCharges: number;
  additionalCharges: number;
};

export default function ReviewDetailCard({
  onBookNow,
  onEdit,
  problemTitle,
  brand,
  problemDuration,
  acType,
  qty,
  price,
  visitCharges,
  additionalCharges,
}: Props) {
  const { selectedAddress } = useAddress();
  // const { points } = useProfile();
  const { wallet } = useWallet();


const walletPoints = Math.min((wallet?.credits || 0), price)
  // const total = price + visitCharges + additionalCharges - (wallet?.credits || 0);
  const total = price + additionalCharges - (walletPoints);

  return (
    <CustomView radius={scale(8)}>
      <View style={styles.wrapper}>
        {/* Top Icon */}
        {/* <View style={styles.iconCircle}>
          <Image
            source={iconMap["review"]}
            style={{
              width: scale(32),
              height: scale(32),
              resizeMode: "contain",
            }}
          />
        </View> */}

        {/* Title */}
        <Text style={styles.title}>Review Summery</Text>
        <Text style={styles.subtitle}>REVIEW BEFORE CONFIRMING</Text>

        {/* Info Card */}
        <CustomView
          radius={scale(8)}
          shadowStyle={{ marginBottom: verticalScale(10) }}
          isGradient={false}
        >
          <View style={styles.infoCard}>
            <InfoRow label="Brand" value={brand} />
            <InfoRow label="Qty" value={String(qty)} />
            <InfoRow label="Main issue" value={problemTitle!} />
            <InfoRow label="Service Time" value="24 Hour" />

            {/* Total row — no pill, bold value */}
            <View style={[styles.row]}>
              <Text style={styles.rowLabel}>Servic Price</Text>
              <Text style={styles.totalValue}>₹{price}</Text>
            </View>
            <View style={[styles.row]}>
              <Text style={styles.rowLabel}>Wallet Points Used</Text>
              <Text style={styles.totalValue}>₹{walletPoints}</Text>
            </View>
            <View style={[styles.row, styles.totalRow]}>
              <Text style={styles.rowLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{total}</Text>
            </View>
          </View>
        </CustomView>

       
          {/* ── Visiting Charges Banner ── */}
                <View style={styles.visitingBanner}>
                  <View style={styles.visitingLeft}>
                    {/* <Text style={styles.visitingPlantIcon}>🌿</Text> */}
                    <Image style={{width :scale(18), height: scale(18)}} source={iconMap['rupee']}/>
                    <Text style={styles.visitingBoldLabel}>Visiting Charges:</Text>
                    <Text style={styles.visitingPrice}>₹150</Text>
                  </View>
                  <View style={styles.visitingRight}>
                    
                    <Text style={styles.visitingMuted}>
                      Adjusted if service is taken
                    </Text>
                  </View>
                </View>

        {/* Action Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={{width : '49%'}} onPress={onEdit}>
             <CustomView
                        radius={moderateScale(8)}
                        gradientColors={["#D2882C", "#D2882C"]}
                        shadowColor={"#AA5F00"}
                        borderColor={"#fff"}
                        boxStyle={{
                          paddingVertical: verticalScale(10),
                          // height : verticalScale(45),
                          alignItems: "center",
                        }}
                        
                      >
            <Text style={styles.cancelText}>Cancel</Text>
            </CustomView>
          </TouchableOpacity>
          <TouchableOpacity style={{width : '49%'}} onPress={onBookNow}>
            <CustomView
                        radius={moderateScale(8)}
                        gradientColors={["#729869", "#729869"]}
                        shadowColor={"#77966F"}
                        boxStyle={{
                          paddingVertical: verticalScale(10),
                          alignItems: "center",
                        }}
                        // shadowStyle={{ marginVertical: verticalScale(10) }}
                      >
            <Text style={styles.confirmText}>Confirm</Text>
            </CustomView>
          </TouchableOpacity>
        </View>
      </View>
    </CustomView>
  );
}

/* ---------- INFO ROW ---------- */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.pill}>
        <Text style={styles.pillText}>{value}</Text>
      </View>
    </View>
  );
}
const TEXT_COLOR = "#864C2D";
const TEXT_COLOR1 = "#936140";
/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  wrapper: {
    // backgroundColor: "#F0F4FF",
    // borderRadius: scale(20),
    paddingHorizontal: scale(11),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(25),
    alignItems: "center",
    width: scale(360),
    alignSelf: "center",
  },

  /* Icon */
  iconCircle: {
    // position: "absolute",
    // top: verticalScale(-28),
    width: scale(60),
    height: scale(60),
    borderRadius: scale(16),
    backgroundColor: "#258ECF",
    alignItems: "center",
    justifyContent: "center",
    // shadowColor: "#4A90D9",
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.4,
    // shadowRadius: 8,
    // elevation: 8,
  },

  /* Title */
  title: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    color: '#864C2D',
    marginBottom: verticalScale(4),
  },
  subtitle: {
    fontSize: moderateScale(11),
    fontWeight: "600",
    color: "#936140",
    letterSpacing: 1.2,
    marginBottom: verticalScale(29),
  },

  /* Info Card */
  infoCard: {
    // backgroundColor: "#FFFFFF",
    // borderRadius: scale(16),
    width: scale(336),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(4),
    // marginBottom: verticalScale(12),
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.06,
    // shadowRadius: 6,
    // elevation: 3,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: verticalScale(12),
    borderBottomWidth: 0.5,
    borderBottomColor: "#E8ECF4",
  },
  rowLabel: {
    fontSize: moderateScale(14),
    color: TEXT_COLOR,
    fontWeight: "700",
  },

  /* Pill badge */
  pill: {
    // backgroundColor: "#DDE6F3",
    borderRadius: scale(4),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(4),
    minWidth: scale(70),
    alignItems: "center",
    // borderWidth: moderateScale(0.7),
    // borderColor: "#045BD826",
  },
  pillText: {
    fontSize: moderateScale(13),
    color: TEXT_COLOR1,
    fontWeight: "600",
  },

  /* Total row (last row, no border) */
  totalRow: {
    borderBottomWidth: 0,
  },
  totalValue: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: TEXT_COLOR,
  },

  /* Visiting Banner */
  visitingBanner: {
    backgroundColor: "#ffffff",
    borderRadius: scale(12),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(10),
    marginBottom: verticalScale(16),
    // flexDirection: "row",
    // justifyContent: "space-between",
    alignItems: "center",
    height: verticalScale(68.3),
    width: scale(336),
   borderWidth: moderateScale(1),
    borderColor: "#F2D6B5",
  },
  visitingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    // borderWidth : 1,
    alignSelf: "flex-start",
  },
  visitingPlantIcon: {
    fontSize: moderateScale(16),
  },
  visitingBoldLabel: {
    fontSize: moderateScale(13.5),
    fontWeight: "700",
    color: TEXT_COLOR,
  },
  visitingRight: {
   alignSelf: "flex-end",
    marginTop : verticalScale(6),
  },
  visitingPrice: {
    fontSize: moderateScale(15),
    fontWeight: "800",
    color: '#D2882C',
    marginLeft : '35%'
  },
  visitingMuted: {
    fontSize: moderateScale(11),
    color: '#729869',
    fontWeight: "600",
    fontStyle : 'italic'
  },

  /* Buttons */
  btnRow: {
    flexDirection: "row",
    gap: scale(12),
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    height: verticalScale(48),
    borderRadius: scale(4),
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D0D8E8",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: "#fff",
  },
  confirmBtn: {
    flex: 1,
    height: verticalScale(48),
    borderRadius: scale(4),
    backgroundColor: "#1D365D",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: "#fff",
  },
});
