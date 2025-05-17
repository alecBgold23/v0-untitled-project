"use server"

import { createClient } from "@supabase/supabase-js"

// Define a proper type for the item data
interface SellItemData {
  name: string
  description: string
  imagePath: string
  email?: string
  condition: string
  phone?: string
  address?: string
  fullName?: string
  pickupDate?: string
}

// Define a type for the database row
interface SellItemRow {
  item_name: string
  item_description: string
  image_path: string
  email?: string
  item_condition: string
  phone?: string
  address?: string
  full_name?: string
  pickup_date?: string
  status: string
  submission_date: string
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Create client with more robust error checking
const getSupabaseAdmin = () => {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing Supabase credentials. Check your environment variables.")
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  })
}

export async function submitSellItem(itemData: SellItemData) {
  try {
    // Validate required fields
    if (!itemData.name || !itemData.description || !itemData.imagePath) {
      return {
        success: false,
        error: "Missing required fields",
        details: {
          name: !itemData.name ? "Item name is required" : null,
          description: !itemData.description ? "Item description is required" : null,
          imagePath: !itemData.imagePath ? "Item image is required" : null,
        },
      }
    }

    // Get Supabase admin client
    const supabase = getSupabaseAdmin()

    // Prepare data for insertion
    const sellItemRow: SellItemRow = {
      item_name: itemData.name,
      item_description: itemData.description,
      image_path: itemData.imagePath,
      email: itemData.email,
      item_condition: itemData.condition,
      phone: itemData.phone,
      address: itemData.address,
      full_name: itemData.fullName,
      pickup_date: itemData.pickupDate,
      status: "pending",
      submission_date: new Date().toISOString(),
    }

    // Insert data and return the inserted row
    const { data, error } = await supabase.from("sell_items").insert([sellItemRow]).select() // Add .select() to return the inserted data

    if (error) {
      console.error("Error submitting sell item:", error)
      return {
        success: false,
        error: error.message,
        code: error.code,
      }
    }

    // Get the public URL for the image
    const {
      data: { publicUrl },
    } = supabase.storage.from("images2").getPublicUrl(itemData.imagePath)

    return {
      success: true,
      data: data?.[0] || null,
      imageUrl: publicUrl,
    }
  } catch (error) {
    console.error("Unexpected error in submitSellItem:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
