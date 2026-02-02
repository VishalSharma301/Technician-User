    import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { getJobVerificationDetails, verifyJobDetails } from "../../utils/verificationApis";
import { ServiceData } from "../../constants/types";

type Props = {
  visible: boolean;
  jobs: ServiceData[];
  onClose: () => void;
};

const VerificationModal: React.FC<Props> = ({
  visible,
  jobs,
  onClose,
}) => {
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState<string | null>(null);
 console.log('jobDetails : ', jobDetails);
  const loadJobDetails = async (job: any) => {
    try {
      setLoading(true);
      const res = await getJobVerificationDetails(job._id);
      setSelectedJob(job);
      setJobDetails(res);
     
      
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
function closenow(){
    onClose()
    setSelectedJob(null)
    setJobDetails(null)
}
  const handleVerify = async () => {
    if (!selectedJob) return;

    try {
      setLoading(true);
      const res = await verifyJobDetails(selectedJob._id);
      setOtp(res.completionPin);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderJobItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.jobItem}
      onPress={() => loadJobDetails(item)}
    >
      <Text style={styles.jobTitle}>Job ID: {item._id}</Text>
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
            <View style={styles.detailsContainer}>
              <Text style={styles.sectionTitle}>Job Details</Text>

              <Text style={styles.detailText}>
                Used Parts: {jobDetails?.usedParts?.length || 0}
              </Text>

              <Text style={styles.detailText}>
                Additional Services:{" "}
                {jobDetails?.additionalServices?.length}
              </Text>

              <Text style={styles.detailText}>
                Total Amount: ₹{Math.round(jobDetails?.totals?.grandTotal * 100) / 100}
              </Text>

              {!otp ? (
                <TouchableOpacity
                  style={styles.verifyBtn}
                  onPress={handleVerify}
                >
                  <Text style={styles.verifyText}>Verify & Approve</Text>
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
            </View>
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
