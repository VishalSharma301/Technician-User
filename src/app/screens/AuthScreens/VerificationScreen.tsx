import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { moderateScale, scale, verticalScale } from "../../../utils/scaling";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../../hooks/useAuth";

const VerificationScreen = () => {
  const { setIsAuthenticated } = useAuth();

  const verify = () => {
    setIsAuthenticated(true);
  };
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.box}>
          <Text style={styles.title}>Enter verification</Text>
          <Text style={styles.subText}>
            We’ve sent a code to hello@technicianapp.com
          </Text>

          <View style={styles.codeContainer}>
            {[1, 2, 3, 4].map((_, index) => (
              <TextInput
                key={index}
                style={styles.codeBox}
                maxLength={1}
                keyboardType="number-pad"
              />
            ))}
          </View>

          <Text style={styles.resendText}>
            Didn’t get a code?{" "}
            <Text style={styles.linkText}>Click to resend.</Text>
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.verifyButton} onPress={verify}>
              <Text style={{ color: "#fff" }}>Verify</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  box: {
    width: scale(375),
    // height: verticalScale(249),
    // marginHorizontal : scale(9),
    padding: moderateScale(20),
    //  backgroundColor: "#FFFFFF1A",
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(17),
    paddingVertical: verticalScale(18),
    borderWidth: 0.9,
    borderColor: "#FFFFFF",
    // shadowColor: "#000",
    // shadowOpacity: 0.1,
    // shadowRadius: 5,
    // elevation: 100,
    marginTop: verticalScale(65),
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: "600",
    color: "#027CC7",
    textAlign: "center",
  },
  subText: {
    textAlign: "center",
    color: "#6B687D",
    fontSize: moderateScale(10),
    fontWeight: "400",
    marginVertical: verticalScale(5),
  },
  codeContainer: {
    flexDirection: "row",
    gap: scale(7),
    justifyContent: "center",
    marginVertical: verticalScale(10),
  },
  codeBox: {
    width: scale(48),
    height: scale(48),
    backgroundColor: "#FFFFFF1A",
    borderRadius: moderateScale(8),
    textAlign: "center",
    fontSize: moderateScale(18),
    borderWidth: 0.9,
    borderColor: "#ffffff",
  },
  resendText: {
    textAlign: "center",
    color: "#000",
    fontWeight: "400",
    marginVertical: verticalScale(10),
  },
  linkText: {
    color: "#000",
    fontWeight: "700",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: verticalScale(15),
  },
  cancelButton: {
    // flex: 1,
    alignItems: "center",
    justifyContent: "center",
    // paddingVertical: verticalScale(10),
    backgroundColor: "#D4D4D440",
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: "#ffffffd8",
    marginRight: scale(12),
    width: scale(96),
    height: verticalScale(36),
  },
  verifyButton: {
    alignItems: "center",
    justifyContent: "center",
    // paddingVertical: verticalScale(10),
    backgroundColor: "#027CC7",
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: "#027CC7",
    // marginRight: scale(8),
    width: scale(96),
    height: verticalScale(36),
  },
});

export default VerificationScreen;
