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

/**
 * Simulated Google Sign-In helper that registers the user if they don't exist,
 * and signs them in if they do, using a standard dummy password behind the scenes.
 */
export const signInWithGoogleSimulated = async (email: string, name: string, role: UserRole) => {
  const dummyPassword = 'GoogleUserDummyPassword123!';
  try {
    // Attempt login
    const data = await signIn(email.toLowerCase(), dummyPassword);
    return data;
  } catch (error: any) {
    // If not found or invalid credentials (meaning user hasn't registered yet), register them
    const errMessage = error.message || '';
    if (
      errMessage.includes('Invalid login credentials') ||
      errMessage.includes('Email not confirmed') ||
      error.status === 400 ||
      error.status === 401
    ) {
      const signUpData = await signUp(email.toLowerCase(), dummyPassword, role, name);
      return signUpData;
    }
    throw error;
  }
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
  if (error) throw error;
  if (!user) return null;

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
