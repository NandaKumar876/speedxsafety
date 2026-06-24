// ============================================
// SpeedxSafety - Register Screen (Spatial Edition)
// Floating glass forms, spatial role cards
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, useWindowDimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassInput, GradientButton, GlassCard } from '../../components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { Springs, Duration } from '../../constants/spatial';
import { scaleWidth, scaleHeight, getSafeAreaTop } from '../../utils/responsive';
import { FloatingOrbs } from '../../components/common/SpatialComponents';
import { UserRole } from '../../types';
import { signUp } from '../../services/authService';

export const RegisterScreen = ({ navigation }: any) => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { height } = useWindowDimensions();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const formFade = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: Duration.entrance, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, ...Springs.gentle }),
    ]).start();
  }, []);

  // Animate form in when role is selected
  useEffect(() => {
    if (role) {
      formFade.setValue(0);
      formSlide.setValue(20);
      Animated.parallel([
        Animated.timing(formFade, { toValue: 1, duration: Duration.normal, useNativeDriver: true }),
        Animated.spring(formSlide, { toValue: 0, ...Springs.gentle }),
      ]).start();
    }
  }, [role]);

  const handleRegister = async () => {
    if (!role || !email || !password || !name) {
      alert('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, role, name);
      setLoading(false);
      navigation.replace(role === 'parent' ? 'ParentTabs' : 'TeenTabs');
    } catch (err: any) {
      setLoading(false);
      alert(err.message || 'Registration failed. Please try again.');
    }
  };

  const RoleOption = ({ value, icon, label, desc, gradient, glowColor }: any) => {
    const isActive = role === value;
    const pressScale = useRef(new Animated.Value(1)).current;

    return (
      <TouchableOpacity
        onPress={() => setRole(value)}
        onPressIn={() => Animated.spring(pressScale, { toValue: 0.96, ...Springs.snappy }).start()}
        onPressOut={() => Animated.spring(pressScale, { toValue: 1, ...Springs.bouncy }).start()}
        activeOpacity={0.9}
        style={{ flex: 1 }}
      >
        <Animated.View style={{ transform: [{ scale: pressScale }] }}>
          <View style={[
            styles.roleCard,
            isActive && { borderColor: glowColor, backgroundColor: glowColor + '12' },
            isActive && Shadow.glowSoft(glowColor),
          ]}>
            <LinearGradient
              colors={isActive ? gradient : ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)']}
              style={styles.roleIconBg}
            >
              <Ionicons name={icon} size={26} color={isActive ? '#fff' : Colors.textTertiary} />
            </LinearGradient>
            <Text style={[styles.roleLabel, isActive && { color: glowColor }]}>{label}</Text>
            <Text style={styles.roleDesc}>{desc}</Text>
            {isActive && (
              <View style={[styles.activeIndicator, { backgroundColor: glowColor }]}>
                <Ionicons name="checkmark" size={10} color="#fff" />
              </View>
            )}
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={Colors.gradientBg as any} style={styles.container}>
      <FloatingOrbs orbs={[
        { color: 'rgba(108, 99, 255, 0.06)', size: 160, x: -30, y: 120 },
        { color: 'rgba(168, 85, 247, 0.04)', size: 140, x: 260, y: 400 },
      ]} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.scrollContent, { minHeight: height }]} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join SpeedxSafety to keep your family safe on the road</Text>
          </Animated.View>

          {/* Role Selection */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.label}>I am a...</Text>
            <View style={styles.roleRow}>
              <RoleOption
                value="parent"
                icon="shield-checkmark"
                label="Parent"
                desc="Monitor & protect"
                gradient={['#4338CA', '#6C63FF']}
                glowColor={Colors.primary}
              />
              <RoleOption
                value="teen"
                icon="bicycle"
                label="Rider"
                desc="Drive safely"
                gradient={['#7C3AED', '#A855F7']}
                glowColor={Colors.accent}
              />
            </View>
          </Animated.View>

          {/* Form */}
          {role && (
            <Animated.View style={[styles.form, { opacity: formFade, transform: [{ translateY: formSlide }] }]}>
              <GlassCard elevation="floating" style={{ padding: Spacing.xl }}>
                <GlassInput
                  placeholder="Full name"
                  value={name}
                  onChangeText={setName}
                  icon={<Ionicons name="person-outline" size={18} color={Colors.textTertiary} />}
                />
                <View style={{ height: Spacing.md }} />
                <GlassInput
                  placeholder="Email address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  icon={<Ionicons name="mail-outline" size={18} color={Colors.textTertiary} />}
                />
                <View style={{ height: Spacing.md }} />
                <GlassInput
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  icon={<Ionicons name="lock-closed-outline" size={18} color={Colors.textTertiary} />}
                />

                {role === 'teen' && (
                  <>
                    <View style={{ height: Spacing.md }} />
                    <GlassInput
                      placeholder="Family invite code"
                      value={inviteCode}
                      onChangeText={setInviteCode}
                      icon={<Ionicons name="link-outline" size={18} color={Colors.textTertiary} />}
                    />
                    <Text style={styles.hint}>Ask your parent for the invite code from their app</Text>
                  </>
                )}
              </GlassCard>

              <GradientButton
                title="Create Account"
                onPress={handleRegister}
                loading={loading}
                size="lg"
                colors={role === 'parent' ? ['#4338CA', '#6C63FF'] : ['#7C3AED', '#A855F7']}
                style={{ marginTop: Spacing.xl }}
              />
            </Animated.View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
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
  scrollContent: { flexGrow: 1, paddingHorizontal: Spacing.xxl, paddingTop: getSafeAreaTop() + 16, paddingBottom: Spacing.huge, alignSelf: 'center', width: '100%', maxWidth: 460 },
  backBtn: { width: scaleWidth(42), height: scaleWidth(42), borderRadius: scaleWidth(14), backgroundColor: Colors.bgCard, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.xxl, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  title: { fontSize: FontSize.xxxl, fontWeight: FontWeight.heavy, color: Colors.textPrimary, marginBottom: Spacing.sm, letterSpacing: -1 },
  subtitle: { fontSize: FontSize.md, color: Colors.textTertiary, marginBottom: Spacing.xxxl, lineHeight: 22 },
  label: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: Spacing.md },
  roleRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xxl },
  roleCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    ...Shadow.sm,
  },
  roleIconBg: { width: scaleWidth(54), height: scaleWidth(54), borderRadius: scaleWidth(16), justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  roleLabel: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textSecondary, marginBottom: 2 },
  roleDesc: { fontSize: FontSize.xs, color: Colors.textTertiary },
  activeIndicator: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: scaleWidth(20),
    height: scaleWidth(20),
    borderRadius: scaleWidth(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: { marginBottom: Spacing.xxxl },
  hint: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: Spacing.sm, marginLeft: Spacing.xs },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl, paddingBottom: Spacing.md },
  footerText: { color: Colors.textTertiary, fontSize: FontSize.md },
  footerLink: { color: Colors.primaryLight, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
});
