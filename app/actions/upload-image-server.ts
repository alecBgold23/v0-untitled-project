"use server"

import { createClient } from "@supabase/supabase-js"

// Use consistent environment variable names with the rest of your application
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "" // Use service role key for server operations

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// This function accepts a FormData object instead of a File
export async function uploadImageToStorage(formData: FormData) {
  try {
    // Get the file from FormData
    const file = formData.get("file") as File | null
    const userId = formData.get("userId") as string

    if (!file || !userId) {
      return { success: false, error: "No file or userId provided" }
    }

    // Convert the file to a Buffer for server-side upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create unique filename
    const fileName = `${userId}_${Date.now()}_${file.name.replace(/\s+/g, "_")}`

    // Upload file to 'images2' bucket
    const { data, error } = await supabase.storage.from("images2").upload(fileName, buffer, {
      contentType: file.type,
      cacheControl: "3600",
    })

    if (error) {
      console.error("Supabase storage upload error:", error)
      return { success: false, error: error.message }
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("images2").getPublicUrl(data.path)

    return {
      success: true,
      path: data.path,
      url: publicUrl,
    }
  } catch (error) {
    console.error("Server action error:", error)
    return {
      success: false,
      error: "Failed to upload image",
    }
  }
}
