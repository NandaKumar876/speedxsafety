// ============================================
// SpeedxSafety - Live Tracking Screen (Spatial Edition)
// Realistic animated bike/car tracking on map with premium overlays
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { GlassCard } from '../../components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { scaleWidth, scaleHeight, scaleFont, getSafeAreaBottom } from '../../utils/responsive';
import { AmbientGlow } from '../../components/common/SpatialComponents';
import { canUseNativeDriver } from '../../utils/platform';

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
  const markerY = useRef(new Animated.Value(ROUTE_POINTS[0].y * SCREEN_HEIGHT * 0.65)).current;
  
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;
  const trailOpacity = useRef(new Animated.Value(0)).current;
  const panelFade = useRef(new Animated.Value(0)).current;

  // Start trail and panel animations
  useEffect(() => {
    const entranceAnim = Animated.parallel([
      Animated.timing(trailOpacity, { toValue: 1, duration: 800, useNativeDriver: canUseNativeDriver }),
      Animated.timing(panelFade, { toValue: 1, duration: 600, useNativeDriver: canUseNativeDriver }),
    ]);
    entranceAnim.start();
    return () => entranceAnim.stop();
  }, []);

  // Pulse animation
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 1600, useNativeDriver: canUseNativeDriver }),
          Animated.timing(pulseAnim, { toValue: 0, duration: 0, useNativeDriver: canUseNativeDriver }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, { toValue: 0, duration: 1600, useNativeDriver: canUseNativeDriver }),
          Animated.timing(pulseOpacity, { toValue: 0.6, duration: 0, useNativeDriver: canUseNativeDriver }),
        ]),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
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
            useNativeDriver: canUseNativeDriver,
          }),
          Animated.timing(markerY, {
            toValue: point.y * SCREEN_HEIGHT * 0.65,
            duration: 2000,
            useNativeDriver: canUseNativeDriver,
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
    outputRange: [1, 3.2],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Map Background */}
      <LinearGradient colors={['#050714', '#0B0F30', '#070A20']} style={styles.mapBg}>
        {/* Grid lines for map feel */}
        {[...Array(14)].map((_, i) => (
          <View key={`h${i}`} style={[styles.gridLineH, { top: `${(i + 1) * 7}%` }]} />
        ))}
        {[...Array(9)].map((_, i) => (
          <View key={`v${i}`} style={[styles.gridLineV, { left: `${(i + 1) * 11.1}%` }]} />
        ))}

        {/* Ambient Glows around major geofence hotspots */}
        {GEOFENCES.map((zone, idx) => (
          <AmbientGlow
            key={`glow-${idx}`}
            color={zone.color}
            size={zone.radius * 2.8}
            intensity={0.06}
            style={{
              position: 'absolute',
              left: zone.x * SCREEN_WIDTH - zone.radius * 1.4,
              top: zone.y * SCREEN_HEIGHT * 0.65 - zone.radius * 1.4,
            }}
          />
        ))}

        {/* Geofence circles */}
        {GEOFENCES.map((zone, idx) => (
          <View
            key={idx}
            style={[
              styles.geofence,
              {
                left: zone.x * SCREEN_WIDTH - zone.radius,
                top: zone.y * SCREEN_HEIGHT * 0.65 - zone.radius,
                width: zone.radius * 2,
                height: zone.radius * 2,
                borderRadius: zone.radius,
                backgroundColor: zone.color + '07',
                borderColor: zone.color + '40',
              },
            ]}
          >
            <View style={[styles.geofenceBadge, { backgroundColor: zone.color + '15', borderColor: zone.color + '30' }]}>
              <Text style={[styles.geofenceLabel, { color: zone.color }]}>{zone.label}</Text>
            </View>
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
            const dy = (point.y - prev.y) * SCREEN_HEIGHT * 0.65;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            const midX = (prev.x + point.x) * 0.5 * SCREEN_WIDTH;
            const midY = (prev.y + point.y) * 0.5 * SCREEN_HEIGHT * 0.65;
            return (
              <View
                key={idx}
                style={[
                  styles.routeSegment,
                  {
                    left: midX - length / 2,
                    top: midY - 3.5 / 2,
                    width: length,
                    backgroundColor: segColor + '90',
                    transform: [{ rotate: `${angle}deg` }],
                    ...Shadow.glowSoft(segColor),
                  },
                ]}
              />
            );
          })}
        </Animated.View>

        {/* Start marker */}
        <View style={[styles.startMarker, { left: ROUTE_POINTS[0].x * SCREEN_WIDTH - 10, top: ROUTE_POINTS[0].y * SCREEN_HEIGHT * 0.65 - 10 }]}>
          <Ionicons name="flag" size={12} color={Colors.safe} />
        </View>

        {/* Animated vehicle marker */}
        <Animated.View
          style={[
            styles.markerContainer,
            {
              transform: [
                { translateX: markerX },
                { translateY: markerY },
                { translateX: -22 },
                { translateY: -22 },
              ],
            },
          ]}
        >
          {/* Pulse ring */}
          <Animated.View
            style={[
              styles.markerPulse,
              {
                backgroundColor: statusColor + '15',
                borderColor: statusColor + '40',
                transform: [{ scale: pulseScale }],
                opacity: pulseOpacity,
              },
            ]}
          />
          {/* Vehicle */}
          <View style={[styles.vehicleMarker, { backgroundColor: statusColor, borderColor: '#fff' }, Shadow.glowIntense(statusColor)]}>
            <Ionicons name="bicycle" size={20} color="#fff" />
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        
        <View style={styles.topBarCenter}>
          <View style={[styles.liveDot, { backgroundColor: statusColor }, Shadow.glow(statusColor)]} />
          <Text style={styles.liveText}>Live Tracking</Text>
        </View>

        <TouchableOpacity onPress={() => setIsPaused(!isPaused)} style={styles.pauseBtn} activeOpacity={0.8}>
          <Ionicons name={isPaused ? 'play' : 'pause'} size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Bottom info panel (Floating Spatial Panel) */}
      <Animated.View style={[styles.bottomPanel, { opacity: panelFade }]}>
        <BlurView intensity={50} tint="dark" style={styles.bottomPanelBlur}>
          
          {/* Speed indicator with premium details */}
          <GlassCard style={[styles.speedCard, { borderColor: statusColor + '30', backgroundColor: 'rgba(255, 255, 255, 0.02)' }]}>
            <View style={styles.speedRow}>
              <View style={styles.speedMain}>
                <Text style={[styles.speedValue, { color: statusColor }, Shadow.glowSoft(statusColor)]}>
                  {Math.round(currentSpeed)}
                </Text>
                <Text style={styles.speedUnit}>km/h</Text>
              </View>
              <View style={styles.speedDivider} />
              <View style={styles.speedLimitSection}>
                <Text style={styles.limitLabel}>LIMIT</Text>
                <View style={styles.limitBadge}>
                  <Text style={styles.limitValue}>{SPEED_LIMIT}</Text>
                </View>
              </View>
            </View>
            {isOverLimit && (
              <View style={styles.warningBanner}>
                <Ionicons name="warning" size={14} color={Colors.danger} />
                <Text style={styles.warningText}>Speed limit exceeded!</Text>
              </View>
            )}
          </GlassCard>

          {/* Trip stats grid */}
          <View style={styles.tripStats}>
            <View style={styles.tripStat}>
              <View style={[styles.statIconContainer, { backgroundColor: Colors.primary + '15' }]}>
                <Ionicons name="time" size={16} color={Colors.primaryLight} />
              </View>
              <Text style={styles.tripStatValue}>{minutes}:{seconds.toString().padStart(2, '0')}</Text>
              <Text style={styles.tripStatLabel}>Duration</Text>
            </View>
            <View style={styles.tripStatDivider} />
            <View style={styles.tripStat}>
              <View style={[styles.statIconContainer, { backgroundColor: Colors.safe + '15' }]}>
                <Ionicons name="navigate" size={16} color={Colors.safeLight} />
              </View>
              <Text style={styles.tripStatValue}>{distance}</Text>
              <Text style={styles.tripStatLabel}>km</Text>
            </View>
            <View style={styles.tripStatDivider} />
            <View style={styles.tripStat}>
              <View style={[styles.statIconContainer, { backgroundColor: (isOverLimit ? Colors.danger : Colors.safe) + '15' }]}>
                <Ionicons name={isOverLimit ? 'warning' : 'shield-checkmark'} size={16} color={isOverLimit ? Colors.dangerLight : Colors.safeLight} />
              </View>
              <Text style={[styles.tripStatValue, { color: isOverLimit ? Colors.danger : Colors.safe }]}>
                {isOverLimit ? 'ALERT' : 'SAFE'}
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
            <TouchableOpacity style={styles.callBtn} activeOpacity={0.8}>
              <Ionicons name="call" size={18} color={Colors.safe} />
            </TouchableOpacity>
          </View>

        </BlurView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  mapBg: { flex: 1, position: 'relative', overflow: 'hidden' },
  gridLineH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(108, 99, 255, 0.03)' },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(108, 99, 255, 0.03)' },
  geofence: {
    position: 'absolute',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  geofenceBadge: {
    paddingHorizontal: scaleWidth(10),
    paddingVertical: scaleHeight(4),
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  geofenceLabel: { fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.5 },
  trailContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  routeSegment: {
    position: 'absolute',
    height: 3.5,
    borderRadius: 2,
  },
  startMarker: {
    position: 'absolute',
    width: scaleWidth(24),
    height: scaleWidth(24),
    borderRadius: scaleWidth(12),
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.safe + '60',
  },
  markerContainer: {
    position: 'absolute',
    width: scaleWidth(44),
    height: scaleWidth(44),
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerPulse: {
    position: 'absolute',
    width: scaleWidth(44),
    height: scaleWidth(44),
    borderRadius: scaleWidth(22),
    borderWidth: 1.5,
  },
  vehicleMarker: {
    width: scaleWidth(38),
    height: scaleWidth(38),
    borderRadius: scaleWidth(19),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  topBar: {
    position: 'absolute',
    top: scaleHeight(55),
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  backBtn: {
    width: scaleWidth(44),
    height: scaleWidth(44),
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(10, 14, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: Colors.borderMedium,
    ...Shadow.sm,
  },
  topBarCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(10, 14, 42, 0.75)',
    borderRadius: BorderRadius.round,
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(8),
    borderWidth: 1.2,
    borderColor: Colors.borderMedium,
    ...Shadow.sm,
  },
  liveDot: {
    width: scaleWidth(8),
    height: scaleWidth(8),
    borderRadius: scaleWidth(4),
  },
  liveText: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: FontWeight.bold, letterSpacing: 0.5 },
  pauseBtn: {
    width: scaleWidth(44),
    height: scaleWidth(44),
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(10, 14, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: Colors.borderMedium,
    ...Shadow.sm,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: getSafeAreaBottom() + scaleHeight(12),
    left: Spacing.lg,
    right: Spacing.lg,
    borderRadius: BorderRadius.xxl,
    borderWidth: 1.5,
    borderColor: Colors.borderMedium,
    overflow: 'hidden',
    ...Shadow.lg,
  },
  bottomPanelBlur: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    backgroundColor: 'rgba(5, 7, 20, 0.85)',
  },
  speedCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
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
    fontSize: scaleFont(44),
    fontWeight: FontWeight.heavy,
    letterSpacing: -1.5,
  },
  speedUnit: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    fontWeight: FontWeight.semibold,
  },
  speedDivider: {
    width: 1,
    height: scaleHeight(36),
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  speedLimitSection: {
    alignItems: 'center',
    gap: 2,
  },
  limitLabel: {
    fontSize: 9,
    color: Colors.textTertiary,
    fontWeight: FontWeight.heavy,
    letterSpacing: 1.2,
  },
  limitBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.xs,
    paddingHorizontal: scaleWidth(10),
    paddingVertical: scaleHeight(2),
    borderWidth: 1,
    borderColor: Colors.border,
  },
  limitValue: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: FontWeight.bold,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.danger + '12',
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.danger + '25',
  },
  warningText: {
    color: Colors.dangerLight,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  tripStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  tripStat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statIconContainer: {
    width: scaleWidth(28),
    height: scaleWidth(28),
    borderRadius: BorderRadius.xs,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  tripStatValue: {
    fontSize: FontSize.md,
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
    height: '70%',
    alignSelf: 'center',
    backgroundColor: Colors.borderLight,
  },
  riderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  riderAvatar: {
    width: scaleWidth(42),
    height: scaleWidth(42),
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.glowSoft('#7C3AED'),
  },
  riderInitial: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  riderDetails: { flex: 1 },
  riderName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  riderRoute: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 1 },
  callBtn: {
    width: scaleWidth(42),
    height: scaleWidth(42),
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.safe + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: Colors.safe + '30',
  },
});
