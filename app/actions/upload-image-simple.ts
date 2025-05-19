"use server"

import { createClient } from "@supabase/supabase-js"

// Create a singleton Supabase client for server-side use
let supabaseClient: ReturnType<typeof createClient> | null = null

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase credentials not configured")
  }

  supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  })

  return supabaseClient
}

export async function uploadImageSimple(file: File, userId: string) {
  if (!file) {
    return { success: false, error: "No file provided" }
  }

  try {
    // Create a unique filename to avoid collisions
    const fileName = `${userId}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    console.log(`Simple upload: Attempting to upload file: ${fileName}`)

    // Get Supabase client
    const supabase = getSupabaseClient()

    // Convert file to buffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Define bucket name - use the default public bucket that always exists
    const bucketName = "images2"

    // Direct upload attempt
    const { data, error } = await supabase.storage.from(bucketName).upload(fileName, buffer, {
      contentType: file.type,
      upsert: true, // Use upsert to overwrite if file exists
    })

    if (error) {
      console.error(`Simple upload error: ${error.message}`)
      return { success: false, error: error.message }
    }

    if (!data || !data.path) {
      return { success: false, error: "Upload path not returned" }
    }

    // Get public URL of the uploaded file
    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(data.path)

    if (!publicUrlData || !publicUrlData.publicUrl) {
      return { success: false, error: "Failed to get public URL" }
    }

    console.log(`Simple upload: Successfully uploaded file: ${fileName}`)

    return {
      success: true,
      path: data.path,
      url: publicUrlData.publicUrl,
    }
  } catch (error) {
    console.error(`Simple upload: Unexpected error: ${error instanceof Error ? error.message : String(error)}`)
    return {
      success: false,
      error: `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
