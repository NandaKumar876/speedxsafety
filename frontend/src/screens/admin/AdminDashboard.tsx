// ============================================
// SpeedxSafety - Admin Dashboard (Spatial Edition)
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, ActivityIndicator, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard, SectionHeader } from '../../components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { scaleWidth, scaleHeight, scaleFont, getSafeAreaTop } from '../../utils/responsive';
import { getAllUsers, getAdminStats, getAlerts } from '../../services/dataService';
import { AmbientGlow } from '../../components/common/SpatialComponents';

export const AdminDashboard = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dbStats, dbUsers, dbAlerts] = await Promise.all([
        getAdminStats(),
        getAllUsers(),
        getAlerts(''),
      ]);

      setStats([
        { label: 'Total Users', value: `${dbStats.total_users}`, icon: 'people', color: Colors.primary, trend: '+1' },
        { label: 'Active Trips', value: `${dbStats.active_trips}`, icon: 'navigate', color: Colors.safe, trend: '+0' },
        { label: 'Total Alerts', value: `${dbStats.total_alerts}`, icon: 'notifications', color: Colors.danger, trend: '+0' },
        { label: 'Avg Score', value: `${dbStats.avg_safety_score}%`, icon: 'star', color: Colors.warning, trend: '+0' },
      ]);

      const mappedRecent = dbUsers.slice(0, 4).map(u => ({
        name: u.name || u.email.split('@')[0],
        role: u.role || 'teen',
        email: u.email,
        status: u.is_active ? 'active' : 'suspended',
        joined: u.created_at ? getTimeAgo(new Date(u.created_at).getTime()) : 'Just now',
      }));
      setRecentUsers(mappedRecent);
      setRecentAlerts(dbAlerts.slice(0, 3));
    } catch (error) {
      console.error('Failed to load admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={Colors.gradientBg as any} style={styles.container}>
      <StatusBar barStyle="light-content" />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <GlassCard style={styles.headerCard} elevation="raised">
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Admin Hub</Text>
                <Text style={styles.subGreeting}>System health & user metrics</Text>
              </View>
              <View style={[styles.adminBadge, Shadow.glowSoft(Colors.primary)]}>
                <Ionicons name="shield-checkmark" size={16} color={Colors.primary} />
                <Text style={styles.adminBadgeText}>SYSTEM ADMIN</Text>
              </View>
            </View>
          </GlassCard>

          {/* Ambient background glow orbs */}
          <View style={styles.glowOverlay} pointerEvents="none">
            <AmbientGlow color={Colors.primary} size={150} intensity={0.05} style={styles.glowLeft} />
            <AmbientGlow color={Colors.accent} size={180} intensity={0.03} style={styles.glowRight} />
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {stats.map((stat, idx) => (
              <GlassCard 
                key={idx} 
                style={styles.statCard} 
                animated 
                delay={idx * 80}
                glowColor={stat.color}
                elevation="raised"
              >
                <View style={[styles.statIconBg, { backgroundColor: stat.color + '15' }]}>
                  <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <View style={[styles.trendBadge, { backgroundColor: stat.trend.startsWith('+') ? Colors.safe + '15' : Colors.danger + '15' }]}>
                  <Ionicons
                    name={stat.trend.startsWith('+') ? 'trending-up' : 'trending-down'}
                    size={11}
                    color={stat.trend.startsWith('+') ? Colors.safeLight : Colors.dangerLight}
                  />
                  <Text style={[styles.trendText, { color: stat.trend.startsWith('+') ? Colors.safeLight : Colors.dangerLight }]}>
                    {stat.trend}
                  </Text>
                </View>
              </GlassCard>
            ))}
          </View>

          {/* Activity Chart (Simple bar visualization) */}
          <SectionHeader title="Weekly Activity" />
          <GlassCard animated delay={350} elevation="raised">
            <View style={styles.chartContainer}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                const heights = [60, 45, 80, 35, 70, 90, 55];
                return (
                  <View key={day} style={styles.chartBar}>
                    <View style={styles.barContainer}>
                      <LinearGradient
                        colors={Colors.gradientPrimary as any}
                        style={[styles.bar, { height: `${heights[idx]}%` }]}
                      />
                    </View>
                    <Text style={styles.barLabel}>{day}</Text>
                  </View>
                );
              })}
            </View>
          </GlassCard>

          {/* Recent Users */}
          <SectionHeader title="Recent Users" action="View All" onAction={() => navigation.navigate('Users')} />
          {recentUsers.map((user, idx) => (
            <GlassCard key={idx} style={styles.userCard} animated delay={400 + idx * 60} elevation="surface">
              <View style={styles.userRow}>
                <LinearGradient
                  colors={user.role === 'parent' ? ['#4F46E5', '#6C63FF'] : ['#7C3AED', '#A855F7']}
                  style={styles.userAvatar}
                >
                  <Text style={styles.userInitial}>{user.name ? user.name[0].toUpperCase() : 'U'}</Text>
                </LinearGradient>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
                <View style={styles.userMeta}>
                  <View style={[styles.roleBadge, {
                    backgroundColor: user.role === 'parent' ? Colors.primary + '20' : Colors.accent + '20',
                  }]}>
                    <Text style={[styles.roleText, {
                      color: user.role === 'parent' ? Colors.primaryLight : Colors.accentLight,
                    }]}>{user.role}</Text>
                  </View>
                  <Text style={styles.userJoined}>{user.joined}</Text>
                </View>
              </View>
            </GlassCard>
          ))}

          {/* System Alerts */}
          <SectionHeader title="System Alerts" action="View All" onAction={() => navigation.navigate('AdminAlerts')} />
          {recentAlerts.length === 0 ? (
            <GlassCard style={styles.emptyCard} elevation="surface">
              <Ionicons name="checkmark-circle" size={32} color={Colors.safe} />
              <Text style={styles.emptyText}>No recent system alerts</Text>
            </GlassCard>
          ) : (
            recentAlerts.map((alert, idx) => (
              <GlassCard 
                key={alert.alert_id} 
                style={styles.alertCard} 
                animated 
                delay={550 + idx * 60}
                elevation="surface"
                glowColor={getAlertColor(alert.type) + '30'}
              >
                <View style={styles.alertRow}>
                  <View style={[styles.alertIconBg, { backgroundColor: getAlertColor(alert.type) + '1A' }]}>
                    <Ionicons name={getAlertIcon(alert.type)} size={18} color={getAlertColor(alert.type)} />
                  </View>
                  <View style={styles.alertContent}>
                    <Text style={styles.alertMessage} numberOfLines={1}>{alert.message}</Text>
                    <Text style={styles.alertMeta}>{alert.teen_name} · {getTimeAgo(alert.timestamp)}</Text>
                  </View>
                  <View style={[styles.severityDot, { backgroundColor: getAlertColor(alert.type) }, Shadow.glow(getAlertColor(alert.type))]} />
                </View>
              </GlassCard>
            ))
          )}
          
        </ScrollView>
      )}
    </LinearGradient>
  );
};

// Helpers
const getAlertIcon = (type: string): any => {
  switch (type) {
    case 'speed': return 'speedometer';
    case 'geo': return 'location';
    case 'crash': return 'alert-circle';
    case 'curfew': return 'moon';
    case 'sos': return 'warning';
    default: return 'alert';
  }
};

const getAlertColor = (type: string): string => {
  switch (type) {
    case 'speed': return Colors.danger;
    case 'geo': return Colors.warning;
    case 'crash': return Colors.danger;
    case 'curfew': return Colors.primaryLight;
    case 'sos': return Colors.danger;
    default: return Colors.textSecondary;
  }
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: getSafeAreaTop() + 12,
    paddingBottom: scaleHeight(110),
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1100,
  },
  headerCard: {
    marginBottom: Spacing.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  subGreeting: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary + '15',
    borderRadius: BorderRadius.round,
    paddingHorizontal: scaleWidth(10),
    paddingVertical: scaleHeight(5),
    borderWidth: 1.2,
    borderColor: Colors.primary + '40',
  },
  adminBadgeText: { color: Colors.primaryLight, fontSize: 9, fontWeight: FontWeight.heavy, letterSpacing: 0.5 },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    zIndex: -1,
  },
  glowLeft: {
    position: 'absolute',
    top: 40,
    left: -50,
  },
  glowRight: {
    position: 'absolute',
    top: 150,
    right: -60,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statIconBg: {
    width: scaleWidth(42),
    height: scaleWidth(42),
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.heavy, color: Colors.textPrimary, letterSpacing: -0.5 },
  statLabel: { fontSize: 10, color: Colors.textTertiary, marginTop: 2, fontWeight: FontWeight.semibold },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderRadius: BorderRadius.round,
    paddingHorizontal: scaleWidth(8),
    paddingVertical: scaleHeight(2),
    marginTop: Spacing.sm,
  },
  trendText: { fontSize: 9, fontWeight: FontWeight.bold },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: scaleHeight(130),
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    flex: 1,
    width: scaleWidth(20),
    justifyContent: 'flex-end',
    marginBottom: Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BorderRadius.xs,
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: BorderRadius.xs,
    minHeight: scaleHeight(6),
  },
  barLabel: { fontSize: 9, color: Colors.textTertiary, fontWeight: FontWeight.semibold },
  userCard: { 
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  userAvatar: {
    width: scaleWidth(40),
    height: scaleWidth(40),
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitial: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  userInfo: { flex: 1 },
  userName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  userEmail: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 1 },
  userMeta: { alignItems: 'flex-end' },
  roleBadge: {
    borderRadius: BorderRadius.round,
    paddingHorizontal: scaleWidth(10),
    paddingVertical: scaleHeight(2),
    marginBottom: 4,
  },
  roleText: { fontSize: 9, fontWeight: FontWeight.bold, textTransform: 'uppercase', letterSpacing: 0.5 },
  userJoined: { fontSize: 9, color: Colors.textTertiary },
  alertCard: { 
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  alertIconBg: {
    width: scaleWidth(38),
    height: scaleWidth(38),
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContent: { flex: 1 },
  alertMessage: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  alertMeta: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
  severityDot: {
    width: scaleWidth(8),
    height: scaleWidth(8),
    borderRadius: scaleWidth(4),
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
});
