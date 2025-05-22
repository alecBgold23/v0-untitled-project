"use server"

import { createClient } from "@supabase/supabase-js"

// Function to get the bucket name with fallback
function getBucketName(): string {
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET
  if (!bucket) {
    console.warn("NEXT_PUBLIC_SUPABASE_BUCKET is not defined, using default bucket: item_images")
    return "item_images"
  }
  return bucket
}

// Function to ensure the URL has the correct format with bucket name
function formatImageUrl(url: string, bucket = getBucketName()): string {
  if (!url) return ""

  // If the URL already contains the bucket name, return it
  if (url.includes(`/public/${bucket}/`)) return url

  // Extract the Supabase project URL
  const projectUrlMatch = url.match(/(https:\/\/[^/]+)/)
  if (!projectUrlMatch) return url

  const projectUrl = projectUrlMatch[1]

  // Extract the file path after the last slash
  const pathParts = url.split("/")
  const fileName = pathParts[pathParts.length - 1]

  // Construct the correct URL format
  return `${projectUrl}/storage/v1/object/public/${bucket}/${fileName}`
}

export async function uploadToEnvBucket(formData: FormData) {
  try {
    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

    if (!supabaseUrl || !supabaseServiceKey) {
      return {
        success: false,
        error: "Missing Supabase environment variables",
      }
    }

    // Create Supabase client with service role key for server-side operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the file from the form data
    const file = formData.get("file") as File

    if (!file) {
      return {
        success: false,
        error: "No file provided",
      }
    }

    // Get the bucket name from environment variable
    const bucket = getBucketName()

    // Create a unique file path
    const filePath = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

    console.log(`Uploading file to bucket: ${bucket}, path: ${filePath}`)

    // Convert the file to a buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload the file
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      console.error("Error uploading file:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path)

    // Format the URL to ensure it's correct
    const formattedUrl = formatImageUrl(publicUrlData.publicUrl, bucket)

    console.log("File uploaded successfully:", formattedUrl)

    return {
      success: true,
      path: data.path,
      url: formattedUrl,
      publicUrl: formattedUrl,
      bucket: bucket,
    }
  } catch (error) {
    console.error("Upload error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown upload error",
    }
  }
}
