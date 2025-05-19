import { createClient } from "@supabase/supabase-js"

export async function checkSupabaseConfig() {
  try {
    // Get Supabase credentials
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return {
        success: false,
        error: "Missing Supabase credentials",
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey,
        },
      }
    }

    // Create client
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test connection by listing buckets
    const { data, error } = await supabase.storage.listBuckets()

    if (error) {
      return {
        success: false,
        error: error.message,
        details: {
          code: error.code,
          statusCode: error.status,
        },
      }
    }

    // Check if our bucket exists
    const bucketExists = data.some((bucket) => bucket.name === "images2")

    return {
      success: true,
      buckets: data.map((b) => b.name),
      bucketExists,
      details: {
        bucketCount: data.length,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: {
        type: error instanceof Error ? error.name : typeof error,
      },
    }
  }
}
