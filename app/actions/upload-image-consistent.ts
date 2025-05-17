"use server"

import { createClient } from "@supabase/supabase-js"

// Use the same environment variables as the sell_item table operations
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Create Supabase client with the same configuration
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function uploadImageToSupabase(formData: FormData) {
  try {
    console.log("Starting image upload with consistent env vars")
    console.log(`Using Supabase URL: ${supabaseUrl.substring(0, 10)}...`)

    // Get the file from FormData
    const imageFile = formData.get("image") as File

    if (!imageFile) {
      console.error("No image file provided in FormData")
      return { success: false, error: "No image file provided" }
    }

    console.log(`Processing file: ${imageFile.name}, type: ${imageFile.type}, size: ${imageFile.size} bytes`)

    // Create a unique filename
    const fileExt = imageFile.name.split(".").pop()
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`

    // Convert File to Buffer for server-side upload
    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log(`Uploading to 'images2' bucket as: ${uniqueFileName}`)

    // Upload image to 'images' bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("images2")
      .upload(uniqueFileName, buffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: imageFile.type,
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return { success: false, error: uploadError.message }
    }

    if (!uploadData?.path) {
      console.error("Upload succeeded but no path returned")
      return { success: false, error: "Upload succeeded but no path returned" }
    }

    console.log(`Upload successful, path: ${uploadData.path}`)

    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage.from("images2").getPublicUrl(uploadData.path)

    const publicUrl = publicUrlData.publicUrl
    console.log("Generated public URL:", publicUrl)

    return {
      success: true,
      path: uploadData.path,
      publicUrl: publicUrl,
    }
  } catch (error) {
    console.error("Unexpected error in uploadImageToSupabase:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
