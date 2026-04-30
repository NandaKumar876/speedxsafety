// ============================================
// SpeedxSafety - Teen Dashboard (Speedometer)
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SpeedGauge } from '../../components/SpeedGauge';
import { GlassCard, StatCard, StatusBadge } from '../../components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { mockTeens, mockTrips } from '../../constants/mockData';

export const TeenDashboard = ({ navigation }: any) => {
  const teen = mockTeens[0];
  const [speed, setSpeed] = useState(0);
  const [isDriving, setIsDriving] = useState(false);
  const sosPulse = useRef(new Animated.Value(1)).current;

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
    Animated.loop(
      Animated.sequence([
        Animated.timing(sosPulse, { toValue: 1.1, duration: 800, useNativeDriver: true }),
        Animated.timing(sosPulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const isOverLimit = speed > teen.speed_limit;
  const tripDuration = isDriving ? '12:34' : '00:00';
  const tripDistance = isDriving ? '8.2' : '0.0';

  return (
    <LinearGradient colors={['#0A0E27', '#111538', '#1A1E3A']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hey, {teen.name.split(' ')[0]} 👋</Text>
            <Text style={styles.subGreeting}>
              {isDriving ? 'Drive safe!' : 'Ready to drive?'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.streakBadge}>
              <Text style={styles.streakIcon}>🔥</Text>
              <Text style={styles.streakText}>{teen.streak_days}</Text>
            </View>
          </View>
        </View>

        {/* Speed Status Banner */}
        {isDriving && (
          <GlassCard style={[
            styles.statusBanner,
            { borderColor: isOverLimit ? Colors.danger + '40' : Colors.safe + '40' }
          ]}>
            <View style={styles.statusRow}>
              <Ionicons 
                name={isOverLimit ? 'warning' : 'checkmark-circle'} 
                size={20} 
                color={isOverLimit ? Colors.danger : Colors.safe} 
              />
              <Text style={[styles.statusText, { color: isOverLimit ? Colors.danger : Colors.safe }]}>
                {isOverLimit ? 'SPEED LIMIT EXCEEDED!' : 'Within Speed Limit ✓'}
              </Text>
            </View>
          </GlassCard>
        )}

        {/* Speed Gauge */}
        <View style={styles.gaugeContainer}>
          <SpeedGauge speed={speed} speedLimit={teen.speed_limit} />
        </View>

        {/* Drive Toggle Button */}
        <TouchableOpacity
          style={[styles.driveBtn, isDriving && styles.driveBtnActive]}
          onPress={() => setIsDriving(!isDriving)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isDriving ? ['#FF3B30', '#FF6961'] : ['#34C759', '#30D158']}
            style={styles.driveBtnGradient}
          >
            <Ionicons name={isDriving ? 'stop' : 'play'} size={24} color="#fff" />
            <Text style={styles.driveBtnText}>
              {isDriving ? 'End Trip' : 'Start Trip'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Trip Stats */}
        <View style={styles.statsRow}>
          <StatCard label="Duration" value={tripDuration} icon="⏱️" color={Colors.primary} />
          <View style={{ width: Spacing.md }} />
          <StatCard label="Distance" value={`${tripDistance} km`} icon="📏" color={Colors.primaryLight} />
          <View style={{ width: Spacing.md }} />
          <StatCard label="Score" value={`${teen.safety_score}`} icon="⭐" color={Colors.safe} />
        </View>

        {/* SOS Button */}
        <View style={styles.sosSection}>
          <Animated.View style={{ transform: [{ scale: sosPulse }] }}>
            <TouchableOpacity
              style={styles.sosBtn}
              onPress={() => {}}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF3B30', '#FF6961']}
                style={styles.sosBtnGradient}
              >
                <Ionicons name="alert-circle" size={28} color="#fff" />
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
            <TouchableOpacity onPress={() => navigation.navigate('Trips')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {mockTrips.slice(0, 2).map(trip => (
            <GlassCard key={trip.trip_id} style={styles.tripCard}>
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
    paddingTop: 60,
    paddingBottom: 100,
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  streakIcon: { fontSize: 16 },
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
  statusText: {
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.sm,
  },
  gaugeContainer: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  driveBtn: {
    marginHorizontal: Spacing.xxxl,
    marginBottom: Spacing.xxl,
  },
  driveBtnActive: {},
  driveBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: BorderRadius.xl,
    gap: Spacing.md,
    ...Shadow.md,
  },
  driveBtnText: {
    color: '#fff',
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
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
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.lg,
  },
  sosBtnText: {
    color: '#fff',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.heavy,
    marginTop: 2,
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
    color: Colors.primary,
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
