import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { MotiView, MotiText } from 'moti';

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
  duration = 400,
  fromY = 20,
  scale = 0.96,
  style,
}) => {
  return (
    <MotiView
      from={{
        opacity: 0,
        translateY: fromY,
        scale: scale,
      }}
      animate={{
        opacity: 1,
        translateY: 0,
        scale: 1,
      }}
      transition={{
        type: 'spring',
        damping: 18,
        stiffness: 120,
        delay,
      }}
      style={style}
    >
      {children}
    </MotiView>
  );
};

interface PulseViewProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export const PulseView: React.FC<PulseViewProps> = ({ children, style }) => {
  return (
    <MotiView
      from={{ scale: 1 }}
      animate={{ scale: 1.05 }}
      transition={{
        type: 'timing',
        duration: 1200,
        loop: true,
        repeatReverse: true,
      }}
      style={style}
    >
      {children}
    </MotiView>
  );
};
