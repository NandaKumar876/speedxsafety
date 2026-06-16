// ============================================
// SpeedxSafety - Live Tracking Screen
// Realistic animated bike/car tracking on map
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../../components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { scaleWidth, scaleHeight, scaleFont } from '../../utils/responsive';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Simulated route coordinates (normalized 0-1 positions on screen)
const ROUTE_POINTS = [
  { x: 0.15, y: 0.65 },
  { x: 0.22, y: 0.58 },
  { x: 0.30, y: 0.52 },
  { x: 0.35, y: 0.48 },
  { x: 0.42, y: 0.44 },
  { x: 0.50, y: 0.40 },
  { x: 0.55, y: 0.38 },
  { x: 0.62, y: 0.35 },
  { x: 0.68, y: 0.30 },
  { x: 0.72, y: 0.28 },
  { x: 0.78, y: 0.32 },
  { x: 0.82, y: 0.36 },
  { x: 0.85, y: 0.40 },
];

const SPEEDS = [35, 42, 55, 65, 72, 78, 82, 75, 68, 60, 55, 48, 40];
const SPEED_LIMIT = 80;

interface GeofenceZone {
  x: number;
  y: number;
  radius: number;
  label: string;
  color: string;
}

const GEOFENCES: GeofenceZone[] = [
  { x: 0.20, y: 0.60, radius: 60, label: 'Home', color: Colors.safe },
  { x: 0.70, y: 0.30, radius: 50, label: 'School', color: Colors.primary },
];

export const LiveTrackingScreen = ({ navigation }: any) => {
  const [currentPoint, setCurrentPoint] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const markerX = useRef(new Animated.Value(ROUTE_POINTS[0].x * SCREEN_WIDTH)).current;
  const markerY = useRef(new Animated.Value(ROUTE_POINTS[0].y * SCREEN_HEIGHT * 0.7)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;
  const trailOpacity = useRef(new Animated.Value(0)).current;

  // Start trail fade in
  useEffect(() => {
    Animated.timing(trailOpacity, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  // Pulse animation
  useEffect(() => {
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
  }, []);

  // Move along route
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentPoint(prev => {
        const next = (prev + 1) % ROUTE_POINTS.length;
        const point = ROUTE_POINTS[next];
        Animated.parallel([
          Animated.timing(markerX, {
            toValue: point.x * SCREEN_WIDTH,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(markerY, {
            toValue: point.y * SCREEN_HEIGHT * 0.7,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]).start();
        return next;
      });
      setElapsed(prev => prev + 2);
    }, 2000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const currentSpeed = SPEEDS[currentPoint] || 0;
  const isOverLimit = currentSpeed > SPEED_LIMIT;
  const isNearLimit = currentSpeed > SPEED_LIMIT * 0.85;
  const statusColor = isOverLimit ? Colors.danger : isNearLimit ? Colors.warning : Colors.safe;
  const distance = (elapsed * 0.015).toFixed(1);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 3],
  });

  return (
    <View style={styles.container}>
      {/* Map Background */}
      <LinearGradient colors={['#080C2A', '#0D1245', '#0A0F35']} style={styles.mapBg}>
        {/* Grid lines for map feel */}
        {[...Array(12)].map((_, i) => (
          <View key={`h${i}`} style={[styles.gridLineH, { top: `${(i + 1) * 7.7}%` }]} />
        ))}
        {[...Array(8)].map((_, i) => (
          <View key={`v${i}`} style={[styles.gridLineV, { left: `${(i + 1) * 12.5}%` }]} />
        ))}

        {/* Geofence circles */}
        {GEOFENCES.map((zone, idx) => (
          <View
            key={idx}
            style={[
              styles.geofence,
              {
                left: zone.x * SCREEN_WIDTH - zone.radius,
                top: zone.y * SCREEN_HEIGHT * 0.7 - zone.radius,
                width: zone.radius * 2,
                height: zone.radius * 2,
                borderRadius: zone.radius,
                backgroundColor: zone.color + '10',
                borderColor: zone.color + '30',
              },
            ]}
          >
            <Text style={[styles.geofenceLabel, { color: zone.color }]}>{zone.label}</Text>
          </View>
        ))}

        {/* Route trail */}
        <Animated.View style={[styles.trailContainer, { opacity: trailOpacity }]}>
          {ROUTE_POINTS.slice(0, currentPoint + 1).map((point, idx) => {
            if (idx === 0) return null;
            const prev = ROUTE_POINTS[idx - 1];
            const speed = SPEEDS[idx];
            const segColor = speed > SPEED_LIMIT ? Colors.danger : speed > SPEED_LIMIT * 0.85 ? Colors.warning : Colors.safe;
            const dx = (point.x - prev.x) * SCREEN_WIDTH;
            const dy = (point.y - prev.y) * SCREEN_HEIGHT * 0.7;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            return (
              <View
                key={idx}
                style={[
                  styles.routeSegment,
                  {
                    left: prev.x * SCREEN_WIDTH,
                    top: prev.y * SCREEN_HEIGHT * 0.7,
                    width: length,
                    backgroundColor: segColor + '80',
                    transform: [{ rotate: `${angle}deg` }],
                  },
                ]}
              />
            );
          })}
        </Animated.View>

        {/* Start marker */}
        <View style={[styles.startMarker, { left: ROUTE_POINTS[0].x * SCREEN_WIDTH - 8, top: ROUTE_POINTS[0].y * SCREEN_HEIGHT * 0.7 - 8 }]}>
          <Ionicons name="flag" size={14} color={Colors.safe} />
        </View>

        {/* Animated vehicle marker */}
        <Animated.View
          style={[
            styles.markerContainer,
            {
              transform: [
                { translateX: Animated.subtract(markerX, new Animated.Value(20)) },
                { translateY: Animated.subtract(markerY, new Animated.Value(20)) },
              ],
            },
          ]}
        >
          {/* Pulse ring */}
          <Animated.View
            style={[
              styles.markerPulse,
              {
                backgroundColor: statusColor + '20',
                borderColor: statusColor + '40',
                transform: [{ scale: pulseScale }],
                opacity: pulseOpacity,
              },
            ]}
          />
          {/* Vehicle */}
          <View style={[styles.vehicleMarker, { backgroundColor: statusColor }, Shadow.glow(statusColor)]}>
            <Ionicons name="bicycle" size={18} color="#fff" />
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <View style={[styles.liveDot, { backgroundColor: statusColor }]} />
          <Text style={styles.liveText}>Live Tracking</Text>
        </View>
        <TouchableOpacity onPress={() => setIsPaused(!isPaused)} style={styles.pauseBtn} activeOpacity={0.7}>
          <Ionicons name={isPaused ? 'play' : 'pause'} size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Bottom info panel */}
      <View style={styles.bottomPanel}>
        {/* Speed indicator */}
        <GlassCard style={[styles.speedCard, { borderColor: statusColor + '40' }]}>
          <View style={styles.speedRow}>
            <View style={styles.speedMain}>
              <Text style={[styles.speedValue, { color: statusColor }]}>{Math.round(currentSpeed)}</Text>
              <Text style={styles.speedUnit}>km/h</Text>
            </View>
            <View style={styles.speedDivider} />
            <View style={styles.speedLimitSection}>
              <Text style={styles.limitLabel}>LIMIT</Text>
              <Text style={styles.limitValue}>{SPEED_LIMIT}</Text>
            </View>
          </View>
          {isOverLimit && (
            <View style={styles.warningBanner}>
              <Ionicons name="warning" size={14} color={Colors.danger} />
              <Text style={styles.warningText}>Speed limit exceeded!</Text>
            </View>
          )}
        </GlassCard>

        {/* Trip stats */}
        <View style={styles.tripStats}>
          <View style={styles.tripStat}>
            <Ionicons name="time-outline" size={16} color={Colors.primaryLight} />
            <Text style={styles.tripStatValue}>{minutes}:{seconds.toString().padStart(2, '0')}</Text>
            <Text style={styles.tripStatLabel}>Duration</Text>
          </View>
          <View style={styles.tripStatDivider} />
          <View style={styles.tripStat}>
            <Ionicons name="navigate-outline" size={16} color={Colors.safe} />
            <Text style={styles.tripStatValue}>{distance}</Text>
            <Text style={styles.tripStatLabel}>km</Text>
          </View>
          <View style={styles.tripStatDivider} />
          <View style={styles.tripStat}>
            <Ionicons name="shield-checkmark-outline" size={16} color={isOverLimit ? Colors.danger : Colors.safe} />
            <Text style={[styles.tripStatValue, { color: isOverLimit ? Colors.danger : Colors.safe }]}>
              {isOverLimit ? 'Alert' : 'Safe'}
            </Text>
            <Text style={styles.tripStatLabel}>Status</Text>
          </View>
        </View>

        {/* Rider info */}
        <View style={styles.riderInfo}>
          <LinearGradient colors={['#7C3AED', '#A855F7']} style={styles.riderAvatar}>
            <Text style={styles.riderInitial}>A</Text>
          </LinearGradient>
          <View style={styles.riderDetails}>
            <Text style={styles.riderName}>Alex Johnson</Text>
            <Text style={styles.riderRoute}>Home → School</Text>
          </View>
          <TouchableOpacity style={styles.callBtn} activeOpacity={0.7}>
            <Ionicons name="call" size={18} color={Colors.safe} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  mapBg: { flex: 1, position: 'relative', overflow: 'hidden' },
  gridLineH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(108, 99, 255, 0.04)' },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(108, 99, 255, 0.04)' },
  geofence: {
    position: 'absolute',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  geofenceLabel: { fontSize: 10, fontWeight: FontWeight.semibold },
  trailContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  routeSegment: {
    position: 'absolute',
    height: 3,
    borderRadius: 1.5,
    transformOrigin: 'left center',
  },
  startMarker: {
    position: 'absolute',
    width: scaleWidth(20),
    height: scaleWidth(20),
    borderRadius: scaleWidth(10),
    backgroundColor: Colors.safe + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.safe + '40',
  },
  markerContainer: {
    position: 'absolute',
    width: scaleWidth(40),
    height: scaleWidth(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerPulse: {
    position: 'absolute',
    width: scaleWidth(40),
    height: scaleWidth(40),
    borderRadius: scaleWidth(20),
    borderWidth: 1.5,
  },
  vehicleMarker: {
    width: scaleWidth(36),
    height: scaleWidth(36),
    borderRadius: scaleWidth(18),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  topBar: {
    position: 'absolute',
    top: scaleHeight(50),
    left: Spacing.xl,
    right: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: scaleWidth(42),
    height: scaleWidth(42),
    borderRadius: scaleWidth(14),
    backgroundColor: 'rgba(6, 8, 26, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  topBarCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(6, 8, 26, 0.8)',
    borderRadius: BorderRadius.round,
    paddingHorizontal: scaleWidth(14),
    paddingVertical: scaleHeight(8),
    borderWidth: 1,
    borderColor: Colors.border,
  },
  liveDot: {
    width: scaleWidth(8),
    height: scaleWidth(8),
    borderRadius: scaleWidth(4),
  },
  liveText: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  pauseBtn: {
    width: scaleWidth(42),
    height: scaleWidth(42),
    borderRadius: scaleWidth(14),
    backgroundColor: 'rgba(6, 8, 26, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(6, 8, 26, 0.95)',
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: scaleHeight(40),
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  speedCard: {
    marginBottom: Spacing.lg,
  },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speedMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  speedValue: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.heavy,
    letterSpacing: -2,
  },
  speedUnit: {
    fontSize: FontSize.md,
    color: Colors.textTertiary,
    fontWeight: FontWeight.medium,
  },
  speedDivider: {
    width: 1,
    height: scaleHeight(40),
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.lg,
  },
  speedLimitSection: {
    alignItems: 'center',
  },
  limitLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: FontWeight.semibold,
    letterSpacing: 1,
  },
  limitValue: {
    fontSize: FontSize.xxl,
    color: Colors.textSecondary,
    fontWeight: FontWeight.bold,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.danger + '15',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.md,
  },
  warningText: {
    color: Colors.danger,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  tripStats: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  tripStat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  tripStatValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  tripStatLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: FontWeight.medium,
  },
  tripStatDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.border,
  },
  riderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  riderAvatar: {
    width: scaleWidth(40),
    height: scaleWidth(40),
    borderRadius: scaleWidth(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  riderInitial: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  riderDetails: { flex: 1 },
  riderName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  riderRoute: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 1 },
  callBtn: {
    width: scaleWidth(40),
    height: scaleWidth(40),
    borderRadius: scaleWidth(12),
    backgroundColor: Colors.safe + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.safe + '30',
  },
});
