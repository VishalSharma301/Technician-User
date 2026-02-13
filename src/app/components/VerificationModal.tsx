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
  JobDetails,
  JobInvoiceDetails,
  VerificationJob,
} from "../../constants/verification";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import CustomView from "./CustomView";
import { scale, verticalScale, moderateScale } from "../../utils/scaling";

type Props = {
  visible: boolean;
  jobs: VerificationJob[];
  onClose: () => void;
};

type ServiceType = "standard" | "parts_pending" | "workshop_required";

const VerificationModal: React.FC<Props> = ({ visible, jobs, onClose }) => {
  const [selectedJob, setSelectedJob] = useState<VerificationJob | null>(null);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState<string | null>(null);
  console.log("jobDetails : ", jobDetails);
  const serviceType: ServiceType =
    selectedJob?.inspection?.completionType ?? "standard";

  // const jobDetails: JobInvoiceDetails = jobDetailss?.invoice;

  const loadJobDetails = async (job: any) => {
    try {
      setLoading(true);
      const res = await getJobVerificationDetails(job._id);
      setSelectedJob(job);
      setJobDetails(res.data);
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

  type CCViewProps = {
    children: React.ReactNode;
    style?: any;
  };

  function CCView({ children, style }: CCViewProps) {
    return (
      <CustomView
        radius={scale(12)}
        shadowStyle={{ marginBottom: verticalScale(14) }}
      >
        {children}
      </CustomView>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            !selectedJob && !jobDetails && { flex: 0, padding: 16 },
          ]}
        >
          {!selectedJob && !jobDetails && (
            <Text style={styles.heading}>Pending Verifications</Text>
          )}

          {loading && <ActivityIndicator size="large" />}

          {!selectedJob && (
            <FlatList
              data={jobs}
              keyExtractor={(item) => item._id}
              renderItem={renderJobItem}
            />
          )}

          {selectedJob && jobDetails && (
            <SafeAreaView style={styles.container}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <Text style={styles.header}>Pending Approval</Text>

                {/* Job Status */}
                <CCView>
                  <View
                    style={[
                      styles.card,
                      { flexDirection: "row", alignItems: "center", gap: 10 },
                    ]}
                  >
                    <Text style={styles.rowLabel}>Job Status</Text>
                    <Text style={styles.status}>
                      {serviceType == "parts_pending" ||
                      serviceType == "workshop_required"
                        ? "On Hold"
                        : "In Progress"}
                    </Text>
                  </View>
                </CCView>

                {/* What's Covered */}
                <CCView>
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>What's Covered?</Text>

                    <View style={styles.coveredRow}>
                      {[
                        "Inspection of AC Unit",
                        "Cleaning Filters",
                        "Fan Cleaning",
                        "AC Leak Inspection",
                      ].map((item, index) => (
                        <View key={index} style={styles.coveredItem}>
                          <LinearGradient
                            colors={["#36DFF1", "#2764E7"]}
                            start={{ x: 0, y: 0 }} // top-left
                            end={{ x: 1, y: 1 }}
                            style={styles.checkbox}
                          >
                            <Ionicons
                              name="checkmark"
                              size={12}
                              color="white"
                            />
                          </LinearGradient>

                          <Text style={styles.coveredText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </CCView>

                {/* Additional Services */}
                <CCView>
                  <View style={styles.card}>
                    <View style={styles.spaceBetween}>
                      <Text style={styles.cardTitle}>Additional Services</Text>
                      <Text style={styles.amount}>
                        ₹{jobDetails.invoice.additionalServices?.total}
                      </Text>
                    </View>

                    {jobDetails.invoice.additionalServices?.items.map(
                      (item, index) => (
                        <ServiceRow
                          key={index}
                          name={item.serviceName}
                          brand={item.serviceName}
                          price={item.unitPrice}
                          qty={item.quantity}
                        />
                      ),
                    )}
                  </View>
                </CCView>

                {/* Custom Services */}
                {false && (
                  <CCView>
                    <View style={styles.card}>
                      <View style={styles.spaceBetween}>
                        <Text style={styles.cardTitle}>Custom Services</Text>
                        <Text style={styles.amount}>₹3300</Text>
                      </View>

                      <PriceRow label="Windows AC Services" value="₹1500" />
                      <PriceRow
                        label="Air Conditioning Services for Windows"
                        value="₹1800"
                      />
                    </View>
                  </CCView>
                )}

                {/* Parts List */}
                <CCView>
                  <View style={styles.card}>
                    <View style={styles.spaceBetween}>
                      <Text style={styles.cardTitle}>Parts List</Text>
                      <Text style={styles.amount}>
                        ₹{jobDetails.invoice.parts.total.toFixed(2)}
                      </Text>
                    </View>

                    <TableHeader />
                    {jobDetails.invoice.parts?.items.map((item, index) => (
                      <TableRow
                        key={index}
                        name={item.productName}
                        warranty={"5 Month"}
                        price={"₹" + item.unitPrice}
                      />
                    ))}
                  </View>
                </CCView>

                {/* Part Not Available / Workshop */}
                <CCView>
                  <View style={styles.card}>
                    <View style={{ flexDirection: "row" }}>
                      <View style={styles.workshopSection}>
                        <Text style={[styles.cardTitle, { marginBottom: 8 }]}>
                          Part Not Available
                        </Text>
                        {jobDetails.partsPending?.requiredParts.map(
                          (part, index) => (
                            <View key={index} style={{ flexDirection: "row" }}>
                              <Text
                                style={[styles.text, { fontWeight: "700" }]}
                              >
                                Part Name :
                              </Text>
                              <Text style={styles.text}> {part.partName}</Text>
                            </View>
                          ),
                        )}
                      </View>

                      {jobDetails.workshopDetails && (
                        <View style={styles.workshopSection}>
                          <Text style={styles.cardTitle}>Workshop Repair</Text>
                          <Text style={styles.text}>
                            Part Name:{" "}
                            {jobDetails.workshopDetails?.itemDescription}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={{ flexDirection: "row" }}>
                      <Text style={[styles.text, { fontWeight: "700", fontSize : moderateScale(12) }]}>
                        Reschedule Date
                      </Text>
                      <Text style={[styles.subText, {marginTop : 0}]}>
                        (Technician will fix this issue in given time)
                      </Text>
                    </View>

                    <Text style={styles.link}>Today</Text>
                  </View>
                </CCView>

                {/* Price Summary */}
                <CCView>
                  <View style={styles.card}>
                    <View style={styles.spaceBetween}>
                      <Text style={styles.cardTitle}>Service Detail</Text>
                      <Text style={styles.cardTitle}>Price</Text>
                    </View>

                    <PriceRow
                      label="Original Service Price"
                      value={"₹" + jobDetails.invoice.originalService.amount}
                    />
                    <PriceRow
                      label="Additional Service Price"
                      value={"₹" + jobDetails.invoice.additionalServices?.total}
                    />
                    <PriceRow
                      label="Part Price With Gst"
                      value={"₹" + jobDetails.invoice.totals.parts}
                    />
                    {/* <PriceRow label="Part Price With Gst" value="₹6300" /> */}

                    <View style={styles.divider} />

                    <View style={styles.spaceBetween}>
                      <Text style={styles.total}>Total Service Price</Text>
                      <Text style={styles.total}>
                        ₹{jobDetails.invoice.totals.grandTotal}
                      </Text>
                    </View>
                  </View>
                </CCView>
              </ScrollView>

              {/* Bottom Buttons */}
              <View style={styles.bottomActions}>
                <TouchableOpacity style={styles.dismissBtn}>
                  <Text style={styles.dismissText}>Dismiss</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.approveBtn} onPress={handleVerify}>
                  <Text style={styles.approveText}>Approved</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={closenow}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
const ServiceRow = ({ name, brand, price, qty }: any) => (
  <View style={{ marginBottom: 10 }}>
    <View style={styles.serviceTitleRow}>
      <Text style={styles.text}>{name}</Text>
      <View style={styles.brandChip}>
        <Text style={styles.brandText}>{brand}</Text>
      </View>
    </View>
    <Text style={styles.calc}>
      ₹ {price} × {qty} = ₹ {price * qty}
    </Text>
  </View>
);

const PriceRow = ({ label, value }: any) => (
  <View style={styles.spaceBetween}>
    <Text style={styles.text}>{label}</Text>
    <Text style={styles.text}>{value}</Text>
  </View>
);

const TableHeader = () => (
  <View style={styles.tableRow}>
    <Text style={styles.tableHeader}>Part Name</Text>
    <Text style={styles.tableHeader}>Warranty</Text>
    <Text style={styles.tableHeader}>Price</Text>
  </View>
);

const TableRow = ({ name, warranty, price }: any) => (
  <View style={styles.tableRow}>
    <Text style={styles.text}>{name}</Text>
    <Text style={styles.text}>{warranty}</Text>
    <Text style={styles.text}>{price}</Text>
  </View>
);

export default VerificationModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  container: {
    flex: 1,
    backgroundColor: "#F0EFF8",
    paddingHorizontal: scale(9),
  },

  header: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    textAlign: "center",
    marginVertical: verticalScale(16),
  },

  card: {
    padding: scale(14),
  },

  cardTitle: {
    fontSize: moderateScale(15),
    fontWeight: "600",
  },

  rowLabel: {
    fontSize: moderateScale(12),
    fontWeight: "700",
    color: "#000",
  },

  status: {
    fontSize: moderateScale(12),
    fontWeight: "700",
    color: "#004DBD",
  },

  coveredRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: verticalScale(10),
  },

  coveredItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },

  checkbox: {
    width: scale(14),
    height: scale(14),
    borderRadius: scale(3),
    backgroundColor: "#2F80ED",
    marginRight: scale(8),
  },

  coveredText: {
    fontSize: moderateScale(13),
    fontWeight: "500",
    color: "#000",
  },

  spaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(8),
  },

  workshopSection: {
    justifyContent: "space-between",
    marginBottom: verticalScale(8),
    flex: 1,
  },

  amount: {
    fontWeight: "700",
  },

  serviceTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  brandChip: {
    backgroundColor: "#BED2F4",
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: scale(20),
    marginLeft: scale(8),
  },

  brandText: {
    fontSize: moderateScale(12),
    color: "#000",
  },

  calc: {
    fontSize: moderateScale(12),
    color: "#000",
    marginTop: verticalScale(4),
  },

  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: verticalScale(4),
  },

  tableHeader: {
    fontWeight: "600",
    fontSize: moderateScale(13),
  },

  text: {
    fontSize: moderateScale(14),
    color: "#000000",
    fontWeight: "400",
  },

  subText: {
    fontSize: moderateScale(12),
    color: "#000",
    marginTop: verticalScale(8),
  },

  link: {
    fontSize: moderateScale(12),
    fontWeight: "700",
    color: "#004DBD",
    marginTop: verticalScale(4),
  },

  divider: {
    height: verticalScale(1),
    backgroundColor: "#EEE",
    marginVertical: verticalScale(10),
  },

  total: {
    fontSize: moderateScale(15),
    fontWeight: "700",
  },

  bottomActions: {
    flexDirection: "row",
    gap: scale(9.08),
    // padding: scale(16),
    // backgroundColor: "#FFF",
  },

  dismissBtn: {
    flex: 1,
    backgroundColor: "#FF0000",
    // paddingVertical: verticalScale(10),
    borderRadius: scale(4),
    height : verticalScale(38),
    alignItems : 'center',
    justifyContent : 'center'
    // marginRight: scale(10),
  },

  approveBtn: {
    flex: 1,
    backgroundColor: "#009EFF",
     borderRadius: scale(4),
    height : verticalScale(38),
    alignItems : 'center',
    justifyContent : 'center'
  },

  dismissText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "600",
    fontSize: moderateScale(14),
  },

  approveText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "600",
    fontSize: moderateScale(14),
  },

  heading: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    marginBottom: verticalScale(12),
  },

  jobItem: {
    padding: scale(14),
    borderRadius: scale(10),
    backgroundColor: "#f2f2f2",
    marginBottom: verticalScale(10),
  },

  jobTitle: {
    fontWeight: "600",
    fontSize: moderateScale(14),
  },

  jobSub: {
    fontSize: moderateScale(12),
    color: "#666",
    marginTop: verticalScale(4),
  },

  closeBtn: {
    marginTop: verticalScale(16),
    alignSelf: "center",
  },

  closeText: {
    color: "#0a7cff",
    fontWeight: "600",
    fontSize: moderateScale(14),
  },
});
