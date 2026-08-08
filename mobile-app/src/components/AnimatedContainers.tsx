import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  fromY?: number;
  scale?: number;
  style?: ViewStyle | ViewStyle[];
}

export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  delay = 0,
  fromY = 20,
  scale = 0.96,
  style,
}) => {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(reducedMotion ? 1 : 0);
  const translateY = useSharedValue(reducedMotion ? 0 : fromY);
  const scaleVal = useSharedValue(reducedMotion ? 1 : scale);

  useEffect(() => {
    if (reducedMotion) return;

    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 350, easing: Easing.out(Easing.quad) }),
    );
    translateY.value = withDelay(
      delay,
      withSpring(0, { damping: 18, stiffness: 120 }),
    );
    scaleVal.value = withDelay(
      delay,
      withSpring(1, { damping: 18, stiffness: 120 }),
    );
  }, [delay, fromY, scale, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scaleVal.value },
    ],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
};

interface PulseViewProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export const PulseView: React.FC<PulseViewProps> = ({ children, style }) => {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (reducedMotion) return;

    scale.value = withRepeat(
      withTiming(1.04, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
};
