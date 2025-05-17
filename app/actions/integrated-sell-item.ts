"use server"

import { createClient } from "@supabase/supabase-js"
import { uploadImageToSupabase } from "./upload-image-consistent"

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

    // Validate required fields
    if (!name || !description) {
      return { success: false, error: "Missing required fields" }
    }

    // 1. Upload the image first
    const uploadResult = await uploadImageToSupabase(formData)

    if (!uploadResult.success) {
      return { success: false, error: `Image upload failed: ${uploadResult.error}` }
    }

    console.log("Image uploaded successfully, proceeding with item submission")

    // 2. Insert item data with image path and URL
    const { data, error } = await supabase
      .from("sell_items")
      .insert([
        {
          item_name: name,
          item_description: description,
          image_path: uploadResult.path,
          image_url: uploadResult.publicUrl,
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
      imageUrl: uploadResult.publicUrl,
    }
  } catch (error) {
    console.error("Unexpected error in submitSellItemWithImage:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
