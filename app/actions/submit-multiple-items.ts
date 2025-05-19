"use server"

import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { sendConfirmationEmail } from "./send-confirmation-email"

interface ItemData {
  name: string
  description: string
  condition: string
  issues: string
  imagePath?: string
  imageUrl?: string
  imagePaths?: string[]
  imageUrls?: string[]
  estimatedPrice?: string
  photos?: Array<{
    name: string
    type: string
    size: number
  }>
}

interface ContactInfo {
  fullName: string
  email: string
  phone: string
  address: string
  pickupDate: string
}

export async function submitMultipleItemsToSupabase(items: ItemData[], contactInfo: ContactInfo) {
  console.log("Starting submission to Supabase:", { items, contactInfo })

  try {
    // Validate inputs
    if (!items || items.length === 0) {
      return {
        success: false,
        message: "No items provided",
      }
    }

    if (!contactInfo.email || !contactInfo.fullName) {
      return {
        success: false,
        message: "Contact information is incomplete",
      }
    }

    // Get Supabase client
    const supabase = getSupabaseAdmin()

    // Prepare data for insertion
    const submissionData = items.map((item) => ({
      item_name: item.name,
      item_description: item.description,
      item_condition: item.condition,
      image_path: item.imagePath || "",
      email: contactInfo.email,
      phone: contactInfo.phone,
      address: contactInfo.address,
      full_name: contactInfo.fullName,
      pickup_date: contactInfo.pickupDate,
      status: "pending",
      submission_date: new Date().toISOString(),
      estimated_price: item.estimatedPrice || null,
      image_paths: item.imagePaths || [],
      image_urls: item.imageUrls || [],
    }))

    // Ensure the table exists before inserting
    await initializeTable(supabase)

    // Insert data into Supabase
    const { data, error } = await supabase.from("sell_items").insert(submissionData).select()

    if (error) {
      console.error("Error submitting items to Supabase:", error)
      return {
        success: false,
        message: `Database error: ${error.message}`,
        code: error.code,
      }
    }

    console.log("Successfully submitted to Supabase")

    // Send confirmation email
    try {
      const emailResult = await sendConfirmationEmail({
        fullName: contactInfo.fullName,
        email: contactInfo.email,
        itemName: `Multiple Items (${items.length})`,
        itemCondition: "Multiple",
        itemDescription: items.map((item) => `${item.name}: ${item.description}`).join(" | "),
        itemIssues: items.map((item) => `${item.name}: ${item.issues}`).join(" | "),
        phone: contactInfo.phone,
        address: contactInfo.address,
        pickupDate: contactInfo.pickupDate,
      })

      console.log("Email result:", emailResult)
    } catch (error) {
      console.error("Error sending confirmation email:", error)
    }

    return {
      success: true,
      data,
      message: `Successfully submitted ${items.length} item(s)`,
    }
  } catch (error) {
    console.error("Unexpected error in submitMultipleItemsToSupabase:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Helper function to ensure the table exists
async function initializeTable(supabase) {
  try {
    // Check if table exists by attempting a simple query
    const { error } = await supabase.from("sell_items").select("id").limit(1)

    if (error && error.code === "PGRST116") {
      // Table doesn't exist, create it
      const { error: createError } = await supabase.sql`
        CREATE TABLE IF NOT EXISTS sell_items (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          item_name TEXT NOT NULL,
          item_description TEXT NOT NULL,
          image_path TEXT,
          email TEXT,
          item_condition TEXT NOT NULL,
          phone TEXT,
          address TEXT,
          full_name TEXT,
          pickup_date TEXT,
          status TEXT DEFAULT 'pending',
          submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          estimated_price TEXT,
          image_paths TEXT[],
          image_urls TEXT[]
        );
      `

      if (createError) {
        console.error("Error creating sell_items table:", createError)
      }
    }
  } catch (err) {
    console.error("Error checking/creating table:", err)
  }
}
