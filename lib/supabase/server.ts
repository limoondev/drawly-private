import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Return mock client if env vars are not set (build time)
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({
          data: { user: null, session: null },
          error: new Error("Supabase not configured"),
        }),
        signUp: async () => ({ data: { user: null, session: null }, error: new Error("Supabase not configured") }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({
          data: null,
          error: new Error("Supabase not configured"),
          single: () => ({ data: null, error: null }),
        }),
        insert: () => ({ data: null, error: new Error("Supabase not configured") }),
        update: () => ({
          data: null,
          error: new Error("Supabase not configured"),
          eq: () => ({ data: null, error: null }),
        }),
        delete: () => ({ data: null, error: new Error("Supabase not configured") }),
        upsert: () => ({ data: null, error: new Error("Supabase not configured") }),
      }),
    } as any
  }

  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Server Component, can be ignored
        }
      },
    },
  })
}
