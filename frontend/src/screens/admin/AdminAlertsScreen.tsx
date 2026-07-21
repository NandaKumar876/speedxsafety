// ============================================
// SpeedxSafety - Admin Alerts Screen (Spatial Edition)
// ============================================

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../../components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { scaleWidth, scaleHeight, scaleFont, getSafeAreaTop } from '../../utils/responsive';
import { getAlerts, markAllAlertsRead } from '../../services/dataService';
import { AmbientGlow } from '../../components/common/SpatialComponents';

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
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await getAlerts('');
      setAlerts(data);
    } catch (error) {
      console.error('Failed to load admin alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.type === filter);

  const markAllReviewed = async () => {
    try {
      await markAllAlertsRead('');
      const data = await getAlerts('');
      setAlerts(data);
    } catch (error) {
      console.error('Failed to mark all alerts as read:', error);
    }
  };

  const filters: { key: AlertFilter; label: string; icon: string }[] = [
    { key: 'all', label: 'All', icon: 'apps' },
    { key: 'speed', label: 'Speed', icon: 'speedometer' },
    { key: 'geo', label: 'Geofence', icon: 'location' },
    { key: 'crash', label: 'Crash', icon: 'alert-circle' },
    { key: 'curfew', label: 'Curfew', icon: 'moon' },
  ];

  if (loading) {
    return (
      <LinearGradient colors={Colors.gradientBg as any} style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={Colors.gradientBg as any} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>All Alerts</Text>
            <Text style={styles.subtitle}>{alerts.filter(a => !a.read).length} unreviewed</Text>
          </View>
          <TouchableOpacity 
            style={[styles.bulkBtn, Shadow.glowSoft(Colors.safe)]} 
            onPress={markAllReviewed} 
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-done" size={16} color={Colors.safe} />
            <Text style={styles.bulkBtnText}>Mark Reviewed</Text>
          </TouchableOpacity>
        </View>

        {/* Ambient background glows */}
        <View style={styles.glowOverlay} pointerEvents="none">
          <AmbientGlow color={Colors.danger} size={150} intensity={0.03} style={styles.glowLeft} />
        </View>

        {/* Alert Summary Cards */}
        <View style={styles.summaryRow}>
          {[
            { label: 'Speed', count: alerts.filter(a => a.type === 'speed').length, color: Colors.danger },
            { label: 'Geofence', count: alerts.filter(a => a.type === 'geo').length, color: Colors.warning },
            { label: 'Crash', count: alerts.filter(a => a.type === 'crash').length, color: '#FF2D55' },
            { label: 'Curfew', count: alerts.filter(a => a.type === 'curfew').length, color: Colors.primaryLight },
          ].map(s => (
            <GlassCard 
              key={s.label} 
              style={[styles.summaryCard, { borderColor: s.color + '20' }]}
              glowColor={s.color}
              elevation="surface"
            >
              <Text style={[styles.summaryCount, { color: s.color }]}>{s.count}</Text>
              <Text style={styles.summaryLabel}>{s.label}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Horizontal Filters */}
        <View style={styles.filterScrollWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {filters.map(f => {
              const isActive = filter === f.key;
              return (
                <TouchableOpacity
                  key={f.key}
                  style={[
                    styles.filterChip, 
                    isActive && styles.filterChipActive,
                    isActive && Shadow.glowSoft(Colors.primary)
                  ]}
                  onPress={() => setFilter(f.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons name={f.icon as any} size={14} color={isActive ? '#fff' : Colors.textSecondary} />
                  <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>{f.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Alert List */}
        {filtered.map((alert, idx) => {
          const isUnread = !alert.read;
          const typeColor = getAlertColor(alert.type);
          return (
            <GlassCard 
              key={alert.alert_id} 
              style={[styles.alertCard, isUnread && styles.alertUnread]}
              animated
              delay={idx * 60}
              elevation={isUnread ? 'raised' : 'surface'}
              glowColor={isUnread ? typeColor + '30' : undefined}
            >
              <View style={styles.alertRow}>
                <View style={[styles.alertIconBg, { backgroundColor: typeColor + '15' }]}>
                  <Ionicons name={getAlertIcon(alert.type)} size={22} color={typeColor} />
                </View>
                <View style={styles.alertContent}>
                  <View style={styles.alertTopRow}>
                    <Text style={[styles.alertType, { color: typeColor }]}>
                      {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert
                    </Text>
                    {isUnread && (
                      <View style={[styles.unreadDot, { backgroundColor: Colors.primaryLight }, Shadow.glow(Colors.primaryLight)]} />
                    )}
                  </View>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                  
                  <View style={styles.alertMeta}>
                    <View style={styles.metaBadge}>
                      <Ionicons name="person" size={10} color={Colors.textSecondary} />
                      <Text style={styles.alertTime}>{alert.teen_name}</Text>
                    </View>
                    <View style={styles.metaBadge}>
                      <Ionicons name="time" size={10} color={Colors.textSecondary} />
                      <Text style={styles.alertTime}>
                        {new Date(alert.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </GlassCard>
          );
        })}

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={48} color={Colors.safe} style={styles.emptyIcon} />
            <Text style={styles.emptyText}>No alerts in this category</Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { 
    paddingHorizontal: Spacing.xl, 
    paddingTop: getSafeAreaTop() + 12, 
    paddingBottom: scaleHeight(110),
    alignSelf: 'center',
    width: '100%',
    maxWidth: 800,
  },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: Spacing.xl 
  },
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
    borderWidth: 1.2,
    borderColor: Colors.safe + '35',
  },
  bulkBtnText: { color: Colors.safe, fontSize: 10, fontWeight: FontWeight.bold },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    zIndex: -1,
  },
  glowLeft: {
    position: 'absolute',
    top: 60,
    left: -40,
  },
  summaryRow: { 
    flexDirection: 'row', 
    gap: Spacing.sm, 
    marginBottom: Spacing.xl,
    justifyContent: 'space-between'
  },
  summaryCard: { 
    flex: 1, 
    alignItems: 'center', 
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  summaryCount: { fontSize: scaleFont(22), fontWeight: FontWeight.heavy },
  summaryLabel: { fontSize: 8, color: Colors.textTertiary, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: FontWeight.semibold },
  filterScrollWrapper: {
    marginBottom: Spacing.lg,
  },
  filterScroll: { 
    paddingRight: Spacing.xl,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: BorderRadius.round,
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(8),
    marginRight: Spacing.sm,
    borderWidth: 1.2,
    borderColor: Colors.border,
  },
  filterChipActive: { 
    backgroundColor: Colors.primary, 
    borderColor: Colors.primaryLight 
  },
  filterLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.semibold },
  filterLabelActive: { color: '#fff', fontWeight: FontWeight.bold },
  alertCard: { 
    marginBottom: Spacing.md,
    padding: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  alertUnread: { 
    borderColor: Colors.primaryLight + '20',
  },
  alertRow: { flexDirection: 'row', gap: Spacing.md },
  alertIconBg: {
    width: scaleWidth(44),
    height: scaleWidth(44),
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContent: { flex: 1 },
  alertTopRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 4 },
  alertType: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  unreadDot: { 
    width: scaleWidth(6), 
    height: scaleWidth(6), 
    borderRadius: scaleWidth(3),
  },
  alertMessage: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18, marginBottom: 6 },
  alertMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: scaleWidth(8),
    paddingVertical: scaleHeight(2),
    borderRadius: BorderRadius.xs,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  alertTime: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.huge },
  emptyIcon: { opacity: 0.8 },
  emptyText: { fontSize: FontSize.md, color: Colors.textTertiary, marginTop: Spacing.md },
});
