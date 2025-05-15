"use server"

import supabase from "@/lib/supabase"

export async function uploadImage(
  file: File,
): Promise<{ url: string | null; id: string | null; error: string | null }> {
  try {
    if (!file) {
      return { url: null, id: null, error: "No file provided" }
    }

    // Create file path
    const filePath = `uploads/${file.name}`

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("images") // your bucket name
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error("Upload error:", error)
      return { url: null, id: null, error: `Upload failed: ${error.message}` }
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage.from("images").getPublicUrl(filePath)

    // Now insert the metadata into the 'images' table
    const { data: imageRecord, error: dbError } = await supabase
      .from("images")
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
      // We still return the URL even if the database insert fails
      return {
        url: publicUrlData.publicUrl,
        id: null,
        error: `Image uploaded but database record failed: ${dbError.message}`,
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

// Function to get all images from the database
export async function getImages() {
  try {
    const { data, error } = await supabase.from("images").select("*").order("created_at", { ascending: false })

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

// Function to delete an image
export async function deleteImage(id: string) {
  try {
    // First get the image record to get the file path
    const { data: image, error: fetchError } = await supabase.from("images").select("file_path").eq("id", id).single()

    if (fetchError) {
      console.error("Error fetching image:", fetchError.message)
      return { success: false, error: fetchError.message }
    }

    if (!image) {
      return { success: false, error: "Image not found" }
    }

    // Delete the file from storage
    const { error: storageError } = await supabase.storage.from("images").remove([image.file_path])

    if (storageError) {
      console.error("Error deleting file from storage:", storageError.message)
      // Continue to delete the database record even if storage delete fails
    }

    // Delete the record from the database
    const { error: dbError } = await supabase.from("images").delete().eq("id", id)

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
