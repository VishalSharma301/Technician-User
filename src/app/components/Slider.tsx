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
import CustomView from "./CustomView";

const width = scale(351);

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
      <CustomView
        height={verticalScale(68.9)}
        width={scale(351)}
        radius={moderateScale(12)}
        boxStyle={styles.techCard}
      >
        <View style={styles.techInfo}>
          <View style={styles.iconWrapper}>
            <Image
              source={iconMap[service?.icon as IconName] ?? iconMap["default"]}
              style={styles.techImage}
            />
          </View>

          <View style={{ width: scale(190), borderWidth: 0 }}>
            <Text style={styles.techName}>{service?.name}</Text>
            <Text style={styles.techDesc}>
              {service?.category?.name} • 4.5 ⭐
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.bookBtn}>
          <Text style={styles.bookText}>Book</Text>
        </TouchableOpacity>
      </CustomView>
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
    const slide = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(slide);
  };

  return (
    <View style={[styles.sliderContainer]}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        ref={scrollRef}
      >
        {mostBookedServices.map((service) => (
          <View key={service._id} style={{ width , height: verticalScale(72), borderWidth : 0, borderColor : 'red' }}>
            <ServiceCard service={service} onPressService={onPressService} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default ServiceOfTheWeek;

/* --------------------------- STYLES --------------------------- */

const styles = StyleSheet.create({
  sliderContainer: {
    // borderWidth : 1
    // borderRadius: moderateScale(16),
    height: verticalScale(72),

    // marginBottom: verticalScale(20),
    width: scale(351),
    // borderWidth : 1,
    alignSelf: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: scale(12),

  },
 

  techInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: scale(4),
  },

  iconWrapper: {
    width: scale(45),
    height: scale(45),
    borderWidth: scale(1),
    borderColor: "#fff",
    borderRadius: moderateScale(10),
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(6),
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
  bookBtn: {
    backgroundColor: "#027CC7",
    paddingVertical: verticalScale(6),
    // paddingHorizontal: scale(16),
    borderRadius: scale(20),
    borderWidth: 1,
    borderColor: "#fff",
    width: scale(87),
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(12),
  },

  bookText: {
    color: "#fff",
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
});
