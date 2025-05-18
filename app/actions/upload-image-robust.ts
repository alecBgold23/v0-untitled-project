"use server"

import { createRobustSupabaseClient } from "@/lib/supabase-robust-client"

export async function uploadImageRobust(file: File, userId: string) {
  console.log("Starting robust image upload...")

  if (!file) {
    console.error("No file provided for upload")
    return { success: false, error: "No file provided" }
  }

  try {
    // Create a unique filename
    const fileName = `${userId}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    console.log(`Preparing to upload file: ${fileName}`)

    // Create a fresh Supabase client for this upload
    const supabase = createRobustSupabaseClient()

    // Convert file to buffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    console.log(`File converted to buffer, size: ${buffer.length} bytes`)

    // Define bucket name
    const bucketName = "images2"

    // Check if bucket exists and create if needed
    try {
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()

      if (bucketError) {
        console.error("Error listing buckets:", bucketError)
        return { success: false, error: `Storage error: ${bucketError.message}` }
      }

      const bucketExists = buckets.some((bucket) => bucket.name === bucketName)

      if (!bucketExists) {
        console.log(`Bucket "${bucketName}" does not exist, creating...`)
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
        })

        if (createError) {
          console.error("Error creating bucket:", createError)
          return { success: false, error: `Failed to create storage bucket: ${createError.message}` }
        }
        console.log(`Bucket "${bucketName}" created successfully`)
      }
    } catch (bucketCheckError) {
      console.error("Error checking/creating bucket:", bucketCheckError)
      return {
        success: false,
        error: `Bucket check failed: ${bucketCheckError instanceof Error ? bucketCheckError.message : String(bucketCheckError)}`,
      }
    }

    // Upload the file with retry logic
    let uploadResult = null
    let attempts = 0
    const maxAttempts = 3

    while (attempts < maxAttempts && !uploadResult) {
      attempts++
      console.log(`Upload attempt ${attempts} of ${maxAttempts}...`)

      try {
        const { data, error } = await supabase.storage.from(bucketName).upload(fileName, buffer, {
          contentType: file.type,
          upsert: attempts > 1, // Only upsert on retry attempts
        })

        if (error) {
          console.error(`Upload error on attempt ${attempts}:`, error)
          if (attempts === maxAttempts) {
            return { success: false, error: `Upload failed after ${maxAttempts} attempts: ${error.message}` }
          }
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000))
        } else {
          uploadResult = data
          console.log("Upload successful:", data)
        }
      } catch (uploadError) {
        console.error(`Exception during upload attempt ${attempts}:`, uploadError)
        if (attempts === maxAttempts) {
          return {
            success: false,
            error: `Upload exception after ${maxAttempts} attempts: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`,
          }
        }
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    if (!uploadResult || !uploadResult.path) {
      return { success: false, error: "Upload failed with no error details" }
    }

    // Get public URL with error handling
    try {
      const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(uploadResult.path)

      if (!publicUrlData || !publicUrlData.publicUrl) {
        console.error("Failed to get public URL")
        return { success: false, error: "Failed to get public URL" }
      }

      console.log("Public URL generated:", publicUrlData.publicUrl)

      return {
        success: true,
        path: uploadResult.path,
        url: publicUrlData.publicUrl,
        signedUrl: publicUrlData.publicUrl,
      }
    } catch (urlError) {
      console.error("Error getting public URL:", urlError)
      return {
        success: false,
        error: `Failed to get URL: ${urlError instanceof Error ? urlError.message : String(urlError)}`,
      }
    }
  } catch (error) {
    console.error("Unexpected error in uploadImageRobust:", error)
    return {
      success: false,
      error: `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
