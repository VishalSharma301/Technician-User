import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "../../utils/scaling";
import { Ionicons as Icon } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { HomeStackParamList } from "../../constants/navigation";

 export default function Header({showSearchBar = true} : {showSearchBar? : boolean}) {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList , "HomeScreen">>()
  return (
    <>
     <View style={styles.topBar}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: scale(2),
            }}
          >
            <Icon
              name="location-outline"
              size={moderateScale(16)}
              color="#000"
            />
            <TouchableOpacity onPress={()=>navigation.navigate("Location")}>

            <Text style={styles.locationText}>Allow Location</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={()=>navigation.navigate("ProfileScreen")}>
            <Image
              source={{ uri: "https://i.pravatar.cc/100" }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
      { showSearchBar && <View style={styles.searchContainer}>
          <Icon
            name="search-outline"
            size={moderateScale(20)}
            color="#000000ff"
          />
          <TextInput
            placeholder="Search For Services"
            placeholderTextColor="#00000080"
            style={styles.searchInput}
          />
          <Icon
            name="notifications-outline"
            size={moderateScale(26)}
            color="#000000B2"
          />
        </View>}
    </>
  );
};

const styles = StyleSheet.create({
     topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(5),
    // borderWidth : 1
  },
  locationText: {
    fontWeight: "600",
    fontSize: moderateScale(14),
    alignItems: "center",
    justifyContent: "center",
  },
  profileImage: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(20),
    borderWidth: 1,
    borderColor: "#fff",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",

    paddingHorizontal: scale(12),
    height: verticalScale(47),
    borderWidth: 0.8,
    borderColor: "#ffffff98",
    borderRadius: moderateScale(12),

    // shadowColor: "#000",
    // shadowOpacity: 0.05,
    // shadowRadius: 3,
    // elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: scale(10),
    fontSize: moderateScale(14),
    fontWeight: "500",
  },
})