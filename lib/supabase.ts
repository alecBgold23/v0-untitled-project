import { createClient as supabaseCreateClient } from "@supabase/supabase-js"

// Re-export createClient for use in other files
export { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables")
}

const supabase = supabaseCreateClient(supabaseUrl, supabaseAnonKey)

export default supabase
