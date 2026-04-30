// ============================================
// SpeedxSafety - Speed Gauge Component
// ============================================

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { Colors, FontSize, FontWeight } from '../constants/theme';

interface SpeedGaugeProps {
  speed: number;
  speedLimit: number;
  size?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const SpeedGauge: React.FC<SpeedGaugeProps> = ({ speed, speedLimit, size = 280 }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const isOverLimit = speed > speedLimit;
  const percentage = Math.min(speed / (speedLimit * 1.5), 1);
  const strokeWidth = 12;
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

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: pulseAnim }] }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <SvgGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={isOverLimit ? Colors.danger : Colors.safe} />
            <Stop offset="1" stopColor={isOverLimit ? '#FF6961' : Colors.primary} />
          </SvgGradient>
        </Defs>

        {/* Background arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.08)"
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
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  limitText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
    letterSpacing: 1,
  },
});
