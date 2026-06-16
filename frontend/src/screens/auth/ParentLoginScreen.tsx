// ============================================
// SpeedxSafety - Parent Login Screen
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions, Animated } from 'react-native';
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
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (isAdmin) {
        navigation.replace('AdminTabs');
      } else {
        navigation.replace('ParentTabs');
      }
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
              {isAdmin ? 'Sign in to the admin dashboard' : 'Sign in to monitor your family\'s safety'}
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View style={[styles.formSection, { opacity: fadeAnim }]}>
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
              title={isAdmin ? 'Sign In as Admin' : 'Sign In'}
              onPress={handleLogin}
              loading={loading}
              size="lg"
              colors={['#4F46E5', '#6C63FF']}
              style={{ marginTop: Spacing.lg }}
            />
          </Animated.View>

          {/* Footer */}
          {!isAdmin && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
                <Text style={styles.footerLink}> Sign Up</Text>
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: Spacing.md,
  },
  forgotText: {
    color: Colors.primaryLight,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: Spacing.md,
  },
  footerText: { color: Colors.textTertiary, fontSize: FontSize.md },
  footerLink: { color: Colors.primaryLight, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
});
