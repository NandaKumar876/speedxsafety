// ============================================
// SpeedxSafety - Trip History Screen
// ============================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../../components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { mockTrips } from '../../data/mockData';
import { Trip } from '../../types';
import { scaleWidth, scaleHeight } from '../../utils/responsive';

const gradeColor = (g: string) =>
  g === 'A' ? Colors.safe : g === 'B' ? Colors.primaryLight : g === 'C' ? Colors.warning : Colors.danger;

const formatDuration = (start: number, end?: number) => {
  if (!end) return 'In progress';
  const mins = Math.round((end - start) / 60000);
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

export const TripHistoryScreen = () => {
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);

  const trips = mockTrips;
  const totalDistance = trips.reduce((s: number, t: Trip) => s + t.distance_km, 0).toFixed(1);
  const totalTrips = trips.length;
  const avgScore = trips.filter((t: Trip) => t.safety_grade === 'A' || t.safety_grade === 'B').length;

  return (
    <LinearGradient colors={Colors.gradientBg as any} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Trip History</Text>

        {/* Stats summary */}
        <View style={styles.summaryRow}>
          <GlassCard style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{totalTrips}</Text>
            <Text style={styles.summaryLabel}>Total Trips</Text>
          </GlassCard>
          <GlassCard style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: Colors.primaryLight }]}>{totalDistance}</Text>
            <Text style={styles.summaryLabel}>Total km</Text>
          </GlassCard>
          <GlassCard style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: Colors.safe }]}>{avgScore}/{totalTrips}</Text>
            <Text style={styles.summaryLabel}>Safe Trips</Text>
          </GlassCard>
        </View>

        {/* Trip list */}
        {trips.map((trip: Trip) => (
          <TouchableOpacity
            key={trip.trip_id}
            onPress={() => setSelectedTrip(selectedTrip === trip.trip_id ? null : trip.trip_id)}
            activeOpacity={0.8}
          >
            <GlassCard style={[styles.tripCard, selectedTrip === trip.trip_id && styles.tripCardExpanded]}>
              <View style={styles.tripHeader}>
                <View style={styles.tripLeft}>
                  <View style={[styles.gradeCircle, { backgroundColor: gradeColor(trip.safety_grade) + '1A', borderColor: gradeColor(trip.safety_grade) }]}>
                    <Text style={[styles.gradeText, { color: gradeColor(trip.safety_grade) }]}>{trip.safety_grade}</Text>
                  </View>
                  <View>
                    <Text style={styles.tripDate}>
                      {new Date(trip.start_time).toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric'
                      })}
                    </Text>
                    <Text style={styles.tripTime}>
                      {new Date(trip.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      {' · '}
                      {formatDuration(trip.start_time, trip.end_time)}
                    </Text>
                  </View>
                </View>
                <Ionicons 
                  name={selectedTrip === trip.trip_id ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color={Colors.textTertiary} 
                />
              </View>

              {/* Expanded details */}
              {selectedTrip === trip.trip_id && (
                <View style={styles.tripDetails}>
                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <Ionicons name="speedometer-outline" size={16} color={Colors.textTertiary} />
                      <Text style={styles.detailLabel}>Max Speed</Text>
                      <Text style={[styles.detailValue, trip.max_speed > 80 && { color: Colors.danger }]}>
                        {trip.max_speed} km/h
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="analytics-outline" size={16} color={Colors.textTertiary} />
                      <Text style={styles.detailLabel}>Avg Speed</Text>
                      <Text style={styles.detailValue}>{trip.avg_speed} km/h</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="map-outline" size={16} color={Colors.textTertiary} />
                      <Text style={styles.detailLabel}>Distance</Text>
                      <Text style={styles.detailValue}>{trip.distance_km} km</Text>
                    </View>
                  </View>
                  {trip.violations > 0 && (
                    <View style={styles.violationBanner}>
                      <Ionicons name="warning" size={14} color={Colors.warning} />
                      <Text style={styles.violationText}>
                        {trip.violations} violation{trip.violations > 1 ? 's' : ''} during this trip
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </GlassCard>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: scaleHeight(60),
    paddingBottom: scaleHeight(100),
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xxl,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
  },
  summaryValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primaryLight,
  },
  summaryLabel: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  tripCard: {
    marginBottom: Spacing.md,
  },
  tripCardExpanded: {
    borderColor: Colors.primaryLight + '30',
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  gradeCircle: {
    width: scaleWidth(40),
    height: scaleWidth(40),
    borderRadius: scaleWidth(20),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.2,
  },
  gradeText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  tripDate: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  tripTime: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  tripDetails: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
    gap: 4,
  },
  detailLabel: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
  detailValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  violationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  violationText: {
    fontSize: FontSize.sm,
    color: Colors.warning,
    fontWeight: FontWeight.medium,
  },
});
