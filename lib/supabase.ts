import { createClient as supabaseCreateClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing Supabase environment variables")
}

const supabase = supabaseCreateClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default supabase
export const createClient = supabaseCreateClient
