"use server"

import { createClient } from "@supabase/supabase-js"
import { sendConfirmationEmail } from "./send-confirmation-email"
import supabase from "@/lib/supabase"

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
  address: string
  pickupDate: string
  photoCount: number
}) {
  try {
    console.log("Starting submission process...")

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

    // Prepare data for submission
    const itemData = {
      item_name: formData.itemName,
      item_description: formData.itemDescription,
      item_condition: formData.itemCondition,
      item_issues: formData.itemIssues || "None",
      full_name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address || "",
      pickup_date: formData.pickupDate || "",
      photo_count: formData.photoCount || 0,
      status: "pending",
      submission_date: new Date().toISOString(),
    }

    // Store in temporary memory as a fallback
    temporarySubmissions.push(itemData)
    console.log(`Stored in temporary memory. Total submissions: ${temporarySubmissions.length}`)

    // Try to insert into Supabase using the imported client
    console.log("Attempting to insert into Supabase...")

    // Get Supabase URL and key for debugging
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      ""

    console.log("Supabase URL available:", !!supabaseUrl)
    console.log("Supabase Key available:", !!supabaseKey)

    // Create a new client with explicit options
    const newSupabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      global: {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
        },
      },
    })

    let supabaseSuccess = false
    let supabaseError = null

    try {
      // First try with the imported client
      const { data, error } = await supabase.from("sell_items").insert([itemData])

      if (error) {
        console.error("Error with imported client:", error)

        // Try with the new client as fallback
        console.log("Trying with new client...")
        const { data: newData, error: newError } = await newSupabase.from("sell_items").insert([itemData])

        if (newError) {
          console.error("Error with new client:", newError)
          supabaseError = newError
        } else {
          console.log("Success with new client!")
          supabaseSuccess = true
        }
      } else {
        console.log("Success with imported client!")
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
        itemIssues: formData.itemIssues,
        phone: formData.phone,
        address: formData.address,
        pickupDate: formData.pickupDate,
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
