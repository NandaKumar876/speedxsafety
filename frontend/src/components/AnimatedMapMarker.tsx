// ============================================
// SpeedxSafety - Animated Map Marker Component
// ============================================

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Shadow } from '../constants/theme';
import { scaleWidth, scaleHeight } from '../utils/responsive';

interface AnimatedMapMarkerProps {
  speed: number;
  speedLimit: number;
  heading: number;
  isActive: boolean;
  name?: string;
  vehicleType?: 'car' | 'bike';
}

export const AnimatedMapMarker: React.FC<AnimatedMapMarkerProps> = ({
  speed, speedLimit, heading, isActive, name, vehicleType = 'bike',
}) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(pulseOpacity, { toValue: 0, duration: 1500, useNativeDriver: true }),
            Animated.timing(pulseOpacity, { toValue: 0.6, duration: 0, useNativeDriver: true }),
          ]),
        ])
      ).start();
    }
  }, [isActive]);

  const isOverLimit = speed > speedLimit;
  const isNearLimit = speed > speedLimit * 0.85;
  const statusColor = isOverLimit ? Colors.danger : isNearLimit ? Colors.warning : Colors.safe;
  const iconName = vehicleType === 'bike' ? 'bicycle' : 'car-sport';

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.5],
  });

  return (
    <View style={styles.container}>
      {/* Radar pulse ring */}
      {isActive && (
        <Animated.View
          style={[
            styles.pulse,
            {
              backgroundColor: statusColor + '30',
              borderColor: statusColor + '50',
              transform: [{ scale: pulseScale }],
              opacity: pulseOpacity,
            },
          ]}
        />
      )}

      {/* Main marker */}
      <View style={[styles.marker, { backgroundColor: statusColor }, Shadow.glow(statusColor)]}>
        <View style={{ transform: [{ rotate: `${heading}deg` }] }}>
          <Ionicons name={iconName} size={18} color="#fff" />
        </View>
      </View>

      {/* Speed badge */}
      {isActive && (
        <View style={[styles.speedBadge, { backgroundColor: statusColor + '20', borderColor: statusColor + '40' }]}>
          <Text style={[styles.speedText, { color: statusColor }]}>{Math.round(speed)}</Text>
          <Text style={styles.speedUnit}>km/h</Text>
        </View>
      )}

      {/* Name label */}
      {name && (
        <View style={styles.nameLabel}>
          <Text style={styles.nameText}>{name}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    width: scaleWidth(36),
    height: scaleWidth(36),
    borderRadius: scaleWidth(18),
    borderWidth: 1.5,
  },
  marker: {
    width: scaleWidth(36),
    height: scaleWidth(36),
    borderRadius: scaleWidth(18),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  speedBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    borderRadius: scaleWidth(8),
    paddingHorizontal: scaleWidth(6),
    paddingVertical: scaleHeight(2),
    marginTop: scaleHeight(4),
    borderWidth: 1,
  },
  speedText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.heavy,
  },
  speedUnit: {
    fontSize: 8,
    color: Colors.textTertiary,
    fontWeight: FontWeight.medium,
  },
  nameLabel: {
    backgroundColor: 'rgba(6, 8, 26, 0.85)',
    borderRadius: scaleWidth(6),
    paddingHorizontal: scaleWidth(8),
    paddingVertical: scaleHeight(2),
    marginTop: scaleHeight(2),
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  nameText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: FontWeight.semibold,
  },
});
