import { createClient } from "@supabase/supabase-js"

// Create a more robust client initialization function
export function createRobustSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  // For server-side operations, use the service role key if available
  const isServer = typeof window === "undefined"
  const key = isServer ? supabaseServiceKey : supabaseAnonKey

  if (!supabaseUrl) {
    console.error("Supabase URL is not defined")
    throw new Error("Supabase URL is not defined")
  }

  if (!key) {
    console.error("Supabase key is not defined")
    throw new Error("Supabase key is not defined")
  }

  try {
    return createClient(supabaseUrl, key, {
      auth: {
        persistSession: !isServer, // Only persist session on client-side
      },
    })
  } catch (error) {
    console.error("Failed to create Supabase client:", error)
    throw error
  }
}

// Create and export a singleton client
export const supabase = createRobustSupabaseClient()
