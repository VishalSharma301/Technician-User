import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "./src/app/screens/AuthScreens/LoginScreen";
import VerificationScreen from "./src/app/screens/AuthScreens/VerificationScreen";
import HomeScreen from "./src/app/screens/HomeScreen";
import CartScreen from "./src/app/screens/CartScreen";
import CategoryScreen from "./src/app/screens/CategoryScreen";
import OrderScreen from "./src/app/screens/OrderScreen";
import ProfileScreen from "./src/app/screens/ProfileScreen";

import { ActivityIndicator, View } from "react-native";

import {
  RootStackParamList,
  HomeTabParamList,
  HomeStackParamList,
  OrderStackParamList,
  ProfileStackParamList,
} from "./src/constants/navigation";

import CustomNavBar from "./src/app/components/CustomNavBar";
import LocationScreen from "./src/app/screens/AddressScreens/LocationScreen";
import AddressListScreen from "./src/app/screens/AddressScreens/AddressListScreen";
import AddAddressScreen from "./src/app/screens/AddressScreens/AddAddressScreen";
import OrderDetailsScreen from "./src/app/screens/OrderDetailScreen";
import JobsScreen from "./src/app/screens/JobsScreen";
import ResetPasswordScreen from "./src/app/screens/AuthScreens/ResetPasswordScreen";
import AccountHealthScreen from "./src/app/screens/AccountHealthScreen";
import SubmitReviewScreen from "./src/app/screens/SubmitReviewScreen";
import EditProfileScreen from "./src/app/screens/ProfileEditScreen";
import HelpSupportScreen from "./src/app/screens/HelpAndSupportScreen";
import MyAddressesScreen from "./src/app/screens/MyAddressesScreen";
import MyCoinScreen from "./src/app/screens/CoinsScreen";
import NotificationsScreen from "./src/app/screens/NotificationsScreen";
import SelectDeliveryLocationScreen from "./src/app/screens/SelectDeliveryLocationScreen";
import InitialLocationSelector from "./src/app/screens/InitialLocationSelector";
import { useContext } from "react";
import { AddressContext } from "./src/store/AddressContext";

const Stack = createStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<HomeTabParamList>();
const HomeStackNav = createStackNavigator<HomeStackParamList>();
const OrderStackNav = createStackNavigator<OrderStackParamList>();
const ProfileStackNav = createStackNavigator<ProfileStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="VerificationScreen" component={VerificationScreen} />
      <Stack.Screen
        name="ResetPasswordScreen"
        component={ResetPasswordScreen}
      />
    </Stack.Navigator>
  );
}

export function OrderStack() {
  return (
    <OrderStackNav.Navigator screenOptions={{ headerShown: false }}>
      <OrderStackNav.Screen name="OrderScreen" component={OrderScreen} />
      <OrderStackNav.Screen
        name="OrderDetailsScreen"
        component={OrderDetailsScreen}
      />
    </OrderStackNav.Navigator>
  );
}
export function ProfileStack() {
  return (
    <ProfileStackNav.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStackNav.Screen name="ProfileScreen" component={ProfileScreen} />
      <ProfileStackNav.Screen
        name="EditProfileScreen"
        component={EditProfileScreen}
      />
      <ProfileStackNav.Screen
        name="HelpAndSupportScreen"
        component={HelpSupportScreen}
      />
      <ProfileStackNav.Screen
        name="MyAddressesScreen"
        component={MyAddressesScreen}
      />
      <ProfileStackNav.Screen
        name="AccountHealthScreen"
        component={AccountHealthScreen}
      />
      <ProfileStackNav.Screen
        name="SelectDeliveryLocationScreen"
        component={SelectDeliveryLocationScreen}
      />
    </ProfileStackNav.Navigator>
  );
}

export function LoadingScreen() {
  return (
    <View
      style={{
        flex: 1,
        // backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ActivityIndicator size="large" color="#ff0000ff" />
    </View>
  );
}

export function HomeStack() {
  return (
    <HomeStackNav.Navigator>
      <HomeStackNav.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
      />

      <HomeStackNav.Screen name="ProfileScreen" component={ProfileScreen} />
      <HomeStackNav.Screen
        name="CoinScreen"
        component={MyCoinScreen}
        options={{ headerShown: false }}
      />
      <HomeStackNav.Screen
        name="NotificationScreen"
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />

      {/* 🔵 New Address System Screens */}
      <HomeStackNav.Screen
        name="Location"
        component={LocationScreen}
        options={{ headerShown: false }}
      />

      <HomeStackNav.Screen
        name="Addresses"
        component={AddressListScreen}
        options={{ headerShown: false }}
      />

      <HomeStackNav.Screen
        name="AddAddress"
        component={AddAddressScreen}
        options={{ headerShown: false }}
      />
    </HomeStackNav.Navigator>
  );
}

export function AuthenticatedTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomNavBar {...props} />}
    >
      <Tabs.Screen
        options={{
          tabBarItemStyle: { display: "none" },
        }}
        name="HomeStack"
        component={HomeStack}
      />
      <Tabs.Screen name="JobsScreen" component={JobsScreen} />
      <Tabs.Screen name="ProfileStack" component={ProfileStack} />
      <Tabs.Screen name="CategoryScreen" component={CategoryScreen} />
      <Tabs.Screen name="OrderStack" component={OrderStack} />
    </Tabs.Navigator>
  );
}

export function AuthenticatedScreens() {
  const { addresses, isLoadingAddresses } = useContext(AddressContext);

  // Still reading AsyncStorage — show neutral loader
  if (isLoadingAddresses) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {addresses.length === 0 ? (
        // No saved address → setup flow
        <Stack.Screen
          name="InitialLocationSelector"
          component={InitialLocationSelector}
        />
      ) : (
        // Address exists → main app
        <Stack.Screen
          name="AuthenticatedTabs"
          component={AuthenticatedTabs}
        />
      )}
    </Stack.Navigator>
  );
}
