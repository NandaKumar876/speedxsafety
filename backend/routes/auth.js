// ============================================
// SpeedxSafety - Auth Routes
// ============================================

const express = require('express');
const router = express.Router();
const { users } = require('../data/seedData');

/**
 * POST /api/auth/register
 * Register a new user (parent or teen).
 * Body: { name, email, role }
 */
router.post('/register', (req, res) => {
  const { name, email, role } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Fields name, email, and role are required',
    });
  }

  if (!['parent', 'teen'].includes(role)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Role must be "parent" or "teen"',
    });
  }

  // Check for duplicate email
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({
      error: 'Conflict',
      message: 'A user with this email already exists',
    });
  }

  const newUser = {
    uid: `${role}-${Date.now()}`,
    name,
    email: email.toLowerCase(),
    role,
    avatar: null,
    createdAt: Date.now(),
  };

  users.push(newUser);

  res.status(201).json({
    message: 'User registered successfully',
    user: newUser,
  });
});

/**
 * POST /api/auth/login
 * Login by email — returns the matching user object.
 * Body: { email }
 */
router.post('/login', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Email is required',
    });
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({
      error: 'Authentication Failed',
      message: 'No user found with this email',
    });
  }

  res.json({
    message: 'Login successful',
    user,
  });
});

/**
 * GET /api/auth/me
 * Retrieves the currently authenticated user from the session middleware (via cookies).
 */
router.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      authenticated: false,
      message: 'No active session found',
    });
  }

  res.json({
    authenticated: true,
    user: req.user,
    session: req.session,
  });
});


/**
 * GET /api/auth/users
 * List all users (for development/debugging).
 */
router.get('/users', (_req, res) => {
  res.json({ count: users.length, users });
});

module.exports = router;
