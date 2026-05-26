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
import { scaleWidth, scaleHeight, scaleFont } from '../../utils/responsive';

export const BadgesScreen = () => {
  const teen = mockTeens[0];
  const earnedCount = mockBadges.filter(b => b.earned).length;

  return (
    <LinearGradient colors={Colors.gradientBg as any} style={styles.container}>
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
              <Text style={[styles.badgeTitle, !badge.earned && { color: Colors.textTertiary }]} numberOfLines={1}>
                {badge.title}
              </Text>
              <Text style={styles.badgeDesc} numberOfLines={3}>{badge.description}</Text>

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
  streakCard: {
    marginBottom: Spacing.xxl,
    padding: Spacing.xl,
  },
  streakGlow: {
    width: scaleWidth(64),
    height: scaleWidth(64),
    borderRadius: scaleWidth(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadow.glow('#FF9500'),
  },
  streakEmoji: { fontSize: scaleFont(32) },
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
    height: scaleHeight(8),
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: scaleHeight(4),
    overflow: 'hidden',
    marginBottom: 4,
  },
  streakMeterFill: {
    height: scaleHeight(8),
    borderRadius: scaleHeight(4),
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
  statEmoji: { fontSize: scaleFont(20), marginBottom: scaleHeight(4) },
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
    justifyContent: 'space-between',
    rowGap: Spacing.md,
  },
  badgeCard: {
    width: '48%',
    padding: Spacing.md,
    minHeight: scaleHeight(165),
  },
  badgeCardEarned: {
    borderColor: Colors.safe + '30',
  },
  badgeCardLocked: {
    opacity: 0.7,
  },
  badgeIconContainer: {
    width: scaleWidth(44),
    height: scaleWidth(44),
    borderRadius: scaleWidth(12),
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  badgeIconEarned: {
    backgroundColor: Colors.safe + '15',
  },
  badgeIcon: { fontSize: scaleFont(22) },
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
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressBg: {
    flex: 1,
    height: scaleHeight(4),
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: scaleHeight(2),
    overflow: 'hidden',
  },
  progressFill: {
    height: scaleHeight(4),
    borderRadius: scaleHeight(2),
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
