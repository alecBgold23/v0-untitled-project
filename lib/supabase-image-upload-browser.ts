import { createClient } from "@supabase/supabase-js"
import { checkSupabaseStorage } from "@/lib/check-supabase-storage-browser"

// Create a client for the browser
export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials not configured")
  }

  return createClient(supabaseUrl, supabaseKey)
}

/**
 * Upload an image to Supabase storage
 */
export async function uploadImageToSupabase(file: File, folder = "uploads") {
  try {
    const supabase = getSupabaseClient()

    // Generate a unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 10)
    const fileExtension = file.name.split(".").pop()
    const fileName = `${timestamp}-${randomString}.${fileExtension}`
    const filePath = `${folder}/${fileName}`

    // Upload the file
    const { data, error } = await supabase.storage.from("images2").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Error uploading file:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    // Get the public URL
    const { data: urlData } = supabase.storage.from("images2").getPublicUrl(filePath)

    return {
      success: true,
      path: filePath,
      url: urlData.publicUrl,
    }
  } catch (error) {
    console.error("Error in uploadImageToSupabase:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Client-side version of the image upload function
 */
export async function uploadImageClient(file: File, folder = "uploads") {
  return uploadImageToSupabase(file, folder)
}

/**
 * Check if Supabase storage is properly configured
 */
export async function checkSupabaseStorageClient() {
  return checkSupabaseStorage()
}
