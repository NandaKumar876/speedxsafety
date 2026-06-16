// ============================================
// SpeedxSafety - Role Selection Landing Screen
// ============================================

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { scaleWidth, scaleHeight } from '../../utils/responsive';

export const RoleSelectScreen = ({ navigation }: any) => {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(30)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const cardSlide1 = useRef(new Animated.Value(50)).current;
  const cardOpacity1 = useRef(new Animated.Value(0)).current;
  const cardSlide2 = useRef(new Animated.Value(50)).current;
  const cardOpacity2 = useRef(new Animated.Value(0)).current;
  const adminOpacity = useRef(new Animated.Value(0)).current;
  const { height } = useWindowDimensions();

  useEffect(() => {
    Animated.sequence([
      // Logo entrance
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      // Title
      Animated.parallel([
        Animated.timing(titleSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(titleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      // Cards staggered
      Animated.parallel([
        Animated.timing(cardSlide1, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(cardOpacity1, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardSlide2, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(cardOpacity2, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(adminOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const RoleCard = ({
    title, subtitle, icon, gradient, onPress, animSlide, animOpacity, glowColor,
  }: any) => {
    const pressScale = useRef(new Animated.Value(1)).current;
    
    return (
      <Animated.View style={{ opacity: animOpacity, transform: [{ translateY: animSlide }, { scale: pressScale }] }}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPress}
          onPressIn={() => Animated.spring(pressScale, { toValue: 0.96, useNativeDriver: true }).start()}
          onPressOut={() => Animated.spring(pressScale, { toValue: 1, useNativeDriver: true }).start()}
        >
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.roleCard, Shadow.glow(glowColor)]}
          >
            <View style={styles.roleCardContent}>
              <View style={styles.roleIconContainer}>
                <Ionicons name={icon} size={scaleWidth(36)} color="#fff" />
              </View>
              <Text style={styles.roleTitle}>{title}</Text>
              <Text style={styles.roleSubtitle}>{subtitle}</Text>
            </View>
            <View style={styles.roleArrow}>
              <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.7)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <LinearGradient colors={Colors.gradientBg as any} style={styles.container}>
      <View style={[styles.content, { minHeight: height }]}>
        {/* Logo */}
        <Animated.View style={[styles.logoSection, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
          <LinearGradient colors={Colors.gradientPrimary as any} style={styles.logoGradient}>
            <Ionicons name="speedometer" size={scaleWidth(44)} color="#fff" />
          </LinearGradient>
        </Animated.View>

        {/* Title */}
        <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleSlide }] }}>
          <Text style={styles.appName}>SpeedxSafety</Text>
          <Text style={styles.tagline}>Safe rides, happy families</Text>
        </Animated.View>

        {/* Role Cards */}
        <View style={styles.cardsContainer}>
          <RoleCard
            title="I'm a Parent"
            subtitle="Monitor & protect your teen drivers"
            icon="shield-checkmark"
            gradient={['#4F46E5', '#6C63FF']}
            glowColor="#6C63FF"
            onPress={() => navigation.navigate('ParentLogin')}
            animSlide={cardSlide1}
            animOpacity={cardOpacity1}
          />

          <RoleCard
            title="I'm a Rider"
            subtitle="Drive safe, earn badges & rewards"
            icon="bicycle"
            gradient={['#7C3AED', '#A855F7']}
            glowColor="#A855F7"
            onPress={() => navigation.navigate('TeenLogin')}
            animSlide={cardSlide2}
            animOpacity={cardOpacity2}
          />
        </View>

        {/* Admin link */}
        <Animated.View style={[styles.adminSection, { opacity: adminOpacity }]}>
          <TouchableOpacity onPress={() => navigation.navigate('ParentLogin', { isAdmin: true })} activeOpacity={0.7}>
            <Text style={styles.adminLink}>Admin Access →</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoGradient: {
    width: scaleWidth(88),
    height: scaleWidth(88),
    borderRadius: scaleWidth(28),
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.glow(Colors.primary),
  },
  appName: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.heavy,
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: FontSize.md,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.huge,
  },
  cardsContainer: {
    gap: Spacing.lg,
  },
  roleCard: {
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleCardContent: {
    flex: 1,
  },
  roleIconContainer: {
    width: scaleWidth(56),
    height: scaleWidth(56),
    borderRadius: scaleWidth(16),
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  roleTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: '#fff',
    marginBottom: Spacing.xs,
  },
  roleSubtitle: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
  },
  roleArrow: {
    width: scaleWidth(36),
    height: scaleWidth(36),
    borderRadius: scaleWidth(18),
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminSection: {
    alignItems: 'center',
    marginTop: Spacing.xxxl,
  },
  adminLink: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    fontWeight: FontWeight.medium,
  },
});
