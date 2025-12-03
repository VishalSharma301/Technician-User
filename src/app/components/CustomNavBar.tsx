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
    // <View style={{borderWidth : 0, paddingBottom : verticalScale(10), backgroundColor : 'transparent'}}>
    <View style={styles.bottomNav}>
      <ImageBackground
        source={require("../../../assets/Navbg.png")}
        style={styles.bottomNav2}
      >
      {/* <ImageBackground
        source={require("../../../assets/bg0.png")}
        style={styles.bottomNav2}
      > */}
        {/* Home */}
        <TouchableOpacity
          onPress={() => nav?.navigate("HomeStack")}
          style={[styles.navItem, { marginRight: scale(21) }]}
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
          style={[styles.navItem, { marginRight: scale(30) }]}
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

        {/* Cart */}
        <TouchableOpacity
          onPress={() => nav?.navigate("CartScreen")}
          style={styles.cartCenter}
        >
          <Image
            source={require("../../../assets/CartNav.png")}
            style={{
              height: scale(55),
              width: scale(55),
              resizeMode: "cover",
              position: "relative",
              left: scale(1),
              top: verticalScale(3),
            }}
          />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cartItems.length}</Text>
          </View>
        </TouchableOpacity>

        {/* Category */}
        <TouchableOpacity
          onPress={() => nav?.navigate("CategoryScreen")}
          style={[styles.navItem, { marginLeft: scale(21) }]}
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
          style={[styles.navItem, { marginLeft: scale(21) }]}
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
      {/* </ImageBackground> */}
      </ImageBackground>
    </View>
    // </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#ffffff10",
    borderRadius: moderateScale(30),
    paddingVertical: verticalScale(10),
    height: verticalScale(68),
    width: scale(347),
    borderWidth: 0.8,
    borderColor: "#FFFFFF",
    alignItems : 'center',
    overflow : 'hidden',
    position: "absolute",
    bottom: verticalScale(10),
    marginHorizontal: scale(23),
  },
  bottomNav2: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#FFFFFF1A",
    borderRadius: moderateScale(300),
    paddingVertical: verticalScale(10),
    height: verticalScale(888),
    resizeMode : 'stretch',
    // position: "absolute",
    
    width: scale(347),
    // bottom: verticalScale(30),
    // marginHorizontal: scale(23),
    // borderWidth: 0.8,
    // borderColor: "#FFFFFF",
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
