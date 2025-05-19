import { createClient } from "@supabase/supabase-js"

// Create a singleton client to avoid multiple instances
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

    // Upload file
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

    // Get public URL
    const { data: urlData } = supabase.storage.from("images2").getPublicUrl(data.path)

    console.log("Upload successful:", data.path)
    console.log("Public URL:", urlData.publicUrl)

    return {
      success: true,
      path: data.path,
      url: urlData.publicUrl,
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
    // Try to list files in the images bucket
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
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error checking Supabase storage",
    }
  }
}

// Additional browser-compatible functions
export async function uploadImageToSupabase(
  file: File,
  bucket = "images2",
  path = "",
): Promise<{ url: string } | { error: string }> {
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

    // Get the public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath)

    return { url: urlData.publicUrl }
  } catch (error: any) {
    return { error: error.message || "Failed to upload image" }
  }
}
