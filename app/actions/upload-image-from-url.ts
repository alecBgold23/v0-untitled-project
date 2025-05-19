"use server"

import { getSupabaseAdmin } from "@/lib/supabase-admin"

// Function to check if a bucket exists and create it if it doesn't
async function ensureBucketExists(supabase, bucketName) {
  try {
    // Check if bucket exists
    const { data: bucket, error: getBucketError } = await supabase.storage.getBucket(bucketName)

    if (getBucketError && getBucketError.message.includes("not found")) {
      console.log(`Bucket ${bucketName} not found, attempting to create it...`)

      // Create the bucket if it doesn't exist
      const { data: newBucket, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true, // Make bucket public
      })

      if (createError) {
        console.error(`Failed to create bucket ${bucketName}:`, createError.message)
        return false
      }

      console.log(`Successfully created bucket ${bucketName}`)
      return true
    } else if (getBucketError) {
      console.error(`Error checking bucket ${bucketName}:`, getBucketError.message)
      return false
    }

    console.log(`Bucket ${bucketName} already exists`)
    return true
  } catch (error) {
    console.error(`Unexpected error checking/creating bucket ${bucketName}:`, error)
    return false
  }
}

/**
 * Uploads an image from a URL to Supabase storage
 * @param imageUrl The URL of the image to upload
 * @param userId Optional user ID to associate with the image
 * @param customFileName Optional custom file name (without extension)
 * @returns Object with upload status and details
 */
export async function uploadImageFromUrl(imageUrl: string, userId = "anonymous", customFileName?: string) {
  if (!imageUrl) {
    return { success: false, error: "No image URL provided" }
  }

  try {
    console.log(`Attempting to fetch and upload image from URL: ${imageUrl}`)

    // Fetch the image
    const response = await fetch(imageUrl)

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch image: ${response.status} ${response.statusText}`,
      }
    }

    // Get content type and create appropriate file extension
    const contentType = response.headers.get("content-type") || "image/jpeg"
    const fileExtension = contentType.split("/").pop() || "jpg"

    // Create a buffer from the response
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Generate a filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const safeUserId = userId.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 20)

    // Use custom filename if provided, otherwise generate one
    const fileName = customFileName
      ? `${safeUserId}_${customFileName}.${fileExtension}`
      : `${safeUserId}_${timestamp}_${randomString}.${fileExtension}`

    // Get Supabase admin client
    const supabase = getSupabaseAdmin()

    // Try to upload to itemimages bucket first, then fall back to others if needed
    const bucketNames = ["itemimages", "uploads", "images", "default"]
    let uploadResult = null
    let uploadError = null
    let successBucket = null

    for (const bucketName of bucketNames) {
      try {
        console.log(`Checking bucket: ${bucketName}`)

        // Ensure the bucket exists before trying to upload
        const bucketExists = await ensureBucketExists(supabase, bucketName)

        if (!bucketExists) {
          console.log(`Skipping bucket ${bucketName} as it doesn't exist and couldn't be created`)
          continue
        }

        console.log(`Attempting upload to bucket: ${bucketName}`)
        const { data, error } = await supabase.storage.from(bucketName).upload(fileName, buffer, {
          contentType: contentType,
          upsert: true,
        })

        if (!error) {
          uploadResult = data
          successBucket = bucketName
          console.log(`Successfully uploaded to bucket: ${bucketName}`)
          break
        } else {
          console.log(`Failed to upload to bucket ${bucketName}:`, error.message)
          uploadError = error
        }
      } catch (err) {
        console.error(`Error trying bucket ${bucketName}:`, err)
      }
    }

    if (!uploadResult) {
      console.error("All upload attempts failed. Last error:", uploadError)
      return {
        success: false,
        error: uploadError ? uploadError.message : "Failed to upload to any storage bucket",
      }
    }

    // Get public URL
    const publicUrlResponse = supabase.storage.from(successBucket).getPublicUrl(uploadResult.path)

    if (!publicUrlResponse.data?.publicUrl) {
      return { success: false, error: "Failed to get public URL" }
    }

    // Return success with all relevant information
    return {
      success: true,
      path: uploadResult.path,
      url: publicUrlResponse.data.publicUrl,
      signedUrl: publicUrlResponse.data.publicUrl,
      bucket: successBucket,
      originalUrl: imageUrl,
      fileName: fileName,
      contentType: contentType,
    }
  } catch (error) {
    console.error("Error in uploadImageFromUrl:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
