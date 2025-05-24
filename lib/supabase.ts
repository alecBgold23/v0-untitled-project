import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client-side function to create a new client instance
export function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Server-side Supabase client (uses service role key for bypassing RLS)
export function createSupabaseServerClient() {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Re-export createClient from supabase for direct use
export { createClient } from "@supabase/supabase-js"

export default supabase
