import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import AuthInput from "../../components/AuthInput";
import { moderateScale, scale, verticalScale } from "../../../utils/scaling";
import { useNavigation } from "@react-navigation/native";
import ScreenWrapper from "../../components/ScreenWrapper";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../constants/navigation";
import { login } from "../../../utils/authApi";
import { useProfile } from "../../../hooks/useProfile";

type loginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "LoginScreen"
>;

const LoginScreen = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const navigation = useNavigation<loginScreenNavigationProp>();
  const { phoneNumber, setPhoneNumber } = useProfile();
  const [countryCode, setCountryCode] = useState<string>("+91");
  const [phoneNumberInput, setPhoneNumberInput] = useState<string>("");



  useEffect(() => {
    setPhoneNumber(`${countryCode}${phoneNumberInput}`);
    // setPhoneNumber(`${phoneNumberInput}`);
  }, [countryCode, phoneNumberInput]);



  // toggle between login and signup
  const toggleSignup = () => {
    setIsSignup((prev) => !prev);
    setIsOtpLogin(false);
  };

  // toggle OTP login
  const toggleOtpLogin = () => {
    setIsOtpLogin((prev) => !prev);
    setIsSignup(false);
  };

  const handleLogin = async () => {
    navigation.navigate("VerificationScreen");
    // const result = await login(phoneNumber);

    // if (result) {
    //   Alert.alert("OTP Sent", "Check your phone for OTP");
    //   navigation.navigate("VerificationScreen");
    // } else {
    //   Alert.alert("Login Failed", "Invalid phone number or server error");
    // }
  };

  const handleAuthAction = () => {
    if (isOtpLogin) {
      handleLogin();
      console.log("Send OTP to phone...");
    } else if (isSignup) {
      console.log("Sign Up user...");
    } else {
      console.log("Login user...");
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          // justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View style={styles.container}>
          <Image
            source={require("../../../../assets/placeholder.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.box}>
            <Text style={styles.title}>
              {isOtpLogin ? "Login with OTP" : isSignup ? "Sign Up" : "Login"}
            </Text>
            <Text style={styles.subText}>
              {isOtpLogin
                ? "Enter your phone number to receive an OTP"
                : isSignup
                ? "Create a new account"
                : "Welcome Back"}
            </Text>

            {/* Inputs */}
            {isOtpLogin ? (
              <>
                <AuthInput
                  iconName="phone-outline"
                  placeholder="Enter Phone Number"
                  keyboardType="phone-pad"
                  title="Email or Phone"
                  onChangeText={setPhoneNumberInput}
                  maxLength={10}
                  autoFocus={true}
                />
              </>
            ) : (
              <>
                <AuthInput
                  iconName="email-outline"
                  placeholder="Email or Phone"
                  title="Email or Phone"
                />

                {isSignup && (
                  <AuthInput
                    iconName="account-outline"
                    placeholder="User Name"
                    title="User Name"
                  />
                )}

                <AuthInput
                  iconName="lock-outline"
                  placeholder="Enter Your Password"
                  secureTextEntry
                  title="Password"
                />

                {isSignup && (
                  <AuthInput
                    iconName="lock-check-outline"
                    placeholder="Confirm Password"
                    secureTextEntry
                    title="Confirm Password"
                  />
                )}
              </>
            )}

            {/* Forgot Password */}
            {!isSignup && !isOtpLogin && (
              <TouchableOpacity>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            {/* Main Button */}
            <TouchableOpacity style={styles.button} onPress={handleAuthAction}>
              <Text style={styles.buttonText}>
                {isOtpLogin ? "Send OTP" : isSignup ? "Sign Up" : "Login"}
              </Text>
            </TouchableOpacity>

            {/* OR */}
            {!isSignup && (
              <>
                {!isOtpLogin && (
                  <>
                    <Text style={styles.orText}>Or</Text>

                    <TouchableOpacity
                      style={styles.otpButton}
                      onPress={toggleOtpLogin}
                    >
                      <Text style={styles.otpText}>Login With OTP</Text>
                    </TouchableOpacity>
                  </>
                )}

                {isOtpLogin && (
                  <TouchableOpacity
                    style={[styles.otpButton, { backgroundColor: "#E6E6E6" }]}
                    onPress={toggleOtpLogin}
                  >
                    <Text style={[styles.otpText, { color: "#000" }]}>
                      Back to Login
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            {/* Footer */}
            {!isOtpLogin && (
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <Text style={styles.footerText}>
                  {isSignup
                    ? "Already have an Account? "
                    : "Don’t have an Account? "}
                </Text>
                <TouchableOpacity
                  onPress={toggleSignup}
                  style={{ alignItems: "center", justifyContent: "center" }}
                >
                  <Text style={styles.linkText}>
                    {isSignup ? "Login" : "Sign Up"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Social Login */}
            {!isSignup && (
              <>
                {/* <View style={styles.iconRow}>
                    <Image
                      style={styles.socialIcon}
                      source={require("../../../assets/google.png")}
                    />
                    <Image
                      style={styles.socialIcon}
                      source={require("../../../assets/apple.png")}
                    />
                    <Image
                      style={styles.socialIcon}
                      source={require("../../../assets/more.png")}
                    />
                  </View> */}

                <Text style={styles.policyText}>
                  By Continuing, you agree to our{"\n"}
                  <Text style={styles.linkText2}>Terms of Service</Text> |{" "}
                  <Text style={styles.linkText2}>Privacy Policy</Text> |{" "}
                  <Text style={styles.linkText2}>Content Policy</Text>
                </Text>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: verticalScale(40),
  },
  logo: {
    width: scale(164.88),
    height: verticalScale(119.57),
    marginBottom: verticalScale(24.43),
  },
  box: {
    width: scale(375),
    backgroundColor: "#FFFFFF1A",
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(17),
    paddingVertical: verticalScale(18),
    borderWidth: 0.9,
    borderColor: "#FFFFFF",
  },
  title: {
    fontSize: moderateScale(25),
    fontWeight: "700",
    textAlign: "center",
  },
  subText: {
    textAlign: "center",
    color: "#596378",
    fontSize: moderateScale(16),
    fontWeight: "500",
    marginBottom: verticalScale(15),
  },
  forgotText: {
    alignSelf: "flex-end",
    color: "#027CC7",
    fontSize: moderateScale(16),
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#027CC7",
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(10),
    alignItems: "center",
    justifyContent: "center",
    marginVertical: verticalScale(10),
    height: verticalScale(48),
  },
  buttonText: {
    color: "#fff",
    fontSize: moderateScale(18),
    fontWeight: "500",
  },
  orText: {
    textAlign: "center",
    color: "#666",
  },
  otpButton: {
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    borderColor: "#E6E6E6",
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(8),
    alignItems: "center",
    marginVertical: verticalScale(10),
  },
  otpText: {
    color: "#000",
    fontWeight: "500",
    fontSize: moderateScale(16),
  },
  footerText: {
    textAlign: "center",
    marginVertical: verticalScale(5),
    fontSize: moderateScale(10),
    fontWeight: "400",
  },
  linkText: {
    color: "#027CC7",
    fontWeight: "700",
    fontSize: moderateScale(10),
  },
  linkText2: {
    color: "#000",
    fontWeight: "500",
    fontSize: moderateScale(8),
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: verticalScale(10),
  },
  socialIcon: {
    width: scale(35),
    height: scale(35),
    backgroundColor: "#E8E8E8",
    borderRadius: moderateScale(8),
    marginHorizontal: scale(6),
  },
  policyText: {
    fontSize: moderateScale(12),
    fontWeight: "500",
    color: "#000",
    textAlign: "center",
  },
});
