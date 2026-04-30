// ============================================
// SpeedxSafety - Geofence Management Screen
// ============================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard, GradientButton } from '../../components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { mockGeofences } from '../../constants/mockData';

export const GeofenceScreen = () => {
  const [geofences, setGeofences] = useState(mockGeofences);

  const toggleFence = (id: string) => {
    setGeofences(prev => prev.map(g =>
      g.zone_id === id ? { ...g, is_active: !g.is_active } : g
    ));
  };

  return (
    <LinearGradient colors={['#0A0E27', '#111538', '#1A1E3A']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Safe Zones</Text>
        <Text style={styles.subtitle}>Get alerts when your teen enters or leaves these areas</Text>

        {/* Map visual */}
        <GlassCard style={styles.mapCard}>
          <LinearGradient colors={['#0D2137', '#132B4E']} style={styles.mapPlaceholder}>
            {/* Simple zone visualization */}
            {geofences.map((fence, idx) => (
              <View key={fence.zone_id} style={[styles.zoneCircle, {
                borderColor: fence.is_active ? fence.color : Colors.textTertiary + '40',
                backgroundColor: fence.is_active ? fence.color + '10' : 'transparent',
                top: 30 + idx * 40,
                left: 40 + idx * 70,
                width: fence.radius_m / 3,
                height: fence.radius_m / 3,
                borderRadius: fence.radius_m / 6,
              }]}>
                <Text style={[styles.zoneLabel, { color: fence.is_active ? fence.color : Colors.textTertiary }]}>
                  {fence.label}
                </Text>
              </View>
            ))}

            <View style={styles.mapOverlay}>
              <Ionicons name="expand" size={16} color={Colors.primary} />
              <Text style={styles.mapOverlayText}>Tap to expand map</Text>
            </View>
          </LinearGradient>
        </GlassCard>

        {/* Geofence list */}
        {geofences.map(fence => (
          <GlassCard key={fence.zone_id} style={[styles.fenceCard, { borderLeftColor: fence.color, borderLeftWidth: 3 }]}>
            <View style={styles.fenceHeader}>
              <View style={styles.fenceLeft}>
                <View style={[styles.fenceIcon, { backgroundColor: fence.color + '20' }]}>
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
                onValueChange={() => toggleFence(fence.zone_id)}
                trackColor={{ false: '#3A3A4A', true: fence.color + '50' }}
                thumbColor={fence.is_active ? fence.color : '#8E8E93'}
              />
            </View>

            <View style={styles.fenceDetails}>
              <View style={styles.fenceDetail}>
                <Ionicons name="navigate-outline" size={14} color={Colors.textTertiary} />
                <Text style={styles.fenceDetailText}>
                  {fence.center_lat.toFixed(4)}, {fence.center_lng.toFixed(4)}
                </Text>
              </View>
              <View style={[styles.fenceStatusBadge, { 
                backgroundColor: fence.is_active ? Colors.safe + '15' : Colors.textTertiary + '15' 
              }]}>
                <Text style={[styles.fenceStatusText, { 
                  color: fence.is_active ? Colors.safe : Colors.textTertiary 
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
  scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: 100 },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.textTertiary, marginTop: 4, marginBottom: Spacing.xxl },
  mapCard: { padding: 0, overflow: 'hidden', marginBottom: Spacing.xxl },
  mapPlaceholder: {
    height: 180,
    borderRadius: BorderRadius.xl,
    position: 'relative',
    overflow: 'hidden',
  },
  zoneCircle: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoneLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  mapOverlay: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  mapOverlayText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium },
  fenceCard: { marginBottom: Spacing.md },
  fenceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  fenceLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  fenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fenceName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  fenceRadius: { fontSize: FontSize.sm, color: Colors.textTertiary, marginTop: 1 },
  fenceDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fenceDetail: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  fenceDetailText: { fontSize: FontSize.xs, color: Colors.textTertiary },
  fenceStatusBadge: { borderRadius: BorderRadius.round, paddingHorizontal: 10, paddingVertical: 3 },
  fenceStatusText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
});
