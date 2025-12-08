// components/AuthInput.tsx
import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  Text,
} from "react-native";
import {
  MaterialCommunityIcons as Icon,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { moderateScale, scale, verticalScale } from "../../utils/scaling";

interface AuthInputProps extends TextInputProps {
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  title?: string;
}

const AuthInput: React.FC<AuthInputProps> = ({ iconName, title, ...props }) => {
  return (
    <View style={{ marginBottom: verticalScale(16) }}>
    { title && <Text
        style={{
          fontSize: moderateScale(14),
          fontWeight: "600",
          height: verticalScale(16),
          lineHeight: moderateScale(14),
          marginBottom: verticalScale(9),
        }}
      >
        {" "}
        {title}
      </Text>}
      <View style={styles.container}>
        <Icon
          name={iconName}
          size={moderateScale(18)}
          color="#888"
          style={styles.icon}
        />
        <TextInput
          placeholderTextColor="#888"
          style={styles.input}
          {...props}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF1A",
    // borderRadius: moderateScale(8),
    paddingHorizontal: moderateScale(10),
    // marginVertical: verticalScale(6),

    // paddingHorizontal: scale(12),
    height: verticalScale(47),
    borderWidth: 0.9,
    borderColor: "#ffffff",
    borderRadius: moderateScale(12),
  },
  icon: {
    marginRight: scale(8),
  },
  input: {
    flex: 1,
    fontSize: moderateScale(13.5),
    paddingVertical: verticalScale(10),
  },
});

export default AuthInput;
