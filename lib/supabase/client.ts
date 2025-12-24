import { createBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client that throws helpful errors when used
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: new Error("Supabase not configured") }),
        getUser: async () => ({ data: { user: null }, error: new Error("Supabase not configured") }),
        signInWithPassword: async () => ({
          data: { user: null, session: null },
          error: new Error("Supabase not configured"),
        }),
        signUp: async () => ({ data: { user: null, session: null }, error: new Error("Supabase not configured") }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({ data: null, error: new Error("Supabase not configured") }),
        insert: () => ({ data: null, error: new Error("Supabase not configured") }),
        update: () => ({ data: null, error: new Error("Supabase not configured") }),
        delete: () => ({ data: null, error: new Error("Supabase not configured") }),
        upsert: () => ({ data: null, error: new Error("Supabase not configured") }),
      }),
      channel: () => ({
        on: () => ({ subscribe: () => {} }),
        subscribe: () => {},
        unsubscribe: () => {},
      }),
      removeChannel: () => {},
    } as unknown as ReturnType<typeof createBrowserClient>
  }

  // Singleton pattern for the real client
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }

  return supabaseClient
}
