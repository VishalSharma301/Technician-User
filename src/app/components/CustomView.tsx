import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";

interface CustomViewProps {
   style?: StyleProp<ViewStyle>;
    children : ReactNode;
}

 export default function CustomView({style, children} : CustomViewProps) {
  return (
    <LinearGradient colors={['#F7F6FA','#EDEBF4']} style={style}>
            {children}
    </LinearGradient>
  );
};
