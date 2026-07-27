// ============================================
// SpeedxSafety - Supabase Client Configuration
// ============================================

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Load credentials from environment variables
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

if (!SUPABASE_URL) {
  console.error('[SpeedxSafety] Missing SUPABASE_URL — set EXPO_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL in your .env file');
}
if (!SUPABASE_ANON_KEY) {
  console.error('[SpeedxSafety] Missing SUPABASE_ANON_KEY — set EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in your .env file');
}

// TEST_MODE is enabled if EXPO_PUBLIC_TEST_MODE is true (or not explicitly set to 'false'),
// or if Supabase project credentials are missing or unconfigured.
const envTestMode = process.env.EXPO_PUBLIC_TEST_MODE;
const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('YOUR_PROJECT_ID'));

export const TEST_MODE = envTestMode === 'true' || (envTestMode !== 'false' && true) || !isSupabaseConfigured;

if (TEST_MODE) {
  console.log('[SpeedxSafety] Running in TEST_MODE (local auth & mock data active)');
}

export const supabase = createClient(SUPABASE_URL || 'https://localhost.supabase.co', SUPABASE_ANON_KEY || 'anon-key', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Export for easy access
export default supabase;
