import { createClient } from "@supabase/supabase-js"
import type { Buffer } from "buffer"

// Add this function at the top of the file, after the imports
function getSupabaseProjectId(url: string): string {
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/)
  return match ? match[1] : ""
}

// Create a singleton client to avoid multiple instances
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
const supabaseServiceRole = createClient(supabaseUrl, supabaseServiceRoleKey)

export const supabase = supabaseClient

// Add this function to ensure URLs have the correct format
function ensureCorrectImageUrl(url: string, bucket = "item_images"): string {
  if (!url) return ""

  // If it already has the correct format with item_images, return it
  if (url.includes(`/storage/v1/object/public/${bucket}/`)) return url

  // Get the Supabase project ID from the URL
  const projectIdMatch = url.match(/https:\/\/([^.]+)\.supabase\.co/)
  if (!projectIdMatch) return url

  const projectId = projectIdMatch[1]

  // Extract the file path - get everything after the last slash
  const pathParts = url.split("/")
  const fileName = pathParts[pathParts.length - 1]

  // Construct the correct URL format with bucket name
  return `https://${projectId}.supabase.co/storage/v1/object/public/${bucket}/${fileName}`
}

// Function to ensure the URL has the correct format with bucket name
function ensureCorrectUrlFormat(url: string, bucket = "item_images"): string {
  if (!url) return url

  // If the URL already contains the correct bucket path, return it
  if (url.includes(`/storage/v1/object/public/${bucket}/`)) return url

  // Extract the Supabase project URL
  const projectUrlMatch = url.match(/(https:\/\/[^.]+\.supabase\.co)/)
  if (!projectUrlMatch) return url

  const projectUrl = projectUrlMatch[1]

  // Extract the file path after the last slash
  const pathParts = url.split("/")
  const fileName = pathParts[pathParts.length - 1]

  // Construct the correct URL format with bucket name
  return `${projectUrl}/storage/v1/object/public/${bucket}/${fileName}`
}

// Client-side image upload function (for use in browser)
export async function uploadImageClient(file: File, userId = "anonymous") {
  try {
    // Validate file
    if (!file) {
      throw new Error("No file provided")
    }

    // Validate file type
    const fileType = file.type
    if (!fileType.startsWith("image/")) {
      throw new Error("File must be an image")
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size must be less than 5MB")
    }

    // Create unique filename with user ID for better organization
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    console.log("Uploading file:", fileName)

    // Always use item_images bucket
    const bucket = "item_images"

    // Upload to item_images bucket
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
      cacheControl: "3600",
      upsert: true, // Changed to true to overwrite if file exists
    })

    if (error) {
      console.error("Error uploading to item_images:", error)
      throw new Error(`Upload to item_images failed: ${error.message}`)
    }

    // Get the public URL directly
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path)

    // Ensure the URL has the correct format
    const correctUrl = ensureCorrectUrlFormat(publicUrlData.publicUrl, bucket)

    console.log("Upload successful to item_images:", data.path)
    console.log("Public URL:", correctUrl)

    return {
      success: true,
      path: data.path,
      url: correctUrl,
      publicUrl: correctUrl,
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

// Function to check if Supabase storage is configured correctly
export async function checkSupabaseStorage() {
  try {
    // Check the item_images bucket
    const { data, error } = await supabase.storage.from("item_images").list()

    if (error) {
      return {
        success: false,
        error: `Supabase storage error: ${error.message}`,
      }
    }

    return {
      success: true,
      message: "item_images bucket is configured correctly",
      files: data?.length || 0,
      bucket: "item_images",
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error checking Supabase storage",
    }
  }
}

// Server-side image upload function with public URL (for use in Node.js)
export async function uploadImageToSupabase(fileBuffer: Buffer, fileName: string, bucket = "item_images") {
  try {
    // Use service role key for server-side operations
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Create a unique file path with better organization
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_")
    const filePath = `uploads/${Date.now()}-${sanitizedFileName}`

    console.log(`Attempting to upload image to ${bucket} bucket with path: ${filePath}`)

    // Upload the file
    const { data, error: uploadError } = await supabase.storage.from(bucket).upload(filePath, fileBuffer, {
      contentType: "image/jpeg",
      upsert: true,
    })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      throw new Error(`Failed to upload image to ${bucket}: ${uploadError.message}`)
    }

    console.log(`Successfully uploaded image to ${bucket} bucket with path: ${filePath}`)

    // Get the public URL and ensure correct format
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath)

    // Extract project ID from Supabase URL
    const projectId = process.env.SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]

    // Construct the correct URL format
    const correctUrl = `https://${projectId}.supabase.co/storage/v1/object/public/${bucket}/${filePath}`

    console.log("Image upload successful with URL:", correctUrl)

    return {
      image_path: filePath,
      image_url: correctUrl,
      publicUrl: correctUrl,
      success: true,
    }
  } catch (error) {
    console.error("Error in uploadImageToSupabase:", error)
    throw error
  }
}

// Additional browser-compatible functions
export async function uploadImageToSupabaseBrowser(
  file: File,
  bucket = "item_images",
  path = "",
): Promise<{ url: string; publicUrl?: string; path?: string } | { error: string }> {
  try {
    // Generate a unique file name
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    const fileExt = file.name.split(".").pop()
    const filePath = path ? `${path}/${fileName}.${fileExt}` : `${fileName}.${fileExt}`

    // Upload the file
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      upsert: true, // Changed to true to overwrite if file exists
    })

    if (error) {
      return { error: error.message }
    }

    // Get the public URL directly
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath)

    // Ensure the URL has the correct format
    const correctUrl = ensureCorrectUrlFormat(publicUrlData.publicUrl, bucket)

    return {
      url: correctUrl,
      publicUrl: correctUrl,
      path: filePath,
    }
  } catch (error: any) {
    return { error: error.message || "Failed to upload image" }
  }
}

// Function to upload an image from a URL to Supabase storage
export async function uploadImageFromUrl(
  url: string,
  bucket = "item_images",
  path = "",
): Promise<{ url: string; path: string; publicUrl?: string } | { error: string }> {
  try {
    if (!url) {
      return { error: "No URL provided" }
    }

    // Fetch the image
    const response = await fetch(url)
    if (!response.ok) {
      return { error: `Failed to fetch image: ${response.statusText}` }
    }

    // Get the content type and determine file extension
    const contentType = response.headers.get("content-type") || "image/jpeg"
    const fileExt = contentType.split("/").pop() || "jpg"

    // Convert to blob
    const blob = await response.blob()

    // Generate a unique file name
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    const filePath = path ? `${path}/${fileName}.${fileExt}` : `${fileName}.${fileExt}`

    // Upload the file
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, blob, {
      contentType,
      cacheControl: "3600",
      upsert: true, // Changed to true to overwrite if file exists
    })

    if (error) {
      console.error("Error uploading image from URL:", error)
      return { error: error.message }
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath)

    // Ensure the URL has the correct format
    const correctUrl = ensureCorrectUrlFormat(publicUrlData.publicUrl, bucket)

    return {
      url: correctUrl,
      path: filePath,
      publicUrl: correctUrl,
    }
  } catch (error: any) {
    console.error("Error uploading image from URL:", error)
    return { error: error.message || "Failed to upload image from URL" }
  }
}

// Function to fix existing image URLs in the database
export async function fixImageUrls(tableName = "sell_items") {
  try {
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Get all records with image_url
    const { data, error } = await supabase
      .from(tableName)
      .select("id, image_url, image_path")
      .not("image_url", "is", null)

    if (error) {
      console.error("Error fetching records:", error)
      return { success: false, error: error.message }
    }

    if (!data || data.length === 0) {
      return { success: true, message: "No records with image URLs found" }
    }

    console.log(`Found ${data.length} records with image URLs to fix`)

    // Fix each record
    let fixedCount = 0
    let errorCount = 0

    for (const record of data) {
      if (!record.image_url) continue

      const correctUrl = ensureCorrectUrlFormat(record.image_url, "item_images")

      // Only update if the URL changed
      if (correctUrl !== record.image_url) {
        const { error: updateError } = await supabase
          .from(tableName)
          .update({ image_url: correctUrl })
          .eq("id", record.id)

        if (updateError) {
          console.error(`Error updating record ${record.id}:`, updateError)
          errorCount++
        } else {
          fixedCount++
        }
      }
    }

    return {
      success: true,
      message: `Fixed ${fixedCount} URLs, ${errorCount} errors, ${data.length - fixedCount - errorCount} already correct`,
    }
  } catch (error) {
    console.error("Error fixing image URLs:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error fixing image URLs",
    }
  }
}

// Function to create the item_images bucket if it doesn't exist
export async function ensureItemImagesBucket() {
  try {
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error("Error listing buckets:", listError)
      return { success: false, error: listError.message }
    }

    const bucketExists = buckets.some((bucket) => bucket.name === "item_images")

    if (!bucketExists) {
      // Create the bucket
      const { data, error } = await supabase.storage.createBucket("item_images", {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      })

      if (error) {
        console.error("Error creating item_images bucket:", error)
        return { success: false, error: error.message }
      }

      console.log("Successfully created item_images bucket")
      return { success: true, message: "Created item_images bucket" }
    }

    console.log("item_images bucket already exists")
    return { success: true, message: "item_images bucket already exists" }
  } catch (error: any) {
    console.error("Error ensuring item_images bucket:", error)
    return { success: false, error: error.message || "Unknown error" }
  }
}
