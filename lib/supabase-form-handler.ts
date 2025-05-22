import { createClient } from "@supabase/supabase-js"

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "item_images"

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Define types for better type safety
type UploadResult = {
  success: boolean
  url?: string
  path?: string
  error?: string
}

type FormSubmissionResult = {
  success: boolean
  itemId?: string
  photoCount?: number
  imageUrls?: string[]
  error?: string
}

/**
 * Uploads a single file to Supabase Storage
 */
async function uploadFile(file: File, prefix = ""): Promise<UploadResult> {
  try {
    if (!file) {
      return { success: false, error: "No file provided" }
    }

    // Create a unique file path with optional prefix
    const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const filePath = prefix ? `${prefix}/${Date.now()}_${fileName}` : `${Date.now()}_${fileName}`

    console.log(`Uploading file to bucket: ${bucketName}, path: ${filePath}`)

    // Upload the file
    const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file, {
      cacheControl: "3600",
      upsert: true, // Overwrite if file exists
    })

    if (error) {
      console.error("Error uploading file:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(data.path)

    return {
      success: true,
      url: publicUrlData.publicUrl,
      path: data.path,
    }
  } catch (error) {
    console.error("Upload error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown upload error",
    }
  }
}

/**
 * Handles form submission with multiple image uploads
 */
export async function handleFormSubmission(formData: FormData): Promise<FormSubmissionResult> {
  try {
    // Extract form data
    const itemName = formData.get("item_name") as string
    const condition = formData.get("condition") as string
    const files = formData.getAll("images") as File[]

    // Validate required fields
    if (!itemName) {
      return { success: false, error: "Item name is required" }
    }

    // Initialize upload results
    const uploadResults: UploadResult[] = []
    const imageUrls: string[] = []

    // Generate a unique ID for this item to group images
    const itemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    // Upload each file
    for (const file of files) {
      // Skip non-image files
      if (!file.type.startsWith("image/")) {
        console.warn(`Skipping non-image file: ${file.name}`)
        continue
      }

      const result = await uploadFile(file, itemId)
      uploadResults.push(result)

      if (result.success && result.url) {
        imageUrls.push(result.url)
      }
    }

    // Count successful uploads
    const successfulUploads = uploadResults.filter((r) => r.success).length

    // Insert record into database
    const { data, error: insertError } = await supabase
      .from("sell_items")
      .insert({
        id: itemId,
        item_name: itemName,
        condition: condition,
        image_urls: imageUrls, // Store all image URLs as an array
        image_url: imageUrls[0] || null, // For backward compatibility
        photo_count: successfulUploads,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error("Database insert error:", insertError)
      return {
        success: false,
        error: `Failed to save item: ${insertError.message}`,
        photoCount: successfulUploads,
        imageUrls,
      }
    }

    console.log(`Successfully saved item with ${successfulUploads} photos`)

    return {
      success: true,
      itemId: data?.id,
      photoCount: successfulUploads,
      imageUrls,
    }
  } catch (error) {
    console.error("Form submission error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error processing form",
    }
  }
}

/**
 * Gets the photo count for an item from storage
 */
export async function getItemPhotoCount(itemId: string): Promise<number> {
  try {
    // List files in the item's folder
    const { data, error } = await supabase.storage.from(bucketName).list(itemId)

    if (error) {
      console.error(`Error getting photo count for item ${itemId}:`, error)
      return 0
    }

    // Count only files, not folders
    return data.filter((item) => !item.id.endsWith("/")).length
  } catch (error) {
    console.error(`Error counting photos for item ${itemId}:`, error)
    return 0
  }
}

/**
 * Updates the photo count in the database based on actual storage
 */
export async function updateItemPhotoCount(itemId: string): Promise<boolean> {
  try {
    // Get actual count from storage
    const photoCount = await getItemPhotoCount(itemId)

    // Update the database
    const { error } = await supabase
      .from("sell_items")
      .update({
        photo_count: photoCount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId)

    if (error) {
      console.error(`Error updating photo count for item ${itemId}:`, error)
      return false
    }

    return true
  } catch (error) {
    console.error(`Error in updateItemPhotoCount for ${itemId}:`, error)
    return false
  }
}
