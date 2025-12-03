import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  Pressable,
  LayoutChangeEvent,
} from "react-native";
import { scale } from "../../utils/scaling";

interface BottomSheetProps {
  visible: boolean;
  children: React.ReactNode;
  onClose?: () => void;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ visible, children, onClose }) => {
  const [contentHeight, setContentHeight] = useState(0);
  const [isMounted, setIsMounted] = useState(visible); // NEW

  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Mount on visible=true
  useEffect(() => {
    if (visible) {
      setIsMounted(true);
    }
  }, [visible]);

  // Animate open / close
  useEffect(() => {
    if (contentHeight === 0) return;

    if (visible) {
      // OPEN animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
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
      // CLOSE animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: contentHeight,
          duration: 250,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsMounted(false); // unmount AFTER animation
      });
    }
  }, [visible, contentHeight]);

  const onContentLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h !== contentHeight) setContentHeight(h);
  };

  if (!isMounted) return null; // sheet/backdrop unmounted only after animation ends

  return (
    <>
      {/* BACKDROP */}
      <Animated.View style={[styles.backdrop, { opacity }]}>
        <Pressable
          style={[StyleSheet.absoluteFill, { bottom: contentHeight }]}
          onPress={() => onClose?.()}
        />
      </Animated.View>

      {/* SHEET */}
      <Animated.View
        style={[
          styles.sheetContainer,
          {
            transform: [{ translateY }],
            // width: scale(375),
            // marginHorizontal: scale(9),
          },
        ]}
        pointerEvents="box-none"
      >
        <View onLayout={onContentLayout}>{children}</View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor: "#f5f5f561",
     backgroundColor: "rgba(0, 0, 0, 0.93)", 
  },
  sheetContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
    overflow: "hidden",
    zIndex: 999,
    elevation: 20,
  },
});

export default BottomSheet;
