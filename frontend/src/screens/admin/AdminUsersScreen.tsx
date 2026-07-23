// ============================================
// SpeedxSafety - Admin Users Screen (Spatial Edition)
// ============================================

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../../components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { scaleWidth, scaleHeight, scaleFont, getSafeAreaTop } from '../../utils/responsive';
import { getAllUsers } from '../../services/dataService';
import { AmbientGlow } from '../../components/common/SpatialComponents';

type FilterType = 'all' | 'parent' | 'teen';

export const AdminUsersScreen = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

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
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Title */}
        <Text style={styles.title}>User Management</Text>

        {/* Ambient background glows */}
        <View style={styles.glowOverlay} pointerEvents="none">
          <AmbientGlow color={Colors.primary} size={160} intensity={0.04} style={styles.glowLeft} />
        </View>

        {/* Search Bar with glowing focus states */}
        <View style={[
          styles.searchBar, 
          searchFocused && { borderColor: Colors.borderGlow, ...Shadow.glowSoft(Colors.primary) }
        ]}>
          <Ionicons name="search" size={18} color={searchFocused ? Colors.primaryLight : Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor={Colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips Row */}
        <View style={styles.filterRow}>
          {(['all', 'parent', 'teen'] as FilterType[]).map(f => {
            const isActive = filter === f;
            const count = users.filter(u => f === 'all' || u.role === f).length;
            return (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterChip, 
                  isActive && styles.filterChipActive,
                  isActive && Shadow.glowSoft(Colors.primary)
                ]}
                onPress={() => setFilter(f)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {f === 'all' ? 'All' : f === 'parent' ? 'Parents' : 'Riders'} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <>
            {/* User List */}
            {filtered.map((user, idx) => (
              <GlassCard 
                key={user.id} 
                style={styles.userCard}
                animated
                delay={idx * 60}
                elevation="raised"
              >
                <View style={styles.userRow}>
                  <LinearGradient
                    colors={user.role === 'parent' ? ['#4F46E5', '#6C63FF'] : ['#7C3AED', '#A855F7']}
                    style={styles.avatar}
                  >
                    <Text style={styles.avatarText}>
                      {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </Text>
                  </LinearGradient>
                  
                  <View style={styles.userInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.userName}>{user.name}</Text>
                      {user.status === 'suspended' && (
                        <View style={[styles.suspendedBadge, Shadow.glowSoft(Colors.danger)]}>
                          <Text style={styles.suspendedText}>Suspended</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    
                    <View style={styles.metaRow}>
                      <View style={[
                        styles.roleBadge, 
                        { backgroundColor: (user.role === 'parent' ? Colors.primary : Colors.accent) + '15' }
                      ]}>
                        <Ionicons 
                          name={user.role === 'parent' ? 'shield-checkmark' : 'bicycle'} 
                          size={10} 
                          color={user.role === 'parent' ? Colors.primaryLight : Colors.accentLight} 
                        />
                        <Text style={[
                          styles.roleText, 
                          { color: user.role === 'parent' ? Colors.primaryLight : Colors.accentLight }
                        ]}>
                          {user.role}
                        </Text>
                      </View>
                      
                      {user.role === 'parent' && (
                        <Text style={styles.metaText}>{user.teens} teen(s) linked</Text>
                      )}
                      {user.role === 'teen' && (
                        <>
                          <Text style={styles.metaText}>Parent: {user.parent}</Text>
                          <Text style={[styles.metaText, { color: user.score >= 80 ? Colors.safeLight : Colors.warningLight }]}>
                            Score: {user.score}%
                          </Text>
                        </>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity style={styles.moreBtn} activeOpacity={0.8}>
                    <Ionicons name="ellipsis-vertical" size={18} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ))}

            {filtered.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="search" size={48} color={Colors.textTertiary} style={styles.emptyIcon} />
                <Text style={styles.emptyText}>No matching users found</Text>
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
  scrollContent: { 
    paddingHorizontal: Spacing.xl, 
    paddingTop: getSafeAreaTop() + 12, 
    paddingBottom: scaleHeight(110),
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1100,
  },
  title: { 
    fontSize: FontSize.xxl, 
    fontWeight: FontWeight.bold, 
    color: Colors.textPrimary, 
    marginBottom: Spacing.xl 
  },
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
    top: 50,
    left: -40,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BorderRadius.md,
    borderWidth: 1.2,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    height: scaleHeight(48),
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.md },
  filterRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  filterChip: {
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(8),
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1.2,
    borderColor: Colors.border,
  },
  filterChipActive: { 
    backgroundColor: Colors.primary, 
    borderColor: Colors.primaryLight 
  },
  filterText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.semibold },
  filterTextActive: { color: '#fff', fontWeight: FontWeight.bold },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: Spacing.huge 
  },
  userCard: { 
    marginBottom: Spacing.md,
    padding: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: {
    width: scaleWidth(44),
    height: scaleWidth(44),
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  userInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  userName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  suspendedBadge: {
    backgroundColor: Colors.danger + '15',
    borderRadius: BorderRadius.round,
    paddingHorizontal: scaleWidth(8),
    paddingVertical: scaleHeight(2),
    borderWidth: 1,
    borderColor: Colors.danger + '30',
  },
  suspendedText: { fontSize: 8, color: Colors.dangerLight, fontWeight: FontWeight.heavy, letterSpacing: 0.5 },
  userEmail: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 1, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: BorderRadius.round,
    paddingHorizontal: scaleWidth(8),
    paddingVertical: scaleHeight(2),
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  roleText: { fontSize: 9, fontWeight: FontWeight.heavy, textTransform: 'uppercase', letterSpacing: 0.5 },
  metaText: { fontSize: FontSize.xs, color: Colors.textTertiary },
  moreBtn: {
    width: scaleWidth(36),
    height: scaleWidth(36),
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.huge },
  emptyIcon: { opacity: 0.4 },
  emptyText: { fontSize: FontSize.md, color: Colors.textTertiary, marginTop: Spacing.md },
});
