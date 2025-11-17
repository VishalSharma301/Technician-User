import "react-native-gesture-handler";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AuthStack, { AuthenticatedTabs, LoadingScreen } from "./Navigation";
import { useAuth } from "./src/hooks/useAuth";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthContextProvider from "./src/store/AuthContext";
import ProfileContextProvider from "./src/store/ProfileContext";
import TestBottomSheet from "./src/app/screens/Test";
import { useEffect, useRef, useState } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import { Platform } from "react-native";
import { useProfile } from "./src/hooks/useProfile";
import { getProfileData, getToken } from "./src/utils/setAsyncStorage";
import ServicesContextProvider from "./src/store/ServicesContext";
import CartContextProvider from "./src/store/CartContext";

function Navigator() {
  const { isAuthenticated, isLoading, token, setToken, setIsAuthenticated } =
    useAuth();
  const { setEmail, setFirstName, setPhoneNumber, setLastName, setUserId } =
    useProfile();
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    async function fetchingToken() {
      const storedToken = await getToken();
      const profileData = await getProfileData();

      if (storedToken) {
        setToken(storedToken);
        if (profileData) {
          setEmail(profileData.email);
          setFirstName(profileData.firstName);
          setLastName(profileData.lastName);
          setPhoneNumber(profileData.phoneNumber);
          setUserId(profileData._id);
        }
        setIsAuthenticated(true);
      }
      setRestoring(false); // ✅ finished restoring
    }

    fetchingToken();
  }, []);

  return (
    <NavigationContainer>
      {restoring ? (
        <LoadingScreen />
      ) : !isAuthenticated ? (
        <AuthStack /> // user NOT logged in → show login screens
      ) : (
        <AuthenticatedTabs /> // user logged in → show app
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthContextProvider>
        <ProfileContextProvider>
          <ServicesContextProvider>
            <CartContextProvider>
              <SafeAreaView style={{ flex: 1 }}>
                <Navigator />
              </SafeAreaView>
            </CartContextProvider>
          </ServicesContextProvider>
        </ProfileContextProvider>
      </AuthContextProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
