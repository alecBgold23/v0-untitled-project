"use server"

import supabase from "@/lib/supabase"

export async function uploadImage(
  file: File,
): Promise<{ url: string | null; id: string | null; error: string | null }> {
  try {
    if (!file) {
      return { url: null, id: null, error: "No file provided" }
    }

    // Create file path inside bucket
    const filePath = `uploads/${file.name}`

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    // Upload file to Supabase Storage bucket "images2"
    const { data, error } = await supabase.storage
      .from("images2") // your bucket name
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error("Upload error:", error)
      return { url: null, id: null, error: `Upload failed: ${error.message}` }
    }

    // Get public URL of the uploaded file
    const { data: publicUrlData } = supabase.storage.from("images2").getPublicUrl(filePath)

    // Insert image metadata into your "sell_item" table
    const { data: imageRecord, error: dbError } = await supabase
      .from("sell_item") // your actual table
      .insert({
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        public_url: publicUrlData.publicUrl,
      })
      .select()

    if (dbError) {
      console.error("Error inserting image record:", dbError.message)
      // Return URL but mention DB insert failed
      return {
        url: publicUrlData.publicUrl,
        id: null,
        error: `Image uploaded but DB record failed: ${dbError.message}`,
      }
    }

    return {
      url: publicUrlData.publicUrl,
      id: imageRecord?.[0]?.id || null,
      error: null,
    }
  } catch (error) {
    console.error("Unexpected error during file upload:", error)
    return { url: null, id: null, error: "Unexpected error during file upload" }
  }
}

// Fetch all images metadata from "sell_item" table
export async function getImages() {
  try {
    const { data, error } = await supabase
      .from("sell_item")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching images:", error.message)
      return { images: null, error: error.message }
    }

    return { images: data, error: null }
  } catch (error) {
    console.error("Unexpected error fetching images:", error)
    return { images: null, error: "Unexpected error fetching images" }
  }
}

// Delete image file from storage and record from "sell_item" table
export async function deleteImage(id: string) {
  try {
    // Fetch image record from DB to get file path
    const { data: image, error: fetchError } = await supabase
      .from("sell_item")
      .select("file_path")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("Error fetching image record:", fetchError.message)
      return { success: false, error: fetchError.message }
    }

    if (!image) {
      return { success: false, error: "Image record not found" }
    }

    // Delete file from storage bucket "images2"
    const { error: storageError } = await supabase.storage
      .from("images2")
      .remove([image.file_path])

    if (storageError) {
      console.error("Error deleting file from storage:", storageError.message)
      // Continue to delete DB record even if file deletion fails
    }

    // Delete record from database table
    const { error: dbError } = await supabase
      .from("sell_item")
      .delete()
      .eq("id", id)

    if (dbError) {
      console.error("Error deleting image record:", dbError.message)
      return { success: false, error: dbError.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("Unexpected error deleting image:", error)
    return { success: false, error: "Unexpected error deleting image" }
  }
}
