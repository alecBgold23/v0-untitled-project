import { createServerSupabaseClient } from "@/lib/supabase-server"

/**
 * Checks if Supabase storage is properly configured and accessible
 * @returns Object with success status and error message if applicable
 */
export async function checkSupabaseStorage(): Promise<{
  success: boolean
  error?: string
  buckets?: string[]
}> {
  try {
    const supabase = createServerSupabaseClient()

    // List buckets to check if storage is working
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      return {
        success: false,
        error: `Error listing buckets: ${error.message}`,
      }
    }

    return {
      success: true,
      buckets: buckets.map((bucket) => bucket.name),
    }
  } catch (error: any) {
    return {
      success: false,
      error: `Error checking Supabase storage: ${error.message}`,
    }
  }
}
