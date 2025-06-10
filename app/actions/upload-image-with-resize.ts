"use server"

import { createClient } from "@supabase/supabase-js"
import sharp from "sharp"

// Use the same environment variables as the sell_item table operations
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Create Supabase client with the same configuration
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function uploadImageToSupabase(formData: FormData) {
  try {
    console.log("📤 Starting image upload with resizing")

    const imageFile = formData.get("image") as File
    if (!imageFile) {
      console.error("❌ No image file provided in FormData")
      return { success: false, error: "No image file provided" }
    }

    // Validate file type
    if (!imageFile.type.startsWith("image/")) {
      return { success: false, error: "File must be an image" }
    }

    // Validate file size (10MB max before processing)
    if (imageFile.size > 10 * 1024 * 1024) {
      return { success: false, error: "File size must be less than 10MB" }
    }

    const fileExt = "jpg"
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`

    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 🖼️ Resize the image using sharp
    const resizedImage = await sharp(buffer)
      .resize({
        width: 1600,
        height: 1600,
        fit: "contain",
        background: { r: 255, g: 255, b: 255 }, // white background padding
      })
      .jpeg({ quality: 90 })
      .toBuffer()

    console.log(`🧩 Resized image, now uploading to Supabase as: ${uniqueFileName}`)
    console.log(`📏 Original size: ${imageFile.size} bytes, Resized: ${resizedImage.length} bytes`)

    // Use item_images bucket for consistency with your existing system
    const bucketName = "item_images"

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(uniqueFileName, resizedImage, {
        cacheControl: "3600",
        upsert: false,
        contentType: "image/jpeg",
      })

    if (uploadError) {
      console.error("❌ Upload error:", uploadError)
      return { success: false, error: uploadError.message }
    }

    if (!uploadData?.path) {
      console.error("⚠️ Upload succeeded but no path returned")
      return { success: false, error: "Upload succeeded but no path returned" }
    }

    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(uploadData.path)
    const publicUrl = publicUrlData.publicUrl

    console.log("✅ Upload and resize complete:", publicUrl)

    return {
      success: true,
      path: uploadData.path,
      publicUrl,
      bucket: bucketName,
      originalSize: imageFile.size,
      resizedSize: resizedImage.length,
    }
  } catch (error) {
    console.error("❌ Unexpected error in uploadImageToSupabase:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Alternative version that accepts multiple resize options
export async function uploadImageWithCustomResize(
  formData: FormData,
  options: {
    width?: number
    height?: number
    quality?: number
    bucket?: string
    fit?: "contain" | "cover" | "fill" | "inside" | "outside"
  } = {},
) {
  try {
    console.log("📤 Starting custom image upload with resizing")

    const imageFile = formData.get("image") as File
    if (!imageFile) {
      return { success: false, error: "No image file provided" }
    }

    // Validate file type
    if (!imageFile.type.startsWith("image/")) {
      return { success: false, error: "File must be an image" }
    }

    const { width = 1600, height = 1600, quality = 90, bucket = "item_images", fit = "contain" } = options

    const fileExt = "jpg"
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`

    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 🖼️ Resize the image using sharp with custom options
    const resizedImage = await sharp(buffer)
      .resize({
        width,
        height,
        fit,
        background: { r: 255, g: 255, b: 255 },
      })
      .jpeg({ quality })
      .toBuffer()

    console.log(`🧩 Custom resized image (${width}x${height}, ${fit}), uploading as: ${uniqueFileName}`)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(uniqueFileName, resizedImage, {
        cacheControl: "3600",
        upsert: false,
        contentType: "image/jpeg",
      })

    if (uploadError) {
      console.error("❌ Upload error:", uploadError)
      return { success: false, error: uploadError.message }
    }

    if (!uploadData?.path) {
      return { success: false, error: "Upload succeeded but no path returned" }
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(uploadData.path)
    const publicUrl = publicUrlData.publicUrl

    console.log("✅ Custom upload and resize complete:", publicUrl)

    return {
      success: true,
      path: uploadData.path,
      publicUrl,
      bucket,
      originalSize: imageFile.size,
      resizedSize: resizedImage.length,
      dimensions: { width, height },
    }
  } catch (error) {
    console.error("❌ Unexpected error in uploadImageWithCustomResize:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
