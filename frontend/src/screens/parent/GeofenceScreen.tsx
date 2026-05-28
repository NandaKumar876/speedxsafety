// ============================================
// SpeedxSafety - Geofence Management Screen
// ============================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard, GradientButton } from '../../components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { mockGeofences } from '../../data/mockData';
import { scaleWidth, scaleHeight, scaleFont } from '../../utils/responsive';

export const GeofenceScreen = () => {
  const [geofences, setGeofences] = useState(mockGeofences);

  const toggleFence = (id: string) => {
    setGeofences(prev => prev.map(g =>
      g.zone_id === id ? { ...g, is_active: !g.is_active } : g
    ));
  };

  return (
    <LinearGradient colors={Colors.gradientBg as any} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Safe Zones</Text>
        <Text style={styles.subtitle}>Get alerts when your teen enters or leaves these areas</Text>

        {/* Map visual */}
        <GlassCard style={styles.mapCard}>
          <LinearGradient colors={['#070A1E', '#10173A']} style={styles.mapPlaceholder}>
            {/* Simple zone visualization */}
            {geofences.map((fence, idx) => {
              const baseWidth = scaleWidth(fence.radius_m / 3);
              return (
                <View key={fence.zone_id} style={[styles.zoneCircle, {
                  borderColor: fence.is_active ? fence.color : Colors.textTertiary + '40',
                  backgroundColor: fence.is_active ? fence.color + '10' : 'transparent',
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
              <Ionicons name="expand" size={16} color={Colors.primaryLight} />
              <Text style={styles.mapOverlayText}>Tap to expand map</Text>
            </View>
          </LinearGradient>
        </GlassCard>

        {/* Geofence list */}
        {geofences.map(fence => (
          <GlassCard key={fence.zone_id} style={[styles.fenceCard, { borderLeftColor: fence.color, borderLeftWidth: 3.5 }]}>
            <View style={styles.fenceHeader}>
              <View style={styles.fenceLeft}>
                <View style={[styles.fenceIcon, { backgroundColor: fence.color + '1A' }]}>
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
                trackColor={{ false: '#20264E', true: fence.color + '50' }}
                thumbColor={fence.is_active ? fence.color : '#606A93'}
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
                backgroundColor: fence.is_active ? Colors.safe + '1A' : Colors.textTertiary + '1A' 
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
  scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: scaleHeight(60), paddingBottom: scaleHeight(100) },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.textTertiary, marginTop: 4, marginBottom: Spacing.xxl },
  mapCard: { padding: 0, overflow: 'hidden', marginBottom: Spacing.xxl },
  mapPlaceholder: {
    height: scaleHeight(180),
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
    backgroundColor: 'rgba(6, 9, 25, 0.7)',
    borderRadius: scaleWidth(8),
    paddingHorizontal: scaleWidth(10),
    paddingVertical: scaleHeight(5),
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  mapOverlayText: { fontSize: FontSize.xs, color: Colors.primaryLight, fontWeight: FontWeight.medium },
  fenceCard: { marginBottom: Spacing.md },
  fenceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  fenceLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  fenceIcon: {
    width: scaleWidth(40),
    height: scaleWidth(40),
    borderRadius: scaleWidth(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  fenceName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  fenceRadius: { fontSize: FontSize.sm, color: Colors.textTertiary, marginTop: 1 },
  fenceDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fenceDetail: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  fenceDetailText: { fontSize: FontSize.xs, color: Colors.textTertiary },
  fenceStatusBadge: { borderRadius: BorderRadius.round, paddingHorizontal: scaleWidth(10), paddingVertical: scaleHeight(3) },
  fenceStatusText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
});
