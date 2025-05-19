import { createClient } from "@supabase/supabase-js"

export async function checkSupabaseStorage() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

    if (!supabaseUrl || !supabaseKey) {
      return {
        success: false,
        error: "Supabase credentials not configured",
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey,
        },
      }
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Try to list buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      return {
        success: false,
        error: `Error listing buckets: ${bucketsError.message}`,
        details: {
          errorCode: bucketsError.code,
          errorMessage: bucketsError.message,
          statusCode: bucketsError.status,
        },
      }
    }

    // Check if our bucket exists
    const bucketName = "images2"
    const bucketExists = buckets.some((bucket) => bucket.name === bucketName)

    if (!bucketExists) {
      return {
        success: false,
        error: `Bucket "${bucketName}" does not exist`,
        details: {
          buckets: buckets.map((b) => b.name),
        },
      }
    }

    return {
      success: true,
      message: `Bucket "${bucketName}" exists`,
      buckets: buckets.map((b) => b.name),
    }
  } catch (error) {
    return {
      success: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      details: { error: String(error) },
    }
  }
}
