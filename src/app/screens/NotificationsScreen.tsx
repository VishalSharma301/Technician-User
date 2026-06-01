import React, { useState } from "react";
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
  border: "#DEDEDE  ",
  brown: "#864C2D",
  brownLight: "#1E1E1E0A",
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

export type NotificationType =
  | "action_required"
  | "technician_request"
  | "reminder"
  | "coins"
  | "rating"
  | "general";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  time: string;
  read: boolean;
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "action_required",
    title: "ACTION REQUIRED",
    body: "Technician wants to add parts/services to your AC booking. Tap to review and approve or decline.",
    time: "2 min ago",
    read: false,
  },
  {
    id: "2",
    type: "technician_request",
    title: "Technician Request",
    body: "Harpreet Singh wants to add parts/services to your AC booking. Tap to review.",
    time: "2 min ago",
    read: false,
  },
  {
    id: "3",
    type: "reminder",
    title: "Service Reminder",
    body: "Your AC service is today at 2:00 PM in Sector 17.",
    time: "2 hrs ago",
    read: false,
  },
  {
    id: "4",
    type: "coins",
    title: "50 Coins Added!",
    body: "Reward for completing your Washing Machine repair.",
    time: "1 day ago",
    read: false,
  },
  {
    id: "5",
    type: "rating",
    title: "Rate Your Service",
    body: "How was your Washing Machine repair? Leave a quick review.",
    time: "5 days ago",
    read: false,
  },
];

/* ── Icon config per notification type ── */
function getIconConfig(type: NotificationType): {
  icon: string;
  iconColor: string;
  iconBg: string;
} {
  switch (type) {
    case "action_required":
      return { icon: "bell-alert-outline", iconColor: C.red,   iconBg: C.redBg };
    case "technician_request":
      return { icon: "account-wrench-outline", iconColor: C.brown, iconBg: C.brownLight };
    case "reminder":
      return { icon: "bell-ring-outline",  iconColor: C.brown, iconBg: C.brownLight };
    case "coins":
      return { icon: "cash-multiple",      iconColor: C.brown, iconBg: C.brownLight };
    case "rating":
      return { icon: "star-outline",      iconColor: C.brown, iconBg: C.brownLight };
    default:
      return { icon: "bell-outline",       iconColor: C.brown, iconBg: C.brownLight };
  }
}

/* ── Single notification card ── */
type NotifCardProps = {
  item: Notification;
  onPress: (id: string) => void;
};

function NotifCard({ item, onPress }: NotifCardProps) {
  const { icon, iconColor, iconBg } = getIconConfig(item.type);
  const isActionRequired = item.type === "action_required";

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isActionRequired && styles.cardActionRequired,
      ]}
      onPress={() => onPress(item.id)}
      activeOpacity={0.75}
    >
      {/* Icon */}
      <View
        style={[
          styles.notifIcon,
          { backgroundColor: iconBg },
          isActionRequired && styles.notifIconAction,
        ]}
      >
        <Icon
          name={icon as any}
          size={moderateScale(20)}
          color={isActionRequired ? C.red : iconColor}
        />
      </View>

      {/* Content */}
      <View style={styles.notifContent}>
        <Text
          style={[
            styles.notifTitle,
            isActionRequired && styles.notifTitleAction,
          ]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text style={styles.notifBody} numberOfLines={2}>
          {item.body}
        </Text>
        <Text style={styles.notifTime}>{item.time}</Text>
      </View>

      {/* Unread dot */}
      {!item.read && (
        <View
          style={[
            styles.unreadDot,
            { backgroundColor: isActionRequired ? C.red : C.green },
          ]}
        />
      )}
    </TouchableOpacity>
  );
}

interface Props {
  initialNotifications?: Notification[];
}

export default function NotificationsScreen({
  initialNotifications = MOCK_NOTIFICATIONS,
}: Props) {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={moderateScale(20)} color={C.txt} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: scale(72) }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Icon name="bell-off-outline" size={moderateScale(48)} color={C.txt3} />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyBody}>You're all caught up!</Text>
          </View>
        ) : (
          notifications.map((item) => (
            <NotifCard key={item.id} item={item} onPress={markAsRead} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { paddingHorizontal: scale(16), paddingBottom: verticalScale(40), paddingTop: verticalScale(8) },

  /* header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(8),
    backgroundColor: '#F6EBDE',
  },
  backBtn: { width: scale(40) },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    color: C.brown,
  },
  markAllText: {
    fontSize: moderateScale(13),
    color: C.brown,
    fontWeight: "600",
    width: scale(72),
    textAlign: "right",
  },

  /* card */
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: scale(12),
    backgroundColor: C.card,
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: C.border,
    padding: scale(14),
    marginBottom: verticalScale(10),
  },
  cardActionRequired: {
    backgroundColor: C.redBg,
    borderColor: C.redBorder,
  },

  /* icon */
  notifIcon: {
    width: scale(42),
    height: scale(42),
    borderRadius: moderateScale(12),
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  notifIconAction: {
    backgroundColor: C.redBg,
  },

  /* content */
  notifContent: { flex: 1 },
  notifTitle: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    color: C.txt,
    marginBottom: verticalScale(4),
  },
  notifTitleAction: { color: '#000' },
  notifBody: {
    fontSize: moderateScale(12),
    color: C.txt2,
    lineHeight: moderateScale(18),
    marginBottom: verticalScale(6),
  },
  notifTime: { fontSize: moderateScale(11), color: C.txt3 },

  /* unread dot */
  unreadDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    flexShrink: 0,
    marginTop: verticalScale(2),
  },

  /* empty state */
  emptyWrap: {
    alignItems: "center",
    paddingTop: verticalScale(80),
    gap: verticalScale(10),
  },
  emptyTitle: { fontSize: moderateScale(16), fontWeight: "600", color: C.txt2 },
  emptyBody: { fontSize: moderateScale(13), color: C.txt3 },
});