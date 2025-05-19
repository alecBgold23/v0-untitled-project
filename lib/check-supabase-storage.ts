import { createClient } from "@supabase/supabase-js"

export async function checkSupabaseStorage() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return {
        success: false,
        error: "Supabase credentials not configured",
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseServiceRoleKey,
        },
      }
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    })

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
      // Try to create the bucket
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
      })

      if (createError) {
        return {
          success: false,
          error: `Failed to create bucket: ${createError.message}`,
          details: {
            errorCode: createError.code,
            errorMessage: createError.message,
            statusCode: createError.status,
          },
        }
      }

      return {
        success: true,
        message: `Created bucket "${bucketName}"`,
        buckets: [...buckets, { name: bucketName, id: bucketName }],
      }
    }

    return {
      success: true,
      message: `Bucket "${bucketName}" exists`,
      buckets,
    }
  } catch (error) {
    return {
      success: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      details: { error: String(error) },
    }
  }
}
