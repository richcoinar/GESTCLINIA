import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a dummy client during build-time prerendering if env vars are missing
    // or if we are not in a browser context where we expect them to be present.
    // This prevents the build from failing.
    return {
      auth: { getUser: async () => ({ data: { user: null } }) },
      from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null }) }) }) }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
