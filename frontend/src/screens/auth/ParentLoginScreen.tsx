// ============================================
// SpeedxSafety - Parent Login (Spatial Edition)
// Floating glass forms, ambient glow, spatial modal
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions, Animated, ActivityIndicator, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassInput, GradientButton, GlassCard } from '../../components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { Springs, Duration } from '../../constants/spatial';
import { scaleWidth, scaleHeight, getSafeAreaTop } from '../../utils/responsive';
import { FloatingOrbs } from '../../components/common/SpatialComponents';
import { signInWithGoogle } from '../../services/authService';
import { supabase } from '../../services/supabase';

export const ParentLoginScreen = ({ navigation, route }: any) => {
  const isAdmin = route?.params?.isAdmin;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { height } = useWindowDimensions();

  const [googleModalVisible, setGoogleModalVisible] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googleError, setGoogleError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.9)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: Duration.entrance, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, ...Springs.gentle }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (googleModalVisible) {
      Animated.parallel([
        Animated.spring(modalScale, { toValue: 1, ...Springs.gentle }),
        Animated.timing(modalOpacity, { toValue: 1, duration: Duration.normal, useNativeDriver: true }),
      ]).start();
    } else {
      modalScale.setValue(0.9);
      modalOpacity.setValue(0);
    }
  }, [googleModalVisible]);

  const floatTranslate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  const handleLogin = () => {
    setErrorMsg('');
    const adminUser = process.env.EXPO_PUBLIC_ADMIN_USERNAME || 'tony';
    const adminPass = process.env.EXPO_PUBLIC_ADMIN_PASSWORD || 'stark';

    if (email.trim() === '' || password.trim() === '') {
      setErrorMsg('Please enter both username and password');
      return;
    }

    if (email.trim() !== adminUser || password !== adminPass) {
      setErrorMsg('Invalid admin username or password');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.replace('AdminTabs');
    }, 1200);
  };

  const handleGoogleLoginPress = () => {
    setErrorMsg('');
    setGoogleEmail('');
    setGoogleName('');
    setGoogleError('');
    setGoogleModalVisible(true);
  };

  const submitGoogleLogin = async () => {
    if (!googleEmail.trim()) {
      setGoogleError('Please enter a Google email address');
      return;
    }
    if (!googleName.trim()) {
      setGoogleError('Please enter your name');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(googleEmail.trim())) {
      setGoogleError('Please enter a valid email address');
      return;
    }

    setGoogleError('');
    setLoading(true);

    try {
      const emailVal = googleEmail.trim().toLowerCase();
      const nameVal = googleName.trim();
      const roleVal = isAdmin ? 'admin' : 'parent';
      const dummyPassword = 'DefaultDummyPassword123!';

      // Try sign in
      try {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: emailVal,
          password: dummyPassword,
        });

        if (signInError) {
          // Check if user is not found or has invalid credentials (which means we should sign up)
          if (signInError.message.includes('Invalid login credentials') || signInError.message.includes('User not found')) {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: emailVal,
              password: dummyPassword,
              options: {
                data: {
                  name: nameVal,
                  role: roleVal,
                },
              },
            });

            if (signUpError) throw signUpError;

            // Manual profile creation fallback in case database triggers are not present or failed
            if (signUpData.user) {
              const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                  id: signUpData.user.id,
                  email: emailVal,
                  name: nameVal,
                  role: roleVal,
                  is_active: true,
                });
              if (profileError && !profileError.message.includes('relation "profiles" does not exist')) {
                console.warn('Profile creation error during signup fallback:', profileError);
              }
            }
          } else {
            throw signInError;
          }
        } else {
          // Signed in successfully. Let's make sure the profile is in place
          if (signInData.user) {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: signInData.user.id,
                email: emailVal,
                name: nameVal,
                role: roleVal,
                is_active: true,
              });
            // Safe to ignore if it already exists (duplicate key error) or relation is missing
            if (profileError && !profileError.message.includes('duplicate key') && !profileError.message.includes('relation "profiles" does not exist')) {
              console.warn('Profile sync on signin warning:', profileError);
            }
          }
        }
      } catch (innerErr: any) {
        throw innerErr;
      }

      setLoading(false);
      setGoogleModalVisible(false);
      navigation.replace(isAdmin ? 'AdminTabs' : 'ParentTabs');
    } catch (err: any) {
      setLoading(false);
      setGoogleError(err.message || 'Google Sign-In failed. Please try again.');
    }
  };

  return (
    <LinearGradient colors={Colors.gradientBg as any} style={styles.container}>
      <FloatingOrbs orbs={[
        { color: 'rgba(108, 99, 255, 0.07)', size: 180, x: -40, y: 100 },
        { color: 'rgba(79, 70, 229, 0.05)', size: 150, x: 260, y: 350 },
      ]} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.scrollContent, { minHeight: height }]} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>

          <Animated.View style={[styles.headerSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Animated.View style={{ transform: [{ translateY: floatTranslate }] }}>
              <View style={styles.iconOuter}>
                <LinearGradient colors={isAdmin ? ['#334155', '#475569'] : ['#4338CA', '#6C63FF', '#818CF8']} style={styles.iconBg}>
                  <Ionicons name={isAdmin ? 'settings' : 'shield-checkmark'} size={scaleWidth(30)} color="#fff" />
                </LinearGradient>
              </View>
            </Animated.View>
            <Text style={styles.title}>{isAdmin ? 'Admin Access' : 'Parent Login'}</Text>
            <Text style={styles.subtitle}>
              {isAdmin ? 'Sign in to the admin dashboard' : 'Sign in with your Google account'}
            </Text>
          </Animated.View>

          <Animated.View style={[styles.formSection, { opacity: fadeAnim }]}>
            {isAdmin ? (
              <GlassCard elevation="floating" style={{ padding: Spacing.xl }}>
                <GlassInput
                  placeholder="Username"
                  value={email}
                  onChangeText={setEmail}
                  icon={<Ionicons name="person-outline" size={18} color={Colors.textTertiary} />}
                />
                <View style={{ height: Spacing.md }} />
                <GlassInput
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  icon={<Ionicons name="lock-closed-outline" size={18} color={Colors.textTertiary} />}
                />

                {errorMsg ? (
                  <Text style={styles.errorText}>{errorMsg}</Text>
                ) : null}

                <GradientButton
                  title="Sign In as Admin"
                  onPress={handleLogin}
                  loading={loading}
                  size="lg"
                  colors={['#4F46E5', '#6C63FF']}
                  style={{ marginTop: Spacing.xl }}
                />
              </GlassCard>
            ) : (
              <GlassCard elevation="floating" style={styles.googleContainer}>
                <Text style={styles.googlePrompt}>
                  For secure authorization and real-time tracking, please log in using your official Google account.
                </Text>

                <TouchableOpacity
                  style={styles.googleBtn}
                  onPress={handleGoogleLoginPress}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  <View style={styles.googleBtnInner}>
                    <Ionicons name="logo-google" size={20} color="#EA4335" style={styles.googleIcon} />
                    <Text style={styles.googleBtnText}>Sign in with Google</Text>
                  </View>
                </TouchableOpacity>

                {errorMsg ? (
                  <Text style={styles.errorText}>{errorMsg}</Text>
                ) : null}
              </GlassCard>
            )}
          </Animated.View>

          {!isAdmin && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>Need to set up a new account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
                <Text style={styles.footerLink}> Register here</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Google Login Modal — Spatial */}
      <Modal animationType="none" transparent visible={googleModalVisible} onRequestClose={() => setGoogleModalVisible(false)}>
        <Animated.View style={[styles.modalOverlay, { opacity: modalOpacity }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => { setGoogleModalVisible(false); setGoogleError(''); }} activeOpacity={1} />
          <Animated.View style={[styles.modalCard, { transform: [{ scale: modalScale }] }, Shadow.xl]}>
            <View style={styles.modalHighlight} />
            <View style={styles.modalHeader}>
              <View style={styles.modalGoogleIcon}>
                <Ionicons name="logo-google" size={22} color="#EA4335" />
              </View>
              <Text style={styles.modalTitle}>Google Sign In</Text>
            </View>
            <Text style={styles.modalSubtitle}>Authenticate with your Google Email and Full Name.</Text>

            <Text style={{ fontSize: FontSize.xs, color: Colors.textTertiary, fontWeight: FontWeight.semibold, marginBottom: Spacing.xs }}>
              Quick select test account:
            </Text>
            <View style={styles.quickSelectRow}>
              <TouchableOpacity 
                style={styles.quickSelectBtn}
                onPress={() => {
                  setGoogleEmail('john.doe@gmail.com');
                  setGoogleName('John Doe');
                }}
              >
                <Text style={styles.quickSelectText}>John Doe (john.doe@gmail.com)</Text>
              </TouchableOpacity>
            </View>

            <GlassInput placeholder="Google Email Address" value={googleEmail} onChangeText={setGoogleEmail} keyboardType="email-address" icon={<Ionicons name="mail-outline" size={18} color={Colors.textTertiary} />} />
            <View style={{ height: Spacing.md }} />
            <GlassInput placeholder="Full Name" value={googleName} onChangeText={setGoogleName} icon={<Ionicons name="person-outline" size={18} color={Colors.textTertiary} />} />

            {googleError ? <Text style={styles.modalError}>{googleError}</Text> : null}

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => { setGoogleModalVisible(false); setGoogleError(''); }} disabled={loading}>
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtn} onPress={submitGoogleLogin} disabled={loading}>
                <LinearGradient colors={Colors.gradientPrimary as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.modalBtnConfirm}>
                  {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.modalBtnConfirmText}>Continue</Text>}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.xl, alignSelf: 'center', width: '100%', maxWidth: 460 },
  backBtn: { position: 'absolute', top: getSafeAreaTop() + 8, left: 0, width: scaleWidth(42), height: scaleWidth(42), borderRadius: scaleWidth(14), backgroundColor: Colors.bgCard, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, zIndex: 10, ...Shadow.sm },
  headerSection: { alignItems: 'center', marginBottom: Spacing.huge },
  iconOuter: { padding: 3, borderRadius: scaleWidth(26), backgroundColor: 'rgba(108, 99, 255, 0.12)', marginBottom: Spacing.lg },
  iconBg: { width: scaleWidth(70), height: scaleWidth(70), borderRadius: scaleWidth(22), justifyContent: 'center', alignItems: 'center', ...Shadow.glowIntense('#6C63FF') },
  title: { fontSize: FontSize.xxxl, fontWeight: FontWeight.heavy, color: Colors.textPrimary, letterSpacing: -1 },
  subtitle: { fontSize: FontSize.md, color: Colors.textTertiary, marginTop: Spacing.xs, textAlign: 'center' },
  formSection: { marginBottom: Spacing.xxxl },
  googleContainer: { alignItems: 'center', padding: Spacing.xl },
  googlePrompt: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
  googleBtn: { width: '100%', borderRadius: BorderRadius.lg, overflow: 'hidden', ...Shadow.sm },
  googleBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', borderRadius: BorderRadius.lg, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, height: 52 },
  googleIcon: { marginRight: Spacing.sm },
  googleBtnText: { color: '#1a1a2e', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  errorText: { color: Colors.danger, fontSize: FontSize.sm, fontWeight: FontWeight.medium, marginTop: Spacing.md, textAlign: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center', paddingBottom: Spacing.md },
  footerText: { color: Colors.textTertiary, fontSize: FontSize.md },
  footerLink: { color: Colors.primaryLight, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  modalCard: { width: '100%', maxWidth: 400, backgroundColor: Colors.bgSurface, borderRadius: BorderRadius.xxl, borderWidth: 1.5, borderColor: Colors.borderMedium, padding: Spacing.xxl, overflow: 'hidden', position: 'relative' },
  modalHighlight: { position: 'absolute', top: 0, left: 20, right: 20, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  modalGoogleIcon: { width: scaleWidth(40), height: scaleWidth(40), borderRadius: scaleWidth(12), backgroundColor: 'rgba(234, 67, 53, 0.10)', justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  modalSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.lg },
  modalError: { color: Colors.danger, fontSize: FontSize.xs, fontWeight: FontWeight.semibold, marginTop: Spacing.md, textAlign: 'center' },
  modalBtnRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl },
  modalBtn: { flex: 1, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  modalBtnCancel: { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, height: 48, justifyContent: 'center', alignItems: 'center' },
  modalBtnCancelText: { color: Colors.textSecondary, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  modalBtnConfirm: { height: 48, borderRadius: BorderRadius.lg, justifyContent: 'center', alignItems: 'center' },
  modalBtnConfirmText: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  quickSelectRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.xs, marginBottom: Spacing.md, width: '100%' },
  quickSelectBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.round, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderColor: Colors.border },
  quickSelectText: { color: Colors.textSecondary, fontSize: FontSize.xs, fontWeight: FontWeight.medium },
});
