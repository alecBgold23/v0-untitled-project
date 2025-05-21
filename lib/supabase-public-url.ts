import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function uploadImageAndGetPublicUrl(file: File, userId: string) {
  try {
    const fileName = `${userId}/${Date.now()}-${file.name}`

    // Upload the file to the 'item_images' bucket
    const { data, error } = await supabase.storage.from("item_images").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      throw error
    }

    if (!data?.path) {
      throw new Error("No file path returned from upload")
    }

    // Get the public URL (this requires the bucket to be set to public access)
    const { data: publicUrlData } = supabase.storage.from("item_images").getPublicUrl(data.path)

    if (!publicUrlData?.publicUrl) {
      throw new Error("No public URL returned")
    }

    // Return both the public URL and the path for reference
    return {
      publicUrl: publicUrlData.publicUrl,
      path: data.path,
      success: true,
    }
  } catch (err) {
    console.error("Upload error:", err)
    return {
      error: err instanceof Error ? err.message : "Unknown error",
      success: false,
    }
  }
}

// Function to check if the bucket is public and make it public if it's not
export async function ensureBucketIsPublic(bucketName = "item_images") {
  try {
    // Get the bucket's public status
    const { data, error } = await supabase.storage.getBucket(bucketName)

    if (error) {
      console.error("Error checking bucket status:", error)
      return { success: false, error: error.message }
    }

    // If the bucket is not public, make it public
    if (data && !data.public) {
      const { error: updateError } = await supabase.storage.updateBucket(bucketName, {
        public: true,
      })

      if (updateError) {
        console.error("Error making bucket public:", updateError)
        return { success: false, error: updateError.message }
      }

      return { success: true, message: `Bucket ${bucketName} is now public` }
    }

    return { success: true, message: `Bucket ${bucketName} is already public` }
  } catch (err) {
    console.error("Error ensuring bucket is public:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    }
  }
}

// Function to upload an image and save the public URL to a Supabase table
export async function uploadImageAndSaveUrl(
  file: File,
  userId: string,
  tableName = "items",
  itemId?: string,
  additionalData: Record<string, any> = {},
) {
  try {
    // First, ensure the bucket is public
    const bucketStatus = await ensureBucketIsPublic()
    if (!bucketStatus.success) {
      console.warn("Warning: Bucket may not be public:", bucketStatus.error)
      // Continue anyway, as we'll try to get a public URL
    }

    // Upload the image and get the public URL
    const uploadResult = await uploadImageAndGetPublicUrl(file, userId)

    if (!uploadResult.success || !("publicUrl" in uploadResult)) {
      throw new Error(uploadResult.error || "Failed to upload image")
    }

    const { publicUrl, path } = uploadResult

    // Save the URL to the database
    const timestamp = new Date().toISOString()

    let dbOperation
    if (itemId) {
      // Update existing record
      dbOperation = supabase
        .from(tableName)
        .update({
          image_url: publicUrl,
          image_path: path,
          updated_at: timestamp,
          ...additionalData,
        })
        .eq("id", itemId)
        .select()
    } else {
      // Insert new record
      dbOperation = supabase
        .from(tableName)
        .insert({
          image_url: publicUrl,
          image_path: path,
          user_id: userId,
          created_at: timestamp,
          updated_at: timestamp,
          ...additionalData,
        })
        .select()
    }

    const { data, error } = await dbOperation

    if (error) {
      console.error("Error saving to database:", error)
      return {
        success: false,
        error: error.message,
        publicUrl, // Still return the URL even if DB save failed
        path,
      }
    }

    return {
      success: true,
      data,
      publicUrl,
      path,
    }
  } catch (err) {
    console.error("Error in uploadImageAndSaveUrl:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    }
  }
}
