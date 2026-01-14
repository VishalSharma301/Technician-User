import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import ScreenWrapper from "../../components/ScreenWrapper";
import { moderateScale, scale, verticalScale } from "../../../utils/scaling";
import AuthInput from "../../components/AuthInput";
import {Ionicons} from "@expo/vector-icons";
import CustomView from "../../components/CustomView";
import { LinearGradient } from "expo-linear-gradient";

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const navigation = useNavigation();

  const handleSendLink = () => {
    if (!email.trim()) return;
    setSent(true);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
     <View style={{ flex: 1, backgroundColor: "#F0EFF8" }}>
        {/* ---- BACK ICON ---- */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={moderateScale(24)}
            color="#717A7E"
          />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {!sent ? (
            <>
              {/* Forgot Password Card */}
              <CustomView shadowStyle={{marginTop: verticalScale(70)}} radius={moderateScale(12)}>
              <View style={styles.card}>
                <Text style={styles.title}>Forgot Password</Text>
                <Text style={styles.subtitle}>
                  Enter your email address and we’ll send you a link to reset
                  your password
                </Text>

                <AuthInput
                  iconName={undefined as any}
                  placeholder="Email address"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <TouchableOpacity onPress={handleSendLink}>
                                         <LinearGradient
                                           style={styles.button}
                                           colors={["#027CC7", "#004DBD"]}
                                         >
                                           <Text style={styles.buttonText}>Send Link</Text>
                                         </LinearGradient>
                                       </TouchableOpacity>
              </View>
              </CustomView>
            </>
          ) : (
            <>
              {/* Reset Email Sent Card */}
              <CustomView shadowStyle={{marginTop: verticalScale(70)}} radius={moderateScale(12)}>
              <View style={styles.card}>
                <Text style={styles.title}>Reset email sent</Text>
                <Text style={styles.subtitle}>
                  We have sent all required instructions details to your mail.
                </Text>

                 <TouchableOpacity onPress={() => navigation.goBack()}>
                                         <LinearGradient
                                           style={styles.button}
                                           colors={["#027CC7", "#004DBD"]}
                                         >
                                            <Text style={styles.buttonText}>Go to Login page</Text>
                                         </LinearGradient>
                                       </TouchableOpacity>
              </View>
              </CustomView>
            </>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    top: verticalScale(20),
    left: scale(9),
    zIndex: 10,
    padding: scale(5),
  },

  container: {
    flexGrow: 1,
    padding: scale(10),
    backgroundColor: "#FFFFFF1A",
  },

  card: {
    width: "100%",
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(28),
    paddingVertical: verticalScale(27),
    
  },

  title: {
    fontSize: moderateScale(18),
    fontWeight: "600",
    textAlign: "center",
    color: "#027CC7",
  },

  subtitle: {
    fontSize: moderateScale(10),
    fontWeight: "400",
    color: "#6B687D",
    textAlign: "center",
    marginTop: verticalScale(8),
    marginBottom: verticalScale(12),
    marginHorizontal: scale(50),
  },

  button: {
    backgroundColor: "#027CC7",
    borderRadius: moderateScale(500),
    alignItems: "center",
    justifyContent: "center",
    marginVertical: verticalScale(10),
    height: verticalScale(36),
  },

  buttonText: {
    color: "#fff",
    fontSize: moderateScale(12),
    fontWeight: "400",
  },
});
