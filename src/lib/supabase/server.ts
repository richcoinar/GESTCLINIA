import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      auth: { getUser: async () => ({ data: { user: null } }) },
      from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null }) }) }) }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }

  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component - ignore
          }
        },
      },
    }
  )
}

export async function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return {
      auth: { getUser: async () => ({ data: { user: null } }) },
      from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null }) }) }) }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }

  return createServerClient(
    supabaseUrl,
    serviceRoleKey,
    {
      cookies: {
        getAll() { return [] },
        setAll() {},
      },
    }
  )
}
