"use server"

import supabase from "@/lib/supabase"

type ItemData = {
  name: string
  description: string
  condition: string
  issues: string
  photos: any[] // In a real implementation, you'd handle photo uploads separately
}

export async function submitMultipleItemsToSupabase(
  items: ItemData[],
  contactInfo: {
    fullName: string
    email: string
    phone: string
    address: string
    pickupDate: string
  },
) {
  try {
    const { fullName, email, phone, address, pickupDate } = contactInfo

    // Validate required contact info
    if (!fullName || !email || !phone) {
      return {
        success: false,
        message: "Missing required contact information",
      }
    }

    // Validate items
    if (!items || items.length === 0) {
      return {
        success: false,
        message: "No items to submit",
      }
    }

    // Prepare items for insertion
    const itemsToInsert = items.map((item) => ({
      item_name: item.name,
      item_description: item.description,
      item_condition: item.condition,
      item_issues: item.issues || "None",
      full_name: fullName,
      email: email,
      phone: phone,
      address: address,
      pickup_date: pickupDate,
      status: "pending",
      submission_date: new Date().toISOString(),
    }))

    // Insert data into Supabase
    const { data, error } = await supabase.from("item_submissions").insert(itemsToInsert).select()

    if (error) {
      console.error("Error submitting to Supabase:", error)
      return {
        success: false,
        message: "Failed to submit items. Please try again later.",
      }
    }

    return {
      success: true,
      message: "Items submitted successfully!",
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
