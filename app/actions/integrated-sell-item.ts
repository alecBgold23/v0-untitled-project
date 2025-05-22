"use server"

import { createClient } from "@supabase/supabase-js"
import { uploadImageToSupabase, ensureItemImagesBucket } from "@/lib/supabase-image-upload"
// Import the fix-image-urls utility at the top of the file
import { fixImageUrl } from "@/lib/fix-image-urls"

// Use the same environment variables consistently
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Create Supabase client with the same configuration
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function submitSellItemWithImage(formData: FormData) {
  try {
    console.log("Starting integrated sell item submission")

    // Extract form fields
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const email = formData.get("email") as string
    const condition = formData.get("condition") as string
    const imageFile = formData.get("image") as File

    // Validate required fields
    if (!name || !description) {
      return { success: false, error: "Missing required fields" }
    }

    // Ensure the item_images bucket exists
    await ensureItemImagesBucket()

    // 1. Upload the image if provided
    let imagePath = ""
    let imageUrl = ""

    if (imageFile && imageFile.size > 0) {
      // Convert the file to a buffer
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Upload the image
      const uploadResult = await uploadImageToSupabase(buffer, imageFile.name, "item_images")

      if (!uploadResult.success) {
        console.error("Image upload failed:", uploadResult)
        return { success: false, error: "Failed to upload image" }
      }

      imagePath = uploadResult.image_path
      imageUrl = uploadResult.image_url || uploadResult.publicUrl || uploadResult.signedUrl

      console.log("Image uploaded successfully:", { imagePath, imageUrl })
    }

    // 2. Insert item data with image path and URL
    const { data, error } = await supabase
      .from("sell_items")
      .insert([
        {
          item_name: name,
          item_description: description,
          image_path: imagePath,
          image_url: fixImageUrl(imageUrl), // Fix the URL format here
          email,
          item_condition: condition,
          status: "pending",
          submission_date: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error("Database insert error:", error)
      return { success: false, error: error.message }
    }

    console.log("Item submitted successfully:", data)

    return {
      success: true,
      data,
      imageUrl: imageUrl,
      imagePath: imagePath,
    }
  } catch (error) {
    console.error("Unexpected error in submitSellItemWithImage:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
