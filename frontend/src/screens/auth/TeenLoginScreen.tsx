// ============================================
// SpeedxSafety - Teen/Rider Login Screen
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions, Animated, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { scaleWidth, scaleHeight } from '../../utils/responsive';

export const TeenLoginScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const { height } = useWindowDimensions();

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

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.replace('TeenTabs');
    }, 1500);
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
                onPress={handleGoogleLogin}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#080C2A" size="small" />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={20} color="#EA4335" style={styles.googleIcon} />
                    <Text style={styles.googleBtnText}>Sign in with Google</Text>
                  </>
                )}
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
});
