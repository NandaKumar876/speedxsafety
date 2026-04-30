// ============================================
// SpeedxSafety - Badges & Streaks Screen
// ============================================

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../../components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { mockBadges, mockTeens } from '../../constants/mockData';

export const BadgesScreen = () => {
  const teen = mockTeens[0];
  const earnedCount = mockBadges.filter(b => b.earned).length;

  return (
    <LinearGradient colors={['#0A0E27', '#111538', '#1A1E3A']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Achievements</Text>

        {/* Streak Hero Card */}
        <GlassCard style={styles.streakCard}>
          <LinearGradient
            colors={['#FF9500', '#FFCC00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.streakGlow}
          >
            <Text style={styles.streakEmoji}>🔥</Text>
          </LinearGradient>
          <View style={styles.streakInfo}>
            <Text style={styles.streakDays}>{teen.streak_days}-Day Streak</Text>
            <Text style={styles.streakSub}>Keep driving safely to extend your streak!</Text>
          </View>
          <View style={styles.streakMeter}>
            <View style={styles.streakMeterBg}>
              <LinearGradient
                colors={['#FF9500', '#FFCC00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.streakMeterFill, { width: `${(teen.streak_days / 7) * 100}%` }]}
              />
            </View>
            <Text style={styles.streakGoal}>Goal: 7 days</Text>
          </View>
        </GlassCard>

        {/* Stats */}
        <View style={styles.statsRow}>
          <GlassCard style={styles.statItem}>
            <Text style={styles.statEmoji}>🏆</Text>
            <Text style={styles.statValue}>{earnedCount}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </GlassCard>
          <GlassCard style={styles.statItem}>
            <Text style={styles.statEmoji}>🎯</Text>
            <Text style={styles.statValue}>{mockBadges.length - earnedCount}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </GlassCard>
          <GlassCard style={styles.statItem}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statValue}>{teen.safety_score}</Text>
            <Text style={styles.statLabel}>Score</Text>
          </GlassCard>
        </View>

        {/* Badge Grid */}
        <Text style={styles.sectionTitle}>All Badges</Text>
        <View style={styles.badgeGrid}>
          {mockBadges.map(badge => (
            <GlassCard
              key={badge.id}
              style={[
                styles.badgeCard,
                badge.earned && styles.badgeCardEarned,
                !badge.earned && styles.badgeCardLocked,
              ]}
            >
              <View style={[styles.badgeIconContainer, badge.earned && styles.badgeIconEarned]}>
                <Text style={styles.badgeIcon}>{badge.icon}</Text>
              </View>
              <Text style={[styles.badgeTitle, !badge.earned && { color: Colors.textTertiary }]}>
                {badge.title}
              </Text>
              <Text style={styles.badgeDesc}>{badge.description}</Text>

              {/* Progress bar */}
              {!badge.earned && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBg}>
                    <LinearGradient
                      colors={Colors.gradientPrimary as any}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressFill, { width: `${badge.progress * 100}%` }]}
                    />
                  </View>
                  <Text style={styles.progressText}>{Math.round(badge.progress * 100)}%</Text>
                </View>
              )}

              {badge.earned && (
                <View style={styles.earnedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={Colors.safe} />
                  <Text style={styles.earnedText}>Earned</Text>
                </View>
              )}
            </GlassCard>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: 100 },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xxl,
  },
  streakCard: {
    marginBottom: Spacing.xxl,
    padding: Spacing.xl,
  },
  streakGlow: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadow.glow('#FF9500'),
  },
  streakEmoji: { fontSize: 32 },
  streakInfo: { marginBottom: Spacing.lg },
  streakDays: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  streakSub: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  streakMeter: {},
  streakMeterBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  streakMeterFill: {
    height: 8,
    borderRadius: 4,
  },
  streakGoal: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
  },
  statEmoji: { fontSize: 20, marginBottom: 4 },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  badgeCard: {
    width: '47%',
    padding: Spacing.lg,
  },
  badgeCardEarned: {
    borderColor: Colors.safe + '30',
  },
  badgeCardLocked: {
    opacity: 0.75,
  },
  badgeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  badgeIconEarned: {
    backgroundColor: Colors.safe + '15',
  },
  badgeIcon: { fontSize: 24 },
  badgeTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  badgeDesc: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    lineHeight: 16,
    marginBottom: Spacing.md,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressBg: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  progressText: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    fontWeight: FontWeight.semibold,
  },
  earnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  earnedText: {
    fontSize: FontSize.xs,
    color: Colors.safe,
    fontWeight: FontWeight.semibold,
  },
});
