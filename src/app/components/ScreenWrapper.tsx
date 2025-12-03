import React, { PropsWithChildren } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Dimensions,
  ViewStyle,
} from "react-native";

const { height, width } = Dimensions.get("screen");

interface Props extends PropsWithChildren {
  style?: ViewStyle;
}

const ScreenWrapper = ({ children, style }: Props) => {
  return (
    <View style={[styles.root]}>
      <ImageBackground
        source={require("../../../assets/bg1.png")}
        style={[styles.background, style]}
        resizeMode="cover"
      >
        <ImageBackground
          source={require("../../../assets/bg0.png")}
          style={{ flex: 1 }}
          resizeMode="cover"
        >
          <View style={styles.overlay}>{children}</View>
        </ImageBackground>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: "visible",
    backgroundColor: "#ffffff10",
  },
  background: {
    flex: 1,
    height,
    width,
  },
  overlay: {
    flex: 1,
    overflow: "visible",
  },
});

export default ScreenWrapper;
