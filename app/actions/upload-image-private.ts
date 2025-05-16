"use server"

import { createClient } from "@supabase/supabase-js"

/**
 * Uploads an image to a private Supabase bucket and returns a signed URL
 * @param file The image file to upload
 * @param identifier A unique identifier (typically email) to use in the filename
 * @returns Object containing success status, path, and signed URL
 */
export async function uploadImagePrivate(file: File, identifier: string) {
  try {
    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return {
        success: false,
        error: "Missing Supabase credentials",
      }
    }

    // Create Supabase client with service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })

    // Create a safe filename
    const safeIdentifier = identifier.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 10)
    const fileExt = file.name.split(".").pop()
    const fileName = `${safeIdentifier}_${timestamp}_${randomString}.${fileExt}`
    const filePath = `item-images/${fileName}`

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const fileData = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("private-uploads")
      .upload(filePath, fileData, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("Error uploading file:", uploadError)
      return {
        success: false,
        error: uploadError.message,
      }
    }

    // Get a signed URL that expires in 1 hour
    const { data: urlData, error: urlError } = await supabase.storage
      .from("private-uploads")
      .createSignedUrl(filePath, 3600)

    if (urlError) {
      console.error("Error creating signed URL:", urlError)
      return {
        success: false,
        error: urlError.message,
        path: filePath,
      }
    }

    return {
      success: true,
      path: filePath,
      signedUrl: urlData.signedUrl,
    }
  } catch (error) {
    console.error("Unexpected error in uploadImagePrivate:", error)
    return {
      success: false,
      error: String(error),
    }
  }
}
