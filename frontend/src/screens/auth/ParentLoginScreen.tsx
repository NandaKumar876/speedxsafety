// ============================================
// SpeedxSafety - Parent Login Screen
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions, Animated, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassInput, GradientButton } from '../../components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { scaleWidth, scaleHeight } from '../../utils/responsive';

export const ParentLoginScreen = ({ navigation, route }: any) => {
  const isAdmin = route?.params?.isAdmin;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { height } = useWindowDimensions();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

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

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.replace('ParentTabs');
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
            <LinearGradient colors={['#4F46E5', '#6C63FF']} style={styles.iconBg}>
              <Ionicons name={isAdmin ? 'settings' : 'shield-checkmark'} size={scaleWidth(32)} color="#fff" />
            </LinearGradient>
            <Text style={styles.title}>{isAdmin ? 'Admin Access' : 'Parent Login'}</Text>
            <Text style={styles.subtitle}>
              {isAdmin ? 'Sign in to the admin dashboard' : 'Sign in with your Google account'}
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View style={[styles.formSection, { opacity: fadeAnim }]}>
            {isAdmin ? (
              <>
                <GlassInput
                  placeholder="Username"
                  value={email}
                  onChangeText={setEmail}
                  icon={<Ionicons name="person-outline" size={20} color={Colors.textTertiary} />}
                />
                <View style={{ height: Spacing.md }} />
                <GlassInput
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  icon={<Ionicons name="lock-closed-outline" size={20} color={Colors.textTertiary} />}
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
                  style={{ marginTop: Spacing.lg }}
                />
              </>
            ) : (
              <View style={styles.googleContainer}>
                <Text style={styles.googlePrompt}>
                  For secure authorization and real-time tracking, please log in using your official Google account.
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
            )}
          </Animated.View>

          {/* Footer */}
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
    marginBottom: Spacing.huge,
  },
  iconBg: {
    width: scaleWidth(72),
    height: scaleWidth(72),
    borderRadius: scaleWidth(22),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadow.glow('#6C63FF'),
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.heavy,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
    textAlign: 'center',
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
  errorText: {
    color: '#EF4444',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: Spacing.md,
  },
  footerText: { color: Colors.textTertiary, fontSize: FontSize.md },
  footerLink: { color: Colors.primaryLight, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
});
