// ============================================
// SpeedxSafety - Admin Dashboard
// ============================================

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard, SectionHeader } from '../../components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { mockTeens, mockAlerts, mockTrips } from '../../data/mockData';
import { scaleWidth, scaleHeight, scaleFont } from '../../utils/responsive';

export const AdminDashboard = ({ navigation }: any) => {
  const stats = [
    { label: 'Total Users', value: '24', icon: 'people', color: Colors.primary, trend: '+3' },
    { label: 'Active Trips', value: '7', icon: 'navigate', color: Colors.safe, trend: '+2' },
    { label: 'Total Alerts', value: `${mockAlerts.length}`, icon: 'notifications', color: Colors.danger, trend: '-1' },
    { label: 'Avg Score', value: '86', icon: 'star', color: Colors.warning, trend: '+4' },
  ];

  const recentUsers = [
    { name: 'Sarah Johnson', role: 'parent', email: 'sarah@example.com', status: 'active', joined: '2 days ago' },
    { name: 'Alex Johnson', role: 'teen', email: 'alex@example.com', status: 'active', joined: '2 days ago' },
    { name: 'Emma Johnson', role: 'teen', email: 'emma@example.com', status: 'active', joined: '5 days ago' },
    { name: 'Mike Davis', role: 'parent', email: 'mike@example.com', status: 'active', joined: '1 week ago' },
  ];

  return (
    <LinearGradient colors={Colors.gradientBg as any} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Admin Panel</Text>
            <Text style={styles.subGreeting}>System overview & management</Text>
          </View>
          <View style={styles.adminBadge}>
            <Ionicons name="shield" size={16} color={Colors.primary} />
            <Text style={styles.adminBadgeText}>Admin</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, idx) => (
            <GlassCard key={idx} style={styles.statCard} animated delay={idx * 100}>
              <View style={[styles.statIconBg, { backgroundColor: stat.color + '15' }]}>
                <Ionicons name={stat.icon as any} size={20} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <View style={[styles.trendBadge, { backgroundColor: stat.trend.startsWith('+') ? Colors.safe + '20' : Colors.danger + '20' }]}>
                <Ionicons
                  name={stat.trend.startsWith('+') ? 'trending-up' : 'trending-down'}
                  size={12}
                  color={stat.trend.startsWith('+') ? Colors.safe : Colors.danger}
                />
                <Text style={[styles.trendText, { color: stat.trend.startsWith('+') ? Colors.safe : Colors.danger }]}>
                  {stat.trend}
                </Text>
              </View>
            </GlassCard>
          ))}
        </View>

        {/* Activity Chart (Simple bar visualization) */}
        <SectionHeader title="Weekly Activity" />
        <GlassCard animated delay={400}>
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
          <GlassCard key={idx} style={styles.userCard} animated delay={500 + idx * 80}>
            <View style={styles.userRow}>
              <LinearGradient
                colors={user.role === 'parent' ? ['#4F46E5', '#6C63FF'] : ['#7C3AED', '#A855F7']}
                style={styles.userAvatar}
              >
                <Text style={styles.userInitial}>{user.name[0]}</Text>
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
                    color: user.role === 'parent' ? Colors.primary : Colors.accent,
                  }]}>{user.role}</Text>
                </View>
                <Text style={styles.userJoined}>{user.joined}</Text>
              </View>
            </View>
          </GlassCard>
        ))}

        {/* Recent Alerts */}
        <SectionHeader title="System Alerts" action="View All" onAction={() => navigation.navigate('AdminAlerts')} />
        {mockAlerts.slice(0, 3).map((alert, idx) => (
          <GlassCard key={alert.alert_id} style={styles.alertCard} animated delay={700 + idx * 80}>
            <View style={styles.alertRow}>
              <View style={[styles.alertIconBg, { backgroundColor: getAlertColor(alert.type) + '1A' }]}>
                <Ionicons name={getAlertIcon(alert.type)} size={18} color={getAlertColor(alert.type)} />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertMessage} numberOfLines={1}>{alert.message}</Text>
                <Text style={styles.alertMeta}>{alert.teen_name} · {getTimeAgo(alert.timestamp)}</Text>
              </View>
              <View style={[styles.severityDot, { backgroundColor: getAlertColor(alert.type) }]} />
            </View>
          </GlassCard>
        ))}
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: scaleHeight(60),
    paddingBottom: scaleHeight(100),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  greeting: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  subGreeting: { fontSize: FontSize.sm, color: Colors.textTertiary, marginTop: 2 },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary + '15',
    borderRadius: BorderRadius.round,
    paddingHorizontal: scaleWidth(14),
    paddingVertical: scaleHeight(6),
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  adminBadgeText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    width: '47%' as any,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  statIconBg: {
    width: scaleWidth(40),
    height: scaleWidth(40),
    borderRadius: scaleWidth(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.heavy, color: Colors.textPrimary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderRadius: BorderRadius.round,
    paddingHorizontal: scaleWidth(8),
    paddingVertical: scaleHeight(2),
    marginTop: Spacing.xs,
  },
  trendText: { fontSize: 10, fontWeight: FontWeight.bold },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: scaleHeight(120),
    paddingTop: Spacing.md,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    flex: 1,
    width: scaleWidth(24),
    justifyContent: 'flex-end',
    marginBottom: Spacing.xs,
  },
  bar: {
    width: '100%',
    borderRadius: scaleWidth(4),
    minHeight: scaleHeight(8),
  },
  barLabel: { fontSize: 10, color: Colors.textTertiary, fontWeight: FontWeight.medium },
  userCard: { marginBottom: Spacing.sm },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  userAvatar: {
    width: scaleWidth(40),
    height: scaleWidth(40),
    borderRadius: scaleWidth(12),
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
  roleText: { fontSize: 10, fontWeight: FontWeight.bold, textTransform: 'uppercase' },
  userJoined: { fontSize: 10, color: Colors.textTertiary },
  alertCard: { marginBottom: Spacing.sm },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  alertIconBg: {
    width: scaleWidth(36),
    height: scaleWidth(36),
    borderRadius: scaleWidth(10),
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
});
