// ============================================
// SpeedxSafety - Admin Users Screen
// ============================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../../components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { scaleWidth, scaleHeight } from '../../utils/responsive';

const allUsers = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'parent', status: 'active', teens: 2, joined: '2026-05-15' },
  { id: '2', name: 'Alex Johnson', email: 'alex@example.com', role: 'teen', status: 'active', parent: 'Sarah Johnson', score: 87, joined: '2026-05-16' },
  { id: '3', name: 'Emma Johnson', email: 'emma@example.com', role: 'teen', status: 'active', parent: 'Sarah Johnson', score: 94, joined: '2026-05-16' },
  { id: '4', name: 'Mike Davis', email: 'mike@example.com', role: 'parent', status: 'active', teens: 1, joined: '2026-05-20' },
  { id: '5', name: 'Jake Davis', email: 'jake@example.com', role: 'teen', status: 'suspended', parent: 'Mike Davis', score: 62, joined: '2026-05-21' },
  { id: '6', name: 'Lisa Park', email: 'lisa@example.com', role: 'parent', status: 'active', teens: 3, joined: '2026-06-01' },
  { id: '7', name: 'Ryan Park', email: 'ryan@example.com', role: 'teen', status: 'active', parent: 'Lisa Park', score: 91, joined: '2026-06-02' },
  { id: '8', name: 'Sophie Park', email: 'sophie@example.com', role: 'teen', status: 'active', parent: 'Lisa Park', score: 78, joined: '2026-06-02' },
];

type FilterType = 'all' | 'parent' | 'teen';

export const AdminUsersScreen = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const filtered = allUsers
    .filter(u => filter === 'all' || u.role === filter)
    .filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <LinearGradient colors={Colors.gradientBg as any} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>User Management</Text>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor={Colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {(['all', 'parent', 'teen'] as FilterType[]).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === 'all' ? 'All' : f === 'parent' ? 'Parents' : 'Riders'} ({allUsers.filter(u => f === 'all' || u.role === f).length})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* User List */}
        {filtered.map(user => (
          <GlassCard key={user.id} style={styles.userCard}>
            <View style={styles.userRow}>
              <LinearGradient
                colors={user.role === 'parent' ? ['#4F46E5', '#6C63FF'] : ['#7C3AED', '#A855F7']}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>{user.name.split(' ').map(n => n[0]).join('')}</Text>
              </LinearGradient>
              <View style={styles.userInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>{user.name}</Text>
                  {user.status === 'suspended' && (
                    <View style={styles.suspendedBadge}>
                      <Text style={styles.suspendedText}>Suspended</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={styles.metaRow}>
                  <View style={[styles.roleBadge, { backgroundColor: user.role === 'parent' ? Colors.primary + '20' : Colors.accent + '20' }]}>
                    <Ionicons name={user.role === 'parent' ? 'shield-checkmark' : 'bicycle'} size={10} color={user.role === 'parent' ? Colors.primary : Colors.accent} />
                    <Text style={[styles.roleText, { color: user.role === 'parent' ? Colors.primary : Colors.accent }]}>{user.role}</Text>
                  </View>
                  {user.role === 'parent' && (
                    <Text style={styles.metaText}>{(user as any).teens} teens linked</Text>
                  )}
                  {user.role === 'teen' && (
                    <>
                      <Text style={styles.metaText}>Parent: {(user as any).parent}</Text>
                      <Text style={[styles.metaText, { color: (user as any).score >= 80 ? Colors.safe : Colors.warning }]}>
                        Score: {(user as any).score}
                      </Text>
                    </>
                  )}
                </View>
              </View>
              <TouchableOpacity style={styles.moreBtn} activeOpacity={0.7}>
                <Ionicons name="ellipsis-vertical" size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            </View>
          </GlassCard>
        ))}

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No users found</Text>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    height: scaleHeight(44),
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.md },
  filterRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xxl },
  filterChip: {
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(8),
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: FontSize.sm, color: Colors.textTertiary, fontWeight: FontWeight.medium },
  filterTextActive: { color: '#fff' },
  userCard: { marginBottom: Spacing.md },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: {
    width: scaleWidth(44),
    height: scaleWidth(44),
    borderRadius: scaleWidth(14),
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  userInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  userName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  suspendedBadge: {
    backgroundColor: Colors.danger + '20',
    borderRadius: BorderRadius.round,
    paddingHorizontal: scaleWidth(8),
    paddingVertical: 1,
  },
  suspendedText: { fontSize: 9, color: Colors.danger, fontWeight: FontWeight.bold },
  userEmail: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 1, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: BorderRadius.round,
    paddingHorizontal: scaleWidth(8),
    paddingVertical: 2,
  },
  roleText: { fontSize: 10, fontWeight: FontWeight.bold, textTransform: 'uppercase' },
  metaText: { fontSize: FontSize.xs, color: Colors.textTertiary },
  moreBtn: {
    width: scaleWidth(32),
    height: scaleWidth(32),
    borderRadius: scaleWidth(10),
    backgroundColor: Colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.huge },
  emptyText: { fontSize: FontSize.md, color: Colors.textTertiary, marginTop: Spacing.md },
});
