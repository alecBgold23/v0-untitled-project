"use server"

import { createClient } from "@supabase/supabase-js"

export async function uploadImageBasic(file: File, userId: string) {
  try {
    console.log("Starting basic upload...")

    // Get Supabase credentials
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials")
    }

    // Create client
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Create a unique filename
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to default bucket
    const { data, error } = await supabase.storage.from("images2").upload(fileName, buffer, {
      contentType: file.type,
      upsert: true,
    })

    if (error) {
      console.error("Basic upload error:", error)
      return { success: false, error: error.message }
    }

    if (!data) {
      return { success: false, error: "No data returned from upload" }
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("images2").getPublicUrl(data.path)

    return {
      success: true,
      path: data.path,
      url: urlData.publicUrl,
      signedUrl: urlData.publicUrl,
    }
  } catch (error) {
    console.error("Basic upload unexpected error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
