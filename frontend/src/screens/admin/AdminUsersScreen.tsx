// ============================================
// SpeedxSafety - Admin Users Screen
// ============================================

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../../components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { scaleWidth, scaleHeight } from '../../utils/responsive';
import { getAllUsers } from '../../services/dataService';

type FilterType = 'all' | 'parent' | 'teen';

export const AdminUsersScreen = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const dbUsers = await getAllUsers();
      
      const mappedUsers = dbUsers.map(u => ({
        id: u.id,
        name: u.name || u.email.split('@')[0],
        email: u.email,
        role: u.role || 'teen',
        status: u.is_active ? 'active' : 'suspended',
        joined: u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : 'Just now',
        teens: u.role === 'parent' ? 1 : undefined,
        parent: u.role === 'teen' ? 'Parent User' : undefined,
        score: u.role === 'teen' ? 90 : undefined,
      }));

      setUsers(mappedUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users
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
                {f === 'all' ? 'All' : f === 'parent' ? 'Parents' : 'Riders'} ({users.filter(u => f === 'all' || u.role === f).length})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing.huge }}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <>
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
                        <Text style={styles.metaText}>{user.teens} teen(s) linked</Text>
                      )}
                      {user.role === 'teen' && (
                        <>
                          <Text style={styles.metaText}>Parent: {user.parent}</Text>
                          <Text style={[styles.metaText, { color: user.score >= 80 ? Colors.safe : Colors.warning }]}>
                            Score: {user.score}
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
          </>
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
