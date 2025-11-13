import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./src/app/screens/AuthScreens/LoginScreen";
import VerificationScreen from "./src/app/screens/AuthScreens/VerificationScreen";
import HomeScreen from "./src/app/screens/HomeScreen";
import {
  HomeTabParamList,
  RootStackParamList,
} from "./src/constants/navigation";
import JobsScreen from "./src/app/screens/JobsScreen";
import CartScreen from "./src/app/screens/CartScreen";
import CategoryScreen from "./src/app/screens/CategoryScreen";
import OrderScreen from "./src/app/screens/OrderScreen";
import { View } from "react-native";
import CustomNavBar from "./src/app/components/CustomNavBar";

const Stack = createStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<HomeTabParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="VerificationScreen" component={VerificationScreen} />
    </Stack.Navigator>
  );
}

// export function HomeStack() {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="HomeScreen" component={HomeScreen} />
//     </Stack.Navigator>
//   );
// }

export function AuthenticatedTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => (<CustomNavBar {...props}/> )}
    >
      <Tabs.Screen options={{
        tabBarItemStyle : {display : 'none'}
      }} name="HomeScreen" component={HomeScreen} />
      <Tabs.Screen name="JobsScreen" component={JobsScreen} />
      <Tabs.Screen name="CartScreen" component={CartScreen} />
      <Tabs.Screen name="CategoryScreen" component={CategoryScreen} />
      <Tabs.Screen name="OrderScreen" component={OrderScreen} />
    </Tabs.Navigator>
  );
}
