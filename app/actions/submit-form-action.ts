"use server"

import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function submitFormAction(formData: FormData) {
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
