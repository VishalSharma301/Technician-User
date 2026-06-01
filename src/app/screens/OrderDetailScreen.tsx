import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { moderateScale, scale, verticalScale } from "../../utils/scaling";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { OrderStackParamList } from "../../constants/navigation";
import { InspectionUsedPart, ServiceRequest } from "../../constants/serviceRequestTypes";
import { Ionicons } from "@expo/vector-icons";
import ReviewModal from "../components/ReviewModal";

// ─── Types ────────────────────────────────────────────────────────────────────

type NavigationProp = RouteProp<OrderStackParamList, "OrderDetailsScreen">;

type AddonItem = {
  id: string;
  type: "PART" | "SERVICE";
  name: string;
  reason: string;
  price: number;
  status: "pending" | "approved" | "declined";
};

// ─── Status Config ─────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  technician_assigned: { label: "Assigned", color: "#4A90E2", bg: "#EAF2FB" },
  booked: { label: "Assigned", color: "#4A90E2", bg: "#EAF2FB" },
  confirmed_scheduled: { label: "Scheduled", color: "#7C3AED", bg: "#F3EEFF" },
  on_way: { label: "En Route", color: "#2F80ED", bg: "#EAF2FB" },
  arrived: { label: "Arrived", color: "#00A8E8", bg: "#E0F7FF" },
  in_progress: { label: "In Progress", color: "#D97706", bg: "#FFF7ED" },
  parts_pending: { label: "Parts Pending", color: "#6C5CE7", bg: "#F0EEFF" },
  at_workshop: { label: "At Workshop", color: "#8E44AD", bg: "#F6EEFF" },
  verification_requested: {
    label: "Verifying",
    color: "#EB5757",
    bg: "#FFF0F0",
  },
  completed: { label: "Completed", color: "#16A34A", bg: "#DCFCE7" },
  cancelled: { label: "Cancelled", color: "#D32F2F", bg: "#FFEBEB" },
};

const STATUS_CONFIG: Record<string, { title: string; color: string }> = {
  technician_assigned: { title: "Technician Assigned", color: "#4A90E2" },
  confirmed_scheduled: { title: "Schedule Confirmed", color: "#7C3AED" },
  on_way: { title: "En Route", color: "#2F80ED" },
  arrived: { title: "Arrived", color: "#00A8E8" },
  in_progress: { title: "In Progress", color: "#F2994A" },
  parts_pending: { title: "Parts Pending", color: "#6C5CE7" },
  at_workshop: { title: "At Workshop", color: "#8E44AD" },
  verification_requested: { title: "Verification Requested", color: "#EB5757" },
  completed: { title: "Completed", color: "#27AE60" },
  cancelled: { title: "Cancelled", color: "#D32F2F" },
};

// ─── Steps ──────────────────────────────────────────────────────────────────

const PROGRESS_STEPS = [
  {
    key: "booked",
    label: "Booked",
    statuses: [
      "confirmed_scheduled",
      "technician_assigned",
      "on_way",
      "arrived",
      "in_progress",
      "parts_pending",
      "at_workshop",
      "verification_requested",
      "completed",
    ],
  },
  {
    key: "assigned",
    label: "Assigned",
    statuses: [
      "technician_assigned",
      "on_way",
      "arrived",
      "in_progress",
      "parts_pending",
      "at_workshop",
      "verification_requested",
      "completed",
    ],
  },
  {
    key: "en_route",
    label: "En Route",
    statuses: [
      "on_way",
      "arrived",
      "in_progress",
      "parts_pending",
      "at_workshop",
      "verification_requested",
      "completed",
    ],
  },
  {
    key: "in_progress",
    label: "In Progress",
    statuses: [
      "in_progress",
      "parts_pending",
      "at_workshop",
      "verification_requested",
      "completed",
    ],
  },
  { key: "done", label: "Done", statuses: ["completed"] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStepState(
  stepKey: string,
  currentStatus: string,
): "done" | "current" | "pending" {
  const step = PROGRESS_STEPS.find((s) => s.key === stepKey);
  if (!step) return "pending";

  if (stepKey === "booked") {
    // always done once we have a status
    if (currentStatus === "confirmed_scheduled") return "current";
    return "done";
  }
  if (step.statuses.includes(currentStatus)) {
    // check if this is the CURRENT step
    const stepIndex = PROGRESS_STEPS.findIndex((s) => s.key === stepKey);
    const nextStep = PROGRESS_STEPS[stepIndex + 1];
    const isNext = nextStep
      ? !nextStep.statuses.includes(currentStatus)
      : false;
    const isLast = !nextStep;
    if (isLast && currentStatus === "completed") return "current";
    if (isNext || (isLast && currentStatus === "completed")) return "current";
    if (!nextStep) return currentStatus === "completed" ? "current" : "done";
    // if the next step is also completed, this step is "done"
    if (nextStep.statuses.includes(currentStatus)) return "done";
    return "current";
  }
  return "pending";
}

function stepColor(state: "done" | "current" | "pending"): string {
  if (state === "done") return "#4A90E2";
  if (state === "current") return "#F5A623";
  return "#D0D5DD";
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

const OrderDetailsScreen: React.FC = () => {
  const route = useRoute<NavigationProp>();
  const item: ServiceRequest = route.params?.item;
  const navigation = useNavigation();
  console.log("job :", item);

  const [reviewVisible, setReviewVisible] = useState(false);
  const [addonItems, setAddonItems] = useState<AddonItem[]>(
    // Map from item data if available, otherwise mock for demonstration
    (item as any).addonRequests ?? [],
  );

  const statusHistory = item.statusHistory ?? [];
  const sortedHistory = useMemo(
    () =>
      [...statusHistory].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      ),
    [statusHistory],
  );

  const formatDateTime = (iso: string) => {
    const date = new Date(iso);
    const day = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const time = date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { day, time };
  };

  const status = item.status ?? "confirmed_scheduled";
  const badge = STATUS_BADGE[status] ?? {
    label: status,
    color: "#555",
    bg: "#EEE",
  };
  const inspection = item.computedInvoice;
  const provider = item.provider;
  const isCompleted = status === "completed";
  const isInProgress = status === "in_progress";
  const isCancellable = ["confirmed_scheduled", "technician_assigned"].includes(
    status,
  );

  const pendingAddons = addonItems.filter((a) => a.status === "pending");
  const hasAddons = addonItems.length > 0;

  // approve / decline addon
  const handleAddon = (id: string, action: "approved" | "declined") => {
    setAddonItems((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: action } : a)),
    );
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => navigation.goBack(),
        },
      ],
    );
  };

  // ── Invoice totals ─────────────────────────────────────────────────────────
const additionalParts = item.inspection?.usedParts

  const baseTotal = item.finalPrice ?? 0;
  const approvedAddons = addonItems
    .filter((a) => a.status === "approved")
    .reduce((sum, a) => sum + a.price, 0);
  const additionalPartsSum = additionalParts?.reduce((sum, part) => sum + (part.totalWithGst ?? 0), 0) ?? 0;
  const subtotal = baseTotal + approvedAddons + additionalPartsSum ;
  const gstRate = 0;
  const gst = Math.round(subtotal * gstRate);
  const advancePaid = (item as any).advancePaid ?? 0;
  // const amountDue = subtotal + gst - advancePaid;
  const amountDue = subtotal  - advancePaid;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={styles.screen}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={moderateScale(20)} color={BROWN} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Booking Details</Text>
          <Text style={styles.headerSub}>
            ID: {item._id?.slice(-8).toUpperCase() ?? "FUV24003"}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { borderColor: badge.color, backgroundColor: badge.bg },
          ]}
        >
          <Text style={[styles.statusBadgeText, { color: badge.color }]}>
            {badge.label}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Service Info Card ───────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.serviceIconRow}>
            <View style={styles.serviceIconBox}>
              <Ionicons
                name="construct-outline"
                size={moderateScale(22)}
                color={BROWN}
              />
            </View>
            <View>
              <Text style={styles.serviceName}>
                {item.service?.name ?? "Service"}
              </Text>
              <Text style={styles.serviceType}>
                {item.service?.category.name ?? "Repair"}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <InfoRow
            label="Date"
            value={
              item.createdAt
                ? new Date(item.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "—"
            }
          />
          <InfoRow
            label="Slot"
            value={item.scheduledTimeSlot ?? "2:00-5:00 PM"}
          />
          {/* <InfoRow label="Address"          value={item.address ?? "—"} /> */}
          <InfoRow
            label="Provider Name"
            value={provider?.companyName ?? provider?.name ?? "—"}
          />
          <InfoRow
            label="Provider Phone no"
            value={provider?.phoneNumber ?? "—"}
          />
        </View>

        {/* ── Technician Add-on Request (in_progress only) ──────────── */}
        {isInProgress && hasAddons && (
          <View style={styles.addonCard}>
            <View style={styles.addonHeader}>
              <Ionicons name="flash" size={moderateScale(14)} color="#fff" />
              <Text style={styles.addonHeaderTitle}>
                Technician Add-on Request
              </Text>
            </View>
            <View style={styles.addonMeta}>
              <Ionicons
                name="person-circle-outline"
                size={moderateScale(14)}
                color={BROWN}
              />
              <Text style={styles.addonMetaText}>
                {provider?.companyName ?? "Technician"} · 2 min ago
              </Text>
            </View>
            <Text style={styles.addonInstruction}>
              Review each item and approve or decline individually:
            </Text>

            {addonItems.map((addon) => (
              <AddonItemCard
                key={addon.id}
                addon={addon}
                onApprove={() => handleAddon(addon.id, "approved")}
                onDecline={() => handleAddon(addon.id, "declined")}
              />
            ))}
          </View>
        )}
        {item.inspection?.usedParts.length &&
          item.inspection?.usedParts.length > 0 && (
            <View style={styles.addonCard}>
              <View style={styles.addonHeader}>
                <Ionicons name="flash" size={moderateScale(14)} color="#fff" />
                <Text style={styles.addonHeaderTitle}>
                  Parts Add-on 
                </Text>
              </View>
            

              {item.inspection?.usedParts.map((addon) => (
                <AdditionalItemCard
                  key={addon._id}
                  addon={addon}
                />
              ))}
            </View>
          )}

        {/* ── Service Progress ─────────────────────────────────────────── */}
        {/* <View style={styles.card}>
          <Text style={styles.sectionTitle}>Service Progress</Text>
          <View style={styles.progressContainer}>
            {PROGRESS_STEPS.map((step, idx) => {
              const state = getStepState(step.key, status);
              const color = stepColor(state);
              const isLast = idx === PROGRESS_STEPS.length - 1;
              const isCurrent = state === "current";

              return (
                <View key={step.key} style={styles.progressRow}>
                  <View style={styles.progressLeft}>
                    <View
                      style={[
                        styles.progressCircle,
                        {
                          backgroundColor: state === "pending" ? "#fff" : color,
                          borderColor: color,
                        },
                      ]}
                    >
                      {state !== "pending" && (
                        <Ionicons
                          name="checkmark"
                          size={moderateScale(12)}
                          color="#fff"
                        />
                      )}
                    </View>
                    {!isLast && (
                      <View
                        style={[
                          styles.progressLine,
                          {
                            backgroundColor:
                              color === "#D0D5DD" ? "#E4E7EC" : color,
                          },
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.progressLabelCol}>
                    <Text
                      style={[
                        styles.progressLabel,
                        isCurrent && styles.progressLabelCurrent,
                      ]}
                    >
                      {step.label}
                    </Text>
                    {isCurrent && (
                      <View style={styles.currentDot}>
                        <View style={styles.currentDotInner} />
                        <Text style={styles.currentStatusText}>
                          Current Status
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View> */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Service Progress</Text>
          <View style={styles.progressContainer}>
            {sortedHistory.length === 0 ? (
              <Text style={{ color: "#999", fontSize: moderateScale(13) }}>
                No history yet.
              </Text>
            ) : (
              sortedHistory.map((histItem, idx) => {
                const isLast = idx === sortedHistory.length - 1;
                const config = STATUS_CONFIG[histItem.status] ?? {
                  title: histItem.status,
                  color: "#999",
                };
                const { day, time } = formatDateTime(histItem.timestamp);

                return (
                  <View key={histItem._id ?? idx} style={styles.progressRow}>
                    {/* ── Circle + Line ── */}
                    <View style={styles.progressLeft}>
                      <View
                        style={[
                          styles.progressCircle,
                          {
                            backgroundColor: config.color,
                            borderColor: config.color,
                          },
                        ]}
                      >
                        <Ionicons
                          name="checkmark"
                          size={moderateScale(12)}
                          color="#fff"
                        />
                      </View>
                      {!isLast && (
                        <View
                          style={[
                            styles.progressLine,
                            { backgroundColor: config.color },
                          ]}
                        />
                      )}
                      {/* Terminal filled dot for last item */}
                      {isLast && (
                        <View
                          style={[
                            styles.progressTerminalDot,
                            { backgroundColor: config.color },
                          ]}
                        />
                      )}
                    </View>

                    {/* ── Right: label + timestamp + notes ── */}
                    <View style={styles.progressLabelCol}>
                      <View style={styles.progressLabelRow}>
                        <Text
                          style={[
                            styles.progressLabel,
                            isLast && styles.progressLabelCurrent,
                          ]}
                        >
                          {config.title}
                        </Text>
                        {/* <Text style={styles.progressTime}>{time}</Text> */}
                      </View>
                      {/* <Text style={styles.progressDate}>{day}</Text> */}

                      {isLast && (
                        <View style={styles.currentDot}>
                          <View
                            style={[
                              styles.currentDotInner,
                              { backgroundColor: config.color },
                            ]}
                          />
                          <Text
                            style={[
                              styles.currentStatusText,
                              { color: config.color },
                            ]}
                          >
                            Current Status
                          </Text>
                        </View>
                      )}

                      {/* {!!histItem.notes && (
                        <Text style={styles.progressNotes} numberOfLines={2}>
                          {histItem.notes}
                        </Text>
                      )} */}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* ── Assigning Technician (no technician yet) ──────────────── */}
        {!provider && status === "confirmed_scheduled" && (
          <View style={styles.assigningCard}>
            <Ionicons
              name="settings-outline"
              size={moderateScale(30)}
              // color="#864C2D"
            />
            <Text style={styles.assigningTitle}>Assigning Technician</Text>
            <Text style={styles.assigningSubtitle}>
              You'll be notified once a technician is assigned
            </Text>
          </View>
        )}

        {/* ── Assigned Technician ──────────────────────────────────── */}
        {provider && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Assigned Technician</Text>
            <View style={styles.techRow}>
              <View style={styles.techAvatar}>
                <Ionicons
                  name="person-outline"
                  size={moderateScale(24)}
                  color={BROWN}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.techName}>
                  {item.technician?.name ?? provider.name}
                </Text>
                <Text style={styles.techSub}>Appliance Repair · 4 yrs</Text>
                <View style={styles.techBadgeRow}>
                  <View style={styles.ratingBadge}>
                    <Ionicons
                      name="star"
                      size={moderateScale(10)}
                      color={BROWN}
                    />
                    <Text style={styles.ratingText}>4.9</Text>
                  </View>
                  <View style={styles.expertBadge}>
                    <Ionicons
                      name="shield-checkmark"
                      size={moderateScale(10)}
                      color="#729869"
                    />
                    <Text style={styles.expertText}>Expert</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.callRow}>
              <TouchableOpacity style={styles.callBtn}>
                <Ionicons
                  name="call-outline"
                  size={moderateScale(14)}
                  color={BROWN}
                />
                <Text style={styles.callBtnText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.callBtn, styles.callBtnOutline]}>
                <Ionicons
                  name="videocam-outline"
                  size={moderateScale(14)}
                  color={"#729869"}
                />
                <Text style={[styles.callBtnText, { color: "#729869" }]}>
                  Call
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Invoice ──────────────────────────────────────────────── */}
        <View style={[styles.card, {}]}>
          <View style={styles.invoiceHeaderRow}>
            <View style={styles.invoiceIconBox}>
              <Ionicons
                name="receipt-outline"
                size={moderateScale(16)}
                color={BROWN}
              />
            </View>
            <Text style={styles.sectionTitle}>Invoice</Text>
          </View>

          {/* Base service */}
          <InvoiceRow
            label={`${item.service?.name ?? "Service"} — ${item.service?.category.name ?? "Repair"}`}
            sublabel="Base service charge"
            value={`₹${baseTotal}`}
            bold
          />
          <InvoiceRow
            label={`${'Additional Parts'}`}
            sublabel="Base service charge"
            value={`₹${item.inspection?.totals.parts ?? 0}`}
            bold
          />

          {/* Approved addons */}
          {/* {addonItems
            .filter((a) => a.status === "approved")
            .map((a) => (
              <InvoiceRow
                key={a.id}
                label={a.name}
                sublabel={a.reason}
                value={String(a.price)}
              />
            ))} */}

          <View style={styles.divider} />
          <InvoiceRow label="Subtotal" value={`₹${subtotal}`} />
          <InvoiceRow label={`GST (18%)`} value={`₹${gst}`} />
          {advancePaid > 0 && (
            <InvoiceRow
              label="Advance Paid"
              value={`−₹${advancePaid}`}
              valueColor="#16A34A"
            />
          )}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Amount Due</Text>
            <Text style={styles.totalValue}>₹{amountDue}</Text>
          </View>
        </View>

        {/* ── Bottom spacing ───────────────────────────────────────── */}
        <View style={{ height: verticalScale(100) }} />
      </ScrollView>

      {/* ── Bottom Action Button ─────────────────────────────────── */}
      <View style={[styles.bottomBar, {}]}>
        {isCompleted ? (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: BROWN }]}
            // onPress={() => setReviewVisible(true)}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={moderateScale(16)}
              color="#fff"
            />
            <Text style={styles.actionBtnText}>Claim 5-Day Warranty</Text>
          </TouchableOpacity>
        ) : isCancellable ? (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: BROWN }]}
            onPress={handleCancel}
          >
            <Text style={styles.actionBtnText}>Cancel Booking</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.cancelUnavailableBar}>
            <Ionicons
              name="information-circle-outline"
              size={moderateScale(14)}
              color="#D32F2F"
            />
            <Text style={styles.cancelUnavailableText}>
              Cancellation unavailable – technician is already in progress
            </Text>
          </View>
        )}
      </View>

      <ReviewModal
        visible={reviewVisible}
        onClose={() => setReviewVisible(false)}
        serviceRequestId={item._id}
      />
    </View>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: verticalScale(7),
  },
  label: {
    fontSize: moderateScale(13),
    color: "#666",
    flex: 1,
  },
  value: {
    fontSize: moderateScale(13),
    color: "#1A1A1A",
    fontWeight: "500",
    flex: 1.4,
    textAlign: "right",
  },
});

function InvoiceRow({
  label,
  sublabel,
  value,
  bold,
  valueColor,
}: {
  label: string;
  sublabel?: string;
  value: string;
  bold?: boolean;
  valueColor?: string;
}) {
  return (
    <View style={invoiceStyles.row}>
      <View style={{ flex: 1 }}>
        <Text style={[invoiceStyles.label, bold && invoiceStyles.bold]}>
          {label}
        </Text>
        {!!sublabel && <Text style={invoiceStyles.sublabel}>{sublabel}</Text>}
      </View>
      <Text
        style={[
          invoiceStyles.value,
          bold && invoiceStyles.bold,
          valueColor ? { color: valueColor } : {},
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const invoiceStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: verticalScale(7),
  },
  label: {
    fontSize: moderateScale(13),
    color: "#1A1A1A",
  },
  sublabel: {
    fontSize: moderateScale(11),
    color: "#864C2D",
    marginTop: verticalScale(2),
  },
  value: {
    fontSize: moderateScale(13),
    color: "#1A1A1A",
    fontWeight: "500",
  },
  bold: {
    fontWeight: "700",
  },
});

function AddonItemCard({
  addon,
  onApprove,
  onDecline,
}: {
  addon: AddonItem;
  onApprove: () => void;
  onDecline: () => void;
}) {
  const isApproved = addon.status === "approved";
  const isDeclined = addon.status === "declined";
  const isPending = addon.status === "pending";

  const borderColor = isApproved
    ? "#22C55E"
    : isDeclined
      ? "#EF4444"
      : "#E2E8F0";
  const bgColor = isApproved ? "#F0FFF4" : isDeclined ? "#FFF5F5" : "#fff";

  return (
    <View style={[addonStyles.card, { borderColor, backgroundColor: bgColor }]}>
      <View style={addonStyles.topRow}>
        <View
          style={[
            addonStyles.typeBadge,
            { backgroundColor: addon.type === "PART" ? "#DBEAFE" : "#E9D5FF" },
          ]}
        >
          <Text
            style={[
              addonStyles.typeBadgeText,
              { color: addon.type === "PART" ? "#1D4ED8" : "#7C3AED" },
            ]}
          >
            {addon.type}
          </Text>
        </View>
        <Text style={addonStyles.name}>{addon.name}</Text>
        <Text style={addonStyles.price}>₹{addon.price}</Text>
      </View>
      <View style={addonStyles.reasonRow}>
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={moderateScale(11)}
          color={BROWN}
        />
        <Text style={addonStyles.reason}>{addon.reason}</Text>
      </View>

      {isPending && (
        <View style={addonStyles.actionRow}>
          <TouchableOpacity style={addonStyles.approveBtn} onPress={onApprove}>
            <Text style={addonStyles.approveBtnText}>✓ Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={addonStyles.declineBtn} onPress={onDecline}>
            <Text style={addonStyles.declineBtnText}>✕ Decline</Text>
          </TouchableOpacity>
        </View>
      )}

      {isApproved && (
        <View style={addonStyles.statusRow}>
          <Ionicons
            name="checkmark-circle"
            size={moderateScale(13)}
            color="#22C55E"
          />
          <Text style={[addonStyles.statusText, { color: "#22C55E" }]}>
            Approved: Added to your invoice
          </Text>
        </View>
      )}
      {isDeclined && (
        <View style={addonStyles.statusRow}>
          <Ionicons
            name="close-circle"
            size={moderateScale(13)}
            color="#EF4444"
          />
          <Text style={[addonStyles.statusText, { color: "#EF4444" }]}>
            Declined
          </Text>
        </View>
      )}
    </View>
  );
}
function AdditionalItemCard({
  addon,
}: {
  addon: InspectionUsedPart;
}) {

  const borderColor = "#1CA177"
  const bgColor = "#1CA1771A"
  return (
    <View style={[addonStyles.card, { borderColor, backgroundColor: bgColor }]}>
      <View style={addonStyles.topRow}>
        <View
          style={[
            addonStyles.typeBadge,
            // { backgroundColor: addon.type === "PART" ? "#DBEAFE" : "#E9D5FF" },
            { backgroundColor: "#DBEAFE" },
          ]}
        >
          <Text
            style={[
              addonStyles.typeBadgeText,
              { color: "#1D4ED8" },
            ]}
          >
            {'part'}
          </Text>
        </View>
        <Text style={addonStyles.name}>{addon.productName}</Text>
        <Text style={addonStyles.price}>₹{addon.unitPrice}</Text>
      </View>
      <View style={addonStyles.reasonRow}>
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={moderateScale(11)}
          color={BROWN}
        />
        <Text style={addonStyles.reason}>{'Reason for Part Added'}</Text>
      </View>

      {/* {isPending && (
        <View style={addonStyles.actionRow}>
          <TouchableOpacity style={addonStyles.approveBtn} onPress={onApprove}>
            <Text style={addonStyles.approveBtnText}>✓ Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={addonStyles.declineBtn} onPress={onDecline}>
            <Text style={addonStyles.declineBtnText}>✕ Decline</Text>
          </TouchableOpacity>
        </View>
      )} */}

      {/* {isApproved && (
        <View style={addonStyles.statusRow}>
          <Ionicons
            name="checkmark-circle"
            size={moderateScale(13)}
            color="#22C55E"
          />
          <Text style={[addonStyles.statusText, { color: "#22C55E" }]}>
            Approved: Added to your invoice
          </Text>
        </View>
      )} */}
      {/* {isDeclined && (
        <View style={addonStyles.statusRow}>
          <Ionicons
            name="close-circle"
            size={moderateScale(13)}
            color="#EF4444"
          />
          <Text style={[addonStyles.statusText, { color: "#EF4444" }]}>
            Declined
          </Text>
        </View>
      )} */}
    </View>
  );
}

const addonStyles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: moderateScale(10),
    padding: scale(18),
    marginTop: verticalScale(10),
    marginHorizontal : scale(14),
    height : verticalScale(100)
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
    marginBottom: verticalScale(4),
  },
  typeBadge: {
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(1),
    borderRadius: moderateScale(4),
  },
  typeBadgeText: {
    fontSize: moderateScale(9),
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  name: {
    flex: 1,
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#000",
  },
  price: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: "#864C2D",
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    marginBottom: verticalScale(8),
  },
  reason: {
    fontSize: moderateScale(12),
    fontWeight  : "500",
    color: "#000000B2",
    flex: 1,
  },
  actionRow: {
    flexDirection: "row",
    gap: scale(10),
    marginTop: verticalScale(4),
  },
  approveBtn: {
    flex: 1,
    backgroundColor: "#DCFCE7",
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(6),
    alignItems: "center",
  },
  approveBtnText: {
    color: "#16A34A",
    fontWeight: "700",
    fontSize: moderateScale(12),
  },
  declineBtn: {
    flex: 1,
    backgroundColor: "#FEE2E2",
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(6),
    alignItems: "center",
  },
  declineBtnText: {
    color: "#D32F2F",
    fontWeight: "700",
    fontSize: moderateScale(12),
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(5),
    marginTop: verticalScale(2),
  },
  statusText: {
    fontSize: moderateScale(11),
    fontWeight: "600",
  },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const BROWN = "#864C2D";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF8F2",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(19),
    paddingBottom: verticalScale(19),
    marginBottom: verticalScale(20),
    backgroundColor: "#F6EBDE",
    gap: scale(10),
  },
  backBtn: {
    width: scale(32),
    height: scale(32),
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: BROWN,
  },
  headerSub: {
    fontSize: moderateScale(11),
    color: BROWN,
    marginTop: verticalScale(1),
  },
  statusBadge: {
    borderWidth: 1.5,
    borderRadius: moderateScale(20),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(4),
  },
  statusBadgeText: {
    fontSize: moderateScale(11),
    fontWeight: "700",
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(4),
    paddingBottom: verticalScale(20),
    gap: verticalScale(12),
  },

  // Cards
  card: {
    backgroundColor: "#fff",
    borderRadius: moderateScale(8),
    padding: scale(16),
    borderColor: "#F2D6B5",
    borderWidth: 1,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.06,
    // shadowRadius: 8,
    // elevation: 2,
  },

  sectionTitle: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: BROWN,
    marginBottom: verticalScale(12),
  },

  divider: {
    height: 1,
    backgroundColor: "#F0E6DA",
    marginVertical: verticalScale(8),
  },

  // Service
  serviceIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
    marginBottom: verticalScale(12),
  },
  serviceIconBox: {
    width: scale(44),
    height: scale(44),
    borderRadius: moderateScale(10),
    backgroundColor: "#864C2D1A",
    justifyContent: "center",
    alignItems: "center",
  },
  serviceName: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#1A1A1A",
  },
  serviceType: {
    fontSize: moderateScale(12),
    color: BROWN,
    marginTop: verticalScale(2),
  },

  // Progress
  progressContainer: {
    paddingLeft: scale(4),
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: verticalScale(50),
  },
  progressLeft: {
    alignItems: "center",
    width: scale(28),
    marginRight: scale(14),
  },
  progressCircle: {
    width: scale(26),
    height: scale(26),
    borderRadius: scale(13),
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    zIndex: 1,
  },
  progressLine: {
    width: scale(3),
    height: verticalScale(28),
    marginTop: verticalScale(-1),
    borderRadius: 2,
  },
  progressTerminalDot: {
    width: scale(14),
    height: scale(14),
    borderRadius: scale(7),
    marginTop: verticalScale(4),
  },
  progressLabelCol: {
    flex: 1,
    paddingTop: verticalScale(3),
    paddingBottom: verticalScale(10),
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: moderateScale(14),
    color: "#444",
    fontWeight: "500",
  },
  progressLabelCurrent: {
    fontWeight: "700",
    color: "#1A1A1A",
  },
  progressTime: {
    fontSize: moderateScale(11),
    color: "#888",
    fontWeight: "500",
  },
  progressDate: {
    fontSize: moderateScale(11),
    color: "#AAA",
    marginTop: verticalScale(1),
  },
  progressNotes: {
    fontSize: moderateScale(11),
    color: "#777",
    marginTop: verticalScale(4),
    fontStyle: "italic",
  },
  currentDot: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(5),
    marginTop: verticalScale(3),
  },
  currentDotInner: {
    width: scale(7),
    height: scale(7),
    borderRadius: scale(4),
    backgroundColor: "#D97706",
  },
  currentStatusText: {
    fontSize: moderateScale(10),
    color: "#D97706",
    fontWeight: "600",
  },

  // Assigning
  assigningCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: moderateScale(14),
    padding: scale(24),
    alignItems: "center",
    gap: verticalScale(8),
    borderWidth: 1,
    borderColor: "#FDDCB5",
  },
  assigningTitle: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: "#864C2D",
    marginTop: verticalScale(4),
  },
  assigningSubtitle: {
    fontSize: moderateScale(12),
    color: "#B57A3D",
    textAlign: "center",
  },

  // Technician
  techRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
    marginBottom: verticalScale(14),
  },
  techAvatar: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: "#864C2D1A",
    justifyContent: "center",
    alignItems: "center",
  },
  techName: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    color: "#1A1A1A",
  },
  techSub: {
    fontSize: moderateScale(11),
    color: BROWN,
    marginTop: verticalScale(2),
  },
  techBadgeRow: {
    flexDirection: "row",
    gap: scale(8),
    marginTop: verticalScale(5),
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(3),
    backgroundColor: "#864C2D1F",
    paddingHorizontal: scale(7),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(10),
  },
  ratingText: {
    fontSize: moderateScale(10),
    fontWeight: "700",
    color: "#92400E",
  },
  expertBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(3),
    backgroundColor: "#EEF2ED",
    paddingHorizontal: scale(7),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(10),
  },
  expertText: {
    fontSize: moderateScale(10),
    fontWeight: "700",
    color: "#729869",
  },
  callRow: {
    flexDirection: "row",
    gap: scale(12),
  },
  callBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(6),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(10),
    backgroundColor: "#fff",
  },
  callBtnOutline: {
    backgroundColor: "#EEF2ED",
  },
  callBtnText: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: BROWN,
  },

  // Invoice
  invoiceHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
    marginBottom: verticalScale(4),
  },
  invoiceIconBox: {
    width: scale(30),
    height: scale(30),
    borderRadius: moderateScale(8),
    backgroundColor: "#864C2D1A",
    justifyContent: "center",
    alignItems: "center",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: verticalScale(4),
  },
  totalLabel: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#1A1A1A",
  },
  totalValue: {
    fontSize: moderateScale(20),
    fontWeight: "800",
    color: BROWN,
  },

  // Addon Card
  addonCard: {
    backgroundColor: "#fff",
    borderRadius: moderateScale(14),
    overflow: "hidden",
    borderWidth : 1,
    borderColor : '#F2D6B5',
    paddingBottom : 23,
    // paddingHorizontal : 12
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.06,
    // shadowRadius: 8,
    // elevation: 2,
  },
  addonHeader: {
    backgroundColor: BROWN,
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(11),
  },
  addonHeaderTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: moderateScale(14),
  },
  addonMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(10),
  },
  addonMetaText: {
    fontSize: moderateScale(11),
    color: BROWN,
  },
  addonInstruction: {
    fontSize: moderateScale(12),
    color: "#555",
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(6),
    paddingBottom: verticalScale(2),
  },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    backgroundColor: "#FDF6EE",
    borderTopWidth: 1,
    borderTopColor: "#F0E6DA",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(8),
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(16),
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: moderateScale(15),
  },
  cancelUnavailableBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(6),
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FFF5F5",
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(14),
  },
  cancelUnavailableText: {
    color: "#D32F2F",
    fontSize: moderateScale(12),
    fontWeight: "500",
    flex: 1,
  },
});

export default OrderDetailsScreen;
