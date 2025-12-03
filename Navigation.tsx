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
} from "./src/constants/navigation";

import CustomNavBar from "./src/app/components/CustomNavBar";
import SelectLocationScreen from "./src/app/screens/SelectLocationScreen";
import LocationScreen from "./src/app/screens/AddressScreens/LocationScreen";
import AddressListScreen from "./src/app/screens/AddressScreens/AddressListScreen";
import AddAddressScreen from "./src/app/screens/AddressScreens/AddAddressScreen";
import OrderDetailsScreen from "./src/app/screens/OrderDetailScreen";
import JobsScreen from "./src/app/screens/JobsScreen";

const Stack = createStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<HomeTabParamList>();
const HomeStackNav = createStackNavigator<HomeStackParamList>();
const OrderStackNav = createStackNavigator<OrderStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="VerificationScreen" component={VerificationScreen} />
    </Stack.Navigator>
  );
}


export  function OrderStack() {
  return (
    <OrderStackNav.Navigator screenOptions={{ headerShown: false }}>
      <OrderStackNav.Screen name="OrderScreen" component={OrderScreen} />
      <OrderStackNav.Screen name="OrderDetailsScreen" component={OrderDetailsScreen} />
    </OrderStackNav.Navigator>
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

      <HomeStackNav.Screen
        name="ProfileScreen"
        component={ProfileScreen}
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
      <Tabs.Screen name="CartScreen" component={CartScreen} />
      <Tabs.Screen name="CategoryScreen" component={CategoryScreen} />
      <Tabs.Screen name="OrderStack" component={OrderStack} />
    </Tabs.Navigator>
  );
}


export function AuthenticatedScreens(){
  return(
    <Stack.Navigator>
     <Stack.Screen
          name="SelectLocationScreen"
          component={SelectLocationScreen}
          options={{ headerShown: false }}
        />
     <Stack.Screen
          name="AuthenticatedTabs"
          component={AuthenticatedTabs}
          options={{ headerShown: false }}
        />
        </Stack.Navigator>
  )
}