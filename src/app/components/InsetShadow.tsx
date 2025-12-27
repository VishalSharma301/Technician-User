import React from "react";
import { View } from "react-native";
import Svg, { Rect, Defs, Filter, FeOffset, FeGaussianBlur, FeComposite, FeFlood } from "react-native-svg";

interface InsetShadowProps {
  width: number;
  height: number;
  radius?: number;
}

export default function InsetShadow({
  width,
  height,
  radius = 12,
}: InsetShadowProps) {
  return (
    <View style={{ position: "absolute" }}>
      <Svg width={width} height={height}>
        <Defs>
          <Filter id="inset-shadow">
            {/* Offset */}
            <FeOffset dx="0" dy="1" />

            {/* Blur */}
            <FeGaussianBlur stdDeviation="1" result="blur" />

            {/* Shadow color */}
            <FeFlood floodColor="rgb(211,211,211)" floodOpacity="0.25" />

            {/* Mask inside */}
            <FeComposite in2="blur" operator="in" />

            {/* Inset */}
            <FeComposite in2="SourceGraphic" operator="over" />
          </Filter>
        </Defs>

        <Rect
          x="0"
          y="0"
          width={width}
          height={height}
          rx={radius}
          ry={radius}
          fill="transparent"
          filter="url(#inset-shadow)"
        />
      </Svg>
    </View>
  );
}
