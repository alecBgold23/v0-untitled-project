"use server"

import { createClient } from "@supabase/supabase-js"
import { sendConfirmationEmail } from "./send-confirmation-email"

// Create a direct Supabase client with service role key for server actions
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseServiceKey)

type ItemData = {
  name: string
  description: string
  condition: string
  issues: string
  photos: any[] // In a real implementation, you'd handle photo uploads separately
  imagePath?: string // Add image path field
  imageUrl?: string // Add image URL field
  imagePaths?: string[]
  imageUrls?: string[]
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
  console.log("Starting submission to Supabase:", { items, contactInfo })

  try {
    const { fullName, email, phone, address, pickupDate } = contactInfo

    // Validate required contact info
    if (!fullName || !email || !phone) {
      console.error("Missing required contact information")
      return {
        success: false,
        message: "Missing required contact information",
      }
    }

    // Validate items
    if (!items || items.length === 0) {
      console.error("No items to submit")
      return {
        success: false,
        message: "No items to submit",
      }
    }

    // Prepare items for insertion - only use columns we know exist
    const itemsToInsert = items.map((item) => {
      // If we have multiple images, log a warning that we can only store the first one
      if (item.imagePaths && item.imagePaths.length > 1) {
        console.warn(
          `Item ${item.name} has ${item.imagePaths.length} images, but only the first one will be stored due to schema limitations.`,
        )
      }

      return {
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
        photo_count: item.photos ? item.photos.length : 0,
        image_path: item.imagePath || (item.imagePaths && item.imagePaths.length > 0 ? item.imagePaths[0] : null),
        image_url: item.imageUrl || (item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : null),
        // No metadata or additional image columns
      }
    })

    console.log("Prepared items for insertion:", itemsToInsert)

    // Insert data into Supabase
    const { data, error } = await supabase.from("sell_items").insert(itemsToInsert)

    if (error) {
      console.error("Error submitting to Supabase:", error)
      return {
        success: false,
        message: `Failed to submit items: ${error.message}`,
      }
    }

    console.log("Successfully submitted to Supabase")

    // Send confirmation email
    const emailResult = await sendConfirmationEmail({
      fullName,
      email,
      itemName: `Multiple Items (${items.length})`,
      itemCondition: "Multiple",
      itemDescription: items.map((item) => `${item.name}: ${item.description}`).join(" | "),
      itemIssues: items.map((item) => `${item.name}: ${item.issues}`).join(" | "),
      phone,
      address,
      pickupDate,
    })

    console.log("Email result:", emailResult)

    return {
      success: true,
      message: "Items submitted successfully!",
      emailSent: emailResult.success,
    }
  } catch (error) {
    console.error("Unexpected error in submitMultipleItemsToSupabase:", error)
    return {
      success: false,
      message: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
