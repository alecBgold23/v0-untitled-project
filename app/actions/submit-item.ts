"use server"

import supabase from "@/lib/supabase"

export async function submitItemToSupabase(formData: FormData) {
  try {
    // Extract form data
    const itemName = formData.get("itemName") as string
    const itemDescription = formData.get("itemDescription") as string
    const itemCondition = formData.get("itemCondition") as string
    const itemIssues = formData.get("itemIssues") as string
    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const address = formData.get("address") as string
    const pickupDate = formData.get("pickupDate") as string

    // Validate required fields
    if (!itemName || !itemDescription || !itemCondition || !fullName || !email || !phone) {
      return {
        success: false,
        message: "Missing required fields",
      }
    }

    // Insert data into Supabase
    const { data, error } = await supabase
      .from("item_submissions")
      .insert([
        {
          item_name: itemName,
          item_description: itemDescription,
          item_condition: itemCondition,
          item_issues: itemIssues || "None",
          full_name: fullName,
          email: email,
          phone: phone,
          address: address,
          pickup_date: pickupDate,
          status: "pending", // Default status
          submission_date: new Date().toISOString(),
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
