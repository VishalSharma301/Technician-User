import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { Ionicons as Icon } from "@expo/vector-icons";
import { applyForJob, ApplyJobPayload } from "../../utils/jobsApi";

interface Props {
  visible: boolean;
  jobId: string | null;
  onClose: () => void;
  onSubmit: () => void;
}

const JobForm: React.FC<Props> = ({
  visible,
  jobId,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = React.useState("");
  const [mobileNumber, setMobileNumber] = React.useState("");
  const [email, setEmail] = React.useState("");

  const handleSubmit = async () => {
   if (!jobId) return Alert.alert("Error", "Job ID is missing");
  if (!name.trim()) return Alert.alert("Error", "Please enter your full name");
  if (!mobileNumber.trim())
    return Alert.alert("Error", "Please enter your mobile number");

    const payload: ApplyJobPayload = {
      name,
      mobileNumber,
      email,

    };

    try {
      await applyForJob(jobId, payload);
      Alert.alert("Success", "Your application has been submitted!");
      onSubmit();
      onClose();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Icon name="close" size={20} color="#ffffff" />
          </TouchableOpacity>

          <Text style={styles.title}>Professional Information</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your Name"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Mobile No</Text>
          <TextInput
            style={styles.input}
            placeholder="9696969696"
            keyboardType="phone-pad"
            value={mobileNumber}
            onChangeText={setMobileNumber}
          />

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="info@email.com"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit Information</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default JobForm;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 9,
  },
  modalBox: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 21,
    paddingHorizontal : 17,
    borderWidth : 1,
    borderColor : '#DADADA',
    // height : 337
  },
  closeBtn: {
    position: "absolute",
    top: -7,
    right: 0,
    width : 20,
    aspectRatio : 1,
    backgroundColor : '#000',
    borderRadius : 20,
    alignItems : 'center',
    justifyContent : 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 14,
    // borderWidth : 1
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
    // lineHeight : 16
  },
  input: {
    width: "100%",
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    paddingHorizontal: 12,
    backgroundColor: "#e7e4e41a",
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: "#027CC7",
    borderRadius: 24,
    alignItems: "center",
    justifyContent : 'center',
    width : 123,
    height : 28,
    // marginBottom : 21
  },
  submitText: {
    color: "#fff",
    fontWeight: "400",
    fontSize: 12,
  },
});
