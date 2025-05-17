"use server"

import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"
import { revalidatePath } from "next/cache"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function uploadItemImageAndSave(formData: FormData) {
  const file = formData.get("file") as File
  const itemName = formData.get("name") as string

  if (!file || !itemName) {
    return { error: "Missing file or name" }
  }

  const fileExt = file.name.split(".").pop()
  const fileName = `${uuidv4()}.${fileExt}`
  const filePath = `${fileName}`

  // Step 1: Upload the image
  const { data: uploadData, error: uploadError } = await supabase.storage.from("images2").upload(filePath, file)

  if (uploadError) {
    console.error("Upload error:", uploadError)
    return { error: "Failed to upload image." }
  }

  // Step 2: Get public URL
  const { data: publicUrlData } = supabase.storage.from("images2").getPublicUrl(filePath)

  const imageUrl = publicUrlData?.publicUrl

  if (!imageUrl) {
    return { error: "Failed to get public URL." }
  }

  // Step 3: Save to sell_items
  const { error: insertError } = await supabase.from("sell_items").insert([
    {
      name: itemName,
      image_url: imageUrl,
    },
  ])

  if (insertError) {
    console.error("DB insert error:", insertError)
    return { error: "Failed to save item to database." }
  }

  revalidatePath("/") // Optional: revalidate your UI
  return { success: true }
}
