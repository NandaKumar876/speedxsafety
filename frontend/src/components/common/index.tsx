// ============================================
// SpeedxSafety - Reusable UI Components
// ============================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '../../constants/theme';
import { scaleWidth, scaleHeight, scaleFont } from '../../utils/responsive';

// ---- Glass Card ----
interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle | any;
  onPress?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, onPress }) => {
  const content = (
    <BlurView intensity={65} tint="dark" style={[styles.glassCard, style]}>
      {children}
    </BlurView>
  );
  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.8}>{content}</TouchableOpacity>;
  }
  return content;
};

// ---- Gradient Button ----
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
  const height = size === 'sm' ? scaleHeight(40) : size === 'lg' ? scaleHeight(56) : scaleHeight(48);
  const fontSize = size === 'sm' ? FontSize.sm : size === 'lg' ? FontSize.lg : FontSize.md;

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.8} style={style}>
      <LinearGradient
        colors={colors || Colors.gradientPrimary as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradientBtn, { height, opacity: disabled ? 0.5 : 1 }]}
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
  );
};

// ---- Glass Input ----
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
}) => (
  <BlurView intensity={55} tint="dark" style={[styles.glassInput, style]}>
    {icon && <View style={styles.inputIcon}>{icon}</View>}
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={Colors.textTertiary}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      style={styles.inputText}
    />
  </BlurView>
);

// ---- Status Badge ----
interface StatusBadgeProps {
  label: string;
  color: string;
  small?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, color, small }) => (
  <View style={[styles.statusBadge, { backgroundColor: color + '1A' }, small && { paddingHorizontal: scaleWidth(8), paddingVertical: scaleHeight(2) }]}>
    <View style={[styles.statusDot, { backgroundColor: color }]} />
    <Text style={[styles.statusText, { color }, small && { fontSize: FontSize.xs }]}>{label}</Text>
  </View>
);

// ---- Stat Card ----
interface StatCardProps {
  label: string;
  value: string;
  icon?: string;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color = Colors.primary }) => (
  <BlurView intensity={65} tint="dark" style={styles.statCard}>
    {icon && <Text style={{ fontSize: scaleFont(20), marginBottom: scaleHeight(4) }}>{icon}</Text>}
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </BlurView>
);

// ---- Section Header ----
interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, action, onAction }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {action && (
      <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
        <Text style={styles.sectionAction}>{action}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ---- Styles ----
const styles = StyleSheet.create({
  glassCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.2,
    borderColor: Colors.border,
    padding: Spacing.lg,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  gradientBtn: {
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    ...Shadow.md,
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
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    height: scaleHeight(52),
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
    paddingVertical: scaleHeight(6),
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
    borderWidth: 1.2,
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
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
});
