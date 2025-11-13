import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  View,
} from "react-native";
import { scale } from "../../utils/scaling";

interface BottomSheetProps {
  visible: boolean;
  children: React.ReactNode;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ visible, children }) => {
  const [contentHeight, setContentHeight] = useState(0);

  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // ALWAYS start the sheet hidden by its own height
  useEffect(() => {
    if (contentHeight > 0) {
      translateY.setValue(contentHeight);
    }
  }, [contentHeight]);

  useEffect(() => {
    if (contentHeight === 0) return;

    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0, // slide UP fully
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: contentHeight, // slide DOWN by its own height
          duration: 250,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, contentHeight]);

  return (
    <>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity }]} pointerEvents={"none"} />

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheetContainer,
          {
            transform: [{ translateY }],
            width: scale(375),
            marginHorizontal: scale(9),
          },
        ]}
      >
        <View
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
          
            setContentHeight(h);
          }}
        >
          {children}
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheetContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    zIndex: 999,
    elevation: 20,
  },
});

export default BottomSheet;
