// ============================================
// SpeedxSafety - Alert History Screen
// ============================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../../components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { mockAlerts } from '../../constants/mockData';
import { scaleWidth, scaleHeight, scaleFont } from '../../utils/responsive';

type FilterType = 'all' | 'speed' | 'geo' | 'crash' | 'curfew';

const filters: { key: FilterType; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: 'apps' },
  { key: 'speed', label: 'Speed', icon: 'speedometer' },
  { key: 'geo', label: 'Geofence', icon: 'location' },
  { key: 'crash', label: 'Crash', icon: 'alert-circle' },
  { key: 'curfew', label: 'Curfew', icon: 'moon' },
];

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

export const AlertHistoryScreen = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filtered = activeFilter === 'all'
    ? mockAlerts
    : mockAlerts.filter(a => a.type === activeFilter);

  return (
    <LinearGradient colors={Colors.gradientBg as any} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Alert History</Text>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <GlassCard style={[styles.summaryCard, { borderColor: Colors.danger + '30' }]}>
            <Text style={[styles.summaryNum, { color: Colors.danger }]}>
              {mockAlerts.filter(a => a.type === 'speed').length}
            </Text>
            <Text style={styles.summaryLabel}>Speed</Text>
          </GlassCard>
          <GlassCard style={[styles.summaryCard, { borderColor: Colors.warning + '30' }]}>
            <Text style={[styles.summaryNum, { color: Colors.warning }]}>
              {mockAlerts.filter(a => a.type === 'geo').length}
            </Text>
            <Text style={styles.summaryLabel}>Geofence</Text>
          </GlassCard>
          <GlassCard style={[styles.summaryCard, { borderColor: '#FF2D55' + '30' }]}>
            <Text style={[styles.summaryNum, { color: '#FF2D55' }]}>
              {mockAlerts.filter(a => a.type === 'crash').length}
            </Text>
            <Text style={styles.summaryLabel}>Crash</Text>
          </GlassCard>
          <GlassCard style={[styles.summaryCard, { borderColor: Colors.primaryLight + '30' }]}>
            <Text style={[styles.summaryNum, { color: Colors.primaryLight }]}>
              {mockAlerts.filter(a => a.type === 'curfew').length}
            </Text>
            <Text style={styles.summaryLabel}>Curfew</Text>
          </GlassCard>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {filters.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
              onPress={() => setActiveFilter(f.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={f.icon as any}
                size={14}
                color={activeFilter === f.key ? '#fff' : Colors.textTertiary}
              />
              <Text style={[styles.filterLabel, activeFilter === f.key && styles.filterLabelActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Alert list */}
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
                  <Ionicons name="time-outline" size={12} color={Colors.textTertiary} />
                  <Text style={styles.alertTime}>
                    {new Date(alert.timestamp).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </Text>
                  <Ionicons name="person-outline" size={12} color={Colors.textTertiary} style={{ marginLeft: scaleWidth(12) }} />
                  <Text style={styles.alertTime}>{alert.teen_name}</Text>
                </View>
                {alert.speed_recorded && (
                  <View style={styles.speedTag}>
                    <Text style={styles.speedTagText}>
                      {alert.speed_recorded} km/h (limit: {alert.speed_limit} km/h)
                    </Text>
                  </View>
                )}
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
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.xxl },
  summaryRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xxl },
  summaryCard: { flex: 1, alignItems: 'center', padding: Spacing.md },
  summaryNum: { fontSize: FontSize.xxl, fontWeight: FontWeight.heavy },
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
  speedTag: {
    marginTop: scaleHeight(8),
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: scaleWidth(10),
    paddingVertical: scaleHeight(4),
    alignSelf: 'flex-start',
  },
  speedTagText: { fontSize: FontSize.xs, color: Colors.danger, fontWeight: FontWeight.semibold },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.huge },
  emptyText: { fontSize: FontSize.md, color: Colors.textTertiary, marginTop: Spacing.md },
});
