/**
 * AnimatedTrustPlant — Reanimated 4 powered SVG plant
 *
 * Accepts a continuous `growth` (0→1) instead of discrete stages.
 * All SVG geometry interpolates on the UI thread via useAnimatedProps.
 * Zero React re-renders during animation.
 *
 * Growth map:
 *   0.00→0.08  seed visible, crack opens
 *   0.08→0.40  stem grows from soil
 *   0.30→0.60  leaf 1 unfurls
 *   0.40→0.70  leaf 2 unfurls
 *   0.65→1.00  bloom opens, petals rotate
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
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Palette } from '../constants/Palette';

// Animated SVG primitives — created once at module level
const APath = Animated.createAnimatedComponent(Path);
const ACircle = Animated.createAnimatedComponent(Circle);
const AEllipse = Animated.createAnimatedComponent(Ellipse);

interface AnimatedTrustPlantProps {
  /** Continuous growth value 0 (seed) → 1 (full bloom) */
  growth: number;
  /** Pixel size of the square canvas */
  size?: number;
  /** When false, ambient loops are cancelled (e.g. screen blur) */
  focused?: boolean;
  /** Use dark palette */
  dark?: boolean;
}

// Clamp helper for worklets
function clamp(v: number, min: number, max: number): number {
  'worklet';
  return Math.min(Math.max(v, min), max);
}

// Map a value from [inLo, inHi] → [outLo, outHi], clamped
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
  const sv = useSharedValue(0); // main growth 0→1
  const glowOp = useSharedValue(0.3); // glow ring opacity
  const petalRot = useSharedValue(0); // bloom petal rotation degrees
  const seedPulse = useSharedValue(1); // seed breathing scale

  // ── Drive growth ───────────────────────────────────────────────
  useEffect(() => {
    if (reducedMotion) {
      sv.value = growth;
    } else {
      sv.value = withSpring(growth, { damping: 16, stiffness: 90 });
    }
  }, [growth, reducedMotion]);

  // ── Ambient loops (start/stop with focused) ────────────────────
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

    // Glow ring pulse
    glowOp.value = withRepeat(
      withTiming(0.75, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );

    // Seed breathing
    seedPulse.value = withRepeat(
      withTiming(1.15, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );

    // Petal rotation
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

  // ── Colors from Palette ────────────────────────────────────────
  const palette = dark ? Palette.dark : Palette.light;
  const stemColor = '#3D7A52';
  const leafColor = '#4E9E6A';
  const leafVein = '#78C895';
  const soilDark = '#5C4A2A';
  const soilLight = '#7A6040';
  const primaryGold = palette.primary;
  const amberPetal = '#FF8C00';

  // ── Derived values (UI thread) ─────────────────────────────────

  // Seed visibility: visible when growth < 0.15, fades out 0.08→0.15
  const seedScale = useDerivedValue(() => {
    return mapRange(sv.value, 0, 0.12, 1, 0);
  });

  // Seed crack: opens as growth goes 0→0.08
  const seedCrack = useDerivedValue(() => {
    return mapRange(sv.value, 0.02, 0.08, 0, size * 0.04);
  });

  // Stem: grows from soilY toward stemTopY (0.08→0.40)
  const stemT = useDerivedValue(() => {
    return mapRange(sv.value, 0.08, 0.40, 0, 1);
  });

  // Leaf 1: unfurls (0.30→0.60)
  const leaf1T = useDerivedValue(() => {
    return mapRange(sv.value, 0.30, 0.60, 0, 1);
  });

  // Leaf 2: unfurls (0.40→0.70)
  const leaf2T = useDerivedValue(() => {
    return mapRange(sv.value, 0.40, 0.70, 0, 1);
  });

  // Bloom: opens (0.65→1.0)
  const bloomT = useDerivedValue(() => {
    return mapRange(sv.value, 0.65, 1.0, 0, 1);
  });

  // ── Animated props ─────────────────────────────────────────────

  // Glow ring
  const glowProps = useAnimatedProps(() => ({
    opacity: glowOp.value,
  }));

  // Seed left half
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

  // Seed right half (mirror)
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

  // Seed sprout nub (tiny green sprout emerging from crack)
  const seedSproutProps = useAnimatedProps(() => {
    const crack = seedCrack.value;
    const s = seedScale.value;
    const sproutH = mapRange(sv.value, 0.04, 0.10, 0, size * 0.06);
    return {
      cx: cx,
      cy: soilY - size * 0.04 - sproutH,
      rx: size * 0.025 * clamp(crack / (size * 0.03), 0, 1),
      ry: sproutH * 0.7,
      opacity: clamp(crack / (size * 0.02), 0, 1) * s,
    };
  });

  // Stem path
  const stemProps = useAnimatedProps(() => {
    const t = stemT.value;
    if (t <= 0) return { d: '' };
    const tipY = soilY - (soilY - stemTopY) * t;
    const ctrlX = cx + size * 0.03;
    const ctrlY = (soilY + tipY) / 2;
    return {
      d: `M ${cx} ${soilY} Q ${ctrlX} ${ctrlY} ${cx} ${tipY}`,
    };
  });

  // Leaf 1 — left petiole
  const leaf1PetioleProps = useAnimatedProps(() => {
    const t = leaf1T.value;
    const st = stemT.value;
    if (t <= 0 || st <= 0) return { d: '' };
    const anchorY = soilY - (soilY - stemTopY) * 0.5 * st;
    const endX = cx - size * 0.2 * t;
    const endY = anchorY - size * 0.12 * t;
    const ctrlX = cx - size * 0.1 * t;
    const ctrlY = anchorY - size * 0.04 * t;
    return {
      d: `M ${cx} ${anchorY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`,
    };
  });

  // Leaf 1 blade
  const leaf1BladeProps = useAnimatedProps(() => {
    const t = leaf1T.value;
    const st = stemT.value;
    if (t <= 0 || st <= 0) return { cx: 0, cy: 0, rx: 0, ry: 0, opacity: 0 };
    const anchorY = soilY - (soilY - stemTopY) * 0.5 * st;
    return {
      cx: cx - size * 0.22 * t,
      cy: anchorY - size * 0.14 * t,
      rx: size * 0.11 * t,
      ry: size * 0.06 * t,
      opacity: 0.9 * t,
    };
  });

  // Leaf 2 — right petiole
  const leaf2PetioleProps = useAnimatedProps(() => {
    const t = leaf2T.value;
    const st = stemT.value;
    if (t <= 0 || st <= 0) return { d: '' };
    const anchorY = soilY - (soilY - stemTopY) * 0.55 * st;
    const endX = cx + size * 0.18 * t;
    const endY = anchorY - size * 0.18 * t;
    const ctrlX = cx + size * 0.1 * t;
    const ctrlY = anchorY - size * 0.1 * t;
    return {
      d: `M ${cx} ${anchorY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`,
    };
  });

  // Leaf 2 blade
  const leaf2BladeProps = useAnimatedProps(() => {
    const t = leaf2T.value;
    const st = stemT.value;
    if (t <= 0 || st <= 0) return { cx: 0, cy: 0, rx: 0, ry: 0, opacity: 0 };
    const anchorY = soilY - (soilY - stemTopY) * 0.55 * st;
    return {
      cx: cx + size * 0.2 * t,
      cy: anchorY - size * 0.2 * t,
      rx: size * 0.1 * t,
      ry: size * 0.056 * t,
      opacity: 0.88 * t,
    };
  });

  // Bloom center
  const bloomCenterProps = useAnimatedProps(() => {
    const t = bloomT.value;
    return {
      cx: cx,
      cy: bloomCY,
      r: size * 0.09 * t,
      opacity: t,
    };
  });

  // Bloom inner dot
  const bloomDotProps = useAnimatedProps(() => {
    const t = bloomT.value;
    return {
      cx: cx,
      cy: bloomCY,
      r: size * 0.045 * t,
      opacity: t,
    };
  });

  // Build petal animated props (8 petals)
  const petalAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  const petalProps = petalAngles.map((baseAngle) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedProps(() => {
      const t = bloomT.value;
      if (t <= 0) return { cx: cx, cy: bloomCY, rx: 0, ry: 0, opacity: 0, transform: '' };
      const angle = (baseAngle + petalRot.value) % 360;
      const rad = (angle * Math.PI) / 180;
      const dist = size * 0.13 * t;
      const px = cx + Math.cos(rad) * dist;
      const py = bloomCY + Math.sin(rad) * dist;
      return {
        cx: px,
        cy: py,
        rx: size * 0.07 * t,
        ry: size * 0.04 * t,
        opacity: 0.88 * t,
        transform: `rotate(${angle}, ${px}, ${py})`,
      };
    }),
  );

  // Sparkle dots (3)
  const sparkleAngles = [0, 120, 240];
  const sparkleProps = sparkleAngles.map((angle) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedProps(() => {
      const t = bloomT.value;
      const rad = (angle * Math.PI) / 180;
      const dist = size * 0.28 * t;
      return {
        cx: cx + Math.cos(rad) * dist,
        cy: bloomCY + Math.sin(rad) * dist,
        r: size * 0.022 * t,
        opacity: 0.6 * t,
      };
    }),
  );

  const pct = Math.round(growth * 100);

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

        {/* Seed — two halves that crack apart */}
        <AEllipse animatedProps={seedLeftProps} fill={stemColor} />
        <AEllipse animatedProps={seedRightProps} fill={stemColor} />
        {/* Tiny sprout nub emerging from crack */}
        <AEllipse animatedProps={seedSproutProps} fill={leafColor} />

        {/* Stem */}
        <APath
          animatedProps={stemProps}
          stroke={stemColor}
          strokeWidth={size * 0.048}
          strokeLinecap="round"
          fill="none"
        />

        {/* Leaf 1 — left */}
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
          transform={`rotate(-40, ${cx - size * 0.22}, ${soilY - size * 0.14})`}
        />

        {/* Leaf 2 — right */}
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
          transform={`rotate(35, ${cx + size * 0.2}, ${soilY - size * 0.2})`}
        />

        {/* Bloom petals */}
        {petalAngles.map((_, i) => (
          <AEllipse
            key={`petal-${i}`}
            animatedProps={petalProps[i]}
            fill={i % 2 === 0 ? primaryGold : amberPetal}
          />
        ))}

        {/* Bloom center */}
        <ACircle animatedProps={bloomCenterProps} fill={primaryGold} />
        <ACircle animatedProps={bloomDotProps} fill="#1A1500" />

        {/* Sparkle dots */}
        {sparkleAngles.map((_, i) => (
          <ACircle
            key={`sparkle-${i}`}
            animatedProps={sparkleProps[i]}
            fill={primaryGold}
          />
        ))}
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
