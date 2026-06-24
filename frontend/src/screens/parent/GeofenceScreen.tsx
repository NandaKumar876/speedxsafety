// ============================================
// SpeedxSafety - Geofence Management (Spatial Edition)
// ============================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard, GradientButton } from '../../components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { scaleWidth, scaleHeight, getSafeAreaTop } from '../../utils/responsive';
import { getCurrentUser } from '../../services/authService';
import { getGeofences, updateGeofence } from '../../services/dataService';
import { ActivityIndicator } from 'react-native';
import { Geofence } from '../../types';

export const GeofenceScreen = () => {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const loadGeofences = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          const fetched = await getGeofences(user.id);
          setGeofences(fetched);
        }
      } catch (err) {
        console.warn('Failed to load geofences:', err);
      } finally {
        setLoading(false);
      }
    };
    loadGeofences();
  }, []);

  const toggleFence = async (id: string, currentStatus: boolean) => {
    try {
      await updateGeofence(id, { is_active: !currentStatus });
      setGeofences(prev => prev.map(g =>
        g.zone_id === id ? { ...g, is_active: !currentStatus } : g
      ));
    } catch (err) {
      console.warn('Failed to toggle geofence:', err);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={Colors.gradientBg as any} style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={Colors.gradientBg as any} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Safe Zones</Text>
        <Text style={styles.subtitle}>Get alerts when your teen enters or leaves these areas</Text>

        {/* Map visual */}
        <GlassCard style={styles.mapCard} elevation="floating">
          <LinearGradient colors={['#060A1E', '#0D1245', '#060A1E']} style={styles.mapPlaceholder}>
            {/* Grid */}
            <View style={styles.mapGrid}>
              {[...Array(4)].map((_, i) => (
                <View key={`h${i}`} style={[styles.gridLineH, { top: `${25 * (i + 1)}%` }]} />
              ))}
              {[...Array(4)].map((_, i) => (
                <View key={`v${i}`} style={[styles.gridLineV, { left: `${25 * (i + 1)}%` }]} />
              ))}
            </View>

            {geofences.map((fence, idx) => {
              const baseWidth = scaleWidth(fence.radius_m / 3);
              return (
                <View key={fence.zone_id} style={[styles.zoneCircle, {
                  borderColor: fence.is_active ? fence.color : Colors.textTertiary + '40',
                  backgroundColor: fence.is_active ? fence.color + '08' : 'transparent',
                  top: `${20 + idx * 25}%`,
                  left: `${15 + idx * 25}%`,
                  width: baseWidth,
                  height: baseWidth,
                  borderRadius: baseWidth / 2,
                }]}>
                  <Text style={[styles.zoneLabel, { color: fence.is_active ? fence.color : Colors.textTertiary }]}>
                    {fence.label}
                  </Text>
                </View>
              );
            })}

            <View style={styles.mapOverlay}>
              <Ionicons name="expand" size={14} color={Colors.primaryLight} />
              <Text style={styles.mapOverlayText}>Tap to expand</Text>
            </View>
          </LinearGradient>
        </GlassCard>

        {/* Geofence list */}
        {geofences.map((fence, idx) => (
          <GlassCard
            key={fence.zone_id}
            style={[styles.fenceCard, { borderLeftColor: fence.color, borderLeftWidth: 3 }]}
            animated
            delay={idx * 80}
            glowColor={fence.is_active ? fence.color : undefined}
          >
            <View style={styles.fenceHeader}>
              <View style={styles.fenceLeft}>
                <View style={[styles.fenceIcon, { backgroundColor: fence.color + '15' }]}>
                  <Ionicons
                    name={fence.label === 'Home' ? 'home' : fence.label === 'School' ? 'school' : 'location'}
                    size={20}
                    color={fence.color}
                  />
                </View>
                <View>
                  <Text style={styles.fenceName}>{fence.label}</Text>
                  <Text style={styles.fenceRadius}>{fence.radius_m}m radius</Text>
                </View>
              </View>
              <Switch
                value={fence.is_active}
                onValueChange={() => toggleFence(fence.zone_id, fence.is_active)}
                trackColor={{ false: '#20264E', true: fence.color + '50' }}
                thumbColor={fence.is_active ? fence.color : '#606A93'}
              />
            </View>

            <View style={styles.fenceDetails}>
              <View style={styles.fenceDetail}>
                <Ionicons name="navigate-outline" size={13} color={Colors.textTertiary} />
                <Text style={styles.fenceDetailText}>
                  {fence.center_lat.toFixed(4)}, {fence.center_lng.toFixed(4)}
                </Text>
              </View>
              <View style={[styles.fenceStatusBadge, {
                backgroundColor: fence.is_active ? Colors.safeMuted : Colors.bgCard,
              }]}>
                <Text style={[styles.fenceStatusText, {
                  color: fence.is_active ? Colors.safe : Colors.textTertiary,
                }]}>
                  {fence.is_active ? 'Active' : 'Paused'}
                </Text>
              </View>
            </View>
          </GlassCard>
        ))}

        {/* Add zone button */}
        <GradientButton
          title="Add Safe Zone"
          onPress={() => {}}
          icon={<Ionicons name="add-circle" size={20} color="#fff" />}
          size="lg"
          style={{ marginTop: Spacing.lg }}
        />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: getSafeAreaTop() + 12, paddingBottom: scaleHeight(120), alignSelf: 'center', width: '100%', maxWidth: 800 },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: FontSize.sm, color: Colors.textTertiary, marginTop: 4, marginBottom: Spacing.xxl },
  mapCard: { padding: 0, overflow: 'hidden', marginBottom: Spacing.xxl },
  mapPlaceholder: { height: scaleHeight(190), borderRadius: BorderRadius.xl, position: 'relative', overflow: 'hidden' },
  mapGrid: { ...StyleSheet.absoluteFillObject },
  gridLineH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(108, 99, 255, 0.04)' },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(108, 99, 255, 0.04)' },
  zoneCircle: { position: 'absolute', borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  zoneLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  mapOverlay: {
    position: 'absolute', bottom: Spacing.md, right: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(6, 9, 25, 0.80)', borderRadius: scaleWidth(8), paddingHorizontal: scaleWidth(10), paddingVertical: scaleHeight(5),
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)',
  },
  mapOverlayText: { fontSize: FontSize.xs, color: Colors.primaryLight, fontWeight: FontWeight.medium },
  fenceCard: { marginBottom: Spacing.md },
  fenceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  fenceLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  fenceIcon: { width: scaleWidth(42), height: scaleWidth(42), borderRadius: scaleWidth(14), justifyContent: 'center', alignItems: 'center' },
  fenceName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  fenceRadius: { fontSize: FontSize.sm, color: Colors.textTertiary, marginTop: 1 },
  fenceDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fenceDetail: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  fenceDetailText: { fontSize: FontSize.xs, color: Colors.textTertiary },
  fenceStatusBadge: { borderRadius: BorderRadius.round, paddingHorizontal: scaleWidth(10), paddingVertical: scaleHeight(3) },
  fenceStatusText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
});
