// ============================================
// SpeedxSafety - Parent Dashboard (Spatial Edition)
// ============================================

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard, StatusBadge, SectionHeader } from '../../components/common';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '../../constants/theme';
import { Springs, Duration } from '../../constants/spatial';
import { scaleWidth, scaleHeight, scaleFont, getSafeAreaTop, useResponsive } from '../../utils/responsive';
import { canUseNativeDriver } from '../../utils/platform';
import { getTeens, getAlerts } from '../../services/dataService';
import { getCurrentUser } from '../../services/authService';
import { useState } from 'react';

export const ParentDashboard = ({ navigation }: any) => {
  const [user, setUser] = useState<any>(null);
  const [teens, setTeens] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { screenWidth, columns, isMobile } = useResponsive();

  const unreadAlerts = alerts.filter(a => !a.read).length;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, { toValue: 1, duration: Duration.entrance, useNativeDriver: canUseNativeDriver }),
      Animated.spring(headerSlide, { toValue: 0, ...Springs.gentle }),
    ]).start();

    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          const parentId = currentUser.id;
          const fetchedTeens = await getTeens(parentId);
          const fetchedAlerts = await getAlerts(parentId);
          setTeens(fetchedTeens);
          setAlerts(fetchedAlerts);
        }
      } catch (err) {
        console.warn('Failed to load parent dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <LinearGradient colors={Colors.gradientBg as any} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: headerAnim, transform: [{ translateY: headerSlide }] }]}>
          <View>
            <Text style={styles.greeting}>Welcome back 👋</Text>
            <Text style={styles.subGreeting}>Your family's driving overview</Text>
          </View>
          <TouchableOpacity style={styles.alertBtn} onPress={() => navigation.navigate('Alerts')} activeOpacity={0.7}>
            <Ionicons name="notifications" size={20} color={Colors.textPrimary} />
            {unreadAlerts > 0 && (
              <View style={styles.alertBadge}>
                <Text style={styles.alertBadgeText}>{unreadAlerts}</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Live Map Preview */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('LiveTracking')}>
          <GlassCard style={styles.mapCard} animated delay={100} elevation="floating">
            <View style={styles.mapPlaceholder}>
              <LinearGradient colors={['#060A1E', '#0D1245', '#060A1E']} style={styles.mapGradient}>
                <View style={styles.mapGrid}>
                  {[...Array(5)].map((_, i) => (
                    <View key={`h${i}`} style={[styles.gridLineH, { top: `${20 * (i + 1)}%` }]} />
                  ))}
                  {[...Array(5)].map((_, i) => (
                    <View key={`v${i}`} style={[styles.gridLineV, { left: `${20 * (i + 1)}%` }]} />
                  ))}
                </View>

                {teens.map((teen, index) => (
                  <View key={teen.teen_id} style={[styles.mapPin, { top: `${20 + index * 35}%`, left: `${15 + index * 40}%` }]}>
                    <LinearGradient
                      colors={teen.is_driving ? ['#22C55E', '#10B981'] : ['#475569', '#64748B']}
                      style={styles.pinDot}
                    >
                      <Ionicons name="bicycle" size={12} color="#fff" />
                    </LinearGradient>
                    <View style={styles.pinLabel}>
                      <Text style={styles.pinName}>{teen.name.split(' ')[0]}</Text>
                      {teen.is_driving && <Text style={styles.pinSpeed}>{teen.current_speed} km/h</Text>}
                    </View>
                  </View>
                ))}

                <View style={styles.mapLabel}>
                  <View style={styles.liveIndicator}>
                    <View style={styles.liveDot} />
                    <Text style={styles.mapLabelText}>Live Map</Text>
                  </View>
                  <View style={styles.tapHint}>
                    <Text style={styles.tapHintText}>Tap to track</Text>
                    <Ionicons name="arrow-forward" size={12} color={Colors.primaryLight} />
                  </View>
                </View>
              </LinearGradient>
            </View>
          </GlassCard>
        </TouchableOpacity>

        {/* Teen Cards */}
        <SectionHeader title="Your Riders" />
        {teens.map((teen, idx) => {
          const isOver = (teen.current_speed || 0) > teen.speed_limit;
          return (
            <GlassCard
              key={teen.teen_id}
              style={[styles.teenCard, teen.is_driving && isOver && { borderColor: Colors.dangerMuted }]}
              animated delay={300 + idx * 120}
              glowColor={teen.is_driving && isOver ? Colors.danger : undefined}
            >
              <View style={styles.teenHeader}>
                <View style={styles.teenLeft}>
                  <LinearGradient
                    colors={teen.is_driving ? (isOver ? ['#DC2626', '#EF4444'] : ['#15803D', '#22C55E']) : ['#334155', '#475569']}
                    style={styles.teenAvatar}
                  >
                    <Text style={styles.teenInitial}>{teen.name[0]}</Text>
                  </LinearGradient>
                  <View>
                    <Text style={styles.teenName}>{teen.name}</Text>
                    <StatusBadge
                      label={teen.is_driving ? (isOver ? 'Over Limit!' : 'Driving') : 'Parked'}
                      color={teen.is_driving ? (isOver ? Colors.danger : Colors.safe) : Colors.textTertiary}
                      small
                      pulse={teen.is_driving && isOver}
                    />
                  </View>
                </View>
                <View style={styles.teenRight}>
                  {teen.is_driving ? (
                    <View style={styles.speedDisplay}>
                      <Text style={[styles.currentSpeed, { color: isOver ? Colors.danger : Colors.safe }]}>
                        {teen.current_speed}
                      </Text>
                      <Text style={styles.speedUnit}>km/h</Text>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.trackBtn} onPress={() => navigation.navigate('LiveTracking')} activeOpacity={0.7}>
                      <Ionicons name="locate-outline" size={16} color={Colors.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.teenStats}>
                <View style={styles.teenStat}>
                  <Text style={styles.teenStatLabel}>Safety Score</Text>
                  <View style={styles.scoreRow}>
                    <View style={styles.scoreBg}>
                      <LinearGradient
                        colors={teen.safety_score >= 80 ? (Colors.gradientSafe as any) : (Colors.gradientWarning as any)}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={[styles.scoreFill, { width: `${teen.safety_score}%` }]}
                      />
                    </View>
                    <Text style={[styles.scoreText, { color: teen.safety_score >= 80 ? Colors.safe : Colors.warning }]}>
                      {teen.safety_score}
                    </Text>
                  </View>
                </View>
                <View style={styles.teenStat}>
                  <Text style={styles.teenStatLabel}>Streak</Text>
                  <Text style={styles.teenStatValue}>🔥 {teen.streak_days} days</Text>
                </View>
                <View style={styles.teenStat}>
                  <Text style={styles.teenStatLabel}>Limit</Text>
                  <Text style={styles.teenStatValue}>{teen.speed_limit} km/h</Text>
                </View>
              </View>

              {teen.is_driving && (
                <TouchableOpacity style={styles.trackLiveBtn} onPress={() => navigation.navigate('LiveTracking')} activeOpacity={0.7}>
                  <LinearGradient colors={Colors.gradientPrimary as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.trackLiveGradient}>
                    <Ionicons name="navigate" size={14} color="#fff" />
                    <Text style={styles.trackLiveText}>Track Live</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </GlassCard>
          );
        })}

        {/* Recent Alerts */}
        <SectionHeader title="Recent Alerts" action="View All" onAction={() => navigation.navigate('Alerts')} />
        {alerts.slice(0, 3).map((alert, idx) => (
          <GlassCard key={alert.alert_id} style={[styles.alertCard, !alert.read && { borderColor: Colors.primaryMuted }]} animated delay={600 + idx * 80}>
            <View style={styles.alertRow}>
              <View style={[styles.alertIcon, { backgroundColor: getAlertColor(alert.type) + '15' }]}>
                <Ionicons name={getAlertIcon(alert.type)} size={18} color={getAlertColor(alert.type)} />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertMessage} numberOfLines={2}>{alert.message}</Text>
                <Text style={styles.alertTime}>{getTimeAgo(alert.timestamp)}</Text>
              </View>
              {!alert.read && <View style={[styles.unreadDot, Shadow.glow(Colors.primaryLight)]} />}
            </View>
          </GlassCard>
        ))}

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" />
        <View style={styles.actionsRow}>
          {[
            { icon: 'speedometer', label: 'Set Limits', color: Colors.primaryLight, nav: 'Settings' },
            { icon: 'location', label: 'Geofences', color: Colors.safe, nav: 'Geofences' },
            { icon: 'stats-chart', label: 'Reports', color: Colors.warning, nav: 'Reports' },
            { icon: 'people', label: 'Manage', color: Colors.accent, nav: 'Settings' },
          ].map((action, idx) => (
            <TouchableOpacity key={idx} style={styles.actionBtn} onPress={() => navigation.navigate(action.nav)} activeOpacity={0.7}>
              <View style={[styles.actionIcon, { backgroundColor: action.color + '12', borderColor: action.color + '20' }]}>
                <Ionicons name={action.icon as any} size={22} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const getAlertIcon = (type: string): any => {
  switch (type) { case 'speed': return 'speedometer'; case 'geo': return 'location'; case 'crash': return 'alert-circle'; case 'curfew': return 'moon'; case 'sos': return 'warning'; default: return 'alert'; }
};
const getAlertColor = (type: string): string => {
  switch (type) { case 'speed': return Colors.danger; case 'geo': return Colors.warning; case 'crash': return Colors.danger; case 'curfew': return Colors.primaryLight; case 'sos': return Colors.danger; default: return Colors.textSecondary; }
};
const getTimeAgo = (timestamp: number): string => {
  const mins = Math.round((Date.now() - timestamp) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: getSafeAreaTop() + 12, paddingBottom: scaleHeight(120), alignSelf: 'center', width: '100%', maxWidth: 1000 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xxl },
  greeting: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, letterSpacing: -0.5 },
  subGreeting: { fontSize: FontSize.md, color: Colors.textTertiary, marginTop: 2 },
  alertBtn: { width: scaleWidth(44), height: scaleWidth(44), borderRadius: scaleWidth(14), backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, justifyContent: 'center', alignItems: 'center', ...Shadow.sm },
  alertBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: Colors.danger, borderRadius: scaleWidth(10), width: scaleWidth(20), height: scaleWidth(20), justifyContent: 'center', alignItems: 'center' },
  alertBadgeText: { color: '#fff', fontSize: 10, fontWeight: FontWeight.bold },
  mapCard: { padding: 0, overflow: 'hidden', marginBottom: Spacing.lg },
  mapPlaceholder: { height: scaleHeight(200), borderRadius: BorderRadius.xl, overflow: 'hidden' },
  mapGradient: { flex: 1, padding: Spacing.lg, position: 'relative' },
  mapGrid: { ...StyleSheet.absoluteFillObject },
  gridLineH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(108, 99, 255, 0.04)' },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(108, 99, 255, 0.04)' },
  mapPin: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 6 },
  pinDot: { width: scaleWidth(28), height: scaleWidth(28), borderRadius: scaleWidth(14), justifyContent: 'center', alignItems: 'center', ...Shadow.sm },
  pinLabel: { backgroundColor: 'rgba(6, 8, 26, 0.80)', borderRadius: scaleWidth(8), paddingHorizontal: scaleWidth(8), paddingVertical: scaleHeight(3), borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)' },
  pinName: { color: '#fff', fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  pinSpeed: { color: Colors.safe, fontSize: 10, fontWeight: FontWeight.bold },
  mapLabel: { position: 'absolute', bottom: Spacing.md, left: Spacing.md, right: Spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(6, 8, 26, 0.75)', borderRadius: scaleWidth(8), paddingHorizontal: scaleWidth(10), paddingVertical: scaleHeight(4), borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)' },
  liveDot: { width: scaleWidth(6), height: scaleWidth(6), borderRadius: scaleWidth(3), backgroundColor: Colors.safe },
  mapLabelText: { color: Colors.primaryLight, fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  tapHint: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(6, 8, 26, 0.75)', borderRadius: scaleWidth(8), paddingHorizontal: scaleWidth(10), paddingVertical: scaleHeight(4), borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)' },
  tapHintText: { color: Colors.primaryLight, fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  teenCard: { marginBottom: Spacing.md },
  teenHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  teenLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  teenAvatar: { width: scaleWidth(44), height: scaleWidth(44), borderRadius: scaleWidth(14), justifyContent: 'center', alignItems: 'center' },
  teenInitial: { color: '#fff', fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  teenName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginBottom: 4 },
  teenRight: { alignItems: 'flex-end' },
  speedDisplay: { alignItems: 'center' },
  currentSpeed: { fontSize: FontSize.xxl, fontWeight: FontWeight.heavy },
  speedUnit: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: -2 },
  trackBtn: { width: scaleWidth(36), height: scaleWidth(36), borderRadius: scaleWidth(12), backgroundColor: Colors.primaryMuted, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.borderAccent },
  teenStats: { flexDirection: 'row', gap: Spacing.lg },
  teenStat: { flex: 1 },
  teenStatLabel: { fontSize: FontSize.xs, color: Colors.textTertiary, marginBottom: 4 },
  teenStatValue: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.semibold },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  scoreBg: { flex: 1, height: scaleHeight(6), backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: scaleHeight(3), overflow: 'hidden' },
  scoreFill: { height: scaleHeight(6), borderRadius: scaleHeight(3) },
  scoreText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, minWidth: scaleWidth(24) },
  trackLiveBtn: { marginTop: Spacing.lg },
  trackLiveGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: scaleHeight(38), borderRadius: BorderRadius.md, gap: 6 },
  trackLiveText: { color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  alertCard: { marginBottom: Spacing.sm },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  alertIcon: { width: scaleWidth(38), height: scaleWidth(38), borderRadius: scaleWidth(12), justifyContent: 'center', alignItems: 'center' },
  alertContent: { flex: 1 },
  alertMessage: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.medium, lineHeight: 18 },
  alertTime: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
  unreadDot: { width: scaleWidth(8), height: scaleWidth(8), borderRadius: scaleWidth(4), backgroundColor: Colors.primaryLight },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md },
  actionBtn: { flex: 1, alignItems: 'center' },
  actionIcon: { width: scaleWidth(56), height: scaleWidth(56), borderRadius: scaleWidth(18), justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm, borderWidth: 1 },
  actionLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
});
