// ============================================
// SpeedxSafety - Animated Map Marker Component
// ============================================

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Shadow, BorderRadius } from '../constants/theme';
import { scaleWidth, scaleHeight } from '../utils/responsive';
import { canUseNativeDriver } from '../utils/platform';

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
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      // Loop pulse animation
      const pulseLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: canUseNativeDriver }),
            Animated.timing(pulseAnim, { toValue: 0, duration: 0, useNativeDriver: canUseNativeDriver }),
          ]),
          Animated.sequence([
            Animated.timing(pulseOpacity, { toValue: 0, duration: 1800, useNativeDriver: canUseNativeDriver }),
            Animated.timing(pulseOpacity, { toValue: 0.6, duration: 0, useNativeDriver: canUseNativeDriver }),
          ]),
        ])
      );
      pulseLoop.start();

      // Loop gentle floating animation for the entire marker label/badge to feel spatial
      const floatLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, { toValue: -3, duration: 1200, useNativeDriver: canUseNativeDriver }),
          Animated.timing(floatAnim, { toValue: 3, duration: 1200, useNativeDriver: canUseNativeDriver }),
          Animated.timing(floatAnim, { toValue: 0, duration: 600, useNativeDriver: canUseNativeDriver }),
        ])
      );
      floatLoop.start();

      return () => {
        pulseLoop.stop();
        floatLoop.stop();
      };
    } else {
      pulseAnim.setValue(0);
      pulseOpacity.setValue(0);
      floatAnim.setValue(0);
    }
  }, [isActive]);

  const isOverLimit = speed > speedLimit;
  const isNearLimit = speed > speedLimit * 0.85;
  const statusColor = isOverLimit ? Colors.danger : isNearLimit ? Colors.warning : Colors.safe;
  const iconName = vehicleType === 'bike' ? 'bicycle' : 'car-sport';

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.8],
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: floatAnim }] }]}>
      {/* Radar pulse ring */}
      {isActive && (
        <Animated.View
          style={[
            styles.pulse,
            {
              backgroundColor: statusColor + '15',
              borderColor: statusColor + '40',
              transform: [{ scale: pulseScale }],
              opacity: pulseOpacity,
            },
          ]}
        />
      )}

      {/* Main marker bubble */}
      <View style={[styles.marker, { backgroundColor: statusColor, borderColor: '#fff' }, Shadow.glow(statusColor)]}>
        <View style={{ transform: [{ rotate: `${heading}deg` }] }}>
          <Ionicons name={iconName} size={18} color="#fff" />
        </View>
      </View>

      {/* Speed badge */}
      {isActive && (
        <View style={[styles.speedBadge, { borderColor: statusColor + '50' }, Shadow.glowSoft(statusColor)]}>
          <Text style={[styles.speedText, { color: statusColor }]}>{Math.round(speed)}</Text>
          <Text style={styles.speedUnit}>km/h</Text>
        </View>
      )}

      {/* Name label (frosted glass) */}
      {name && (
        <View style={styles.nameLabel}>
          <Text style={styles.nameText}>{name}</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    width: scaleWidth(38),
    height: scaleWidth(38),
    borderRadius: scaleWidth(19),
    borderWidth: 1.5,
  },
  marker: {
    width: scaleWidth(38),
    height: scaleWidth(38),
    borderRadius: scaleWidth(19),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  speedBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: scaleWidth(8),
    paddingVertical: scaleHeight(2),
    marginTop: scaleHeight(5),
    borderWidth: 1.2,
    backgroundColor: 'rgba(5, 7, 20, 0.85)',
  },
  speedText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.heavy,
  },
  speedUnit: {
    fontSize: 7,
    color: Colors.textTertiary,
    fontWeight: FontWeight.medium,
  },
  nameLabel: {
    backgroundColor: 'rgba(10, 14, 42, 0.85)',
    borderRadius: BorderRadius.xs,
    paddingHorizontal: scaleWidth(8),
    paddingVertical: scaleHeight(2),
    marginTop: scaleHeight(4),
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nameText: {
    color: Colors.textPrimary,
    fontSize: 9,
    fontWeight: FontWeight.semibold,
  },
});
