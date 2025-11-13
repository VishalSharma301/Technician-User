import "react-native-gesture-handler";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AuthStack, { AuthenticatedTabs } from "./Navigation";
import { useAuth } from "./src/hooks/useAuth";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthContextProvider from "./src/store/AuthContext";
import ProfileContextProvider from "./src/store/ProfileContext";
import TestBottomSheet from "./src/app/screens/Test";
import { useRef } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import { Platform } from 'react-native';


function Navigator() {
  const { isAuthenticated } = useAuth();
  return (
    <NavigationContainer>
      {!isAuthenticated ? <AuthStack /> : <AuthenticatedTabs />}
      {/* <TestBottomSheet /> */}
    </NavigationContainer>
  );
}



export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaView style={{ flex: 1 }}>
      <AuthContextProvider>
        <ProfileContextProvider>
    <Navigator />

        </ProfileContextProvider>
      </AuthContextProvider>
   </SafeAreaView>
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
