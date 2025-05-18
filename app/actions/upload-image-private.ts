"use server"

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "" // Use service role key for server-side

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function uploadImagePrivate(file: File, userId: string) {
  if (!file) {
    return { success: false, error: "No file provided" }
  }

  try {
    // Create a unique filename to avoid collisions
    const fileName = `${userId}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

    // Log file details for debugging
    console.log(`Attempting to upload file: ${fileName}, size: ${file.size} bytes, type: ${file.type}`)

    // Check if Supabase is properly configured
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Supabase environment variables are not properly configured")
      return { success: false, error: "Storage configuration error" }
    }

    // Convert file to buffer for upload (Node environment)
    let buffer: Buffer
    try {
      const arrayBuffer = await file.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
      console.log(`Successfully converted file to buffer, size: ${buffer.length} bytes`)
    } catch (bufferError) {
      console.error(
        `Error converting file to buffer: ${bufferError instanceof Error ? bufferError.message : String(bufferError)}`,
      )
      return { success: false, error: "Failed to process file" }
    }

    // Check if the bucket exists
    let bucketsResponse
    try {
      bucketsResponse = await supabase.storage.listBuckets()
      if (!bucketsResponse.data) {
        throw new Error(`API responded with status: ${bucketsResponse.status}`)
      }
    } catch (bucketError) {
      console.error(
        `Error listing buckets: ${bucketError instanceof Error ? bucketError.message : String(bucketError)}`,
      )
      return { success: false, error: "Storage access error" }
    }

    const { data: buckets, error: bucketError } = bucketsResponse

    if (bucketError) {
      console.error(`Error listing buckets: ${bucketError.message}`)
      return { success: false, error: "Storage access error" }
    }

    const bucketName = "images2"
    const bucketExists = buckets.some((bucket) => bucket.name === bucketName)

    if (!bucketExists) {
      console.error(`Bucket "${bucketName}" does not exist`)
      // Try to create the bucket if it doesn't exist
      try {
        const createBucketResponse = await supabase.storage.createBucket(bucketName, {
          public: true,
        })

        if (!createBucketResponse.data) {
          throw new Error(`API responded with status: ${createBucketResponse.status}`)
        }

        const { error: createBucketError } = createBucketResponse

        if (createBucketError) {
          console.error(`Failed to create bucket: ${createBucketError.message}`)
          return { success: false, error: "Storage configuration error" }
        }
        console.log(`Created bucket "${bucketName}"`)
      } catch (createError) {
        console.error(
          `Error creating bucket: ${createError instanceof Error ? createError.message : String(createError)}`,
        )
        return { success: false, error: "Storage configuration error" }
      }
    }

    // Upload file to 'images2' bucket
    let uploadResponse
    try {
      uploadResponse = await supabase.storage.from(bucketName).upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

      if (!uploadResponse.data) {
        throw new Error(`API responded with status: ${uploadResponse.status}`)
      }
    } catch (uploadError) {
      console.error(
        `Supabase storage upload error: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`,
      )
      return { success: false, error: "Upload failed" }
    }

    const { data, error } = uploadResponse

    if (error) {
      console.error(`Supabase storage upload error: ${error.message}`)
      return { success: false, error: error.message }
    }

    if (!data || !data.path) {
      console.error("Upload succeeded but no path was returned")
      return { success: false, error: "Upload path not returned" }
    }

    // Get public URL of the uploaded file
    let publicUrlResponse
    try {
      publicUrlResponse = supabase.storage.from(bucketName).getPublicUrl(data.path)

      if (!publicUrlResponse.data) {
        throw new Error(`API responded with status: ${publicUrlResponse.status}`)
      }
    } catch (publicUrlError) {
      console.error(
        `Failed to get public URL for uploaded file: ${publicUrlError instanceof Error ? publicUrlError.message : String(publicUrlError)}`,
      )
      return { success: false, error: "Failed to get public URL" }
    }

    const { data: publicUrlData } = publicUrlResponse

    if (!publicUrlData || !publicUrlData.publicUrl) {
      console.error("Failed to get public URL for uploaded file")
      return { success: false, error: "Failed to get public URL" }
    }

    console.log(`Successfully uploaded file: ${fileName}, path: ${data.path}, URL: ${publicUrlData.publicUrl}`)

    return {
      success: true,
      path: data.path,
      url: publicUrlData.publicUrl,
      signedUrl: publicUrlData.publicUrl, // For backward compatibility
    }
  } catch (error) {
    console.error(`Unexpected error in uploadImagePrivate: ${error instanceof Error ? error.message : String(error)}`)
    return {
      success: false,
      error: `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
