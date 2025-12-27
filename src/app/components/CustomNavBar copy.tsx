import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons as Icon } from "@expo/vector-icons";
import { moderateScale, scale, verticalScale } from "../../utils/scaling";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../../hooks/useCart";
import CustomView from "./CustomView";

type Props = Partial<BottomTabBarProps> & {
  isLocal?: "Home" | "Category";
};

export default function CustomNavBar({ state, navigation, isLocal }: Props) {
  const nav = navigation ?? useNavigation();
  const {cartItems} = useCart()

  // 🔥 Hide ONLY when used as GLOBAL nav bar AND HomeScreen is active
  if (!isLocal && state) {
    const currentRoute = state.routes[state.index].name;
    if (currentRoute === "HomeStack" || currentRoute === "CategoryScreen") {
      return null;
    }
  }

  return (
      <CustomView
        style={styles.bottomNav2}
      >
     
        {/* Home */}
        <TouchableOpacity
          onPress={() => nav?.navigate("HomeStack")}
          style={[styles.navItem, { marginRight: scale(0) }]}
        >
          <Icon
            name="home-outline"
            size={moderateScale(20)}
            color={isLocal === "Home" ? "#0583D0" : "#707070"}
          />
          <Text
            style={[
              styles.navText,
              { color: state?.index === 0 ? "#0583D0" : "#707070" },
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        {/* Jobs */}
        <TouchableOpacity
          onPress={() => nav?.navigate("JobsScreen")}
          style={[styles.navItem, { marginRight: scale(0) }]}
        >
          <Icon
            name="briefcase-outline"
            size={moderateScale(20)}
            color={state?.index === 1 ? "#0583D0" : "#707070"}
          />
          <Text
            style={[
              styles.navText,
              { color: state?.index === 1 ? "#0583D0" : "#707070" },
            ]}
          >
            Jobs
          </Text>
        </TouchableOpacity>

      

        {/* Category */}
        <TouchableOpacity
          onPress={() => nav?.navigate("CategoryScreen")}
          style={[styles.navItem, { marginLeft: scale(0) }]}
        >
          <Icon
            name="grid-outline"
            size={moderateScale(20)}
             color={isLocal === "Category" ? "#0583D0" : "#707070"

            }
          />
          <Text
            style={[
              styles.navText,
              { color: state?.index === 3 ? "#0583D0" : "#707070" },
            ]}
          >
            Category
          </Text>
        </TouchableOpacity>

        {/* Orders */}
        <TouchableOpacity
          onPress={() => nav?.navigate("OrderStack")}
          style={[styles.navItem, { marginLeft: scale(0) }]}
        >
          <Icon
            name="document-text-outline"
            size={moderateScale(20)}
            color={state?.index === 4 ? "#0583D0" : "#707070"}
          />
          <Text
            style={[
              styles.navText,
              { color: state?.index === 4 ? "#0583D0" : "#707070" },
            ]}
          >
            Order
          </Text>
        </TouchableOpacity>
          {/* Cart */}
        <TouchableOpacity
          onPress={() => nav?.navigate("CartScreen")}
          style={styles.navItem}
        >
          <Icon
            name="person-outline"
            size={moderateScale(20)}
            color={state?.index === 2 ? "#0583D0" : "#707070"}
          />
          <Text
            style={[
              styles.navText,
              { color: state?.index === 4 ? "#0583D0" : "#707070" },
            ]}
          >
            Order
          </Text>
        </TouchableOpacity>
      </CustomView>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    // height: verticalScale(75),
    // width: scale(355),
    // borderRadius: moderateScale(16.59),
    // alignItems : 'flex-end',
    // overflow : 'hidden',
    // borderWidth : 0,
    position: "absolute",
    bottom: verticalScale(10),
    alignSelf : 'center',
    elevation: 5,
  },
  bottomNav2: {
    flexDirection: "row",
    justifyContent: "center",
    gap: scale(27),
    height: verticalScale(68),
    width: scale(347),
    borderRadius: scale(16.59),
    borderWidth: 1,
    borderColor: "#FFFFFF",
    overflow : 'hidden',
    position: "absolute",
    bottom: verticalScale(20),
    alignSelf : 'center',
    elevation: 5,
  },
  navItem: { alignItems: "center", alignSelf: "center" },
  navText: {
    fontSize: moderateScale(12),
    color: "#707070",
    marginTop: verticalScale(2),
    fontWeight: "500",
  },
  cartCenter: {
    width: scale(55),
    height: scale(55),
    alignSelf: "center",
  },
  badge: {
    position: "absolute",
    top: verticalScale(0),
    right: scale(0),
    backgroundColor: "white",
    width: scale(18),
    height: scale(18),
    borderRadius: scale(9),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#0082D3",
  },
  badgeText: {
    fontSize: moderateScale(9),
    fontWeight: "700",
    color: "#0082D3",
  },
});
