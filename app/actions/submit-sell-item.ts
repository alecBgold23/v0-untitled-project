"use server"

import { createClient } from "@supabase/supabase-js"
import { sendConfirmationEmail } from "./send-confirmation-email"

// Simple in-memory storage as a fallback
const temporarySubmissions: any[] = []

export async function submitSellItemToSupabase(formData: {
  itemName: string
  itemDescription: string
  itemCondition: string
  itemIssues: string
  fullName: string
  email: string
  phone: string
  address?: string
  pickupDate?: string
  photoCount?: number
  imageUrl?: string
  imagePath?: string
  estimatedPrice?: string
  estimatedPriceNumeric?: number
}) {
  try {
    console.log("Starting submission process with data:", JSON.stringify(formData, null, 2))

    // Validate required fields
    if (
      !formData.itemName ||
      !formData.itemDescription ||
      !formData.itemCondition ||
      !formData.fullName ||
      !formData.email ||
      !formData.phone
    ) {
      console.log("Validation failed: Missing required fields")
      return {
        success: false,
        message: "Missing required fields",
      }
    }

    // Ensure itemIssues is never null - use empty string as fallback
    const itemIssues = formData.itemIssues?.trim() ? formData.itemIssues : "None"
    console.log("Item issues value:", itemIssues)

    // Ensure imageUrl is never null - use empty string as fallback
    const imageUrl = formData.imageUrl || ""
    console.log("Image URL value:", imageUrl)

    // Prepare data for submission
    const itemData = {
      item_name: formData.itemName,
      item_description: formData.itemDescription,
      item_condition: formData.itemCondition,
      item_issues: itemIssues, // Using the non-null value
      full_name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address || "",
      pickup_date: formData.pickupDate || "",
      photo_count: formData.photoCount || 0,
      status: "pending",
      submission_date: new Date().toISOString(),
      image_url: imageUrl, // Using the non-null value
      image_path: formData.imagePath || "",
      estimated_price: formData.estimatedPrice || null,
      estimated_price_numeric: formData.estimatedPriceNumeric || null,
    }

    console.log("Final item_issues value being sent to Supabase:", itemData.item_issues)
    console.log("Estimated price being sent to Supabase:", itemData.estimated_price)
    console.log("Numeric price being sent to Supabase:", itemData.estimated_price_numeric)
    console.log("Prepared item data for Supabase:", JSON.stringify(itemData, null, 2))

    // Store in temporary memory as a fallback
    temporarySubmissions.push(itemData)
    console.log(`Stored in temporary memory. Total submissions: ${temporarySubmissions.length}`)

    // Try to insert into Supabase using the service role key
    console.log("Attempting to insert into Supabase...")

    // Get Supabase URL and service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Missing Supabase environment variables")
      return {
        success: true,
        message: "Your submission was received and stored temporarily. We'll process it as soon as possible.",
        databaseSuccess: false,
        emailSuccess: false,
        error: "Missing Supabase environment variables",
      }
    }

    console.log("Supabase URL available:", !!supabaseUrl)
    console.log("Supabase Service Role Key available:", !!supabaseServiceRoleKey)

    // Create a new client with the service role key to bypass RLS
    const adminSupabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    })

    let supabaseSuccess = false
    let supabaseError = null
    let insertedData = null

    try {
      // Insert data using the admin client with service role key
      const { data, error } = await adminSupabase.from("sell_items").insert([itemData]).select()

      if (error) {
        console.error("Error inserting data with service role key:", error)
        supabaseError = error
      } else {
        console.log("Success with service role key client!", data)
        insertedData = data
        supabaseSuccess = true
      }
    } catch (dbError) {
      console.error("Exception during Supabase operation:", dbError)
      supabaseError = dbError
    }

    // Send confirmation email
    let emailSuccess = false
    try {
      console.log("Sending confirmation email...")
      const emailResult = await sendConfirmationEmail({
        fullName: formData.fullName,
        email: formData.email,
        itemName: formData.itemName,
        itemCondition: formData.itemCondition,
        itemDescription: formData.itemDescription,
        itemIssues: formData.itemIssues || "None",
        phone: formData.phone,
        address: formData.address || "",
        pickupDate: formData.pickupDate || "",
        imageUrl: formData.imageUrl || "",
        estimatedPrice: formData.estimatedPrice || "",
      })

      if (!emailResult.success) {
        console.warn("Email sending failed:", emailResult)
      } else {
        console.log("Email sent successfully")
        emailSuccess = true
      }
    } catch (emailError) {
      console.error("Error sending email:", emailError)
    }

    // Return appropriate response based on what succeeded
    if (supabaseSuccess) {
      return {
        success: true,
        message: emailSuccess
          ? "Your item has been submitted successfully! You will receive a confirmation email shortly."
          : "Your item has been submitted successfully! However, we couldn't send a confirmation email.",
        databaseSuccess: true,
        emailSuccess,
        data: insertedData,
      }
    } else {
      // If Supabase failed but we have the data in memory and/or email
      return {
        success: true,
        message:
          "Your submission was received and stored temporarily. " +
          (emailSuccess
            ? "You will receive a confirmation email shortly."
            : "However, we couldn't send a confirmation email."),
        databaseSuccess: false,
        emailSuccess,
        error: supabaseError ? String(supabaseError) : "Unknown database error",
      }
    }
  } catch (error: any) {
    console.error("Unexpected error in submitSellItemToSupabase:", error)

    return {
      success: false,
      message: `We encountered an error processing your submission. Please try again later or contact support.`,
      error: String(error),
    }
  }
}

// Function to retrieve temporary submissions
export async function getTemporarySubmissions() {
  return {
    success: true,
    count: temporarySubmissions.length,
    submissions: temporarySubmissions,
  }
}
