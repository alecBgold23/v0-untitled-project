"use server"

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "" // Use service role key for server-side

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function uploadImagePrivate(file: File, userId: string) {
  if (!file) {
    return { success: false, error: "No file provided" }
  }

  try {
    // Create a unique filename to avoid collisions
    const fileName = `${userId}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

    // Convert file to buffer for upload (Node environment)
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Log upload attempt
    console.log(`Attempting to upload file: ${fileName}, size: ${buffer.length} bytes, type: ${file.type}`)

    // Upload file to 'images2' bucket (correct bucket name)
    const { data, error } = await supabase.storage.from("images2").upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    })

    if (error) {
      console.error(`Supabase storage upload error: ${error.message}`)
      return { success: false, error: error.message }
    }

    // Get public URL of the uploaded file
    const { data: publicUrlData } = supabase.storage.from("images2").getPublicUrl(data.path)

    console.log(`Successfully uploaded file: ${fileName}, path: ${data.path}`)

    return {
      success: true,
      path: data.path,
      url: publicUrlData.publicUrl,
      signedUrl: publicUrlData.publicUrl, // For backward compatibility
    }
  } catch (error) {
    console.error(`Unexpected error in uploadImagePrivate: ${error instanceof Error ? error.message : String(error)}`)
    return {
      success: false,
      error: `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
