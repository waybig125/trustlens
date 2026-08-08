/**
 * AnimatedTrustPlant — Native-safe Reanimated 4 SVG plant
 *
 * Accepts a continuous `growth` (0→1).
 * Geometry interpolates on the UI thread via useAnimatedProps.
 * Fully compatible with React Native iOS, Android, and Web SVG native renderers.
 */
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Circle,
  Ellipse,
  G,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useDerivedValue,
  withSpring,
  withTiming,
  withRepeat,
  cancelAnimation,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';
import { Palette } from '../constants/Palette';

// Animated SVG primitives
const APath = Animated.createAnimatedComponent(Path);
const ACircle = Animated.createAnimatedComponent(Circle);
const AEllipse = Animated.createAnimatedComponent(Ellipse);
const AG = Animated.createAnimatedComponent(G);

interface AnimatedTrustPlantProps {
  growth: number;
  size?: number;
  focused?: boolean;
  dark?: boolean;
}

function clamp(v: number, min: number, max: number): number {
  'worklet';
  return Math.min(Math.max(v, min), max);
}

function mapRange(
  v: number,
  inLo: number,
  inHi: number,
  outLo: number,
  outHi: number,
): number {
  'worklet';
  const t = clamp((v - inLo) / (inHi - inLo), 0, 1);
  return outLo + t * (outHi - outLo);
}

export const AnimatedTrustPlant: React.FC<AnimatedTrustPlantProps> = ({
  growth,
  size = 160,
  focused = true,
  dark = true,
}) => {
  const reducedMotion = useReducedMotion();

  // ── Shared values ──────────────────────────────────────────────
  const sv = useSharedValue(0);
  const glowOp = useSharedValue(0.3);
  const petalRot = useSharedValue(0);
  const seedPulse = useSharedValue(1);

  // ── Drive growth ───────────────────────────────────────────────
  useEffect(() => {
    if (reducedMotion) {
      sv.value = growth;
    } else {
      sv.value = withSpring(growth, { damping: 16, stiffness: 90 });
    }
  }, [growth, reducedMotion]);

  // ── Ambient loops ──────────────────────────────────────────────
  useEffect(() => {
    if (!focused || reducedMotion) {
      cancelAnimation(glowOp);
      cancelAnimation(petalRot);
      cancelAnimation(seedPulse);
      glowOp.value = 0.4;
      petalRot.value = 0;
      seedPulse.value = 1;
      return;
    }

    glowOp.value = withRepeat(
      withTiming(0.75, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );

    seedPulse.value = withRepeat(
      withTiming(1.15, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );

    petalRot.value = withRepeat(
      withTiming(360, { duration: 10000, easing: Easing.linear }),
      -1,
      false,
    );

    return () => {
      cancelAnimation(glowOp);
      cancelAnimation(petalRot);
      cancelAnimation(seedPulse);
    };
  }, [focused, reducedMotion]);

  // ── Layout constants ───────────────────────────────────────────
  const cx = size / 2;
  const soilY = size * 0.78;
  const stemTopY = size * 0.22;
  const bloomCY = stemTopY;

  const palette = dark ? Palette.dark : Palette.light;
  const stemColor = '#3D7A52';
  const leafColor = '#4E9E6A';
  const soilDark = '#5C4A2A';
  const soilLight = '#7A6040';
  const primaryGold = palette.primary;
  const amberPetal = '#FF8C00';

  // ── Derived values ─────────────────────────────────────────────
  const seedScale = useDerivedValue(() => mapRange(sv.value, 0, 0.12, 1, 0));
  const seedCrack = useDerivedValue(() => mapRange(sv.value, 0.02, 0.08, 0, size * 0.04));
  const stemT = useDerivedValue(() => mapRange(sv.value, 0.08, 0.40, 0, 1));
  const leaf1T = useDerivedValue(() => mapRange(sv.value, 0.30, 0.60, 0, 1));
  const leaf2T = useDerivedValue(() => mapRange(sv.value, 0.40, 0.70, 0, 1));
  const bloomT = useDerivedValue(() => mapRange(sv.value, 0.65, 1.0, 0, 1));

  // ── Animated props ─────────────────────────────────────────────
  const glowProps = useAnimatedProps(() => ({
    opacity: glowOp.value,
  }));

  const seedLeftProps = useAnimatedProps(() => {
    const s = seedScale.value;
    const crack = seedCrack.value;
    const pulse = seedPulse.value;
    return {
      cx: cx - crack,
      cy: soilY - size * 0.04,
      rx: size * 0.1 * s * pulse,
      ry: size * 0.07 * s * pulse,
      opacity: s * 0.9,
    };
  });

  const seedRightProps = useAnimatedProps(() => {
    const s = seedScale.value;
    const crack = seedCrack.value;
    const pulse = seedPulse.value;
    return {
      cx: cx + crack,
      cy: soilY - size * 0.04,
      rx: size * 0.1 * s * pulse,
      ry: size * 0.07 * s * pulse,
      opacity: s * 0.9,
    };
  });

  const seedSproutProps = useAnimatedProps(() => {
    const crack = seedCrack.value;
    const s = seedScale.value;
    const sproutH = mapRange(sv.value, 0.04, 0.10, 0, size * 0.06);
    return {
      cx: cx,
      cy: soilY - size * 0.04 - sproutH,
      rx: size * 0.025 * clamp(crack / (size * 0.03), 0, 1),
      ry: Math.max(0.1, sproutH * 0.7),
      opacity: clamp(crack / (size * 0.02), 0, 1) * s,
    };
  });

  // Native-safe path strings (never empty 'd')
  const stemProps = useAnimatedProps(() => {
    const t = stemT.value;
    if (t <= 0.001) return { d: 'M 0 0' };
    const tipY = soilY - (soilY - stemTopY) * t;
    const ctrlX = cx + size * 0.03;
    const ctrlY = (soilY + tipY) / 2;
    return {
      d: `M ${cx} ${soilY} Q ${ctrlX} ${ctrlY} ${cx} ${tipY}`,
    };
  });

  const leaf1PetioleProps = useAnimatedProps(() => {
    const t = leaf1T.value;
    const st = stemT.value;
    if (t <= 0.001 || st <= 0.001) return { d: 'M 0 0' };
    const anchorY = soilY - (soilY - stemTopY) * 0.5 * st;
    const endX = cx - size * 0.2 * t;
    const endY = anchorY - size * 0.12 * t;
    const ctrlX = cx - size * 0.1 * t;
    const ctrlY = anchorY - size * 0.04 * t;
    return {
      d: `M ${cx} ${anchorY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`,
    };
  });

  const leaf1BladeProps = useAnimatedProps(() => {
    const t = leaf1T.value;
    const st = stemT.value;
    if (t <= 0.001 || st <= 0.001) return { cx: cx, cy: soilY, rx: 0, ry: 0, opacity: 0 };
    const anchorY = soilY - (soilY - stemTopY) * 0.5 * st;
    return {
      cx: cx - size * 0.22 * t,
      cy: anchorY - size * 0.14 * t,
      rx: size * 0.11 * t,
      ry: size * 0.06 * t,
      opacity: 0.9 * t,
    };
  });

  const leaf2PetioleProps = useAnimatedProps(() => {
    const t = leaf2T.value;
    const st = stemT.value;
    if (t <= 0.001 || st <= 0.001) return { d: 'M 0 0' };
    const anchorY = soilY - (soilY - stemTopY) * 0.55 * st;
    const endX = cx + size * 0.18 * t;
    const endY = anchorY - size * 0.18 * t;
    const ctrlX = cx + size * 0.1 * t;
    const ctrlY = anchorY - size * 0.1 * t;
    return {
      d: `M ${cx} ${anchorY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`,
    };
  });

  const leaf2BladeProps = useAnimatedProps(() => {
    const t = leaf2T.value;
    const st = stemT.value;
    if (t <= 0.001 || st <= 0.001) return { cx: cx, cy: soilY, rx: 0, ry: 0, opacity: 0 };
    const anchorY = soilY - (soilY - stemTopY) * 0.55 * st;
    return {
      cx: cx + size * 0.2 * t,
      cy: anchorY - size * 0.2 * t,
      rx: size * 0.1 * t,
      ry: size * 0.056 * t,
      opacity: 0.88 * t,
    };
  });

  // Whole bloom group animated properties
  const bloomGroupProps = useAnimatedProps(() => {
    const t = bloomT.value;
    return {
      opacity: t,
      rotation: petalRot.value,
      originX: cx,
      originY: bloomCY,
    };
  });

  const pct = Math.round(growth * 100);

  // Static petal angles
  const petalAngles = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      accessibilityLabel={`Trust plant: ${pct}% grown`}
      accessibilityRole="image"
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Glow ring */}
        <ACircle
          animatedProps={glowProps}
          cx={cx}
          cy={size / 2}
          r={size * 0.43}
          fill="none"
          stroke={primaryGold}
          strokeWidth={2.5}
          strokeDasharray="6 4"
        />

        {/* Soil mound */}
        <Ellipse
          cx={cx}
          cy={soilY + size * 0.04}
          rx={size * 0.32}
          ry={size * 0.09}
          fill={soilLight}
          opacity={0.55}
        />
        <Ellipse
          cx={cx}
          cy={soilY + size * 0.025}
          rx={size * 0.22}
          ry={size * 0.055}
          fill={soilDark}
          opacity={0.6}
        />

        {/* Seed */}
        <AEllipse animatedProps={seedLeftProps} fill={stemColor} />
        <AEllipse animatedProps={seedRightProps} fill={stemColor} />
        <AEllipse animatedProps={seedSproutProps} fill={leafColor} />

        {/* Stem */}
        <APath
          animatedProps={stemProps}
          stroke={stemColor}
          strokeWidth={size * 0.048}
          strokeLinecap="round"
          fill="none"
        />

        {/* Leaf 1 */}
        <APath
          animatedProps={leaf1PetioleProps}
          stroke={stemColor}
          strokeWidth={size * 0.028}
          strokeLinecap="round"
          fill="none"
        />
        <AEllipse
          animatedProps={leaf1BladeProps}
          fill={leafColor}
          rotation={-40}
          originX={cx - size * 0.22}
          originY={soilY - size * 0.14}
        />

        {/* Leaf 2 */}
        <APath
          animatedProps={leaf2PetioleProps}
          stroke={stemColor}
          strokeWidth={size * 0.028}
          strokeLinecap="round"
          fill="none"
        />
        <AEllipse
          animatedProps={leaf2BladeProps}
          fill={leafColor}
          rotation={35}
          originX={cx + size * 0.2}
          originY={soilY - size * 0.2}
        />

        {/* Rotating Bloom Group */}
        <AG animatedProps={bloomGroupProps}>
          {petalAngles.map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const dist = size * 0.13;
            const px = cx + Math.cos(rad) * dist;
            const py = bloomCY + Math.sin(rad) * dist;
            return (
              <Ellipse
                key={`petal-${i}`}
                cx={px}
                cy={py}
                rx={size * 0.07}
                ry={size * 0.04}
                fill={i % 2 === 0 ? primaryGold : amberPetal}
                opacity={0.88}
                rotation={angle}
                originX={px}
                originY={py}
              />
            );
          })}
          {/* Bloom center */}
          <Circle cx={cx} cy={bloomCY} r={size * 0.09} fill={primaryGold} />
          <Circle cx={cx} cy={bloomCY} r={size * 0.045} fill="#1A1500" />
        </AG>
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
