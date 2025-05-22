"use server"

import { revalidatePath } from "next/cache"
import { uploadItemPhoto, getPhotoCount } from "@/lib/supabase-upload"
import { supabase } from "@/lib/supabase-upload"

export async function uploadItemPhotos(formData: FormData) {
  try {
    const itemId = formData.get("itemId") as string

    if (!itemId) {
      return {
        success: false,
        error: "Item ID is required",
      }
    }

    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return {
        success: false,
        error: "No files provided",
      }
    }

    // Get current photo count to use as starting index
    const currentCount = await getPhotoCount(itemId)

    // Upload each file with proper indexing
    const uploadPromises = files.map((file, i) => uploadItemPhoto(file, itemId, currentCount + i))

    const results = await Promise.all(uploadPromises)

    // Check if all uploads were successful
    const allSuccessful = results.every((result) => result.success)

    // Get the updated photo count
    const newPhotoCount = await getPhotoCount(itemId)

    // Update the item record with the new photo count
    if (allSuccessful) {
      const { error: updateError } = await supabase
        .from("items")
        .update({
          photo_count: newPhotoCount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", itemId)

      if (updateError) {
        console.error("Error updating item photo count:", updateError)
      }
    }

    // Revalidate the item page to show updated photos
    revalidatePath(`/items/${itemId}`)

    return {
      success: allSuccessful,
      uploadCount: results.filter((r) => r.success).length,
      failedCount: results.filter((r) => !r.success).length,
      photoCount: newPhotoCount,
      results: results,
    }
  } catch (error) {
    console.error("Error in uploadItemPhotos:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error uploading photos",
    }
  }
}
