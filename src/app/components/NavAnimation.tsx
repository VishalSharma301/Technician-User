// TransitionOverlay.js
// Full-screen page transition animation for React Native
// Requires: react-native-reanimated v3, react-native-svg
//
// USAGE:
//   import TransitionOverlay, { usePageTransition } from './TransitionOverlay';
//
//   const { navigate, currentPage, phase, targetPage } = usePageTransition('home');
//
//   <TransitionOverlay
//     phase={phase}
//     pageName={targetPage?.title}
//     pageAccent={targetPage?.accent}
//   />

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTransition } from '../../store/TransitionContext';

const { height: SCREEN_H } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath   = Animated.createAnimatedComponent(Path);

// ─── usePageTransition hook ───────────────────────────────────────────────────
export function usePageTransition(initial) {
  const [currentPage, setCurrentPage] = useState(initial);
  const [phase,       setPhase]       = useState('idle');
  const targetRef = useRef(null);
  const busy      = useRef(false);

  const navigate = useCallback((pageKey, loadMs = 1300) => {
    if (busy.current || pageKey === currentPage) return;
    busy.current     = true;
    targetRef.current = pageKey;
    setPhase('loading');

    setTimeout(() => {
      setPhase('success');
      setTimeout(() => {
        setPhase('shutter');
        setTimeout(() => {
          setCurrentPage(targetRef.current);
          setPhase('idle');
          busy.current = false;
        }, 600);
      }, 820);
    }, loadMs);
  }, [currentPage]);

  return { navigate, currentPage, phase, targetKey: targetRef.current };
}

// ─── SpinnerRing ─────────────────────────────────────────────────────────────
function SpinnerRing({ accent }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withTiming(360 * 200, {
      duration: 200_000,
      easing: Easing.linear,
    });
    return () => { rotation.value = 0; };
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value % 360}deg` }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]}>
      <Svg width={124} height={124} viewBox="0 0 124 124">
        <Circle cx={62} cy={62} r={44} fill="none"
          stroke={accent} strokeWidth={5.5} strokeLinecap="round"
          strokeDasharray="30 247" />
        <Circle cx={62} cy={62} r={44} fill="none"
          stroke={accent} strokeWidth={5.5} strokeLinecap="round"
          strokeDasharray="9 268" strokeDashoffset={-70} opacity={0.4} />
      </Svg>
    </Animated.View>
  );
}

// ─── SuccessRing ─────────────────────────────────────────────────────────────
function SuccessRing() {
  const offset = useSharedValue(276);

  useEffect(() => {
    offset.value = withTiming(0, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  const animProps = useAnimatedProps(() => ({ strokeDashoffset: offset.value }));

  return (
    <Svg width={124} height={124} viewBox="0 0 124 124"
      style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
      <AnimatedCircle
        cx={62} cy={62} r={44} fill="none"
        stroke="rgba(255,255,255,0.95)" strokeWidth={5.5} strokeLinecap="round"
        strokeDasharray={276} animatedProps={animProps} />
    </Svg>
  );
}

// ─── CheckMark ───────────────────────────────────────────────────────────────
function CheckMark() {
  const offset = useSharedValue(58);

  useEffect(() => {
    offset.value = withDelay(60,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const animProps = useAnimatedProps(() => ({ strokeDashoffset: offset.value }));

  return (
    <Svg width={36} height={36} viewBox="0 0 36 36" fill="none">
      <AnimatedPath
        d="M7 18.5L15 26.5L29 11"
        stroke="#fff" strokeWidth={3.5}
        strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={58} animatedProps={animProps} />
    </Svg>
  );
}

// ─── LoadingDot ───────────────────────────────────────────────────────────────
function LoadingDot({ delay, accent, size = 8 }) {
  const scale   = useSharedValue(0.6);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    const loop = () => {
      scale.value = withSequence(
        withDelay(delay, withTiming(1,   { duration: 440, easing: Easing.inOut(Easing.quad) })),
        withTiming(0.6, { duration: 440, easing: Easing.inOut(Easing.quad) })
      );
      opacity.value = withSequence(
        withDelay(delay, withTiming(1,   { duration: 440 })),
        withTiming(0.3, { duration: 440 })
      );
    };
    loop();
    const id = setInterval(loop, 880);
    return () => clearInterval(id);
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[style, {
      width: size, height: size,
      borderRadius: size / 2,
      backgroundColor: accent,
    }]} />
  );
}

// ─── TransitionOverlay (main export) ─────────────────────────────────────────
export default function TransitionOverlay() {
    const { phase, targetKey, targetAccent } = useTransition();
  const pageName = targetKey;       // or map targetKey → display name
  const pageAccent = targetAccent;
  const accent    = pageAccent || '#0EA5E9';
  const isSuccess = phase === 'success' || phase === 'shutter';

  // Curtain slide
  const translateY = useSharedValue(SCREEN_H);
  useEffect(() => {
    if (phase === 'loading') {
      translateY.value = withTiming(0, {
        duration: 420,
        easing: Easing.out(Easing.cubic),
      });
    } else if (phase === 'shutter') {
      translateY.value = withTiming(-SCREEN_H, {
        duration: 580,
        easing: Easing.in(Easing.cubic),
      });
    } else if (phase === 'idle') {
      translateY.value = SCREEN_H;
    }
  }, [phase]);

  // Disc icon pop on success
  const discScale = useSharedValue(0.75);
  useEffect(() => {
    if (isSuccess) {
      discScale.value = withSpring(1, { damping: 8, stiffness: 160, mass: 0.6 });
    } else {
      discScale.value = 0.75;
    }
  }, [isSuccess]);

  const curtainStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const discStyle = useAnimatedStyle(() => ({
    transform: [{ scale: discScale.value }],
  }));

  if (phase === 'idle') return null;

  const bg          = isSuccess ? accent : '#FFFFFF';
  const ringTrack   = isSuccess ? 'rgba(255,255,255,0.2)'  : `${accent}33`;
  const discBg      = isSuccess ? 'rgba(255,255,255,0.15)' : `${accent}1A`;
  const discBorder  = isSuccess ? 'rgba(255,255,255,0.25)' : `${accent}4D`;
  const labelMain   = isSuccess ? 'rgba(255,255,255,0.92)' : '#111827';
  const labelSub    = isSuccess ? 'rgba(255,255,255,0.55)' : '#9CA3AF';

  return (
    <Animated.View style={[styles.overlay, { backgroundColor: bg }, curtainStyle]}>

      {/* Track ring (static) */}
      <View style={styles.ringWrap}>
        <Svg width={124} height={124} viewBox="0 0 124 124" style={StyleSheet.absoluteFill}>
          <Circle cx={62} cy={62} r={44} fill="none"
            stroke={ringTrack} strokeWidth={6} />
        </Svg>

        {/* Loading spinner */}
        {!isSuccess && <SpinnerRing accent={accent} />}

        {/* Success fill ring */}
        {isSuccess && <SuccessRing key="ring" />}

        {/* Inner disc */}
        <Animated.View style={[styles.disc, { backgroundColor: discBg, borderColor: discBorder }, discStyle]}>
          {!isSuccess && (
            <View style={styles.dots}>
              <LoadingDot delay={0}    accent={accent} size={5} />
              <LoadingDot delay={170}  accent={accent} size={8} />
              <LoadingDot delay={340}  accent={accent} size={5} />
            </View>
          )}
          {isSuccess && <CheckMark key="check" />}
        </Animated.View>
      </View>

      {/* Label */}
      {pageName ? (
        <View style={styles.labelWrap}>
          <Text style={[styles.labelSub, { color: labelSub }]}>
            {isSuccess ? '✦  Ready' : 'Opening'}
          </Text>
          <Text style={[styles.labelMain, { color: labelMain }]}>
            {pageName}
          </Text>
        </View>
      ) : null}
    </Animated.View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
  },
  ringWrap: {
    width: 124,
    height: 124,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disc: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  labelWrap: {
    alignItems: 'center',
    gap: 5,
  },
  labelSub: {
    fontSize: 10,
    letterSpacing: 3.5,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  labelMain: {
    fontSize: 22,
    fontWeight: '300',
    letterSpacing: -0.3,
  },
});