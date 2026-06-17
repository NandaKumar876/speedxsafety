const { createSupabaseClient } = require('../utils/supabase');

/**
 * Middleware to refresh the user's Supabase session on every incoming request.
 * Automatically keeps the session fresh and updates cookies in the client browser.
 */
async function supabaseSessionMiddleware(req, res, next) {
  try {
    const supabase = createSupabaseClient(req, res);

    // Call getSession() to trigger token refresh automatically if needed.
    // This will set updated session cookies in the response headers.
    const { data: { session }, error } = await supabase.auth.getSession();

    // Attach the supabase client and current user data to the request object
    req.supabase = supabase;
    req.session = session;
    req.user = session ? session.user : null;

    next();
  } catch (error) {
    console.error('Supabase session middleware error:', error);
    next();
  }
}

module.exports = { supabaseSessionMiddleware };
