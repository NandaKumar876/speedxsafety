// ============================================
// SpeedxSafety - Speed Gauge Component (Spatial Edition)
// Premium gauge with ambient glow, spring physics, depth
// ============================================

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { Colors, FontSize, FontWeight, Shadow } from '../constants/theme';
import { scaleWidth, scaleHeight, scaleFont } from '../utils/responsive';

interface SpeedGaugeProps {
  speed: number;
  speedLimit: number;
  size?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const SpeedGauge: React.FC<SpeedGaugeProps> = ({ speed, speedLimit, size = scaleWidth(280) }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const ringRotation = useRef(new Animated.Value(0)).current;

  const isOverLimit = speed > speedLimit;
  const percentage = Math.min(speed / (speedLimit * 1.5), 1);
  const strokeWidth = scaleWidth(10);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcAngle = 0.75; // 270 degrees
  const arcLength = circumference * arcAngle;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: percentage,
      friction: 12,
      tension: 50,
      useNativeDriver: false,
    }).start();

    // Ambient glow intensity based on speed
    Animated.timing(glowAnim, {
      toValue: Math.min(percentage * 1.2, 1),
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [speed]);

  useEffect(() => {
    if (isOverLimit) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isOverLimit]);

  // Slow continuous ring rotation for ambient effect
  useEffect(() => {
    Animated.loop(
      Animated.timing(ringRotation, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [arcLength, 0],
  });

  const getSpeedColor = () => {
    if (speed > speedLimit) return Colors.danger;
    if (speed > speedLimit * 0.85) return Colors.warning;
    return Colors.safe;
  };

  // Tick marks
  const tickCount = 15;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const angle = 135 + (270 / (tickCount - 1)) * i;
    const rad = (angle * Math.PI) / 180;
    const innerR = radius - scaleWidth(22);
    const outerR = radius - scaleWidth(12);
    return {
      x1: size / 2 + Math.cos(rad) * innerR,
      y1: size / 2 + Math.sin(rad) * innerR,
      x2: size / 2 + Math.cos(rad) * outerR,
      y2: size / 2 + Math.sin(rad) * outerR,
    };
  });

  // Outer decorative dots
  const outerDots = Array.from({ length: 36 }, (_, i) => {
    const angle = (360 / 36) * i;
    const rad = (angle * Math.PI) / 180;
    const r = radius + scaleWidth(16);
    return {
      cx: size / 2 + Math.cos(rad) * r,
      cy: size / 2 + Math.sin(rad) * r,
    };
  });

  const rotateInterp = ringRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.wrapper}>
      {/* Ambient glow ring behind gauge */}
      <Animated.View
        style={[
          styles.ambientRing,
          {
            width: size + 40,
            height: size + 40,
            borderRadius: (size + 40) / 2,
            backgroundColor: getSpeedColor(),
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.02, isOverLimit ? 0.12 : 0.06],
            }),
          },
        ]}
      />

      <Animated.View style={[styles.container, { transform: [{ scale: pulseAnim }] }]}>
        {/* Outer rotating decorative ring */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { alignItems: 'center', justifyContent: 'center', transform: [{ rotate: rotateInterp }] },
          ]}
        >
          <Svg width={size + 32} height={size + 32} viewBox={`0 0 ${size + 32} ${size + 32}`}>
            {outerDots.map((dot, i) => (
              <Circle
                key={`od-${i}`}
                cx={dot.cx + 16}
                cy={dot.cy + 16}
                r={i % 6 === 0 ? 1.5 : 0.8}
                fill={i % 6 === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)'}
              />
            ))}
          </Svg>
        </Animated.View>

        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            <SvgGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={isOverLimit ? Colors.danger : Colors.safe} />
              <Stop offset="0.5" stopColor={isOverLimit ? Colors.dangerLight : Colors.primaryLight} />
              <Stop offset="1" stopColor={isOverLimit ? Colors.danger : Colors.primary} />
            </SvgGradient>
            <SvgGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="rgba(255,255,255,0.06)" />
              <Stop offset="1" stopColor="rgba(255,255,255,0.02)" />
            </SvgGradient>
          </Defs>

          {/* Tick marks */}
          {ticks.map((tick, i) => (
            <Circle
              key={i}
              cx={tick.x2}
              cy={tick.y2}
              r={i % 3 === 0 ? 2.5 : 1}
              fill={i <= (percentage * (tickCount - 1)) ? getSpeedColor() + '90' : 'rgba(255,255,255,0.08)'}
            />
          ))}

          {/* Background arc */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#bgGrad)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${arcLength} ${circumference - arcLength}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            rotation={135}
            origin={`${size / 2}, ${size / 2}`}
          />

          {/* Active arc */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#gaugeGrad)"
            strokeWidth={strokeWidth + 1}
            fill="none"
            strokeDasharray={`${arcLength} ${circumference - arcLength}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation={135}
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>

        {/* Center text with depth */}
        <View style={styles.centerText}>
          <Text style={[styles.speedValue, { color: getSpeedColor() }]}>
            {Math.round(speed)}
          </Text>
          <Text style={styles.speedUnit}>km/h</Text>
          <View style={[styles.limitBadge, { borderColor: getSpeedColor() + '35', backgroundColor: getSpeedColor() + '08' }]}>
            <Text style={[styles.limitText, { color: getSpeedColor() + 'CC' }]}>LIMIT {speedLimit}</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambientRing: {
    position: 'absolute',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
  },
  speedValue: {
    fontSize: FontSize.mega,
    fontWeight: FontWeight.heavy,
    letterSpacing: -3,
  },
  speedUnit: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    fontWeight: FontWeight.medium,
    marginTop: -4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  limitBadge: {
    marginTop: scaleHeight(14),
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(5),
    borderRadius: scaleWidth(20),
    borderWidth: 1,
  },
  limitText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 1.5,
  },
});
