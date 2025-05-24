import { createClient } from "@supabase/supabase-js"

// Function to create correct Supabase storage URL
export function createSupabaseImageUrl(filePath: string, bucket = "item_images"): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  if (!supabaseUrl) return ""

  // Extract project ID from Supabase URL
  const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
  if (!projectId) return ""

  // Ensure filePath doesn't start with slash
  const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath

  // Return the correct URL format
  return `https://${projectId}.supabase.co/storage/v1/object/public/${bucket}/${cleanPath}`
}

export function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

// Create the default Supabase client for browser use
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export the client as default and named export
export default supabase
export { supabase }
export { createClient }
