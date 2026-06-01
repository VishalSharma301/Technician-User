import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "../../utils/scaling";
import { useNavigation } from "@react-navigation/native";

const C = {
  bg: "#FFF8F2",
  card: "#FFFFFF",
  field: "#fff",
  border: "#EFD5B7",
  brown: "#864C2D",
  brownLight: "#864C2D1A",
  txt: "#2D1F0F",
  txt2: "#6B5744",
  txt3: "#4D4D4D",
  placeholder: "#B0A090",
  green: "#1CA177",
  greenBg: "#D1FAE5",
  greenBorder: "#1CA177",
  red: "#FF0004",
  redBg: "#FF00041A",
  redBorder: "#FF0004",
};

export type CoinTransaction = {
  id: string;
  title: string;
  date: string;
  coins: number; // positive = earned, negative = spent
};

const MOCK_TRANSACTIONS: CoinTransaction[] = [
  { id: "1", title: "Service Delay *1", date: "8 May 2026", coins: 50 },
  { id: "2", title: "Service Delay *2", date: "8 May 2026", coins: 50 },
  { id: "3", title: "Service Delay *3", date: "8 May 2026", coins: 50 },
  { id: "4", title: "Service Delay *4", date: "8 May 2026", coins: 50 },
  { id: "5", title: "Service Done *5", date: "8 May 2026", coins: -50 },
];

type TransactionRowProps = {
  item: CoinTransaction;
};

function TransactionRow({ item }: TransactionRowProps) {
  const isPositive = item.coins > 0;
  return (
    <View style={styles.txRow}>
      {/* Left icon */}
      <View style={styles.txIconWrap}>
        <Icon
          name="calendar-outline"
          size={moderateScale(20)}
          color={C.brown}
        />
      </View>

      {/* Title + date */}
      <View style={styles.txInfo}>
        <Text style={styles.txTitle}>{item.title}</Text>
        <Text style={styles.txDate}>{item.date}</Text>
      </View>

      {/* Coin badge */}
      <View
        style={[
          styles.coinBadge,
          {
            backgroundColor: isPositive ? C.greenBg : C.redBg,
            borderColor: isPositive ? C.greenBorder : C.redBorder,
          },
        ]}
      >
        <Text
          style={[
            styles.coinBadgeText,
            { color: isPositive ? C.green : C.red },
          ]}
        >
          {isPositive ? "+" : ""}
          {item.coins} coin
        </Text>
      </View>
    </View>
  );
}

interface Props {
  totalCoins?: number;
  transactions?: CoinTransaction[];
}

export default function MyCoinScreen({
  totalCoins = 320,
  transactions = MOCK_TRANSACTIONS,
}: Props) {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Page Header ── */}
        <View style={styles.pageHeader}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Icon name="arrow-left" size={moderateScale(20)} color={C.brown} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.pageTitle}>Fuvay Coins</Text>
            <Text style={styles.pageSubtitle}>
              Earn & redeem on every booking
            </Text>
          </View>
        </View>

        {/* ── Balance Card ── */}
        <View style={styles.balanceCard}>
          {/* Bank icon */}
          <View style={styles.bankIconWrap}>
            <Icon
              name="bank-outline"
              size={moderateScale(30)}
              color={C.brown}
            />
          </View>

          <Text style={styles.balanceAmount}>{totalCoins}</Text>
          <Text style={styles.balanceLabel}>Fuvay Coins · ≈ ₹{totalCoins}</Text>
        </View>

        {/* ── Transaction History ── */}
        <Text style={styles.sectionTitle}>Transaction History</Text>

        {transactions.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Icon name="cash" size={moderateScale(40)} color={C.txt3} />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        ) : (
          transactions.map((item) => (
            <TransactionRow key={item.id} item={item} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { paddingBottom: verticalScale(40) },

  /* page header */
  pageHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: scale(8),
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(8),
    backgroundColor : '#F6EBDE'
  },
  backBtn: { paddingTop: verticalScale(2) },
  pageTitle: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    color: C.brown,
    lineHeight: moderateScale(26),
  },
  pageSubtitle: {
    fontSize: moderateScale(13),
    color: C.brown,
    marginTop: verticalScale(2),
  },

  /* balance card */
  balanceCard: {
    backgroundColor: '#F6EBDE',
    // marginHorizontal: scale(16),
    // marginVertical: verticalScale(12),
    // borderRadius: moderateScale(20),
    // borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    paddingVertical: verticalScale(28),
    paddingHorizontal: scale(20),
     borderBottomLeftRadius: moderateScale(26),
        borderBottomRightRadius: moderateScale(26),
        borderBottomColor: C.border,
        marginBottom: verticalScale(20),
  },
  bankIconWrap: {
    width: scale(64),
    height: scale(64),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.brownLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(16),
  },
  balanceAmount: {
    fontSize: moderateScale(52),
    fontWeight: "700",
    color: C.brown,
    lineHeight: moderateScale(60),
  },
  balanceLabel: {
    fontSize: moderateScale(14),
    color: C.brown,
    marginTop: verticalScale(4),
  },

  /* section title */
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: C.brown,
    marginHorizontal: scale(20),
    marginTop: verticalScale(8),
    marginBottom: verticalScale(12),
  },

  /* transaction row */
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
    backgroundColor: C.card,
    marginHorizontal: scale(16),
    marginBottom: verticalScale(10),
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(14),
  },
  txIconWrap: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(10),
    backgroundColor: C.brownLight,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  txInfo: { flex: 1 },
  txTitle: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: C.txt,
    marginBottom: verticalScale(3),
  },
  txDate: { fontSize: moderateScale(12), color: C.txt3 },

  /* coin badge */
  coinBadge: {
    borderRadius: moderateScale(20),
    borderWidth: 1,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(5),
  },
  coinBadgeText: { fontSize: moderateScale(13), fontWeight: "600" },

  /* empty */
  emptyWrap: {
    alignItems: "center",
    paddingVertical: verticalScale(40),
    gap: verticalScale(10),
  },
  emptyText: { fontSize: moderateScale(14), color: C.txt3 },
});
