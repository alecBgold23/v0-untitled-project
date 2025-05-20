"use server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

// Function to check if a bucket exists and create it if it doesn't
async function ensureBucketExists(supabase, bucketName) {
  try {
    // Check if bucket exists
    const { data: bucket, error: getBucketError } = await supabase.storage.getBucket(bucketName)

    if (getBucketError && getBucketError.message.includes("not found")) {
      console.log(`Fallback: Bucket ${bucketName} not found, attempting to create it...`)

      // Create the bucket if it doesn't exist
      const { data: newBucket, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true, // Make bucket public
      })

      if (createError) {
        console.error(`Fallback: Failed to create bucket ${bucketName}:`, createError.message)
        return false
      }

      console.log(`Fallback: Successfully created bucket ${bucketName}`)
      return true
    } else if (getBucketError) {
      console.error(`Fallback: Error checking bucket ${bucketName}:`, getBucketError.message)
      return false
    }

    console.log(`Fallback: Bucket ${bucketName} already exists`)
    return true
  } catch (error) {
    console.error(`Fallback: Unexpected error checking/creating bucket ${bucketName}:`, error)
    return false
  }
}

export async function uploadImageFallback(file: File, userId: string) {
  try {
    if (!file) {
      return { success: false, error: "No file provided" }
    }

    // Get Supabase client
    const supabase = getSupabaseAdmin()

    // Create a very simple filename
    const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg"
    const safeExtension = ["jpg", "jpeg", "png", "gif", "webp"].includes(extension?.toLowerCase() || "")
      ? extension
      : "jpg"

    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 10)
    const fileName = `file_${timestamp}_${randomString}.${safeExtension}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Try item_images first, then fallback to others
    const primaryBucket = "item_images"
    const fallbackBuckets = ["itemimages", "uploads", "images", "default"]
    const bucketNames = [primaryBucket, ...fallbackBuckets]

    let uploadResult = null
    let uploadError = null
    let successBucket = null

    for (const bucketName of bucketNames) {
      try {
        console.log(`Fallback: Checking bucket: ${bucketName}`)

        // Ensure the bucket exists before trying to upload
        const bucketExists = await ensureBucketExists(supabase, bucketName)

        if (!bucketExists) {
          console.log(`Fallback: Skipping bucket ${bucketName} as it doesn't exist and couldn't be created`)
          continue
        }

        console.log(`Fallback: Attempting upload to bucket: ${bucketName}`)
        const { data, error } = await supabase.storage.from(bucketName).upload(fileName, buffer, {
          contentType: file.type,
          upsert: true,
        })

        if (!error) {
          uploadResult = data
          successBucket = bucketName
          console.log(`Fallback: Successfully uploaded to bucket: ${bucketName}`)
          break
        } else {
          console.log(`Fallback: Failed to upload to bucket ${bucketName}:`, error.message)
          uploadError = error
        }
      } catch (err) {
        console.error(`Fallback: Error trying bucket ${bucketName}:`, err)
      }
    }

    if (!uploadResult) {
      console.error("Fallback: All upload attempts failed. Last error:", uploadError)

      // Return a base64 data URL as an absolute last resort
      try {
        const base64 = await convertFileToBase64(file)
        return {
          success: true,
          path: "local-fallback",
          url: base64,
          signedUrl: base64,
          bucket: "local-fallback",
          isLocalFallback: true,
        }
      } catch (base64Error) {
        console.error("Failed to create base64 fallback:", base64Error)
        return {
          success: false,
          error: uploadError ? uploadError.message : "Failed to upload to any storage bucket",
        }
      }
    }

    // Get public URL
    const publicUrlResponse = supabase.storage.from(successBucket).getPublicUrl(uploadResult.path)

    if (!publicUrlResponse.data?.publicUrl) {
      return { success: false, error: "Failed to get public URL" }
    }

    return {
      success: true,
      path: uploadResult.path,
      url: publicUrlResponse.data.publicUrl,
      signedUrl: publicUrlResponse.data.publicUrl,
      bucket: successBucket,
    }
  } catch (error) {
    console.error("Error in uploadImageFallback:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Helper function to convert a file to base64 as a last resort
async function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}
