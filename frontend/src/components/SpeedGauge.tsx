// ============================================
// SpeedxSafety - Speed Gauge Component
// ============================================

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { Colors, FontSize, FontWeight } from '../constants/theme';
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

  const isOverLimit = speed > speedLimit;
  const percentage = Math.min(speed / (speedLimit * 1.5), 1);
  const strokeWidth = scaleWidth(12);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcAngle = 0.75; // 270 degrees
  const arcLength = circumference * arcAngle;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: percentage,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [speed]);

  useEffect(() => {
    if (isOverLimit) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isOverLimit]);

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
  const tickCount = 12;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const angle = 135 + (270 / (tickCount - 1)) * i;
    const rad = (angle * Math.PI) / 180;
    const innerR = radius - scaleWidth(20);
    const outerR = radius - scaleWidth(10);
    return {
      x1: size / 2 + Math.cos(rad) * innerR,
      y1: size / 2 + Math.sin(rad) * innerR,
      x2: size / 2 + Math.cos(rad) * outerR,
      y2: size / 2 + Math.sin(rad) * outerR,
    };
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: pulseAnim }] }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <SvgGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={isOverLimit ? Colors.danger : Colors.safe} />
            <Stop offset="1" stopColor={isOverLimit ? Colors.dangerLight : Colors.primaryLight} />
          </SvgGradient>
        </Defs>

        {/* Tick marks */}
        {ticks.map((tick, i) => (
          <Circle
            key={i}
            cx={tick.x2}
            cy={tick.y2}
            r={i % 3 === 0 ? 2 : 1}
            fill={i <= (percentage * (tickCount - 1)) ? getSpeedColor() + '80' : 'rgba(255,255,255,0.1)'}
          />
        ))}

        {/* Background arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.06)"
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
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${arcLength} ${circumference - arcLength}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation={135}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* Center text */}
      <View style={styles.centerText}>
        <Text style={[styles.speedValue, { color: getSpeedColor() }]}>
          {Math.round(speed)}
        </Text>
        <Text style={styles.speedUnit}>km/h</Text>
        <View style={[styles.limitBadge, { borderColor: getSpeedColor() + '40' }]}>
          <Text style={styles.limitText}>LIMIT {speedLimit}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
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
    letterSpacing: -2,
  },
  speedUnit: {
    fontSize: FontSize.md,
    color: Colors.textTertiary,
    fontWeight: FontWeight.medium,
    marginTop: -4,
  },
  limitBadge: {
    marginTop: scaleHeight(12),
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(4),
    borderRadius: scaleWidth(20),
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  limitText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
    letterSpacing: 1,
  },
});
