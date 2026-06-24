// ============================================
// SpeedxSafety - Alert History (Spatial Edition)
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../../components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { Springs, Duration } from '../../constants/spatial';
import { scaleWidth, scaleHeight, getSafeAreaTop } from '../../utils/responsive';
import { getCurrentUser } from '../../services/authService';
import { getAlerts } from '../../services/dataService';
import { Alert } from '../../types';
import { ActivityIndicator } from 'react-native';

const alertTypes = ['All', 'speed', 'geo', 'crash', 'curfew', 'sos'] as const;

export const AlertHistoryScreen = () => {
  const [filter, setFilter] = useState<string>('All');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          const fetched = await getAlerts(user.id);
          setAlerts(fetched);
        }
      } catch (err) {
        console.warn('Failed to load alerts:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAlerts();
  }, []);

  if (loading) {
    return (
      <LinearGradient colors={Colors.gradientBg as any} style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </LinearGradient>
    );
  }

  const filtered = filter === 'All' ? alerts : alerts.filter(a => a.type === filter);
  const stats = {
    total: alerts.length,
    speed: alerts.filter(a => a.type === 'speed').length,
    critical: alerts.filter(a => ['crash', 'sos'].includes(a.type)).length,
    unread: alerts.filter(a => !a.read).length,
  };

  return (
    <LinearGradient colors={Colors.gradientBg as any} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Alert History</Text>

        {/* Summary stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Total', value: stats.total, color: Colors.primaryLight },
            { label: 'Speed', value: stats.speed, color: Colors.danger },
            { label: 'Critical', value: stats.critical, color: Colors.warning },
            { label: 'Unread', value: stats.unread, color: Colors.safe },
          ].map((stat, i) => (
            <GlassCard key={i} style={styles.statCard} elevation="raised" animated delay={i * 80}>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          {alertTypes.map((type) => {
            const isActive = filter === type;
            return (
              <TouchableOpacity
                key={type}
                onPress={() => setFilter(type)}
                activeOpacity={0.7}
              >
                <View style={[styles.filterChip, isActive && styles.filterChipActive]}>
                  {type !== 'All' && (
                    <View style={[styles.chipDot, { backgroundColor: getAlertColor(type) }]} />
                  )}
                  <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                    {type === 'All' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Alert cards */}
        {filtered.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <Ionicons name="checkmark-circle" size={40} color={Colors.safe} />
            <Text style={styles.emptyText}>No alerts in this category</Text>
          </GlassCard>
        ) : (
          filtered.map((alert, idx) => (
            <GlassCard
              key={alert.alert_id}
              style={[styles.alertCard, !alert.read && { borderColor: Colors.primaryMuted }]}
              animated
              delay={idx * 60}
              glowColor={!alert.read ? getAlertColor(alert.type) : undefined}
            >
              <View style={styles.alertRow}>
                <View style={[styles.alertIconBg, { backgroundColor: getAlertColor(alert.type) + '15' }]}>
                  <Ionicons name={getAlertIcon(alert.type)} size={18} color={getAlertColor(alert.type)} />
                </View>
                <View style={styles.alertContent}>
                  <View style={styles.alertTopRow}>
                    <Text style={styles.alertType}>{alert.type.toUpperCase()}</Text>
                    {!alert.read && <View style={[styles.unreadDot, Shadow.glow(Colors.primaryLight)]} />}
                  </View>
                  <Text style={styles.alertMessage} numberOfLines={2}>{alert.message}</Text>
                  <View style={styles.alertMeta}>
                    <Ionicons name="person-outline" size={12} color={Colors.textTertiary} />
                    <Text style={styles.alertMetaText}>{alert.teen_name}</Text>
                    <Text style={styles.alertDot}>·</Text>
                    <Text style={styles.alertMetaText}>{getTimeAgo(alert.timestamp)}</Text>
                  </View>
                </View>
              </View>
            </GlassCard>
          ))
        )}
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
const getTimeAgo = (ts: number): string => {
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: getSafeAreaTop() + 12, paddingBottom: scaleHeight(120), alignSelf: 'center', width: '100%', maxWidth: 800 },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.xxl, letterSpacing: -0.5 },
  statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
  statCard: { flex: 1, alignItems: 'center', padding: Spacing.md },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  statLabel: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
  filtersScroll: { paddingBottom: Spacing.xl, gap: Spacing.sm },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.bgCard, borderRadius: BorderRadius.round, paddingHorizontal: scaleWidth(16), paddingVertical: scaleHeight(8),
    borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primaryMuted, borderColor: Colors.borderAccent },
  chipDot: { width: scaleWidth(6), height: scaleWidth(6), borderRadius: scaleWidth(3) },
  filterText: { fontSize: FontSize.sm, color: Colors.textTertiary, fontWeight: FontWeight.medium },
  filterTextActive: { color: Colors.primaryLight, fontWeight: FontWeight.bold },
  emptyCard: { alignItems: 'center', padding: Spacing.xxxl, gap: Spacing.md },
  emptyText: { fontSize: FontSize.md, color: Colors.textTertiary },
  alertCard: { marginBottom: Spacing.sm },
  alertRow: { flexDirection: 'row', gap: Spacing.md },
  alertIconBg: { width: scaleWidth(40), height: scaleWidth(40), borderRadius: scaleWidth(12), justifyContent: 'center', alignItems: 'center' },
  alertContent: { flex: 1 },
  alertTopRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 3 },
  alertType: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.textTertiary, letterSpacing: 1 },
  unreadDot: { width: scaleWidth(6), height: scaleWidth(6), borderRadius: scaleWidth(3), backgroundColor: Colors.primaryLight },
  alertMessage: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.medium, lineHeight: 18 },
  alertMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  alertMetaText: { fontSize: FontSize.xs, color: Colors.textTertiary },
  alertDot: { color: Colors.textTertiary, fontSize: FontSize.xs },
});
