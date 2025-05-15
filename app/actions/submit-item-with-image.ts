"use server"

import supabase from "@/lib/supabase"

type SubmitItemData = {
  name: string
  description: string
  condition: string
  imageUrl: string
}

export async function submitItemWithImage(data: SubmitItemData) {
  try {
    // Validate required fields
    if (!data.name || !data.description || !data.condition) {
      return {
        success: false,
        message: "Missing required fields",
      }
    }

    // Insert data into Supabase
    const { data: insertedData, error } = await supabase
      .from("items") // Replace with your actual table name
      .insert([
        {
          name: data.name,
          description: data.description,
          condition: data.condition,
          image_url: data.imageUrl,
        },
      ])
      .select()

    if (error) {
      console.error("Error inserting data:", error)
      return {
        success: false,
        message: "Failed to submit item. Please try again later.",
      }
    }

    return {
      success: true,
      message: "Item submitted successfully!",
      data: insertedData,
    }
  } catch (error) {
    console.error("Unexpected error:", error)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    }
  }
}
