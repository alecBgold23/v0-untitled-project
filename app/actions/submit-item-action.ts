"use server"

import supabase from "@/lib/supabase"

export async function submitItem(formData: FormData) {
  try {
    // Extract form data
    const condition = formData.get("condition") as string
    const description = formData.get("description") as string
    const imageUrls = formData.get("imageUrls") as string

    // Validate required fields
    if (!condition || !description) {
      return {
        success: false,
        message: "Missing required fields",
      }
    }

    // Insert data into Supabase
    const { data, error } = await supabase
      .from("items")
      .insert([
        {
          condition: condition,
          description: description,
          image_urls: imageUrls,
          // Add other fields as necessary
        },
      ])
      .select()

    if (error) {
      console.error("Error submitting to Supabase:", error)
      return {
        success: false,
        message: "Failed to submit item. Please try again later.",
      }
    }

    return {
      success: true,
      message: "Item submitted successfully!",
      data,
    }
  } catch (error) {
    console.error("Unexpected error:", error)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    }
  }
}
