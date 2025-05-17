"use server"

import { uploadImageToBucket } from "@/app/actions/uploadImageToBucket"
import { submitSellItem } from "@/app/actions/submitSellItem"

export async function handleSubmit(formData: FormData) {
  const imageFile = formData.get("image") as File // assuming file input named "image"
  const email = (formData.get("email") as string) || "anonymous"
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const condition = formData.get("condition") as string

  if (!imageFile || !name || !description || !condition) {
    return { success: false, error: "Missing required fields" }
  }

  // 1. Upload image and get path and URL
  const uploadResult = await uploadImageToBucket(imageFile, email)
  if (!uploadResult.success) {
    return { success: false, error: "Image upload failed: " + uploadResult.error }
  }

  // 2. Submit sell item with image path and URL
  const submitResult = await submitSellItem({
    name,
    description,
    imagePath: uploadResult.path,
    imageUrl: uploadResult.url, // Pass the image URL
    email,
    condition,
  })

  if (!submitResult.success) {
    return { success: false, error: "Submit failed: " + submitResult.error }
  }

  return {
    success: true,
    imageUrl: submitResult.imageUrl, // Return the image URL in the response
    data: submitResult.data,
  }
}
