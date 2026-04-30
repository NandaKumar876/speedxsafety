// ============================================
// SpeedxSafety - Parent Dashboard
// ============================================

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard, StatusBadge, SectionHeader } from '../../components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { mockTeens, mockAlerts } from '../../constants/mockData';

const { width } = Dimensions.get('window');

export const ParentDashboard = ({ navigation }: any) => {
  const unreadAlerts = mockAlerts.filter(a => !a.read).length;

  return (
    <LinearGradient colors={['#0A0E27', '#111538', '#1A1E3A']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back 👋</Text>
            <Text style={styles.subGreeting}>Your family's driving overview</Text>
          </View>
          <TouchableOpacity style={styles.alertBtn} onPress={() => navigation.navigate('Alerts')}>
            <Ionicons name="notifications" size={22} color={Colors.textPrimary} />
            {unreadAlerts > 0 && (
              <View style={styles.alertBadge}>
                <Text style={styles.alertBadgeText}>{unreadAlerts}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Live Map Preview */}
        <GlassCard style={styles.mapCard}>
          <View style={styles.mapPlaceholder}>
            <LinearGradient
              colors={['#0D2137', '#132B4E', '#0D2137']}
              style={styles.mapGradient}
            >
              {/* Map grid lines */}
              <View style={styles.mapGrid}>
                {[...Array(5)].map((_, i) => (
                  <View key={`h${i}`} style={[styles.gridLineH, { top: `${20 * (i + 1)}%` }]} />
                ))}
                {[...Array(5)].map((_, i) => (
                  <View key={`v${i}`} style={[styles.gridLineV, { left: `${20 * (i + 1)}%` }]} />
                ))}
              </View>

              {/* Teen location pins */}
              {mockTeens.map((teen, index) => (
                <View key={teen.teen_id} style={[styles.mapPin, { top: 30 + index * 60, left: 60 + index * 80 }]}>
                  <LinearGradient
                    colors={teen.is_driving ? ['#34C759', '#30D158'] : ['#6E6E73', '#8E8E93']}
                    style={styles.pinDot}
                  >
                    <Ionicons name="car" size={12} color="#fff" />
                  </LinearGradient>
                  <View style={styles.pinLabel}>
                    <Text style={styles.pinName}>{teen.name.split(' ')[0]}</Text>
                    {teen.is_driving && (
                      <Text style={styles.pinSpeed}>{teen.current_speed} km/h</Text>
                    )}
                  </View>
                </View>
              ))}

              {/* Map label */}
              <View style={styles.mapLabel}>
                <Ionicons name="map" size={14} color={Colors.primary} />
                <Text style={styles.mapLabelText}>Live Map</Text>
              </View>
            </LinearGradient>
          </View>
        </GlassCard>

        {/* Teen Cards */}
        <SectionHeader title="Your Teens" />
        {mockTeens.map(teen => {
          const isOver = (teen.current_speed || 0) > teen.speed_limit;
          return (
            <GlassCard key={teen.teen_id} style={styles.teenCard}>
              <View style={styles.teenHeader}>
                <View style={styles.teenLeft}>
                  <LinearGradient
                    colors={teen.is_driving ? (isOver ? ['#FF3B30', '#FF6961'] : ['#34C759', '#30D158']) : ['#3A3A4A', '#4A4A5A']}
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
                    />
                  </View>
                </View>
                <View style={styles.teenRight}>
                  {teen.is_driving && (
                    <View style={styles.speedDisplay}>
                      <Text style={[styles.currentSpeed, { color: isOver ? Colors.danger : Colors.safe }]}>
                        {teen.current_speed}
                      </Text>
                      <Text style={styles.speedUnit}>km/h</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Teen stats row */}
              <View style={styles.teenStats}>
                <View style={styles.teenStat}>
                  <Text style={styles.teenStatLabel}>Safety Score</Text>
                  <View style={styles.scoreRow}>
                    <View style={styles.scoreBg}>
                      <LinearGradient
                        colors={teen.safety_score >= 80 ? Colors.gradientSafe as any : Colors.gradientWarning as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
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
            </GlassCard>
          );
        })}

        {/* Recent Alerts */}
        <SectionHeader title="Recent Alerts" action="View All" onAction={() => navigation.navigate('Alerts')} />
        {mockAlerts.slice(0, 3).map(alert => (
          <GlassCard key={alert.alert_id} style={[styles.alertCard, !alert.read && styles.alertCardUnread]}>
            <View style={styles.alertRow}>
              <View style={[styles.alertIcon, { backgroundColor: getAlertColor(alert.type) + '20' }]}>
                <Ionicons name={getAlertIcon(alert.type)} size={18} color={getAlertColor(alert.type)} />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertMessage} numberOfLines={2}>{alert.message}</Text>
                <Text style={styles.alertTime}>{getTimeAgo(alert.timestamp)}</Text>
              </View>
              {!alert.read && <View style={styles.unreadDot} />}
            </View>
          </GlassCard>
        ))}

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" />
        <View style={styles.actionsRow}>
          {[
            { icon: 'speedometer', label: 'Set Limits', color: Colors.primary, nav: 'Settings' },
            { icon: 'location', label: 'Geofences', color: Colors.safe, nav: 'Geofences' },
            { icon: 'bar-chart', label: 'Reports', color: Colors.warning, nav: 'Reports' },
            { icon: 'people', label: 'Manage', color: Colors.primaryLight, nav: 'Settings' },
          ].map((action, idx) => (
            <TouchableOpacity key={idx} style={styles.actionBtn} onPress={() => navigation.navigate(action.nav)} activeOpacity={0.7}>
              <LinearGradient colors={[action.color + '20', action.color + '08']} style={styles.actionIcon}>
                <Ionicons name={action.icon as any} size={22} color={action.color} />
              </LinearGradient>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

// Helper functions
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
  scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  greeting: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  subGreeting: { fontSize: FontSize.md, color: Colors.textTertiary, marginTop: 2 },
  alertBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.danger,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBadgeText: { color: '#fff', fontSize: 10, fontWeight: FontWeight.bold },
  mapCard: { padding: 0, overflow: 'hidden', marginBottom: Spacing.lg },
  mapPlaceholder: { height: 200, borderRadius: BorderRadius.xl, overflow: 'hidden' },
  mapGradient: { flex: 1, padding: Spacing.lg, position: 'relative' },
  mapGrid: { ...StyleSheet.absoluteFillObject },
  gridLineH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(0,122,255,0.08)' },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(0,122,255,0.08)' },
  mapPin: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 6 },
  pinDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.sm,
  },
  pinLabel: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pinName: { color: '#fff', fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  pinSpeed: { color: Colors.safe, fontSize: 10, fontWeight: FontWeight.bold },
  mapLabel: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  mapLabelText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  teenCard: { marginBottom: Spacing.md },
  teenHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  teenLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  teenAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teenInitial: { color: '#fff', fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  teenName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginBottom: 4 },
  teenRight: { alignItems: 'flex-end' },
  speedDisplay: { alignItems: 'center' },
  currentSpeed: { fontSize: FontSize.xxl, fontWeight: FontWeight.heavy },
  speedUnit: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: -2 },
  teenStats: { flexDirection: 'row', gap: Spacing.lg },
  teenStat: { flex: 1 },
  teenStatLabel: { fontSize: FontSize.xs, color: Colors.textTertiary, marginBottom: 4 },
  teenStatValue: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.semibold },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  scoreBg: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  scoreFill: { height: 6, borderRadius: 3 },
  scoreText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, minWidth: 24 },
  alertCard: { marginBottom: Spacing.sm },
  alertCardUnread: { borderColor: Colors.primary + '30' },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  alertIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContent: { flex: 1 },
  alertMessage: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.medium, lineHeight: 18 },
  alertTime: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md },
  actionBtn: { flex: 1, alignItems: 'center' },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
});
