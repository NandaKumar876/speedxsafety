const { createSupabaseClient } = require('../utils/supabase');

/**
 * Middleware to validate the user's Supabase session on every incoming request.
 * Uses getUser() instead of getSession() for secure server-side validation —
 * getSession() reads from local storage and may be stale, while getUser()
 * makes a request to the Supabase Auth server to verify the JWT.
 */
async function supabaseSessionMiddleware(req, res, next) {
  try {
    const supabase = createSupabaseClient(req, res);

    // Use getUser() for secure server-side session validation.
    // This contacts Supabase Auth to verify the token is valid.
    const { data: { user }, error } = await supabase.auth.getUser();

    // Attach the supabase client and current user data to the request object
    req.supabase = supabase;
    req.user = error ? null : user;
    req.session = user ? { user } : null;

    next();
  } catch (error) {
    console.error('Supabase session middleware error:', error);
    next();
  }
}

module.exports = { supabaseSessionMiddleware };
