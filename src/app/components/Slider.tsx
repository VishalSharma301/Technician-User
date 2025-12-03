import React, { useRef, useState, useEffect, memo } from "react";
import {
  ScrollView,
  View,
  Image,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { scale, moderateScale, verticalScale } from "../../utils/scaling";
import { useServices } from "../../hooks/useServices";
import { ServiceData } from "../../constants/types";
import { iconMap, IconName } from "../../utils/iconMap";

const { width } = Dimensions.get("window");

interface BannerSliderProps {
  onPressService: (service: ServiceData) => void;
}

/* --------------------------- MEMOIZED CARD --------------------------- */
const ServiceCard = memo(
  ({
    service,
    onPressService,
  }: {
    service: ServiceData;
    onPressService: (service: ServiceData) => void;
  }) => {
    return (
      <View style={styles.techCard}>
        <View style={styles.techInfo}>
          <View style={styles.iconWrapper}>
            <Image
              source={
                iconMap[service?.icon as IconName] ?? iconMap["default"]
              }
              style={styles.techImage}
            />
          </View>

          <View>
            <Text style={styles.techName}>{service?.name} 🛡️</Text>
            <Text style={styles.techDesc}>
              {service?.category?.name} • 4.5 ⭐
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => onPressService(service)}
        >
          <Image
            source={require("../../../assets/cart.png")}
            style={styles.cartIcon}
          />
        </TouchableOpacity>
      </View>
    );
  }
);

const ServiceOfTheWeek: React.FC<BannerSliderProps> = ({ onPressService }) => {
  const scrollRef = useRef<ScrollView>(null);
  const { mostBookedServices } = useServices();

  const [currentIndex, setCurrentIndex] = useState(0);

  /* --------------------------- AUTO SLIDE --------------------------- */
  useEffect(() => {
    if (!mostBookedServices?.length) return;

    const total = mostBookedServices.length;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1 >= total ? 0 : prev + 1;

        scrollRef.current?.scrollTo({
          x: next * width,
          animated: true,
        });

        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [mostBookedServices]);

  /* --------------------------- ON SCROLL --------------------------- */
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = Math.round(
      event.nativeEvent.contentOffset.x / width
    );
    setCurrentIndex(slide);
  };

  return (
    <View style={styles.sliderContainer}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        ref={scrollRef}
      >
        {mostBookedServices.map((service) => (
          <View key={service._id} style={{ width }}>
            <ServiceCard service={service} onPressService={onPressService} />
          </View>
        ))}
      </ScrollView>

      {/* DOTS */}
      {/* <View style={styles.dotsContainer}>
        {mostBookedServices.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.activeDot,
            ]}
          />
        ))}
      </View> */}
    </View>
  );
};

export default ServiceOfTheWeek;

/* --------------------------- STYLES --------------------------- */

const styles = StyleSheet.create({
  sliderContainer: {
    // borderWidth : 1
  },

  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: verticalScale(6),
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },

  activeDot: {
    backgroundColor: "#000",
    width: 10,
  },

  techCard: {
    backgroundColor: "#D4D4D440",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: scale(12),
    borderRadius: moderateScale(16),
    borderWidth: 2,
    borderColor: "#fff",
    height: verticalScale(74),
    marginBottom: verticalScale(20),
    width: scale(375),
    // alignSelf: "center",
  },

  techInfo: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconWrapper: {
    width: scale(45),
    height: scale(45),
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: moderateScale(10),
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(10),
  },

  techImage: {
    width: scale(33),
    height: scale(31),
    borderRadius: moderateScale(10),
    resizeMode: "cover",
  },

  techName: {
    fontWeight: "600",
    fontSize: moderateScale(14),
  },

  techDesc: {
    color: "#555",
    fontSize: moderateScale(12),
  },

  cartButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: moderateScale(10),
    padding: scale(6),
  },

  cartIcon: {
    width: scale(22),
    height: scale(22),
    resizeMode: "cover",
  },
});
