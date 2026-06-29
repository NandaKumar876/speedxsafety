// ============================================
// SpeedxSafety - Reusable UI Components (Spatial Edition)
// Premium glassmorphism, floating depth, micro-animations
// ============================================

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  ViewStyle,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, FontFamily, Shadow } from '../../constants/theme';
import { Springs, Duration, Glass, TouchFeedback } from '../../constants/spatial';
import { scaleWidth, scaleHeight, scaleFont } from '../../utils/responsive';
import { canUseNativeDriver } from '../../utils/platform';

// ── Glass Card (Spatial Edition) ─────────────
interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle | any;
  onPress?: () => void;
  animated?: boolean;
  delay?: number;
  elevation?: 'surface' | 'raised' | 'floating';
  glowColor?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children, style, onPress, animated = false, delay = 0,
  elevation = 'raised', glowColor,
}) => {
  const fadeAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const slideAnim = useRef(new Animated.Value(animated ? 24 : 0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: Duration.entrance,
          delay,
          useNativeDriver: canUseNativeDriver,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          delay,
          ...Springs.gentle,
        }),
      ]).start();
    }
  }, [animated, delay]);

  const elevationStyle = elevation === 'floating'
    ? Shadow.md
    : elevation === 'raised'
    ? Shadow.sm
    : Shadow.surface;

  const glowStyle = glowColor ? Shadow.glowSoft(glowColor) : {};

  const content = (
    <Animated.View
      style={[
        styles.glassCard,
        elevationStyle,
        glowStyle,
        style,
        animated && {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Gradient top-edge highlight */}
      <View style={styles.glassHighlight} />
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => Animated.spring(pressScale, { toValue: TouchFeedback.pressedScale, ...Springs.snappy }).start()}
        onPressOut={() => Animated.spring(pressScale, { toValue: 1, ...Springs.bouncy }).start()}
        activeOpacity={0.9}
      >
        <Animated.View style={{ transform: [{ scale: pressScale }] }}>
          {content}
        </Animated.View>
      </TouchableOpacity>
    );
  }
  return content;
};

// ── Gradient Button (Spatial Edition) ────────
interface GradientButtonProps {
  title: string;
  onPress: () => void;
  colors?: string[];
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  title, onPress, colors, icon, disabled, loading, size = 'md', style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const height = size === 'sm' ? scaleHeight(40) : size === 'lg' ? scaleHeight(56) : scaleHeight(48);
  const fontSize = size === 'sm' ? FontSize.sm : size === 'lg' ? FontSize.lg : FontSize.md;
  const gradientColors = colors || Colors.gradientPrimary;

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
        disabled={disabled || loading}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={gradientColors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradientBtn,
            {
              height,
              opacity: disabled ? 0.5 : 1,
            },
            Shadow.md,
            Shadow.glowSoft(gradientColors[0]),
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.btnContent}>
              {icon && <View style={{ marginRight: Spacing.sm }}>{icon}</View>}
              <Text style={[styles.btnText, { fontSize }]}>{title}</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Glass Input (Spatial Edition) ────────────
interface GlassInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: React.ReactNode;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  style?: ViewStyle;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  placeholder, value, onChangeText, icon, secureTextEntry, keyboardType, style,
}) => {
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: Duration.normal,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: Duration.normal,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.border, Colors.borderGlow],
  });

  return (
    <Animated.View style={[styles.glassInput, { borderColor }, style]}>
      {icon && <View style={styles.inputIcon}>{icon}</View>}
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={styles.inputText}
      />
    </Animated.View>
  );
};

// ── Status Badge (Spatial Edition) ───────────
interface StatusBadgeProps {
  label: string;
  color: string;
  small?: boolean;
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, color, small, pulse }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (pulse) {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: canUseNativeDriver }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: canUseNativeDriver }),
        ])
      );
      pulseLoop.start();
      return () => pulseLoop.stop();
    }
  }, [pulse]);

  return (
    <Animated.View
      style={[
        styles.statusBadge,
        { backgroundColor: color + '18' },
        small && { paddingHorizontal: scaleWidth(8), paddingVertical: scaleHeight(2) },
        pulse && { transform: [{ scale: pulseAnim }] },
      ]}
    >
      <View style={[styles.statusDot, { backgroundColor: color, ...Shadow.glow(color) }]} />
      <Text style={[styles.statusText, { color }, small && { fontSize: FontSize.xs }]}>{label}</Text>
    </Animated.View>
  );
};

// ── Stat Card (Spatial Edition) ──────────────
interface StatCardProps {
  label: string;
  value: string;
  icon?: string;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color = Colors.primary }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      ...Springs.bouncy,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.statCard, { transform: [{ scale: scaleAnim }] }]}>
      {icon && <Text style={{ fontSize: scaleFont(18), marginBottom: scaleHeight(4) }}>{icon}</Text>}
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
};

// ── Section Header (Spatial Edition) ─────────
interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, action, onAction }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: Duration.entrance, useNativeDriver: canUseNativeDriver }),
      Animated.spring(slideAnim, { toValue: 0, ...Springs.gentle }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.sectionHeader, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

// ── Skeleton Loader (Spatial Edition) ────────
interface SkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width, height, borderRadius = BorderRadius.md, style }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 1000, useNativeDriver: canUseNativeDriver }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 1000, useNativeDriver: canUseNativeDriver }),
      ])
    );
    shimmerLoop.start();
    return () => shimmerLoop.stop();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.6, 0.3],
  });

  return (
    <Animated.View
      style={[
        {
          width: typeof width === 'string' ? undefined : width,
          flex: width === '100%' ? 1 : undefined,
          height,
          borderRadius,
          backgroundColor: Colors.shimmer,
          opacity,
        },
        style,
      ]}
    />
  );
};

// ── Styles ───────────────────────────────────
const styles = StyleSheet.create({
  glassCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 1,
  },
  gradientBtn: {
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  glassInput: {
    backgroundColor: Colors.bgGlass,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    height: scaleHeight(54),
    overflow: 'hidden',
  },
  inputIcon: {
    marginRight: Spacing.md,
  },
  inputText: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scaleWidth(12),
    paddingVertical: scaleHeight(5),
    borderRadius: BorderRadius.round,
  },
  statusDot: {
    width: scaleWidth(6),
    height: scaleWidth(6),
    borderRadius: scaleWidth(3),
    marginRight: scaleWidth(6),
  },
  statusText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    alignItems: 'center',
    overflow: 'hidden',
    ...Shadow.sm,
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: scaleHeight(2),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  sectionAction: {
    fontSize: FontSize.sm,
    color: Colors.primaryLight,
    fontWeight: FontWeight.semibold,
  },
});
