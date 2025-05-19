"use server"

import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function initializeSupabaseStorage() {
  try {
    const supabase = getSupabaseAdmin()

    // List of buckets we want to ensure exist
    const requiredBuckets = ["itemimages", "uploads", "images", "default"]
    const results = {}

    // Check each bucket and create if needed
    for (const bucketName of requiredBuckets) {
      try {
        // Check if bucket exists
        const { data: bucket, error: getBucketError } = await supabase.storage.getBucket(bucketName)

        if (getBucketError && getBucketError.message.includes("not found")) {
          console.log(`Initializing: Bucket ${bucketName} not found, creating it...`)

          // Create the bucket
          const { data: newBucket, error: createError } = await supabase.storage.createBucket(bucketName, {
            public: true, // Make bucket public
          })

          if (createError) {
            console.error(`Failed to create bucket ${bucketName}:`, createError.message)
            results[bucketName] = { success: false, error: createError.message }
          } else {
            console.log(`Successfully created bucket ${bucketName}`)
            results[bucketName] = { success: true, created: true }
          }
        } else if (getBucketError) {
          console.error(`Error checking bucket ${bucketName}:`, getBucketError.message)
          results[bucketName] = { success: false, error: getBucketError.message }
        } else {
          console.log(`Bucket ${bucketName} already exists`)
          results[bucketName] = { success: true, exists: true }
        }
      } catch (error) {
        console.error(`Unexpected error with bucket ${bucketName}:`, error)
        results[bucketName] = {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }
    }

    return {
      success: Object.values(results).some((r) => r.success),
      results,
    }
  } catch (error) {
    console.error("Error initializing Supabase storage:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
