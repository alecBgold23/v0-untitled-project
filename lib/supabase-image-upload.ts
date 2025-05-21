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
        upsert: true, // Changed to true to overwrite if file exists
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

        // Also get public URL as fallback
        const { data: publicUrlData } = supabase.storage.from("item_images").getPublicUrl(data.path)

        console.log("Upload successful to item_images:", data.path)
        console.log("Signed URL:", signedUrlData.signedUrl)
        console.log("Public URL:", publicUrlData.publicUrl)

        return {
          success: true,
          path: data.path,
          url: signedUrlData.signedUrl,
          signedUrl: signedUrlData.signedUrl,
          publicUrl: publicUrlData.publicUrl,
          bucket: "item_images",
        }
      } else {
        console.error("Error uploading to item_images:", error)
        throw new Error(`Upload to item_images failed: ${error.message}`)
      }
    } catch (itemImagesError) {
      console.error("Error uploading to item_images bucket:", itemImagesError)
      // Continue to fallback bucket
    }

    // Fallback to images2 bucket
    const { data, error } = await supabase.storage.from("images2").upload(fileName, file, {
      cacheControl: "3600",
      upsert: true, // Changed to true to overwrite if file exists
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

    // Also get public URL as fallback
    const { data: publicUrlData } = supabase.storage.from("images2").getPublicUrl(data.path)

    console.log("Upload successful to fallback bucket:", data.path)
    console.log("Signed URL:", signedUrlData.signedUrl)
    console.log("Public URL:", publicUrlData.publicUrl)

    return {
      success: true,
      path: data.path,
      url: signedUrlData.signedUrl,
      signedUrl: signedUrlData.signedUrl,
      publicUrl: publicUrlData.publicUrl,
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
  try {
    // Use service role key for server-side operations
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Create a unique file path
    const filePath = `uploads/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`

    console.log(`Attempting to upload image to ${bucket} bucket with path: ${filePath}`)

    // Upload the file
    const { data, error: uploadError } = await supabase.storage.from(bucket).upload(filePath, fileBuffer, {
      contentType: "image/jpeg", // Adjust if needed
      upsert: true, // Changed to true to overwrite if file exists
    })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      throw new Error(`Failed to upload image to ${bucket}: ${uploadError.message}`)
    }

    console.log(`Successfully uploaded image to ${bucket} bucket with path: ${filePath}`)

    // Generate a signed URL (valid for 7 days = 604800 seconds)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 60 * 60 * 24 * 7) // 7 days

    if (signedUrlError) {
      console.error("Signed URL error:", signedUrlError)
      throw new Error(`Failed to generate signed URL: ${signedUrlError.message}`)
    }

    // Also get the public URL as a fallback
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath)

    const imageUrl = signedUrlData?.signedUrl || publicUrlData?.publicUrl || null

    console.log("Image upload successful with URLs:", {
      path: filePath,
      signedUrl: signedUrlData?.signedUrl,
      publicUrl: publicUrlData?.publicUrl,
    })

    return {
      image_path: filePath,
      image_url: imageUrl,
      signedUrl: signedUrlData?.signedUrl,
      publicUrl: publicUrlData?.publicUrl,
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
): Promise<{ url: string; signedUrl?: string; publicUrl?: string; path?: string } | { error: string }> {
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

    // Generate a signed URL (valid for 7 days)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 60 * 60 * 24 * 7) // 7 days

    if (signedUrlError) {
      return { error: signedUrlError.message }
    }

    // Also get public URL as fallback
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath)

    return {
      url: signedUrlData.signedUrl,
      signedUrl: signedUrlData.signedUrl,
      publicUrl: publicUrlData.publicUrl,
      path: filePath,
    }
  } catch (error: any) {
    return { error: error.message || "Failed to upload image" }
  }
}

// Function to save an external image URL to Supabase database
export async function saveImageUrlToSupabase(
  imageUrl: string,
  itemId: string | null = null,
  tableName = "items",
  userId = "anonymous",
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!imageUrl) {
      return { success: false, error: "No image URL provided" }
    }

    // Create a timestamp for the update
    const timestamp = new Date().toISOString()

    // If itemId is provided, update the existing record
    if (itemId) {
      const { data, error } = await supabase
        .from(tableName)
        .update({
          image_url: imageUrl,
          updated_at: timestamp,
        })
        .eq("id", itemId)
        .select()

      if (error) {
        console.error("Error updating image URL in Supabase:", error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    }
    // Otherwise, create a new record
    else {
      const { data, error } = await supabase
        .from(tableName)
        .insert({
          image_url: imageUrl,
          user_id: userId,
          created_at: timestamp,
          updated_at: timestamp,
        })
        .select()

      if (error) {
        console.error("Error inserting image URL in Supabase:", error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    }
  } catch (error: any) {
    console.error("Error saving image URL to Supabase:", error)
    return { success: false, error: error.message || "Failed to save image URL" }
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

    return {
      url: publicUrlData.publicUrl,
      path: filePath,
      publicUrl: publicUrlData.publicUrl,
    }
  } catch (error: any) {
    console.error("Error uploading image from URL:", error)
    return { error: error.message || "Failed to upload image from URL" }
  }
}

// Function to store an image URL in Supabase database with metadata
export async function storeImageUrlWithMetadata(
  imageUrl: string,
  metadata: {
    itemName?: string
    description?: string
    price?: number | string
    condition?: string
    category?: string
    userId?: string
    itemId?: string
    [key: string]: any // Allow any additional metadata
  },
  tableName = "item_images",
): Promise<{ success: boolean; data?: any; error?: string; id?: string }> {
  try {
    if (!imageUrl) {
      return { success: false, error: "No image URL provided" }
    }

    // Create a timestamp for the record
    const timestamp = new Date().toISOString()

    // Prepare the data to insert
    const insertData = {
      image_url: imageUrl,
      item_name: metadata.itemName || null,
      description: metadata.description || null,
      price: metadata.price || null,
      condition: metadata.condition || null,
      category: metadata.category || null,
      user_id: metadata.userId || "anonymous",
      item_id: metadata.itemId || null,
      created_at: timestamp,
      updated_at: timestamp,
      ...Object.entries(metadata)
        .filter(
          ([key]) => !["itemName", "description", "price", "condition", "category", "userId", "itemId"].includes(key),
        )
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}),
    }

    // Insert the record
    const { data, error } = await supabase.from(tableName).insert(insertData).select()

    if (error) {
      console.error("Error storing image URL with metadata:", error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      data,
      id: data && data[0] ? data[0].id : undefined,
    }
  } catch (error: any) {
    console.error("Error storing image URL with metadata:", error)
    return { success: false, error: error.message || "Failed to store image URL with metadata" }
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
