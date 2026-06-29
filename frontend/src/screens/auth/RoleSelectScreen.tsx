// ============================================
// SpeedxSafety - Role Selection (Spatial Edition)
// Immersive hero, floating cards, ambient orbs
// ============================================

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../constants/theme';
import { Springs, Duration, Stagger } from '../../constants/spatial';
import { FloatingOrbs } from '../../components/common/SpatialComponents';
import { scaleWidth, scaleHeight, getSafeAreaTop } from '../../utils/responsive';
import { canUseNativeDriver } from '../../utils/platform';

export const RoleSelectScreen = ({ navigation }: any) => {
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(30)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const cardSlide1 = useRef(new Animated.Value(60)).current;
  const cardOpacity1 = useRef(new Animated.Value(0)).current;
  const cardSlide2 = useRef(new Animated.Value(60)).current;
  const cardOpacity2 = useRef(new Animated.Value(0)).current;
  const adminOpacity = useRef(new Animated.Value(0)).current;
  const { height } = useWindowDimensions();

  // Staggered entrance sequence
  useEffect(() => {
    Animated.sequence([
      // Logo entrance with spring
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, ...Springs.bouncy }),
        Animated.timing(logoOpacity, { toValue: 1, duration: Duration.normal, useNativeDriver: canUseNativeDriver }),
      ]),
      // Title slide up
      Animated.parallel([
        Animated.spring(titleSlide, { toValue: 0, ...Springs.gentle }),
        Animated.timing(titleOpacity, { toValue: 1, duration: Duration.normal, useNativeDriver: canUseNativeDriver }),
      ]),
      // Cards staggered entrance
      Animated.parallel([
        Animated.spring(cardSlide1, { toValue: 0, ...Springs.gentle }),
        Animated.timing(cardOpacity1, { toValue: 1, duration: Duration.entrance, useNativeDriver: canUseNativeDriver }),
      ]),
      Animated.parallel([
        Animated.spring(cardSlide2, { toValue: 0, ...Springs.gentle }),
        Animated.timing(cardOpacity2, { toValue: 1, duration: Duration.entrance, useNativeDriver: canUseNativeDriver }),
        Animated.timing(adminOpacity, { toValue: 1, duration: Duration.slow, useNativeDriver: canUseNativeDriver }),
      ]),
    ]).start();
  }, []);

  // Continuous floating animation for logo
  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2500, useNativeDriver: canUseNativeDriver }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2500, useNativeDriver: canUseNativeDriver }),
      ])
    );
    floatLoop.start();
    return () => floatLoop.stop();
  }, []);

  const floatTranslate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const RoleCard = ({
    title, subtitle, icon, gradient, onPress, animSlide, animOpacity, glowColor,
  }: any) => {
    const pressScale = useRef(new Animated.Value(1)).current;

    return (
      <Animated.View style={{ opacity: animOpacity, transform: [{ translateY: animSlide }] }}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPress}
          onPressIn={() => Animated.spring(pressScale, { toValue: 0.95, ...Springs.snappy }).start()}
          onPressOut={() => Animated.spring(pressScale, { toValue: 1, ...Springs.bouncy }).start()}
        >
          <Animated.View style={{ transform: [{ scale: pressScale }] }}>
            <LinearGradient
              colors={gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.roleCard, Shadow.glowSoft(glowColor)]}
            >
              {/* Glass highlight at top */}
              <View style={styles.cardHighlight} />

              <View style={styles.roleCardContent}>
                <View style={styles.roleIconContainer}>
                  <Ionicons name={icon} size={scaleWidth(32)} color="#fff" />
                </View>
                <Text style={styles.roleTitle}>{title}</Text>
                <Text style={styles.roleSubtitle}>{subtitle}</Text>
              </View>
              <View style={styles.roleArrow}>
                <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.8)" />
              </View>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <LinearGradient colors={Colors.gradientBg as any} style={styles.container}>
      {/* Floating ambient orbs */}
      <FloatingOrbs />

      <View style={[styles.content, { minHeight: height }]}>
        {/* Logo with float animation */}
        <Animated.View style={[
          styles.logoSection,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }, { translateY: floatTranslate }],
          },
        ]}>
          <View style={styles.logoOuter}>
            <LinearGradient colors={Colors.gradientPrimary as any} style={styles.logoGradient}>
              <Ionicons name="speedometer" size={scaleWidth(40)} color="#fff" />
            </LinearGradient>
          </View>
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
            gradient={['#4338CA', '#6C63FF', '#818CF8']}
            glowColor="#6C63FF"
            onPress={() => navigation.navigate('ParentLogin')}
            animSlide={cardSlide1}
            animOpacity={cardOpacity1}
          />

          <RoleCard
            title="I'm a Rider"
            subtitle="Drive safe, earn badges & rewards"
            icon="bicycle"
            gradient={['#7C3AED', '#A855F7', '#C084FC']}
            glowColor="#A855F7"
            onPress={() => navigation.navigate('TeenLogin')}
            animSlide={cardSlide2}
            animOpacity={cardOpacity2}
          />
        </View>

        {/* Admin link */}
        <Animated.View style={[styles.adminSection, { opacity: adminOpacity }]}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ParentLogin', { isAdmin: true })}
            activeOpacity={0.7}
            style={styles.adminBtn}
          >
            <Ionicons name="shield-outline" size={14} color={Colors.textTertiary} />
            <Text style={styles.adminLink}>Admin Access</Text>
            <Ionicons name="chevron-forward" size={12} color={Colors.textTertiary} />
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
  logoOuter: {
    padding: 3,
    borderRadius: scaleWidth(30),
    backgroundColor: 'rgba(108, 99, 255, 0.12)',
  },
  logoGradient: {
    width: scaleWidth(82),
    height: scaleWidth(82),
    borderRadius: scaleWidth(27),
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.glowIntense(Colors.primary),
  },
  appName: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.heavy,
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -1.5,
  },
  tagline: {
    fontSize: FontSize.md,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.huge,
    letterSpacing: 0.3,
  },
  cardsContainer: {
    gap: Spacing.lg,
  },
  roleCard: {
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  cardHighlight: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    borderRadius: 1,
  },
  roleCardContent: {
    flex: 1,
  },
  roleIconContainer: {
    width: scaleWidth(52),
    height: scaleWidth(52),
    borderRadius: scaleWidth(16),
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  roleTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: '#fff',
    marginBottom: Spacing.xs,
  },
  roleSubtitle: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.70)',
    lineHeight: 20,
  },
  roleArrow: {
    width: scaleWidth(40),
    height: scaleWidth(40),
    borderRadius: scaleWidth(20),
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  adminSection: {
    alignItems: 'center',
    marginTop: Spacing.xxxl,
  },
  adminBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  adminLink: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    fontWeight: FontWeight.medium,
  },
});
