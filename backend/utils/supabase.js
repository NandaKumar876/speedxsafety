const { createServerClient } = require('@supabase/ssr');

/**
 * Creates a Supabase client bound to the current Express request and response.
 * Automatically handles cookie reading (request) and setting/updating (response).
 */
function createSupabaseClient(req, res) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return Object.keys(req.cookies || {}).map((name) => ({
            name,
            value: req.cookies[name],
          }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookie(name, value, options);
          });
        },
      },
    }
  );
}

module.exports = { createSupabaseClient };
