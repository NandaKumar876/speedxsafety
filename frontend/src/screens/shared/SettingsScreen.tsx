// ============================================
// SpeedxSafety - Settings Screen (Spatial Edition)
// ============================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../../components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { scaleWidth, scaleHeight, scaleFont, getSafeAreaTop } from '../../utils/responsive';
import { AmbientGlow } from '../../components/common/SpatialComponents';
import { getTeens } from '../../services/dataService';
import { getCurrentUser, signOut } from '../../services/authService';
import { CommonActions } from '@react-navigation/native';

export const SettingsScreen = ({ navigation }: any) => {
  const [user, setUser] = useState<any>(null);
  const [teens, setTeens] = useState<any[]>([]);
  const [speedLimit, setSpeedLimit] = useState(80);
  const [curfew, setCurfew] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [crashDetect, setCrashDetect] = useState(true);
  const [phoneDetect, setPhoneDetect] = useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          if (currentUser.role === 'parent') {
            const fetchedTeens = await getTeens(currentUser.id);
            setTeens(fetchedTeens);
          }
        }
      } catch (err) {
        console.warn('Failed to load settings data:', err);
      }
    };
    loadData();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.warn('Sign out failed:', err);
    }
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'RoleSelect' }],
      })
    );
  };

  const SettingRow = ({ icon, iconColor, title, subtitle, right }: any) => (
    <View style={s.settingRow}>
      <View style={[s.settingIcon, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={s.settingInfo}>
        <Text style={s.settingTitle}>{title}</Text>
        {subtitle && <Text style={s.settingSub}>{subtitle}</Text>}
      </View>
      {right}
    </View>
  );

  return (
    <LinearGradient colors={Colors.gradientBg as any} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={s.sc} showsVerticalScrollIndicator={false}>
        
        {/* Title */}
        <Text style={s.title}>Settings</Text>

        {/* Ambient background glows */}
        <View style={s.glowOverlay} pointerEvents="none">
          <AmbientGlow color={Colors.primary} size={160} intensity={0.04} style={s.glowLeft} />
          <AmbientGlow color={Colors.accent} size={150} intensity={0.03} style={s.glowRight} />
        </View>

        {/* Profile Card */}
        <GlassCard style={s.profileCard} elevation="raised" glowColor={Colors.primary}>
          <LinearGradient colors={Colors.gradientPrimary as any} style={[s.avatar, Shadow.glowSoft(Colors.primary)]}>
            <Text style={s.avatarText}>
              {user?.profile?.name 
                ? user.profile.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() 
                : 'US'}
            </Text>
          </LinearGradient>
          <View>
            <Text style={s.profileName}>{user?.profile?.name || user?.email || 'User'}</Text>
            <Text style={s.profileRole}>
              {user?.role === 'parent' ? 'Parent Account' : user?.role === 'admin' ? 'Admin Account' : 'Teen Rider'}
            </Text>
          </View>
        </GlassCard>

        {/* Speed Limits */}
        <Text style={s.sectionTitle}>Speed Settings</Text>
        <GlassCard elevation="surface">
          <SettingRow
            icon="speedometer" iconColor={Colors.primaryLight}
            title="Default Speed Limit"
            subtitle={`${speedLimit} km/h`}
            right={
              <View style={s.stepper}>
                <TouchableOpacity 
                  style={s.stepBtn} 
                  onPress={() => setSpeedLimit(Math.max(30, speedLimit - 5))} 
                  activeOpacity={0.8}
                >
                  <Ionicons name="remove" size={16} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={s.stepValue}>{speedLimit}</Text>
                <TouchableOpacity 
                  style={s.stepBtn} 
                  onPress={() => setSpeedLimit(Math.min(130, speedLimit + 5))} 
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={16} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
            }
          />
        </GlassCard>

        {/* Safety Features */}
        <Text style={s.sectionTitle}>Safety Features</Text>
        <GlassCard elevation="surface">
          <SettingRow icon="moon" iconColor={Colors.primaryLight} title="Night Curfew" subtitle="Stricter limits 10PM–6AM"
            right={
              <Switch 
                value={curfew} 
                onValueChange={setCurfew} 
                trackColor={{ false: '#0A0E2A', true: Colors.primaryLight + '35' }} 
                thumbColor={curfew ? Colors.primary : Colors.textTertiary}
              />
            }
          />
          <View style={s.divider}/>
          <SettingRow icon="alert-circle" iconColor={Colors.danger} title="Crash Detection" subtitle="Auto-alert on sudden deceleration"
            right={
              <Switch 
                value={crashDetect} 
                onValueChange={setCrashDetect} 
                trackColor={{ false: '#0A0E2A', true: Colors.danger + '35' }} 
                thumbColor={crashDetect ? Colors.danger : Colors.textTertiary}
              />
            }
          />
          <View style={s.divider}/>
          <SettingRow icon="phone-portrait" iconColor={Colors.warning} title="Phone Usage Detection" subtitle="Detect phone use while driving"
            right={
              <Switch 
                value={phoneDetect} 
                onValueChange={setPhoneDetect} 
                trackColor={{ false: '#0A0E2A', true: Colors.warning + '35' }} 
                thumbColor={phoneDetect ? Colors.warning : Colors.textTertiary}
              />
            }
          />
        </GlassCard>

        {/* Notifications */}
        <Text style={s.sectionTitle}>Notifications</Text>
        <GlassCard elevation="surface">
          <SettingRow icon="notifications" iconColor={Colors.safe} title="Push Notifications" subtitle="Speed & geofence alerts"
            right={
              <Switch 
                value={notifications} 
                onValueChange={setNotifications} 
                trackColor={{ false: '#0A0E2A', true: Colors.safe + '35' }} 
                thumbColor={notifications ? Colors.safe : Colors.textTertiary}
              />
            }
          />
        </GlassCard>

        {/* Teens Management */}
        <Text style={s.sectionTitle}>Linked Riders</Text>
        {teens.map(teen => (
          <GlassCard key={teen.teen_id} style={s.teenRow} elevation="surface" onPress={() => {}}>
            <View style={s.teenInfo}>
              <LinearGradient colors={['#7C3AED', '#A855F7']} style={s.teenAvatar}>
                <Text style={s.teenInit}>{teen.name[0]}</Text>
              </LinearGradient>
              <View>
                <Text style={s.teenName}>{teen.name}</Text>
                <Text style={s.teenLimit}>Limit: {teen.speed_limit} km/h</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
          </GlassCard>
        ))}

        {/* Sign Out */}
        <TouchableOpacity 
          style={[s.signOut, Shadow.glowSoft(Colors.danger + '10')]} 
          onPress={handleSignOut} 
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={s.version}>SpeedxSafety v1.0.0</Text>
      </ScrollView>
    </LinearGradient>
  );
};

const s = StyleSheet.create({
  sc: { paddingHorizontal: Spacing.xl, paddingTop: getSafeAreaTop() + 12, paddingBottom: scaleHeight(110), alignSelf: 'center', width: '100%', maxWidth: 800 },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.xl },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    zIndex: -1,
  },
  glowLeft: {
    position: 'absolute',
    top: 50,
    left: -40,
  },
  glowRight: {
    position: 'absolute',
    top: 180,
    right: -40,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textSecondary, marginTop: Spacing.xl, marginBottom: Spacing.sm },
  profileCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: Spacing.lg, 
    marginBottom: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  avatar: { width: scaleWidth(52), height: scaleWidth(52), borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  profileName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  profileRole: { fontSize: FontSize.sm, color: Colors.textTertiary, marginTop: 1 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  settingIcon: { width: scaleWidth(38), height: scaleWidth(38), borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center' },
  settingInfo: { flex: 1 },
  settingTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  settingSub: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  stepper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: Spacing.md, 
    backgroundColor: 'rgba(255, 255, 255, 0.03)', 
    borderRadius: BorderRadius.md, 
    paddingHorizontal: scaleWidth(6), 
    paddingVertical: scaleHeight(4),
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepBtn: { width: scaleWidth(30), height: scaleWidth(30), borderRadius: BorderRadius.xs, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  stepValue: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primaryLight, minWidth: scaleWidth(30), textAlign: 'center' },
  teenRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm, padding: Spacing.md },
  teenInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  teenAvatar: { width: scaleWidth(38), height: scaleWidth(38), borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center' },
  teenInit: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  teenName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  teenLimit: { fontSize: FontSize.xs, color: Colors.textTertiary },
  signOut: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: Spacing.sm, 
    marginTop: Spacing.xxxl, 
    paddingVertical: scaleHeight(14), 
    borderWidth: 1.2, 
    borderColor: Colors.danger + '30', 
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(239, 68, 68, 0.03)',
  },
  signOutText: { color: Colors.danger, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  version: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: Spacing.xl },
});
