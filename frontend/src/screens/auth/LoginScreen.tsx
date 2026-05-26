// ============================================
// SpeedxSafety - Login Screen
// ============================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassInput, GradientButton } from '../../components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { scaleWidth, scaleHeight } from '../../utils/responsive';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { height } = useWindowDimensions();

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // For demo: navigate based on email
      if (email.includes('parent') || email === '') {
        navigation.replace('ParentTabs');
      } else {
        navigation.replace('TeenTabs');
      }
    }, 1500);
  };

  return (
    <LinearGradient colors={Colors.gradientBg as any} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={[styles.scrollContent, { minHeight: height }]} keyboardShouldPersistTaps="handled">
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={Colors.gradientPrimary as any}
                style={styles.logoGradient}
              >
                <Ionicons name="speedometer" size={scaleWidth(40)} color="#fff" />
              </LinearGradient>
            </View>
            <Text style={styles.appName}>SpeedxSafety</Text>
            <Text style={styles.tagline}>Keeping teen drivers safe</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
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

            <TouchableOpacity style={styles.forgotBtn} activeOpacity={0.7}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <GradientButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              size="lg"
              style={{ marginTop: Spacing.lg }}
            />

            {/* Demo shortcuts */}
            <View style={styles.demoSection}>
              <Text style={styles.demoLabel}>Quick Demo</Text>
              <View style={styles.demoRow}>
                <TouchableOpacity 
                  style={styles.demoBtn}
                  onPress={() => navigation.replace('ParentTabs')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="shield-checkmark" size={18} color={Colors.primaryLight} />
                  <Text style={styles.demoBtnText}>Parent View</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.demoBtn}
                  onPress={() => navigation.replace('TeenTabs')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="car-sport" size={18} color={Colors.safe} />
                  <Text style={[styles.demoBtnText, { color: Colors.safe }]}>Teen View</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
              <Text style={styles.footerLink}> Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.xl,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing.huge,
  },
  logoContainer: {
    marginBottom: Spacing.lg,
  },
  logoGradient: {
    width: scaleWidth(80),
    height: scaleWidth(80),
    borderRadius: scaleWidth(24),
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.glow(Colors.primary),
  },
  appName: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.heavy,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: FontSize.md,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  formSection: {
    marginBottom: Spacing.xxxl,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: Spacing.md,
  },
  forgotText: {
    color: Colors.primaryLight,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  demoSection: {
    marginTop: Spacing.xxxl,
    alignItems: 'center',
  },
  demoLabel: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  demoRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(12),
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  demoBtnText: {
    color: Colors.primaryLight,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: Spacing.md,
  },
  footerText: {
    color: Colors.textTertiary,
    fontSize: FontSize.md,
  },
  footerLink: {
    color: Colors.primaryLight,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
});
