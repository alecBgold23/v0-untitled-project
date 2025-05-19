"use server"

import { getSupabaseAdmin } from "@/lib/supabase-admin"

// Function to sanitize filenames according to Supabase requirements
function sanitizeFileName(userId: string, fileName: string): string {
  // Replace spaces and special characters with underscores
  // Keep only alphanumeric characters, underscores, hyphens, and periods
  const baseFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_")

  // Ensure the filename has a valid extension
  let extension = ""
  const lastDotIndex = baseFileName.lastIndexOf(".")
  if (lastDotIndex > 0) {
    extension = baseFileName.substring(lastDotIndex)
  }

  // Create a safe file name with timestamp and sanitized user ID
  const safeUserId = (userId || "anonymous").replace(/[^a-zA-Z0-9]/g, "_").substring(0, 20)
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 10)

  // Construct final filename (avoiding any special characters)
  return `${safeUserId}_${timestamp}_${randomString}${extension}`.toLowerCase()
}

export async function uploadImagePrivate(file: File, userId: string) {
  if (!file) {
    return { success: false, error: "No file provided" }
  }

  try {
    // Sanitize the filename properly
    const fileName = sanitizeFileName(userId, file.name)
    console.log(`Attempting to upload file: ${fileName}, size: ${file.size} bytes, type: ${file.type}`)

    // Validate file before attempting to upload
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "Only image files are allowed" }
    }

    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: "File size exceeds 10MB limit" }
    }

    // Get Supabase client
    const supabase = getSupabaseAdmin()

    // Convert file to buffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    console.log(`Successfully converted file to buffer, size: ${buffer.length} bytes`)

    // Try multiple buckets in order of preference
    const bucketNames = ["itemimages", "uploads", "images"]
    let uploadResult = null
    let uploadError = null

    for (const bucketName of bucketNames) {
      try {
        console.log(`Attempting upload to bucket: ${bucketName}`)
        const { data, error } = await supabase.storage.from(bucketName).upload(fileName, buffer, {
          contentType: file.type,
          upsert: true,
        })

        if (!error) {
          uploadResult = data
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

    // Get public URL of the uploaded file
    const bucketName = uploadResult.path.split("/")[0]
    const publicUrlResponse = supabase.storage.from(bucketName).getPublicUrl(uploadResult.path)

    if (!publicUrlResponse.data || !publicUrlResponse.data.publicUrl) {
      console.error("Failed to get public URL for uploaded file")
      return { success: false, error: "Failed to get public URL" }
    }

    console.log(
      `Successfully uploaded file: ${fileName}, path: ${uploadResult.path}, URL: ${publicUrlResponse.data.publicUrl}`,
    )

    return {
      success: true,
      path: uploadResult.path,
      url: publicUrlResponse.data.publicUrl,
      signedUrl: publicUrlResponse.data.publicUrl, // For backward compatibility
      bucket: bucketName,
    }
  } catch (error) {
    // Detailed error logging
    console.error(`Unexpected error in uploadImagePrivate:`, error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined

    if (errorStack) {
      console.error(`Error stack:`, errorStack)
    }

    return {
      success: false,
      error: `Upload failed: ${errorMessage}`,
    }
  }
}
