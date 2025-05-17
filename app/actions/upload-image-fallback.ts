"use server"

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function uploadImageFallback(file: File, userId: string) {
  if (!file) {
    return { success: false, error: "No file provided" }
  }

  try {
    // Create a unique filename
    const fileName = `${userId}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

    // For very small files, we can try base64 encoding
    const fileReader = new FileReader()

    // Convert file to base64 using a promise
    const base64Data = await new Promise<string>((resolve, reject) => {
      fileReader.onload = () => {
        const result = fileReader.result as string
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(",")[1]
        resolve(base64)
      }
      fileReader.onerror = () => {
        reject(new Error("Failed to read file"))
      }
      fileReader.readAsDataURL(file)
    })

    // Decode base64 to binary
    const binaryData = Buffer.from(base64Data, "base64")

    // Upload to Supabase
    const { data, error } = await supabase.storage.from("images2").upload(fileName, binaryData, {
      contentType: file.type,
      upsert: false,
    })

    if (error) {
      console.error(`Fallback upload error: ${error.message}`)
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from("images2").getPublicUrl(data.path)

    return {
      success: true,
      path: data.path,
      url: publicUrlData.publicUrl,
      signedUrl: publicUrlData.publicUrl,
    }
  } catch (error) {
    console.error(`Error in fallback upload: ${error instanceof Error ? error.message : String(error)}`)
    return {
      success: false,
      error: `Fallback upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
