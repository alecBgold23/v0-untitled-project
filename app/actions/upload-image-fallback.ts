"use server"

import { getSupabaseAdmin } from "@/lib/supabase-admin"

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

    // Try multiple buckets in order of preference
    const bucketNames = ["uploads", "images", "itemimages"]
    let uploadResult = null
    let uploadError = null
    let successBucket = null

    for (const bucketName of bucketNames) {
      try {
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
