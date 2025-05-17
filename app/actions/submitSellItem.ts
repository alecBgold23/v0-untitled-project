"use server"

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "" // use service role for insert

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function submitSellItem(itemData: any) {
  const { name, description, imagePath, email, condition } = itemData

  if (!name || !description || !imagePath) {
    return { success: false, error: "Missing required fields" }
  }

  // Generate the public URL for the image
  const {
    data: { publicUrl },
  } = supabase.storage.from("images2").getPublicUrl(imagePath)

  const { data, error } = await supabase
    .from("sell_items")
    .insert([
      {
        item_name: name,
        item_description: description,
        image_path: imagePath,
        image_url: publicUrl, // Add the image URL to the inserted data
        email,
        item_condition: condition,
        status: "pending",
        submission_date: new Date().toISOString(),
      },
    ])
    .select()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data, imageUrl: publicUrl }
}
