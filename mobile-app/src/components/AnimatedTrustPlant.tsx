import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Ellipse, G } from 'react-native-svg';
import { useApp } from '../context/AppContext';

interface AnimatedTrustPlantProps {
  /** 0 = seed, 1 = sprout, 2 = sapling, 3 = bloom */
  stage: 0 | 1 | 2 | 3;
  size?: number;
}

export const AnimatedTrustPlant: React.FC<AnimatedTrustPlantProps> = ({
  stage,
  size = 160,
}) => {
  const { colors } = useApp();

  // Animated values
  const stemProgress = useRef(new Animated.Value(0)).current;
  const leaf1Progress = useRef(new Animated.Value(0)).current;
  const leaf2Progress = useRef(new Animated.Value(0)).current;
  const bloomProgress = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;
  const seedPulse = useRef(new Animated.Value(1)).current;
  const petalAngle = useRef(new Animated.Value(0)).current;

  // We'll drive the view-level transforms using these animated values
  const [stemH, setStemH] = React.useState(0);
  const [leaf1S, setLeaf1S] = React.useState(0);
  const [leaf2S, setLeaf2S] = React.useState(0);
  const [bloomS, setBloomS] = React.useState(0);
  const [glowOp, setGlowOp] = React.useState(0.3);
  const [seedS, setSeedS] = React.useState(1);
  const [petalRot, setPetalRot] = React.useState(0);

  useEffect(() => {
    stemProgress.addListener(({ value }) => setStemH(value));
    leaf1Progress.addListener(({ value }) => setLeaf1S(value));
    leaf2Progress.addListener(({ value }) => setLeaf2S(value));
    bloomProgress.addListener(({ value }) => setBloomS(value));
    glowOpacity.addListener(({ value }) => setGlowOp(value));
    seedPulse.addListener(({ value }) => setSeedS(value));
    petalAngle.addListener(({ value }) => setPetalRot(value));

    return () => {
      stemProgress.removeAllListeners();
      leaf1Progress.removeAllListeners();
      leaf2Progress.removeAllListeners();
      bloomProgress.removeAllListeners();
      glowOpacity.removeAllListeners();
      seedPulse.removeAllListeners();
      petalAngle.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    // Continuous glow pulse
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, { toValue: 0.75, duration: 1200, useNativeDriver: false, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(glowOpacity, { toValue: 0.15, duration: 1200, useNativeDriver: false, easing: Easing.inOut(Easing.sin) }),
      ])
    );
    glowLoop.start();

    // Seed pulse when stage 0
    const seedLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(seedPulse, { toValue: 1.15, duration: 850, useNativeDriver: false, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(seedPulse, { toValue: 0.9, duration: 850, useNativeDriver: false, easing: Easing.inOut(Easing.sin) }),
      ])
    );
    if (stage === 0) seedLoop.start();

    // Petal slow rotation for bloom
    const petalLoop = Animated.loop(
      Animated.timing(petalAngle, { toValue: 360, duration: 8000, useNativeDriver: false, easing: Easing.linear })
    );
    if (stage === 3) petalLoop.start();

    // Stage-based grow animations
    Animated.sequence([
      Animated.spring(stemProgress, { toValue: stage >= 1 ? 1 : 0, useNativeDriver: false, tension: 60, friction: 8 }),
      Animated.parallel([
        Animated.spring(leaf1Progress, { toValue: stage >= 2 ? 1 : 0, useNativeDriver: false, tension: 55, friction: 7 }),
        Animated.spring(leaf2Progress, { toValue: stage >= 2 ? 1 : 0, useNativeDriver: false, tension: 55, friction: 9 }),
      ]),
      Animated.spring(bloomProgress, { toValue: stage >= 3 ? 1 : 0, useNativeDriver: false, tension: 50, friction: 6 }),
    ]).start();

    return () => {
      glowLoop.stop();
      seedLoop.stop();
      petalLoop.stop();
    };
  }, [stage]);

  const cx = size / 2;
  // Plant baseline (soil line)
  const soilY = size * 0.78;
  // Stem tip (top of full-grown stem)
  const stemTipY = size * 0.24;
  // Stem current tip based on animation
  const stemCurrentTipY = soilY - (soilY - stemTipY) * stemH;

  // Leaf anchor midpoint on stem
  const leaf1AnchorY = soilY - (soilY - stemTipY) * 0.5 * stemH;

  // Bloom center
  const bloomCY = stemTipY;

  // Colors
  const stemColor = '#3D7A52';
  const leafColor = '#4E9E6A';
  const leafHighlight = '#78C895';
  const soilColor = '#5C4A2A';
  const soilMoundColor = '#7A6040';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background glow ring */}
        <Circle
          cx={cx}
          cy={size / 2}
          r={size * 0.43}
          fill="none"
          stroke={colors.primary}
          strokeWidth={2.5}
          opacity={glowOp}
          strokeDasharray="6 4"
        />

        {/* Soil mound */}
        <Ellipse
          cx={cx}
          cy={soilY + size * 0.04}
          rx={size * 0.32}
          ry={size * 0.09}
          fill={soilMoundColor}
          opacity={0.55}
        />
        <Ellipse
          cx={cx}
          cy={soilY + size * 0.025}
          rx={size * 0.22}
          ry={size * 0.055}
          fill={soilColor}
          opacity={0.6}
        />

        {/* STEM — drawn as a line from soil to stemCurrentTipY */}
        {stemH > 0 && (
          <Path
            d={`M ${cx} ${soilY} Q ${cx + size * 0.035} ${(soilY + stemCurrentTipY) / 2} ${cx} ${stemCurrentTipY}`}
            stroke={stemColor}
            strokeWidth={size * 0.048}
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* LEAF 1 — left, grows from mid-stem */}
        {leaf1S > 0 && stemH > 0 && (
          <G>
            {/* Petiole */}
            <Path
              d={`M ${cx} ${leaf1AnchorY} Q ${cx - size * 0.12 * leaf1S} ${leaf1AnchorY - size * 0.04 * leaf1S} ${cx - size * 0.2 * leaf1S} ${leaf1AnchorY - size * 0.1 * leaf1S}`}
              stroke={stemColor}
              strokeWidth={size * 0.028}
              strokeLinecap="round"
              fill="none"
            />
            {/* Leaf blade */}
            <Ellipse
              cx={cx - size * 0.22 * leaf1S}
              cy={leaf1AnchorY - size * 0.12 * leaf1S}
              rx={size * 0.11 * leaf1S}
              ry={size * 0.062 * leaf1S}
              fill={leafColor}
              opacity={0.9}
              transform={`rotate(-40, ${cx - size * 0.22 * leaf1S}, ${leaf1AnchorY - size * 0.12 * leaf1S})`}
            />
            {/* Leaf vein */}
            <Path
              d={`M ${cx - size * 0.13 * leaf1S} ${leaf1AnchorY - size * 0.06 * leaf1S} L ${cx - size * 0.27 * leaf1S} ${leaf1AnchorY - size * 0.17 * leaf1S}`}
              stroke={leafHighlight}
              strokeWidth={size * 0.012}
              strokeLinecap="round"
              opacity={0.6}
            />
          </G>
        )}

        {/* LEAF 2 — right */}
        {leaf2S > 0 && stemH > 0 && (
          <G>
            <Path
              d={`M ${cx} ${leaf1AnchorY - size * 0.1 * stemH} Q ${cx + size * 0.1 * leaf2S} ${leaf1AnchorY - size * 0.14 * leaf2S} ${cx + size * 0.18 * leaf2S} ${leaf1AnchorY - size * 0.22 * leaf2S}`}
              stroke={stemColor}
              strokeWidth={size * 0.028}
              strokeLinecap="round"
              fill="none"
            />
            <Ellipse
              cx={cx + size * 0.2 * leaf2S}
              cy={leaf1AnchorY - size * 0.24 * leaf2S}
              rx={size * 0.1 * leaf2S}
              ry={size * 0.058 * leaf2S}
              fill={leafColor}
              opacity={0.88}
              transform={`rotate(35, ${cx + size * 0.2 * leaf2S}, ${leaf1AnchorY - size * 0.24 * leaf2S})`}
            />
            <Path
              d={`M ${cx + size * 0.12 * leaf2S} ${leaf1AnchorY - size * 0.14 * leaf2S} L ${cx + size * 0.25 * leaf2S} ${leaf1AnchorY - size * 0.28 * leaf2S}`}
              stroke={leafHighlight}
              strokeWidth={size * 0.012}
              strokeLinecap="round"
              opacity={0.6}
            />
          </G>
        )}

        {/* BLOOM — rotating petals */}
        {bloomS > 0 && (
          <G>
            {/* Rotating outer petals */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
              const rotated = ((angle + petalRot) % 360);
              const rad = (rotated * Math.PI) / 180;
              const petalDist = size * 0.13 * bloomS;
              const px = cx + Math.cos(rad) * petalDist;
              const py = bloomCY + Math.sin(rad) * petalDist;
              return (
                <Ellipse
                  key={i}
                  cx={px}
                  cy={py}
                  rx={size * 0.072 * bloomS}
                  ry={size * 0.042 * bloomS}
                  fill={i % 2 === 0 ? colors.primary : '#FF8C00'}
                  opacity={0.88}
                  transform={`rotate(${rotated}, ${px}, ${py})`}
                />
              );
            })}
            {/* Bloom center disc */}
            <Circle
              cx={cx}
              cy={bloomCY}
              r={size * 0.09 * bloomS}
              fill={colors.primary}
            />
            {/* Bloom center dot */}
            <Circle
              cx={cx}
              cy={bloomCY}
              r={size * 0.045 * bloomS}
              fill="#1A1500"
            />
            {/* Sparkle dots */}
            {[0, 120, 240].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const sparkDist = size * 0.28 * bloomS;
              return (
                <Circle
                  key={i}
                  cx={cx + Math.cos(rad) * sparkDist}
                  cy={bloomCY + Math.sin(rad) * sparkDist}
                  r={size * 0.025 * bloomS}
                  fill={colors.primary}
                  opacity={0.7}
                />
              );
            })}
          </G>
        )}

        {/* SEED — shown when stage === 0 */}
        {stage === 0 && (
          <G>
            <Ellipse
              cx={cx}
              cy={soilY - size * 0.04}
              rx={size * 0.12 * seedS}
              ry={size * 0.075 * seedS}
              fill={stemColor}
              opacity={0.9}
            />
            <Ellipse
              cx={cx + size * 0.02}
              cy={soilY - size * 0.06}
              rx={size * 0.055 * seedS}
              ry={size * 0.035 * seedS}
              fill={leafHighlight}
              opacity={0.65}
              transform={`rotate(-22, ${cx + size * 0.02}, ${soilY - size * 0.06})`}
            />
          </G>
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
