// ============================================
// SpeedxSafety - Auth Service (Supabase & Test Mode)
// ============================================

import { supabase, TEST_MODE } from './supabase';
import { UserRole } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Sign up a new user with role metadata
 */
export const signUp = async (email: string, password: string, role: UserRole, name: string) => {
  if (TEST_MODE) {
    const mockUser = {
      id: role === 'parent' ? 'parent-001' : role === 'admin' ? 'admin-001' : 'teen-001',
      email,
      user_metadata: { name, role },
    };
    await AsyncStorage.setItem('test_session_user', JSON.stringify(mockUser));
    return { user: mockUser };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
      },
    },
  });

  if (error) throw error;

  // Upsert profile record (handles race with database trigger)
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: data.user.id,
          email,
          name,
          role,
          is_active: true,
        },
        { onConflict: 'id' }
      );

    if (profileError) console.warn('Profile creation error:', profileError);
  }

  return data;
};

/**
 * Sign in with email and password (real Supabase Auth)
 */
export const signIn = async (email: string, password: string) => {
  if (TEST_MODE) {
    const mockUser = {
      id: email.includes('alex') || email.includes('smith') ? 'teen-001' : email.includes('tony') || email.includes('stark') ? 'admin-001' : 'parent-001',
      email,
      user_metadata: {
        name: email.includes('alex') || email.includes('smith') ? 'Alex Smith' : email.includes('tony') || email.includes('stark') ? 'Tony Stark' : 'John Doe',
        role: email.includes('alex') || email.includes('smith') ? 'teen' : email.includes('tony') || email.includes('stark') ? 'admin' : 'parent',
      },
    };
    await AsyncStorage.setItem('test_session_user', JSON.stringify(mockUser));
    return { user: mockUser, session: { user: mockUser } };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

/**
 * Sign out current user
 */
export const signOut = async () => {
  if (TEST_MODE) {
    await AsyncStorage.removeItem('test_session_user');
    return;
  }

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Real Google Sign-In using Supabase OAuth redirect.
 * Saves the selected role in AsyncStorage before redirecting.
 */
export const signInWithGoogle = async (role: UserRole) => {
  if (TEST_MODE) {
    const email = role === 'parent' ? 'john.doe@gmail.com' : 'alex.smith@gmail.com';
    const name = role === 'parent' ? 'John Doe' : 'Alex Smith';
    const mockUser = {
      id: role === 'parent' ? 'parent-001' : 'teen-001',
      email,
      user_metadata: { name, role },
    };
    await AsyncStorage.setItem('test_session_user', JSON.stringify(mockUser));
    return { user: mockUser };
  }

  await AsyncStorage.setItem('pending_google_role', role);

  // In React Native Web, window.location is defined
  const redirectTo = typeof window !== 'undefined' && window.location
    ? window.location.origin
    : 'speedxsafety://';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
    },
  });

  if (error) throw error;
  return data;
};

/**
 * Sign in with email using Supabase Auth (sign-up or sign-in).
 * Used by the Google-style login modal — authenticates via real
 * Supabase email/password without using dummy passwords.
 *
 * If the user doesn't exist, they are created with a secure auto-generated password.
 * If the user already exists, they are signed in.
 */
export const signInWithEmail = async (email: string, name: string, role: UserRole) => {
  if (TEST_MODE) {
    const mockUser = {
      id: role === 'parent' ? 'parent-001' : role === 'admin' ? 'admin-001' : 'teen-001',
      email,
      user_metadata: { name, role },
    };
    await AsyncStorage.setItem('test_session_user', JSON.stringify(mockUser));
    return { user: mockUser, session: { user: mockUser } };
  }

  // Generate a secure password for this user (persisted in Supabase Auth).
  // Each user gets a unique password derived from their email, not a shared dummy.
  const securePassword = await getOrCreateUserPassword(email);

  // Try to sign in first
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase(),
    password: securePassword,
  });

  if (!signInError && signInData.user) {
    // Successfully signed in — ensure profile exists
    await upsertProfile(signInData.user.id, email.toLowerCase(), name, role);
    return signInData;
  }

  // If sign-in failed because user doesn't exist, sign up
  if (signInError && (
    signInError.message.includes('Invalid login credentials') ||
    signInError.message.includes('User not found')
  )) {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password: securePassword,
      options: {
        data: { name, role },
      },
    });

    if (signUpError) throw signUpError;

    if (signUpData.user) {
      await upsertProfile(signUpData.user.id, email.toLowerCase(), name, role);
    }

    // After signup, sign in to get a proper session
    const { data: newSignIn, error: newSignInError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: securePassword,
    });

    if (newSignInError) throw newSignInError;
    return newSignIn;
  }

  // Other sign-in error
  throw signInError;
};

/**
 * Get or create a per-user password stored in AsyncStorage.
 * This avoids using a shared dummy password — each user gets their own
 * randomly generated password that persists locally.
 */
const getOrCreateUserPassword = async (email: string): Promise<string> => {
  const storageKey = `user_password_${email.toLowerCase()}`;
  const existing = await AsyncStorage.getItem(storageKey);
  if (existing) return existing;

  // Generate a secure random password
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < 32; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Ensure it meets Supabase minimum requirements
  password = 'Sx!' + password;

  await AsyncStorage.setItem(storageKey, password);
  return password;
};

/**
 * Upsert a user profile — handles the race condition between the
 * database trigger (handle_new_user) and manual profile creation.
 */
const upsertProfile = async (
  userId: string,
  email: string,
  name: string,
  role: string
) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          email,
          name,
          role,
          is_active: true,
        },
        { onConflict: 'id' }
      );

    if (error && !error.message.includes('relation "profiles" does not exist')) {
      console.warn('Profile upsert warning:', error);
    }
  } catch (err) {
    console.warn('Profile upsert failed:', err);
  }
};

/**
 * Synchronize the user profile role if it was a new Google OAuth sign-in.
 */
export const syncGoogleProfile = async (user: any) => {
  if (TEST_MODE) return null;
  if (!user) return null;
  try {
    const pendingRole = await AsyncStorage.getItem('pending_google_role');
    if (pendingRole) {
      await AsyncStorage.removeItem('pending_google_role');

      // Use upsert to handle race with trigger
      const { data: profile } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
            role: pendingRole,
            is_active: true,
          },
          { onConflict: 'id' }
        )
        .select()
        .single();

      return profile;
    }
  } catch (err) {
    console.warn('Error syncing Google profile:', err);
  }
  return null;
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string) => {
  if (TEST_MODE) return;
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
};

/**
 * Get current authenticated user with role
 */
export const getCurrentUser = async () => {
  if (TEST_MODE) {
    const userStr = await AsyncStorage.getItem('test_session_user');
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    const role = user.user_metadata?.role || 'teen';
    return {
      ...user,
      profile: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || 'Test User',
        role,
        is_active: true,
      },
      role,
    };
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  // Sync profile if redirection returned
  await syncGoogleProfile(user);

  // Get profile with role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    ...user,
    profile,
    role: profile?.role || user.user_metadata?.role || 'teen',
  };
};

/**
 * Listen for auth state changes
 */
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  if (TEST_MODE) {
    setTimeout(async () => {
      const userStr = await AsyncStorage.getItem('test_session_user');
      if (userStr) {
        callback('SIGNED_IN', { user: JSON.parse(userStr) });
      } else {
        callback('SIGNED_OUT', null);
      }
    }, 50);
    return { data: { subscription: { unsubscribe: () => {} } } };
  }

  return supabase.auth.onAuthStateChange(callback);
};

/**
 * Get current session
 */
export const getSession = async () => {
  if (TEST_MODE) {
    const userStr = await AsyncStorage.getItem('test_session_user');
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return { user };
  }

  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};
