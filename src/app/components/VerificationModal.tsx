import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import {
  getJobVerificationDetails,
  verifyJobDetails,
} from "../../utils/verificationApis";
import { ServiceData } from "../../constants/types";
import {
  JobInvoiceDetails,
  VerificationJob,
} from "../../constants/verification";

type Props = {
  visible: boolean;
  jobs: VerificationJob[];
  onClose: () => void;
};

type ServiceType = "standard" | "parts_pending" | "workshop_required";

const VerificationModal: React.FC<Props> = ({ visible, jobs, onClose }) => {
  const [selectedJob, setSelectedJob] = useState<VerificationJob | null>(null);
  const [jobDetails, setJobDetails] = useState<JobInvoiceDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState<string | null>(null);
  console.log("jobDetails : ", jobDetails);
  const serviceType: ServiceType =
    selectedJob?.inspection?.completionType ?? "standard";

  const loadJobDetails = async (job: any) => {
    try {
      setLoading(true);
      const res = await getJobVerificationDetails(job._id);
      setSelectedJob(job);
      setJobDetails(res.data.invoice);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  function closenow() {
    onClose();
    setSelectedJob(null);
    setJobDetails(null);
  }
  const handleVerify = async () => {
    if (!selectedJob) return;

    try {
      setLoading(true);
      const res = await verifyJobDetails(selectedJob._id);
      console.log("res", res);
      
      setOtp(res.data.completionPin);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderJobItem = ({ item }: { item: VerificationJob }) => (
    <TouchableOpacity
      style={styles.jobItem}
      onPress={() => loadJobDetails(item)}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={styles.jobTitle}>Job Name : {item.service.name}</Text>
        <Text
          style={{ textTransform: "none", fontWeight: "600", color: "#c22828" }}
        >
          {item.inspection.completionType}
        </Text>
      </View>
      <Text style={styles.jobSub}>Tap to view details</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.heading}>Pending Verifications</Text>

          {loading && <ActivityIndicator size="large" />}

          {!selectedJob && (
            <FlatList
              data={jobs}
              keyExtractor={(item) => item._id}
              renderItem={renderJobItem}
            />
          )}

          {selectedJob && jobDetails && (
            <ScrollView style={styles.card}>
              <Text style={styles.successTitle}>Service Booked!</Text>
              <Text style={styles.successSub}>
                {serviceType == "standard"
                  ? "You have successfully booked the service inspection. Here are the details:"
                  : serviceType == "parts_pending"
                    ? "Inspection successfully done. New parts to be added and are pending. Service will be rescheduled"
                    : "You have successfully booked the service inspection. Service needs to be completed at the workshop. Here are the details"}
              </Text>
              <Text style={styles.successSub}>
                {serviceType == "standard"
                  ? "You have successfully booked the service inspection. Here are the details:"
                  : serviceType == "parts_pending"
                    ? "Inspection successfully done. New parts to be added and are pending. Service will be rescheduled"
                    : "You have successfully booked the service inspection. Service needs to be completed at the workshop. Here are the details"}
              </Text>

              {/* What's Covered */}
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>What’s Covered</Text>
                <Text style={styles.checkItem}>✔ Inspection of AC Unit</Text>
                <Text style={styles.checkItem}>✔ Cleaning Filters</Text>
                <Text style={styles.checkItem}>✔ AC Leak Inspection</Text>
              </View>
              {jobDetails.originalService && (
                <View style={styles.section}>
                  <Text style={styles.sectionHeader}>Original Service</Text>
                  <View style={styles.row}>
                    <Text style={styles.itemName}>
                      {jobDetails.originalService.name}
                    </Text>
                    <Text style={styles.itemPrice}>
                      ₹{Math.round(jobDetails.originalService.amount)}
                    </Text>
                  </View>
                </View>
              )}

              {/* Parts */}
              {jobDetails.parts?.items?.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionHeader}>Parts Used</Text>

                  {jobDetails.parts.items.map((part) => (
                    <View key={part._id} style={styles.row}>
                      <Text style={styles.itemName}>
                        {part.inventoryItem?.productName}
                      </Text>
                      <Text style={styles.itemPrice}>{part.totalWithGst}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Custom / Additional Services */}
              {jobDetails.additionalServices &&
                jobDetails.additionalServices?.items?.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionHeader}>
                      Additional Services
                    </Text>

                    {jobDetails.additionalServices.items.map((srv) => (
                      <View key={srv._id} style={styles.row}>
                        <Text style={styles.itemName}>{srv.serviceName}</Text>
                        <Text style={styles.itemPrice}>{srv.totalPrice}</Text>
                      </View>
                    ))}
                  </View>
                )}

              {/* Total */}
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Summary</Text>

                {/* {jobDetails.summary.items.map((item: any, idx: number) => (
    <View key={idx} style={styles.row}>
      <Text style={styles.itemName}>{item.label}</Text>
      <Text style={styles.itemPrice}>₹{item.amount}</Text>
    </View>
  ))} */}
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalText}>Original Service</Text>
                <Text style={styles.totalAmount}>
                  ₹{jobDetails.totals.originalService}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalText}>Additional Service</Text>
                <Text style={styles.totalAmount}>
                  ₹{jobDetails.totals.additionalServices}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalText}>Additional Parts</Text>
                <Text style={styles.totalAmount}>
                  ₹{jobDetails.totals.parts}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalText}>Grand Total</Text>
                <Text style={styles.totalAmount}>
                  ₹{jobDetails.totals.grandTotal}
                </Text>
              </View>

              {/* Verify */}
              {!otp ? (
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={handleVerify}
                >
                  <Text style={styles.primaryText}>Okay</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.otpBox}>
                  <Text style={styles.otpLabel}>Completion PIN</Text>
                  <Text style={styles.otp}>{otp}</Text>
                  <Text style={styles.otpHint}>
                    Share this PIN with the technician
                  </Text>
                </View>
              )}
              <View style={{height : 100}}></View>
            </ScrollView>
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={closenow}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default VerificationModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#fff",
    padding: 16,
    maxHeight: "90%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  jobItem: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#f2f2f2",
    marginBottom: 10,
  },
  jobTitle: {
    fontWeight: "600",
  },
  jobSub: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#e6e6e6",
    borderRadius: 18,
    padding: 16,
    
    // flex : 1
  },

  successTitle: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 4,
  },

  successSub: {
    fontSize: 13,
    textAlign: "center",
    color: "#555",
    marginBottom: 12,
  },

  section: {
    backgroundColor: "#efeef3",
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
  },

  sectionHeader: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },

  checkItem: {
    fontSize: 13,
    marginBottom: 4,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  itemName: {
    fontSize: 13,
    fontWeight: "600",
  },

  itemPrice: {
    fontSize: 13,
    fontWeight: "600",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },

  totalText: {
    fontSize: 16,
    fontWeight: "700",
  },

  totalAmount: {
    fontSize: 16,
    fontWeight: "800",
  },

  primaryBtn: {
    backgroundColor: "#3B6EF6",
    borderRadius: 22,
    paddingVertical: 12,
    marginTop: 16,
  },

  primaryText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 15,
  },

  detailsContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 6,
  },
  verifyBtn: {
    backgroundColor: "#0a7cff",
    padding: 14,
    borderRadius: 10,
    marginTop: 16,
  },
  verifyText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  otpBox: {
    backgroundColor: "#eaf6ff",
    padding: 14,
    borderRadius: 10,
    marginTop: 16,
    alignItems: "center",
  },
  otpLabel: {
    fontSize: 12,
    color: "#555",
  },
  otp: {
    fontSize: 28,
    fontWeight: "800",
    marginVertical: 6,
  },
  otpHint: {
    fontSize: 12,
    color: "#555",
    textAlign: "center",
  },
  closeBtn: {
    marginTop: 16,
    alignSelf: "center",
  },
  closeText: {
    color: "#0a7cff",
    fontWeight: "600",
  },
});
