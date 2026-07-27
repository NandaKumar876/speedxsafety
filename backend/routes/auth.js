// ============================================
// SpeedxSafety - Auth Routes
// ============================================

const express = require('express');
const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user (parent or teen) in Supabase Auth and profiles.
 * Body: { name, email, role, password }
 */
router.post('/register', async (req, res) => {
  const { name, email, role, password } = req.body;

  if (!name || !email || !role || !password) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Fields name, email, role, and password are required',
    });
  }

  if (!['parent', 'teen'].includes(role)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Role must be "parent" or "teen"',
    });
  }

  try {
    // Check if user already exists in profiles
    const { data: existing } = await req.supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existing) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A user with this email already exists',
      });
    }

    // Sign up via Supabase Auth
    const { data: authData, error: signUpError } = await req.supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (signUpError) throw signUpError;

    // Check if trigger created the profile, if not upsert
    let profile = null;
    if (authData.user) {
      const { data: profData, error: upsertError } = await req.supabase
        .from('profiles')
        .upsert(
          {
            id: authData.user.id,
            email: email.toLowerCase(),
            name,
            role,
            is_active: true,
          },
          { onConflict: 'id' }
        )
        .select()
        .single();

      if (upsertError) console.warn('Profile upsert warning:', upsertError);
      profile = profData;
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        uid: authData.user ? authData.user.id : null,
        name,
        email: email.toLowerCase(),
        role,
        profile,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: 'Registration Failed',
      message: error.message || 'An error occurred during registration',
    });
  }
});

/**
 * POST /api/auth/login
 * Login by email and password using Supabase Auth.
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Email and password are required',
    });
  }

  try {
    const { data, error } = await req.supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (error) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: error.message || 'Invalid login credentials',
      });
    }

    // Fetch the user's profile
    const { data: profile } = await req.supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({
      message: 'Login successful',
      user: {
        uid: data.user.id,
        email: data.user.email,
        name: profile ? profile.name : (data.user.user_metadata?.name || 'User'),
        role: profile ? profile.role : (data.user.user_metadata?.role || 'teen'),
        profile,
      },
      session: data.session,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Login Failed',
      message: error.message || 'An error occurred during login',
    });
  }
});

/**
 * GET /api/auth/me
 * Retrieves the currently authenticated user from the session middleware (via cookies).
 */
router.get('/me', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      authenticated: false,
      message: 'No active session found',
    });
  }

  try {
    const { data: profile } = await req.supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    res.json({
      authenticated: true,
      user: {
        ...req.user,
        profile,
        role: profile ? profile.role : 'teen',
      },
      session: req.session,
    });
  } catch (error) {
    res.json({
      authenticated: true,
      user: req.user,
      session: req.session,
    });
  }
});

/**
 * GET /api/auth/users
 * List all users.
 */
router.get('/users', async (req, res) => {
  try {
    const { data: profiles, error } = await req.supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ count: profiles.length, users: profiles });
  } catch (error) {
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message || 'An error occurred fetching profiles',
    });
  }
});

module.exports = router;
