// ============================================
// SpeedxSafety - Register Screen
// ============================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassInput, GradientButton, GlassCard } from '../../components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { UserRole } from '../../types';

export const RegisterScreen = ({ navigation }: any) => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { height } = useWindowDimensions();

  const handleRegister = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.replace(role === 'parent' ? 'ParentTabs' : 'TeenTabs');
    }, 1500);
  };

  return (
    <LinearGradient colors={Colors.gradientBg as any} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.scrollContent, { minHeight: height }]} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join SpeedxSafety to keep your family safe on the road</Text>

          {/* Role Selection */}
          <Text style={styles.label}>I am a...</Text>
          <View style={styles.roleRow}>
            <TouchableOpacity
              style={[styles.roleCard, role === 'parent' && styles.roleCardActive]}
              onPress={() => setRole('parent')}
            >
              <LinearGradient
                colors={role === 'parent' ? ['#007AFF', '#00C6FF'] : ['transparent', 'transparent']}
                style={styles.roleIconBg}
              >
                <Ionicons name="shield-checkmark" size={28} color={role === 'parent' ? '#fff' : Colors.textTertiary} />
              </LinearGradient>
              <Text style={[styles.roleLabel, role === 'parent' && styles.roleLabelActive]}>Parent</Text>
              <Text style={styles.roleDesc}>Monitor & protect</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleCard, role === 'teen' && styles.roleCardActiveTeen]}
              onPress={() => setRole('teen')}
            >
              <LinearGradient
                colors={role === 'teen' ? ['#34C759', '#30D158'] : ['transparent', 'transparent']}
                style={styles.roleIconBg}
              >
                <Ionicons name="car-sport" size={28} color={role === 'teen' ? '#fff' : Colors.textTertiary} />
              </LinearGradient>
              <Text style={[styles.roleLabel, role === 'teen' && { color: Colors.safe }]}>Teen</Text>
              <Text style={styles.roleDesc}>Drive safely</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          {role && (
            <View style={styles.form}>
              <GlassInput
                placeholder="Full name"
                value={name}
                onChangeText={setName}
                icon={<Ionicons name="person-outline" size={20} color={Colors.textTertiary} />}
              />
              <View style={{ height: Spacing.md }} />
              <GlassInput
                placeholder="Email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                icon={<Ionicons name="mail-outline" size={20} color={Colors.textTertiary} />}
              />
              <View style={{ height: Spacing.md }} />
              <GlassInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                icon={<Ionicons name="lock-closed-outline" size={20} color={Colors.textTertiary} />}
              />

              {role === 'teen' && (
                <>
                  <View style={{ height: Spacing.md }} />
                  <GlassInput
                    placeholder="Family invite code"
                    value={inviteCode}
                    onChangeText={setInviteCode}
                    icon={<Ionicons name="link-outline" size={20} color={Colors.textTertiary} />}
                  />
                  <Text style={styles.hint}>Ask your parent for the invite code from their app</Text>
                </>
              )}

              <GradientButton
                title="Create Account"
                onPress={handleRegister}
                loading={loading}
                size="lg"
                colors={role === 'parent' ? Colors.gradientPrimary as any : Colors.gradientSafe as any}
                style={{ marginTop: Spacing.xxl }}
              />
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.footerLink}> Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: 60,
    paddingBottom: Spacing.huge,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.heavy,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textTertiary,
    marginBottom: Spacing.xxxl,
    lineHeight: 22,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  roleRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  roleCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  roleCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  roleCardActiveTeen: {
    borderColor: Colors.safe,
    backgroundColor: Colors.safe + '10',
  },
  roleIconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  roleLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  roleLabelActive: {
    color: Colors.primary,
  },
  roleDesc: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
  form: {
    marginBottom: Spacing.xxxl,
  },
  hint: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  footerText: { color: Colors.textTertiary, fontSize: FontSize.md },
  footerLink: { color: Colors.primary, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
});
