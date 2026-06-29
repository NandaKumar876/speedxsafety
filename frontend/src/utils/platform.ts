// ============================================
// SpeedxSafety - Platform Utilities
// Cross-platform helpers for web/native compat
// ============================================

import { Platform } from 'react-native';

/**
 * Whether the native animation driver can be used.
 * On web, the native animated module doesn't exist,
 * so we must fall back to the JS-based driver.
 */
export const canUseNativeDriver = Platform.OS !== 'web';
