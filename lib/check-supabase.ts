import { createServerSupabaseClient } from "@/lib/supabase-server"

/**
 * Checks if Supabase is properly configured
 * @returns Object with success status and configuration details
 */
export async function checkSupabaseConfig(): Promise<{
  success: boolean
  error?: string
  details?: {
    url: string
    hasServiceKey: boolean
    hasAnonKey: boolean
  }
}> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
      return {
        success: false,
        error: "Supabase URL is not configured",
      }
    }

    if (!supabaseServiceKey) {
      return {
        success: false,
        error: "Supabase service role key is not configured",
      }
    }

    // Try to create a client and make a simple query
    try {
      const supabase = createServerSupabaseClient()
      const { error } = await supabase.from("sell_items").select("id").limit(1)

      if (error) {
        return {
          success: false,
          error: `Error connecting to Supabase: ${error.message}`,
        }
      }
    } catch (connectionError: any) {
      return {
        success: false,
        error: `Error connecting to Supabase: ${connectionError.message}`,
      }
    }

    return {
      success: true,
      details: {
        url: supabaseUrl,
        hasServiceKey: !!supabaseServiceKey,
        hasAnonKey: !!supabaseAnonKey,
      },
    }
  } catch (error: any) {
    return {
      success: false,
      error: `Error checking Supabase configuration: ${error.message}`,
    }
  }
}
