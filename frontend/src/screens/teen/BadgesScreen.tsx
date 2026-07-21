// ============================================
// SpeedxSafety - Badges & Streaks (Spatial Edition)
// ============================================

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../../components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { scaleWidth, scaleHeight, scaleFont, getSafeAreaTop } from '../../utils/responsive';
import { getCurrentUser } from '../../services/authService';
import { getBadges, getTeenByUserUid } from '../../services/dataService';
import { ActivityIndicator } from 'react-native';

export const BadgesScreen = () => {
  const [teen, setTeen] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          const teenData = await getTeenByUserUid(user.id);

          if (teenData) {
            setTeen(teenData);
            const fetched = await getBadges(teenData.teen_id);
            setBadges(fetched);
          }
        }
      } catch (err) {
        console.warn('Failed to load badges:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading || !teen) {
    return (
      <LinearGradient colors={Colors.gradientBg as any} style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </LinearGradient>
    );
  }

  const earnedCount = badges.filter((b: any) => b.earned).length;

  return (
    <LinearGradient colors={Colors.gradientBg as any} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Achievements</Text>

        {/* Streak Hero Card */}
        <GlassCard style={styles.streakCard} elevation="floating" glowColor="rgba(255, 149, 0, 0.15)">
          <View style={styles.streakTopRow}>
            <LinearGradient colors={['#FF9500', '#FFCC00']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.streakGlow}>
              <Text style={styles.streakEmoji}>🔥</Text>
            </LinearGradient>
            <View style={styles.streakInfo}>
              <Text style={styles.streakDays}>{teen.streak_days}-Day Streak</Text>
              <Text style={styles.streakSub}>Keep driving safely to extend your streak!</Text>
            </View>
          </View>
          <View style={styles.streakMeter}>
            <View style={styles.streakMeterBg}>
              <LinearGradient
                colors={['#FF9500', '#FFCC00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.streakMeterFill, { width: `${Math.min((teen.streak_days / 7) * 100, 100)}%` }]}
              />
            </View>
            <Text style={styles.streakGoal}>Goal: 7 days</Text>
          </View>
        </GlassCard>

        {/* Stats */}
        <View style={styles.statsRow}>
          <GlassCard style={styles.statItem} elevation="raised">
            <Text style={styles.statEmoji}>🏆</Text>
            <Text style={styles.statValue}>{earnedCount}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </GlassCard>
          <GlassCard style={styles.statItem} elevation="raised">
            <Text style={styles.statEmoji}>🎯</Text>
            <Text style={styles.statValue}>{badges.length - earnedCount}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </GlassCard>
          <GlassCard style={styles.statItem} elevation="raised">
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statValue}>{teen.safety_score}</Text>
            <Text style={styles.statLabel}>Score</Text>
          </GlassCard>
        </View>

        {/* Badge Grid */}
        <Text style={styles.sectionTitle}>All Badges</Text>
        <View style={styles.badgeGrid}>
          {badges.map((badge: any, idx: number) => (
            <GlassCard
              key={badge.id}
              style={[
                styles.badgeCard,
                badge.earned && { borderColor: Colors.safeMuted },
                !badge.earned && styles.badgeCardLocked,
              ]}
              glowColor={badge.earned ? Colors.safe : undefined}
              animated
              delay={idx * 60}
            >
              <View style={[styles.badgeIconContainer, badge.earned && styles.badgeIconEarned]}>
                <Text style={styles.badgeIcon}>{badge.icon}</Text>
              </View>
              <Text style={[styles.badgeTitle, !badge.earned && { color: Colors.textTertiary }]} numberOfLines={1}>
                {badge.title}
              </Text>
              <Text style={styles.badgeDesc} numberOfLines={3}>{badge.description}</Text>

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
  scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: getSafeAreaTop() + 12, paddingBottom: scaleHeight(120), alignSelf: 'center', width: '100%', maxWidth: 800 },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.xxl, letterSpacing: -0.5 },
  streakCard: { marginBottom: Spacing.xxl, padding: Spacing.xl },
  streakTopRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, marginBottom: Spacing.lg },
  streakGlow: { width: scaleWidth(58), height: scaleWidth(58), borderRadius: scaleWidth(18), justifyContent: 'center', alignItems: 'center', ...Shadow.glow('#FF9500') },
  streakEmoji: { fontSize: scaleFont(28) },
  streakInfo: { flex: 1 },
  streakDays: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  streakSub: { fontSize: FontSize.sm, color: Colors.textTertiary, marginTop: 2 },
  streakMeter: {},
  streakMeterBg: { height: scaleHeight(8), backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: scaleHeight(4), overflow: 'hidden', marginBottom: 4 },
  streakMeterFill: { height: scaleHeight(8), borderRadius: scaleHeight(4) },
  streakGoal: { fontSize: FontSize.xs, color: Colors.textTertiary, textAlign: 'right' },
  statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xxl },
  statItem: { flex: 1, alignItems: 'center', padding: Spacing.md },
  statEmoji: { fontSize: scaleFont(18), marginBottom: scaleHeight(4) },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 1 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.lg },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: Spacing.md },
  badgeCard: { width: '48%', padding: Spacing.md, minHeight: scaleHeight(165) },
  badgeCardLocked: { opacity: 0.65 },
  badgeIconContainer: { width: scaleWidth(44), height: scaleWidth(44), borderRadius: scaleWidth(14), backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  badgeIconEarned: { backgroundColor: Colors.safeMuted },
  badgeIcon: { fontSize: scaleFont(20) },
  badgeTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 4 },
  badgeDesc: { fontSize: FontSize.xs, color: Colors.textTertiary, lineHeight: 16, marginBottom: Spacing.md, flex: 1 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  progressBg: { flex: 1, height: scaleHeight(4), backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: scaleHeight(2), overflow: 'hidden' },
  progressFill: { height: scaleHeight(4), borderRadius: scaleHeight(2) },
  progressText: { fontSize: FontSize.xs, color: Colors.textTertiary, fontWeight: FontWeight.semibold },
  earnedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  earnedText: { fontSize: FontSize.xs, color: Colors.safe, fontWeight: FontWeight.semibold },
});
