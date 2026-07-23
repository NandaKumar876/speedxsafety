// ============================================
// SpeedxSafety - Spatial UI Components
// Premium floating, glass, and ambient components
// ============================================

import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '../../constants/theme';
import { Glass, Springs, Duration, TabBar, TouchFeedback } from '../../constants/spatial';
import { scaleWidth, scaleHeight, getSafeAreaBottom } from '../../utils/responsive';
import { canUseNativeDriver } from '../../utils/platform';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Ambient Glow ─────────────────────────────
// Renders a soft colored orb behind content for spatial depth
interface AmbientGlowProps {
  color: string;
  size?: number;
  intensity?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const AmbientGlow: React.FC<AmbientGlowProps> = ({
  color,
  size = 120,
  intensity = 0.15,
  style,
  children,
}) => (
  <View style={[styles.ambientGlowContainer, style]}>
    <View
      style={[
        styles.ambientGlowOrb,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: intensity,
        },
      ]}
    />
    {children}
  </View>
);

// ── Gradient Border ──────────────────────────
// Animated gradient border wrapper
interface GradientBorderProps {
  colors?: string[];
  borderWidth?: number;
  borderRadius?: number;
  style?: ViewStyle;
  children: React.ReactNode;
}

export const GradientBorder: React.FC<GradientBorderProps> = ({
  colors = Colors.gradientPrimary as any,
  borderWidth = 1.5,
  borderRadius = BorderRadius.xl,
  style,
  children,
}) => (
  <LinearGradient
    colors={colors}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={[
      {
        borderRadius,
        padding: borderWidth,
      },
      style,
    ]}
  >
    <View
      style={{
        borderRadius: borderRadius - borderWidth,
        backgroundColor: Colors.bgSecondary,
        overflow: 'hidden',
      }}
    >
      {children}
    </View>
  </LinearGradient>
);

// ── Pulse Ring ───────────────────────────────
// Concentric ring pulse animation for live indicators
interface PulseRingProps {
  color: string;
  size?: number;
  rings?: number;
}

export const PulseRing: React.FC<PulseRingProps> = ({
  color,
  size = 12,
  rings = 2,
}) => {
  const animations = useRef(
    Array.from({ length: rings }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const loops = animations.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 600),
          Animated.timing(anim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: canUseNativeDriver,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: canUseNativeDriver,
          }),
        ])
      )
    );
    loops.forEach(loop => loop.start());
    return () => loops.forEach(loop => loop.stop());
  }, []);

  return (
    <View style={{ width: size * 3, height: size * 3, alignItems: 'center', justifyContent: 'center' }}>
      {animations.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            {
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: 1.5,
              borderColor: color,
            },
            {
              opacity: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.6, 0],
              }),
              transform: [
                {
                  scale: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 3],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
};

// ── Floating Action Button ───────────────────
interface FloatingActionButtonProps {
  icon: string;
  color?: string;
  gradientColors?: string[];
  onPress: () => void;
  size?: number;
  style?: ViewStyle;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  color = '#fff',
  gradientColors,
  onPress,
  size = 56,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: TouchFeedback.pressedScale,
      ...Springs.snappy,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      ...Springs.bouncy,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={(gradientColors || Colors.gradientPrimary) as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              justifyContent: 'center',
              alignItems: 'center',
            },
            Shadow.md,
            Shadow.glowSoft((gradientColors || Colors.gradientPrimary)[0]),
          ]}
        >
          <Ionicons name={icon as any} size={size * 0.45} color={color} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Animated Background Orbs ─────────────────
// Floating colored orbs for immersive backgrounds
interface FloatingOrbsProps {
  orbs?: Array<{ color: string; size: number; x: number; y: number }>;
}

export const FloatingOrbs: React.FC<FloatingOrbsProps> = ({ orbs }) => {
  const defaultOrbs = useMemo(() => orbs || [
    { color: 'rgba(108, 99, 255, 0.08)', size: 200, x: -30, y: -20 },
    { color: 'rgba(168, 85, 247, 0.06)', size: 180, x: SCREEN_WIDTH - 60, y: 120 },
    { color: 'rgba(59, 130, 246, 0.05)', size: 160, x: 40, y: 400 },
  ], [orbs]);

  const animations = useRef(
    defaultOrbs.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const loops = animations.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 4000 + i * 1500,
            useNativeDriver: canUseNativeDriver,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 4000 + i * 1500,
            useNativeDriver: canUseNativeDriver,
          }),
        ])
      )
    );
    loops.forEach(loop => loop.start());
    return () => loops.forEach(loop => loop.stop());
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {defaultOrbs.map((orb, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            borderRadius: orb.size / 2,
            backgroundColor: orb.color,
            transform: [
              {
                translateY: animations[i].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 15 + i * 5],
                }),
              },
              {
                scale: animations[i].interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 1.1, 1],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
};

// ── Glass Tab Bar ────────────────────────────
// Custom floating bottom navigation with glassmorphism
interface GlassTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
  activeTintColor: string;
  inactiveTintColor: string;
}

export const GlassTabBar: React.FC<GlassTabBarProps> = ({
  state,
  descriptors,
  navigation,
  activeTintColor,
  inactiveTintColor,
}) => {
  const tabAnimations = useRef(
    state.routes.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    tabAnimations.forEach((anim: Animated.Value, i: number) => {
      Animated.spring(anim, {
        toValue: state.index === i ? 1 : 0,
        ...Springs.snappy,
      }).start();
    });
  }, [state.index]);

  return (
    <View style={tabBarStyles.wrapper}>
      <BlurView intensity={TabBar.blurIntensity} tint="dark" style={tabBarStyles.blurContainer}>
        <View style={tabBarStyles.container}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const label = options.title ?? route.name;
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const iconScale = tabAnimations[index].interpolate({
              inputRange: [0, 1],
              outputRange: [1, TabBar.activeScale],
            });

            const indicatorOpacity = tabAnimations[index].interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            });

            const labelOpacity = tabAnimations[index].interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 1],
            });

            let iconName: string = 'ellipse';
            if (options.tabBarIcon) {
              // The icon is rendered via the tabBarIcon option
            }

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                activeOpacity={0.7}
                style={tabBarStyles.tab}
              >
                <Animated.View style={{ transform: [{ scale: iconScale }] }}>
                  {options.tabBarIcon?.({
                    color: isFocused ? activeTintColor : inactiveTintColor,
                    focused: isFocused,
                    size: TabBar.iconSize,
                  })}
                </Animated.View>
                <Animated.Text
                  style={[
                    tabBarStyles.label,
                    {
                      color: isFocused ? activeTintColor : inactiveTintColor,
                      opacity: labelOpacity,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {label}
                </Animated.Text>
                {/* Active indicator dot */}
                <Animated.View
                  style={[
                    tabBarStyles.indicator,
                    {
                      backgroundColor: activeTintColor,
                      opacity: indicatorOpacity,
                      ...Shadow.glow(activeTintColor),
                    },
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

// ── Spatial Modal ────────────────────────────
interface SpatialModalContentProps {
  children: React.ReactNode;
  visible: boolean;
  onClose: () => void;
  style?: ViewStyle;
}

export const SpatialModalContent: React.FC<SpatialModalContentProps> = ({
  children,
  visible,
  onClose,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, ...Springs.gentle }),
        Animated.timing(opacityAnim, { toValue: 1, duration: Duration.normal, useNativeDriver: canUseNativeDriver }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 0.9, duration: Duration.fast, useNativeDriver: canUseNativeDriver }),
        Animated.timing(opacityAnim, { toValue: 0, duration: Duration.fast, useNativeDriver: canUseNativeDriver }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.spatialModalOverlay,
        { opacity: opacityAnim },
      ]}
    >
      <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
      <Animated.View
        style={[
          styles.spatialModalCard,
          { transform: [{ scale: scaleAnim }] },
          Shadow.xl,
          style,
        ]}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
};

// ── Stagger Container ────────────────────────
// Wraps children to provide stagger-in animations
interface StaggerContainerProps {
  children: React.ReactNode;
  delay?: number;
  stagger?: number;
}

export const StaggerItem: React.FC<{
  children: React.ReactNode;
  index: number;
  stagger?: number;
  style?: ViewStyle;
}> = ({ children, index, stagger = 80, style }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: Duration.entrance,
        delay: index * stagger,
        useNativeDriver: canUseNativeDriver,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay: index * stagger,
        ...Springs.gentle,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

// ── Styles ───────────────────────────────────
const styles = StyleSheet.create({
  ambientGlowContainer: {
    position: 'relative',
  },
  ambientGlowOrb: {
    position: 'absolute',
    alignSelf: 'center',
    top: -20,
  },
  spatialModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    zIndex: 999,
  },
  spatialModalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.bgSurface,
    borderRadius: BorderRadius.xxl,
    borderWidth: 1.5,
    borderColor: Colors.borderMedium,
    padding: Spacing.xxl,
    overflow: 'hidden',
  },
});

const tabBarStyles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: getSafeAreaBottom() + 6,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: TabBar.marginHorizontal,
    zIndex: 999,
  },
  blurContainer: {
    width: '100%',
    maxWidth: 600,
    borderRadius: TabBar.borderRadius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    ...Shadow.tabBar,
  },
  container: {
    flexDirection: 'row',
    height: TabBar.height,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    backgroundColor: 'rgba(10, 14, 42, 0.75)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    gap: 3,
  },
  label: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    marginTop: 2,
  },
  indicator: {
    width: TabBar.indicatorSize,
    height: TabBar.indicatorSize,
    borderRadius: TabBar.indicatorSize / 2,
    marginTop: 2,
  },
});
