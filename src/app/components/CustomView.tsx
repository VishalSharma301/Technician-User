import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { moderateScale, scale, verticalScale } from "../../utils/scaling";

interface CustomViewProps {
  shadowStyle?: StyleProp<ViewStyle>;
  boxStyle?: StyleProp<ViewStyle>;
  children: ReactNode;
  radius: number;
  height: number;
  width: number;
}

export default function CustomView({
  shadowStyle,
  boxStyle,
  children,
  radius,
  height, 
  width,
}: CustomViewProps) {
  return (
    // 🔹 Shadow layer
    <View
      style={[
        {
          backgroundColor: "#8092ACA6", // shadow color
          // paddingLeft: scale(1),
          // paddingBottom: verticalScale(1),
          borderRadius: radius ? radius + scale(0) : undefined,
          height: height ? height + verticalScale( 1) : undefined,
          width: width ? width +scale(1) : undefined,
          alignItems: 'flex-end',
           borderBottomRightRadius: radius ? radius + scale(1) : undefined,
           borderTopLeftRadius: radius ? radius + scale(1) : undefined,
          // borderBottomWidth : 1,
          // borderLeftWidth : 1,
          // borderColor : '#8092ACA6'
        },
        shadowStyle,
      ]}
    >
      {/* 🔹 Actual card */}
      <View style={{backgroundColor : '#F7F6FA', borderRadius : radius,  }}> 
      <LinearGradient
        colors={["#F7F6FA", "#EDEBF4"]}
        style={[
          {
            height: height,
            width: width,
            borderRadius: radius,
          },boxStyle
        ]}
      >
        {children}
      </LinearGradient>
      </View>
    </View>
  );
}
