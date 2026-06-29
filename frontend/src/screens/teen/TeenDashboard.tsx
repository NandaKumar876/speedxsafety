// ============================================
// SpeedxSafety - Teen Dashboard (Spatial Edition)
// Premium speedometer, floating cards, ambient glow
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SpeedGauge } from '../../components/SpeedGauge';
import { GlassCard, StatCard, StatusBadge } from '../../components/common';
import { FloatingOrbs, PulseRing } from '../../components/common/SpatialComponents';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { Springs, Duration } from '../../constants/spatial';
import { scaleWidth, scaleHeight, scaleFont, getSafeAreaTop, useResponsive } from '../../utils/responsive';
import { canUseNativeDriver } from '../../utils/platform';
import { getCurrentUser } from '../../services/authService';
import { getTrips } from '../../services/dataService';
import { supabase } from '../../services/supabase';
import { ActivityIndicator } from 'react-native';

export const TeenDashboard = ({ navigation }: any) => {
  const [teen, setTeen] = useState<any>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [speed, setSpeed] = useState(0);
  const [isDriving, setIsDriving] = useState(false);
  const sosPulse = useRef(new Animated.Value(1)).current;
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(20)).current;
  const driveButtonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const entranceAnim = Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: Duration.entrance, useNativeDriver: canUseNativeDriver }),
      Animated.spring(headerSlide, { toValue: 0, ...Springs.gentle }),
    ]);
    entranceAnim.start();

    const loadTeenData = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          let { data: teenData } = await supabase
            .from('teens')
            .select('*')
            .eq('user_uid', currentUser.id)
            .maybeSingle();

          if (!teenData) {
            const { data: newTeen } = await supabase
              .from('teens')
              .insert({
                user_uid: currentUser.id,
                name: currentUser.profile?.name || currentUser.user_metadata?.full_name || 'Teen Rider',
                speed_limit: 80,
                curfew_start: '22:00',
                curfew_end: '06:00',
                safety_score: 100,
                is_driving: false,
                streak_days: 0
              })
              .select()
              .single();
            teenData = newTeen;
          }

          if (teenData) {
            setTeen(teenData);
            const recentTrips = await getTrips(teenData.teen_id);
            setTrips(recentTrips);
          }
        }
      } catch (err) {
        console.warn('Failed to load teen dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTeenData();
  }, []);

  // Animate speed for demo
  useEffect(() => {
    if (isDriving) {
      const interval = setInterval(() => {
        setSpeed(prev => {
          const delta = (Math.random() - 0.45) * 8;
          return Math.max(0, Math.min(prev + delta, 120));
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setSpeed(0);
    }
  }, [isDriving]);

  // SOS pulse animation
  useEffect(() => {
    const sosLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sosPulse, { toValue: 1.08, duration: 700, useNativeDriver: canUseNativeDriver }),
        Animated.timing(sosPulse, { toValue: 1, duration: 700, useNativeDriver: canUseNativeDriver }),
      ])
    );
    sosLoop.start();
    return () => sosLoop.stop();
  }, []);

  if (loading || !teen) {
    return (
      <LinearGradient colors={Colors.gradientBg as any} style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </LinearGradient>
    );
  }

  const isOverLimit = speed > teen.speed_limit;
  const tripDuration = isDriving ? '12:34' : '00:00';
  const tripDistance = isDriving ? '8.2' : '0.0';

  return (
    <LinearGradient colors={Colors.gradientBg as any} style={styles.container}>
      <FloatingOrbs orbs={[
        { color: isDriving && isOverLimit ? 'rgba(239, 68, 68, 0.06)' : 'rgba(108, 99, 255, 0.05)', size: 200, x: -50, y: 60 },
        { color: 'rgba(168, 85, 247, 0.04)', size: 160, x: 280, y: 300 },
      ]} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
          <View>
            <Text style={styles.greeting}>Hey, {teen.name.split(' ')[0]} 👋</Text>
            <Text style={styles.subGreeting}>
              {isDriving ? 'Drive safe!' : 'Ready to ride?'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.streakBadge}>
              <Text style={styles.streakIcon}>🔥</Text>
              <Text style={styles.streakText}>{teen.streak_days}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Speed Status Banner */}
        {isDriving && (
          <GlassCard
            style={[
              styles.statusBanner,
              { borderColor: isOverLimit ? Colors.dangerMuted : Colors.safeMuted },
            ]}
            glowColor={isOverLimit ? Colors.danger : Colors.safe}
            elevation="floating"
          >
            <View style={styles.statusRow}>
              <View style={[styles.statusIconBg, { backgroundColor: isOverLimit ? Colors.dangerMuted : Colors.safeMuted }]}>
                <Ionicons
                  name={isOverLimit ? 'warning' : 'checkmark-circle'}
                  size={18}
                  color={isOverLimit ? Colors.danger : Colors.safe}
                />
              </View>
              <Text style={[styles.statusText, { color: isOverLimit ? Colors.danger : Colors.safe }]}>
                {isOverLimit ? 'SPEED LIMIT EXCEEDED!' : 'Within Speed Limit ✓'}
              </Text>
            </View>
          </GlassCard>
        )}

        {/* Speed Gauge */}
        <View style={styles.gaugeContainer}>
          <SpeedGauge speed={speed} speedLimit={teen.speed_limit} size={scaleWidth(280)} />
        </View>

        {/* Drive Toggle Button */}
        <TouchableOpacity
          style={styles.driveBtn}
          onPress={() => setIsDriving(!isDriving)}
          onPressIn={() => Animated.spring(driveButtonScale, { toValue: 0.95, ...Springs.snappy }).start()}
          onPressOut={() => Animated.spring(driveButtonScale, { toValue: 1, ...Springs.bouncy }).start()}
          activeOpacity={0.9}
        >
          <Animated.View style={{ transform: [{ scale: driveButtonScale }] }}>
            <LinearGradient
              colors={isDriving ? ['#DC2626', '#EF4444', '#F87171'] : ['#15803D', '#22C55E', '#4ADE80']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.driveBtnGradient,
                isDriving ? Shadow.glow(Colors.danger) : Shadow.glow(Colors.safe),
              ]}
            >
              <Ionicons name={isDriving ? 'stop' : 'play'} size={22} color="#fff" />
              <Text style={styles.driveBtnText}>
                {isDriving ? 'End Trip' : 'Start Trip'}
              </Text>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>

        {/* Trip Stats */}
        <View style={styles.statsRow}>
          <StatCard label="Duration" value={tripDuration} icon="⏱️" color={Colors.primaryLight} />
          <View style={{ width: Spacing.md }} />
          <StatCard label="Distance" value={`${tripDistance} km`} icon="📏" color={Colors.primaryLight} />
          <View style={{ width: Spacing.md }} />
          <StatCard label="Score" value={`${teen.safety_score}`} icon="⭐" color={Colors.safe} />
        </View>

        {/* SOS Button */}
        <View style={styles.sosSection}>
          <Animated.View style={{ transform: [{ scale: sosPulse }] }}>
            <TouchableOpacity style={styles.sosBtn} onPress={() => {}} activeOpacity={0.8}>
              <LinearGradient colors={['#DC2626', '#EF4444', '#F87171']} style={[styles.sosBtnGradient, Shadow.glowIntense(Colors.danger)]}>
                <Ionicons name="alert-circle" size={30} color="#fff" />
                <Text style={styles.sosBtnText}>SOS</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
          <Text style={styles.sosHint}>Press for emergency — shares your location</Text>
        </View>

        {/* Recent Trips Preview */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Trips</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Trips')} activeOpacity={0.7}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {trips.slice(0, 2).map((trip: Trip, idx: number) => (
            <GlassCard key={trip.trip_id} style={styles.tripCard} animated delay={idx * 100}>
              <View style={styles.tripRow}>
                <View style={styles.tripInfo}>
                  <Text style={styles.tripDate}>
                    {new Date(trip.start_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </Text>
                  <Text style={styles.tripMeta}>
                    {trip.distance_km} km · Max {trip.max_speed} km/h
                  </Text>
                </View>
                <StatusBadge
                  label={trip.safety_grade}
                  color={
                    trip.safety_grade === 'A' ? Colors.safe :
                    trip.safety_grade === 'B' ? Colors.primaryLight :
                    trip.safety_grade === 'C' ? Colors.warning :
                    Colors.danger
                  }
                  small
                />
              </View>
            </GlassCard>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: getSafeAreaTop() + 12,
    paddingBottom: scaleHeight(120),
    alignSelf: 'center',
    width: '100%',
    maxWidth: 800,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  greeting: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: FontSize.md,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.round,
    paddingHorizontal: scaleWidth(14),
    paddingVertical: scaleHeight(8),
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
    ...Shadow.sm,
  },
  streakIcon: { fontSize: scaleFont(15) },
  streakText: {
    color: Colors.warning,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.md,
  },
  statusBanner: {
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  statusIconBg: {
    width: scaleWidth(28),
    height: scaleWidth(28),
    borderRadius: scaleWidth(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.sm,
    letterSpacing: 0.3,
  },
  gaugeContainer: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  driveBtn: {
    marginHorizontal: scaleWidth(16),
    marginBottom: Spacing.xxl,
  },
  driveBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: scaleHeight(56),
    borderRadius: BorderRadius.xl,
    gap: Spacing.md,
  },
  driveBtnText: {
    color: '#fff',
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.3,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xxl,
  },
  sosSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  sosBtn: {
    marginBottom: Spacing.sm,
  },
  sosBtnGradient: {
    width: scaleWidth(84),
    height: scaleWidth(84),
    borderRadius: scaleWidth(42),
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosBtnText: {
    color: '#fff',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.heavy,
    marginTop: 1,
    letterSpacing: 1,
  },
  sosHint: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
  recentSection: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  seeAll: {
    fontSize: FontSize.sm,
    color: Colors.primaryLight,
    fontWeight: FontWeight.semibold,
  },
  tripCard: {
    marginBottom: Spacing.md,
    paddingVertical: Spacing.md,
  },
  tripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripInfo: {},
  tripDate: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  tripMeta: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
});
