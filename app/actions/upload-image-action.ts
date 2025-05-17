"use server"

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// This function accepts FormData instead of a File object
export async function uploadImageToSupabase(formData: FormData) {
  try {
    // Extract the file from FormData
    const imageFile = formData.get("image") as File | null

    if (!imageFile) {
      console.error("No image file provided")
      return { success: false, error: "No image file provided" }
    }

    // Log file details for debugging
    console.log("File received:", {
      name: imageFile.name,
      type: imageFile.type,
      size: imageFile.size,
    })

    // Convert the file to a Buffer (this is the key step)
    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uniqueFileName = `${Date.now()}_${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

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

    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage.from("images2").getPublicUrl(uniqueFileName)

    const publicUrl = publicUrlData.publicUrl
    console.log("Image uploaded successfully:", publicUrl)

    return {
      success: true,
      publicUrl,
      path: uniqueFileName,
    }
  } catch (error) {
    console.error("Unexpected error in uploadImageToSupabase:", error)
    return { success: false, error: (error as Error).message || "Unknown error" }
  }
}
