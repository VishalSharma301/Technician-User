import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { ServiceRequest } from "../../constants/serviceRequestTypes";

interface ServiceRequestCardProps {
  request: ServiceRequest;
  onPress: (request: ServiceRequest) => void;
}

const getStatusColor = (status: string): string => {
  const colors: { [key: string]: string } = {
    pending: "#FFA500",
    booked: "#153B93",
    assigned: "#20B2AA",
    technician_assigned: "#32CD32",
    in_progress: "#FF8C00",
    completed: "#228B22",
    cancelled: "#DC143C",
  };
  return colors[status] || "#808080";
};

const getStatusLabel = (status: string): string => {
  const labels: { [key: string]: string } = {
    pending: "Pending",
    booked: "Booked",
    assigned: "Provider Assigned",
    technician_assigned: "Technician Assigned",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return labels[status] || status;
};

export const ServiceRequestCard: React.FC<ServiceRequestCardProps> = ({
  request,
  onPress,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(request)}>
      <View style={styles.header}>
        <View style={styles.serviceInfo}>
          {request.service?.icon && (
            <Image
              source={{ uri: request.service.icon }}
              style={styles.serviceIcon}
            />
          )}
          <View style={styles.serviceTitleContainer}>
            <Text style={styles.serviceName}>
              {request.service?.name ?? "Unknown Service"}
            </Text>
            <Text style={styles.categoryName}>
              {request.service?.category?.name ?? "Uncategorized"}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(request.status) },
          ]}
        >
          <Text style={styles.statusText}>
            {getStatusLabel(request.status)}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Scheduled:</Text>
          <Text style={styles.value}>
            {formatDate(request.scheduledDate)} • {request.scheduledTimeSlot}
          </Text>
        </View>

        {request.selectedOption?.name && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Service Type:</Text>
            <Text style={styles.value}>{request.selectedOption.name}</Text>
          </View>
        )}

        {request.technician?.name && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Technician:</Text>
            <Text style={styles.value}>{request.technician.name}</Text>
          </View>
        )}

        {request.provider?.name && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Provider:</Text>
            <Text style={styles.value}>{request.provider.name}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value} numberOfLines={1}>
            {request.address?.city ?? "Unknown City"},{" "}
            {request.address?.state ?? "Unknown State"}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total Amount</Text>
          <Text style={styles.price}>₹{request.finalPrice ?? "N/A"}</Text>
        </View>
        <View
          style={[
            styles.paymentBadge,
            {
              backgroundColor:
                request.paymentStatus === "paid" ? "#E8F5E9" : "#FFF3E0",
            },
          ]}
        >
          <Text
            style={[
              styles.paymentText,
              {
                color: request.paymentStatus === "paid" ? "#2E7D32" : "#E65100",
              },
            ]}
          >
            {request.paymentStatus?.toUpperCase() ?? "UNKNOWN"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  serviceInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  serviceTitleContainer: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 13,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 12,
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  value: {
    fontSize: 13,
    color: "#1A1A1A",
    fontWeight: "400",
    flex: 1,
    textAlign: "right",
    marginLeft: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  paymentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  paymentText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
