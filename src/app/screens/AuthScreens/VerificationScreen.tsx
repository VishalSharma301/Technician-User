import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import { moderateScale, scale, verticalScale } from "../../../utils/scaling";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../../hooks/useAuth";
import { useProfile } from "../../../hooks/useProfile";
import { loginDirect, verifyOtp } from "../../../utils/authApi";
import CustomView from "../../components/CustomView";
import { LinearGradient } from "expo-linear-gradient";

const VerificationScreen = () => {
  const { setIsAuthenticated, setToken } = useAuth();
  const {
    phoneNumber,
    setUserId,
    setEmail,
    setFirstName,
    setLastName,
    setPhoneNumber,
    setIsNewUser,
  } = useProfile();
  const [otp, setOtp] = React.useState(["", "", "", "", "", ""]);
  const inputRefs = React.useRef<Array<TextInput | null>>([]);

  const verifyOtpCode = async (code: string) => {
    // ✅ ADDED
    // console.log("otpdata : ", phoneNumber + code);
    const result = await loginDirect(); // ✅ ADDED
    // const result = await verifyOtp(phoneNumber, code); // ✅ ADDED

    if (result && result.token?.token) {
      const jwtToken = result.token.token;
      const userData = result.user;
      console.log("Verification successful");
      try {
        setToken(jwtToken); // from AuthContext
        setEmail(userData.email); // from ProfileContext
        setFirstName(userData.firstName);
        setLastName(userData.lastName);
        setUserId(userData._id);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Error saving token or user:", err);
      }
    } else {
      Alert.alert("Verification Failed", "Invalid OTP or server error"); // ✅ ADDED
      console.log("otpdata : ", phoneNumber + code);
    }
  };
  return (
    // <ScreenWrapper>
    //   </ScreenWrapper>
    <View style={styles.container}>
      <CustomView
        radius={moderateScale(12)}
        shadowStyle={{ marginVertical: verticalScale(65) }}
      >
        <View style={styles.box}>
          <Text style={styles.title}>Enter verification</Text>
          <Text style={styles.subText}>
            We’ve sent a code to hello@technicianapp.com
          </Text>

          <View style={styles.codeContainer}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <CustomView radius={moderateScale(8)}  key={i}>
                <TextInput
                 
                  ref={(ref) => {
                    inputRefs.current[i] = ref;
                  }}
                  style={styles.codeBox}
                  maxLength={1}
                  keyboardType="number-pad"
                  value={otp[i]}
                  autoFocus={i === 0}
                  onChangeText={(val) => {
                    const updated = [...otp];
                    updated[i] = val;
                    setOtp(updated);

                    // Auto-jump forward
                    if (val && i < 5) {
                      inputRefs.current[i + 1]?.focus();
                    }

                    // On last box, blur
                    if (i === 5 && val) {
                      inputRefs.current[i]?.blur();
                    }
                  }}
                  onKeyPress={({ nativeEvent }) => {
                    // Auto-jump backward
                    if (
                      nativeEvent.key === "Backspace" &&
                      otp[i] === "" &&
                      i > 0
                    ) {
                      inputRefs.current[i - 1]?.focus();
                    }
                  }}
                />
              </CustomView>
            ))}
          </View>

          <Text style={styles.resendText}>
            Didn’t get a code?{" "}
            <Text style={styles.linkText}>Click to resend.</Text>
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={() => {}}>
              <CustomView
                radius={moderateScale(50)}
                boxStyle={{
                  width: scale(96),
                  height: verticalScale(36),
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text>Cancel</Text>
              </CustomView>
            </TouchableOpacity>
           
              
             <TouchableOpacity onPress={() => verifyOtpCode(otp.join(""))}>
                          <LinearGradient
                            style={styles.verifyButton}
                            colors={["#027CC7", "#004DBD"]}
                          >
                            <Text style={{ color: "#fff" }}>Verify</Text>
                          </LinearGradient>
                        </TouchableOpacity>
          </View>
        </View>
      </CustomView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#F0EFF8",
  },
  box: {
    width: scale(375),
    // height: verticalScale(249),
    // marginHorizontal : scale(9),
    padding: moderateScale(20),
    //  backgroundColor: "#FFFFFF1A",
    paddingHorizontal: moderateScale(17),
    paddingVertical: verticalScale(18),
    // shadowColor: "#000",
    // shadowOpacity: 0.1,
    // shadowRadius: 5,
    // elevation: 100,
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
    // backgroundColor: "#FFFFFF1A",
    // borderRadius: moderateScale(8),
    textAlign: "center",
    fontSize: moderateScale(18),
    // borderWidth: 0.9,
    // borderColor: "#ffffff",
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
    gap: scale(12),
  },
  cancelButton: {
    // flex: 1,

    // paddingVertical: verticalScale(10),
    backgroundColor: "#D4D4D440",
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: "#ffffffd8",
  },
  verifyButton: {
    alignItems: "center",
    justifyContent: "center",
    // paddingVertical: verticalScale(10),
    backgroundColor: "#027CC7",
    borderRadius: moderateScale(50),
    borderWidth: 1,
    borderColor: "#027CC7",
    // marginRight: scale(8),
    width: scale(96),
    height: verticalScale(36),
  },
});

export default VerificationScreen;
