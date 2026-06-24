// ============================================
// SpeedxSafety - Auth Service (Supabase)
// ============================================

import { supabase } from './supabase';
import { UserRole } from '../types';

/**
 * Sign up a new user with role metadata
 */
export const signUp = async (email: string, password: string, role: UserRole, name: string) => {
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

  // Create profile record
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email,
        name,
        role,
        is_active: true,
      });

    if (profileError) console.warn('Profile creation error:', profileError);
  }

  return data;
};

/**
 * Sign in with email and password
 */
export const signIn = async (email: string, password: string) => {
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
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Real Google Sign-In helper using Supabase OAuth redirect.
 * Saves the selected role in AsyncStorage before redirecting.
 */
export const signInWithGoogle = async (role: UserRole) => {
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
 * Synchronize the user profile role if it was a new Google OAuth sign-in.
 */
export const syncGoogleProfile = async (user: any) => {
  if (!user) return null;
  try {
    const pendingRole = await AsyncStorage.getItem('pending_google_role');
    if (pendingRole) {
      await AsyncStorage.removeItem('pending_google_role');

      // Check if profile exists and update/insert
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        if (profile.role !== pendingRole) {
          const { data: updatedProfile } = await supabase
            .from('profiles')
            .update({ role: pendingRole })
            .eq('id', user.id)
            .select()
            .single();
          return updatedProfile;
        }
        return profile;
      } else {
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
            role: pendingRole,
            is_active: true,
          })
          .select()
          .single();
        return newProfile;
      }
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
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
};

/**
 * Get current authenticated user with role
 */
export const getCurrentUser = async () => {
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
  return supabase.auth.onAuthStateChange(callback);
};

/**
 * Get current session
 */
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};
