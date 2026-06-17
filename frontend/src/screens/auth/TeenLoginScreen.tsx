// ============================================
// SpeedxSafety - Teen/Rider Login Screen
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions, Animated, ActivityIndicator, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { scaleWidth, scaleHeight } from '../../utils/responsive';
import { GlassInput, GlassCard } from '../../components/common';
import { signInWithGoogleSimulated } from '../../services/authService';

export const TeenLoginScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const { height } = useWindowDimensions();

  // Google Login States
  const [googleModalVisible, setGoogleModalVisible] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googleError, setGoogleError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const badgePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    // Pulsing badge animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(badgePulse, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(badgePulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleGoogleLoginPress = () => {
    setGoogleEmail('');
    setGoogleName('');
    setGoogleError('');
    setGoogleModalVisible(true);
  };

  const submitGoogleLogin = async () => {
    setGoogleError('');
    if (!googleEmail.trim() || !googleName.trim()) {
      setGoogleError('Both Google Email and Full Name are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(googleEmail.trim())) {
      setGoogleError('Please enter a valid Google email address');
      return;
    }

    setLoading(true);
    try {
      await signInWithGoogleSimulated(googleEmail.trim(), googleName.trim(), 'teen');
      setLoading(false);
      setGoogleModalVisible(false);
      navigation.replace('TeenTabs');
    } catch (err: any) {
      setLoading(false);
      setGoogleError(err.message || 'Google Sign-In failed. Please try again.');
    }
  };


  return (
    <LinearGradient colors={Colors.gradientBg as any} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.scrollContent, { minHeight: height }]} keyboardShouldPersistTaps="handled">
          {/* Back Button */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>

          {/* Header */}
          <Animated.View style={[styles.headerSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Animated.View style={{ transform: [{ scale: badgePulse }] }}>
              <LinearGradient colors={['#7C3AED', '#A855F7']} style={styles.iconBg}>
                <Ionicons name="bicycle" size={scaleWidth(36)} color="#fff" />
              </LinearGradient>
            </Animated.View>
            <Text style={styles.title}>Rider Login</Text>
            <Text style={styles.subtitle}>Start your safe ride 🏍️</Text>
          </Animated.View>

          {/* Stats teaser */}
          <Animated.View style={[styles.statsTeaser, { opacity: fadeAnim }]}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🏆</Text>
              <Text style={styles.statText}>Earn Badges</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={styles.statText}>Build Streaks</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={styles.statText}>Score Points</Text>
            </View>
          </Animated.View>

          {/* Form */}
          <Animated.View style={[styles.formSection, { opacity: fadeAnim }]}>
            <View style={styles.googleContainer}>
              <Text style={styles.googlePrompt}>
                Please sign in with your Google account to start tracking your safety score and building streaks.
              </Text>
              
              <TouchableOpacity 
                style={[styles.googleBtn, Shadow.glow('rgba(255,255,255,0.08)')]} 
                onPress={handleGoogleLoginPress}
                activeOpacity={0.8}
                disabled={loading}
              >
                <Ionicons name="logo-google" size={20} color="#EA4335" style={styles.googleIcon} />
                <Text style={styles.googleBtnText}>Sign in with Google</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Need to set up a new account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
              <Text style={styles.footerLink}> Register here</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Google Login Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={googleModalVisible}
        onRequestClose={() => setGoogleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="logo-google" size={28} color="#EA4335" />
              <Text style={styles.modalTitle}>Google Sign In</Text>
            </View>
            <Text style={styles.modalSubtitle}>
              Please authenticate using your Google Email (Main ID) and Full Name.
            </Text>

            <GlassInput
              placeholder="Google Email Address"
              value={googleEmail}
              onChangeText={setGoogleEmail}
              keyboardType="email-address"
              icon={<Ionicons name="mail-outline" size={20} color={Colors.textTertiary} />}
            />
            <View style={{ height: Spacing.md }} />
            <GlassInput
              placeholder="Full Name"
              value={googleName}
              onChangeText={setGoogleName}
              icon={<Ionicons name="person-outline" size={20} color={Colors.textTertiary} />}
            />

            {googleError ? (
              <Text style={styles.modalError}>{googleError}</Text>
            ) : null}

            <View style={styles.modalBtnRow}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnCancel]} 
                onPress={() => {
                  setGoogleModalVisible(false);
                  setGoogleError('');
                }}
                disabled={loading}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnConfirm]} 
                onPress={submitGoogleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalBtnConfirmText}>Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.xl,
  },
  backBtn: {
    position: 'absolute',
    top: scaleHeight(50),
    left: 0,
    width: scaleWidth(42),
    height: scaleWidth(42),
    borderRadius: scaleWidth(14),
    backgroundColor: Colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    zIndex: 10,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  iconBg: {
    width: scaleWidth(80),
    height: scaleWidth(80),
    borderRadius: scaleWidth(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadow.glow('#A855F7'),
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.heavy,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: FontSize.lg,
    color: Colors.accentLight,
    marginTop: Spacing.xs,
    fontWeight: FontWeight.medium,
  },
  statsTeaser: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statIcon: {
    fontSize: scaleWidth(20),
  },
  statText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
  },
  statDivider: {
    width: 1,
    height: scaleHeight(28),
    backgroundColor: Colors.border,
  },
  formSection: {
    marginBottom: Spacing.xxxl,
  },
  googleContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    marginTop: Spacing.md,
  },
  googlePrompt: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    width: '100%',
    height: 52,
  },
  googleIcon: {
    marginRight: Spacing.sm,
  },
  googleBtnText: {
    color: '#080C2A',
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: Spacing.md,
  },
  footerText: { color: Colors.textTertiary, fontSize: FontSize.md },
  footerLink: { color: Colors.accentLight, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: Spacing.xxl,
    borderRadius: BorderRadius.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  modalError: {
    color: '#EF4444',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  modalBtn: {
    flex: 1,
    height: 46,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnCancel: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalBtnCancelText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  modalBtnConfirm: {
    backgroundColor: Colors.accent,
  },
  modalBtnConfirmText: {
    color: '#fff',
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});

