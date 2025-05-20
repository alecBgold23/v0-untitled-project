import { createClient } from "@supabase/supabase-js"
import type { Buffer } from "buffer"

// Create a singleton client to avoid multiple instances
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
const supabaseServiceRole = createClient(supabaseUrl, supabaseServiceRoleKey)

export const supabase = supabaseClient

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

    // Create unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    console.log("Uploading file:", fileName)

    // Try to upload to item_images bucket first
    try {
      const { data, error } = await supabase.storage.from("item_images").upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (!error) {
        // Generate a signed URL (valid for 7 days)
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from("item_images")
          .createSignedUrl(data.path, 60 * 60 * 24 * 7) // 7 days

        if (signedUrlError) {
          console.error("Signed URL error:", signedUrlError)
          throw new Error("Failed to generate signed URL")
        }

        console.log("Upload successful to item_images:", data.path)
        console.log("Signed URL:", signedUrlData.signedUrl)

        return {
          success: true,
          path: data.path,
          url: signedUrlData.signedUrl,
          signedUrl: signedUrlData.signedUrl,
          bucket: "item_images",
        }
      }
    } catch (itemImagesError) {
      console.error("Error uploading to item_images bucket:", itemImagesError)
      // Continue to fallback bucket
    }

    // Fallback to images2 bucket
    const { data, error } = await supabase.storage.from("images2").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Supabase storage error:", error)
      throw new Error(error.message)
    }

    if (!data?.path) {
      throw new Error("Upload failed - no path returned")
    }

    // Generate a signed URL (valid for 7 days)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("images2")
      .createSignedUrl(data.path, 60 * 60 * 24 * 7) // 7 days

    if (signedUrlError) {
      console.error("Signed URL error:", signedUrlError)
      throw new Error("Failed to generate signed URL")
    }

    console.log("Upload successful to fallback bucket:", data.path)
    console.log("Signed URL:", signedUrlData.signedUrl)

    return {
      success: true,
      path: data.path,
      url: signedUrlData.signedUrl,
      signedUrl: signedUrlData.signedUrl,
      bucket: "images2",
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
    // Try to list files in the item_images bucket first
    try {
      const { data, error } = await supabase.storage.from("item_images").list()

      if (!error) {
        return {
          success: true,
          message: "item_images bucket is configured correctly",
          files: data?.length || 0,
          bucket: "item_images",
        }
      }
    } catch (itemImagesError) {
      console.error("Error checking item_images bucket:", itemImagesError)
    }

    // Fallback to images2 bucket
    const { data, error } = await supabase.storage.from("images2").list()

    if (error) {
      return {
        success: false,
        error: `Supabase storage error: ${error.message}`,
      }
    }

    return {
      success: true,
      message: "Supabase storage is configured correctly",
      files: data?.length || 0,
      bucket: "images2",
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error checking Supabase storage",
    }
  }
}

// Server-side image upload function with signed URL (for use in Node.js)
export async function uploadImageToSupabase(fileBuffer: Buffer, fileName: string, bucket = "item_images") {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const filePath = `uploads/${Date.now()}-${fileName}`

  // Upload the file
  const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, fileBuffer, {
    contentType: "image/jpeg", // Adjust if needed
    upsert: false,
  })

  if (uploadError) {
    console.error("Upload error:", uploadError)
    throw new Error("Failed to upload image to Supabase Storage")
  }

  // Generate a signed URL (valid for 7 days = 604800 seconds)
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, 60 * 60 * 24 * 7) // 7 days

  if (signedUrlError) {
    console.error("Signed URL error:", signedUrlError)
    throw new Error("Failed to generate signed URL")
  }

  const imageUrl = signedUrlData?.signedUrl || null

  return {
    image_path: filePath,
    image_url: imageUrl,
    signedUrl: signedUrlData?.signedUrl,
  }
}

// Additional browser-compatible functions
export async function uploadImageToSupabaseBrowser(
  file: File,
  bucket = "item_images",
  path = "",
): Promise<{ url: string; signedUrl?: string } | { error: string }> {
  try {
    // Generate a unique file name
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    const fileExt = file.name.split(".").pop()
    const filePath = path ? `${path}/${fileName}.${fileExt}` : `${fileName}.${fileExt}`

    // Upload the file
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file)

    if (error) {
      return { error: error.message }
    }

    // Generate a signed URL (valid for 7 days)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 60 * 60 * 24 * 7) // 7 days

    if (signedUrlError) {
      return { error: signedUrlError.message }
    }

    return {
      url: signedUrlData.signedUrl,
      signedUrl: signedUrlData.signedUrl,
    }
  } catch (error: any) {
    return { error: error.message || "Failed to upload image" }
  }
}
