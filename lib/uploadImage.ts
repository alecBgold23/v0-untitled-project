import supabase from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

export async function uploadImage(file: File): Promise<string | null> {
  try {
    if (!file) {
      console.error("No file provided")
      return null
    }

    // Create a unique file name with UUID for better uniqueness than timestamp
    const fileExt = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `uploads/${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("item-images") // Make sure this bucket exists in your Supabase project
      .upload(filePath, file)

    if (error) {
      console.error("Error uploading file:", error.message)
      return null
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage.from("item-images").getPublicUrl(filePath)

    return publicUrlData.publicUrl
  } catch (error) {
    console.error("Unexpected error during file upload:", error)
    return null
  }
}
