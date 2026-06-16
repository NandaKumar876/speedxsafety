// ============================================
// SpeedxSafety - Admin Alerts Screen
// ============================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard, GradientButton } from '../../components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { mockAlerts } from '../../data/mockData';
import { scaleWidth, scaleHeight } from '../../utils/responsive';

type AlertFilter = 'all' | 'speed' | 'geo' | 'crash' | 'curfew';

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
    case 'crash': return '#FF2D55';
    case 'curfew': return Colors.primaryLight;
    case 'sos': return Colors.danger;
    default: return Colors.textSecondary;
  }
};

export const AdminAlertsScreen = () => {
  const [filter, setFilter] = useState<AlertFilter>('all');
  const [alerts, setAlerts] = useState(mockAlerts);

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.type === filter);

  const markAllReviewed = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const filters: { key: AlertFilter; label: string; icon: string }[] = [
    { key: 'all', label: 'All', icon: 'apps' },
    { key: 'speed', label: 'Speed', icon: 'speedometer' },
    { key: 'geo', label: 'Geofence', icon: 'location' },
    { key: 'crash', label: 'Crash', icon: 'alert-circle' },
    { key: 'curfew', label: 'Curfew', icon: 'moon' },
  ];

  return (
    <LinearGradient colors={Colors.gradientBg as any} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>All Alerts</Text>
            <Text style={styles.subtitle}>{alerts.filter(a => !a.read).length} unreviewed</Text>
          </View>
          <TouchableOpacity style={styles.bulkBtn} onPress={markAllReviewed} activeOpacity={0.7}>
            <Ionicons name="checkmark-done" size={16} color={Colors.safe} />
            <Text style={styles.bulkBtnText}>Mark All Reviewed</Text>
          </TouchableOpacity>
        </View>

        {/* Alert Summary */}
        <View style={styles.summaryRow}>
          {[
            { label: 'Speed', count: alerts.filter(a => a.type === 'speed').length, color: Colors.danger },
            { label: 'Geofence', count: alerts.filter(a => a.type === 'geo').length, color: Colors.warning },
            { label: 'Crash', count: alerts.filter(a => a.type === 'crash').length, color: '#FF2D55' },
            { label: 'Curfew', count: alerts.filter(a => a.type === 'curfew').length, color: Colors.primaryLight },
          ].map(s => (
            <GlassCard key={s.label} style={[styles.summaryCard, { borderColor: s.color + '30' }]}>
              <Text style={[styles.summaryCount, { color: s.color }]}>{s.count}</Text>
              <Text style={styles.summaryLabel}>{s.label}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {filters.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.7}
            >
              <Ionicons name={f.icon as any} size={14} color={filter === f.key ? '#fff' : Colors.textTertiary} />
              <Text style={[styles.filterLabel, filter === f.key && styles.filterLabelActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Alert List */}
        {filtered.map(alert => (
          <GlassCard key={alert.alert_id} style={[styles.alertCard, !alert.read && styles.alertUnread]}>
            <View style={styles.alertRow}>
              <View style={[styles.alertIconBg, { backgroundColor: getAlertColor(alert.type) + '1A' }]}>
                <Ionicons name={getAlertIcon(alert.type)} size={22} color={getAlertColor(alert.type)} />
              </View>
              <View style={styles.alertContent}>
                <View style={styles.alertTopRow}>
                  <Text style={[styles.alertType, { color: getAlertColor(alert.type) }]}>
                    {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert
                  </Text>
                  {!alert.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                <View style={styles.alertMeta}>
                  <Ionicons name="person-outline" size={11} color={Colors.textTertiary} />
                  <Text style={styles.alertTime}>{alert.teen_name}</Text>
                  <Ionicons name="time-outline" size={11} color={Colors.textTertiary} style={{ marginLeft: scaleWidth(8) }} />
                  <Text style={styles.alertTime}>
                    {new Date(alert.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            </View>
          </GlassCard>
        ))}

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={48} color={Colors.safe} />
            <Text style={styles.emptyText}>No alerts in this category</Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: scaleHeight(60), paddingBottom: scaleHeight(100) },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.xxl },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.textTertiary, marginTop: 2 },
  bulkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.safe + '15',
    borderRadius: BorderRadius.round,
    paddingHorizontal: scaleWidth(12),
    paddingVertical: scaleHeight(6),
    borderWidth: 1,
    borderColor: Colors.safe + '30',
  },
  bulkBtnText: { color: Colors.safe, fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  summaryRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xxl },
  summaryCard: { flex: 1, alignItems: 'center', padding: Spacing.md },
  summaryCount: { fontSize: FontSize.xxl, fontWeight: FontWeight.heavy },
  summaryLabel: { fontSize: 10, color: Colors.textTertiary, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  filterScroll: { marginBottom: Spacing.xxl },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.round,
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(8),
    marginRight: Spacing.sm,
    borderWidth: 1.2,
    borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterLabel: { fontSize: FontSize.sm, color: Colors.textTertiary, fontWeight: FontWeight.medium },
  filterLabelActive: { color: '#fff' },
  alertCard: { marginBottom: Spacing.md },
  alertUnread: { borderColor: Colors.primaryLight + '30' },
  alertRow: { flexDirection: 'row', gap: Spacing.md },
  alertIconBg: {
    width: scaleWidth(44),
    height: scaleWidth(44),
    borderRadius: scaleWidth(14),
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContent: { flex: 1 },
  alertTopRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 4 },
  alertType: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  unreadDot: { width: scaleWidth(6), height: scaleWidth(6), borderRadius: scaleWidth(3), backgroundColor: Colors.primaryLight },
  alertMessage: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: 6 },
  alertMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  alertTime: { fontSize: FontSize.xs, color: Colors.textTertiary },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.huge },
  emptyText: { fontSize: FontSize.md, color: Colors.textTertiary, marginTop: Spacing.md },
});
