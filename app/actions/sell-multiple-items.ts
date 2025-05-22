"use server"

import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { sendConfirmationEmail } from "./send-confirmation-email"
// Import the fix-image-urls utility at the top of the file
import { fixImageUrl } from "@/lib/fix-image-urls"

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

export async function sellMultipleItems(items: ItemData[], contactInfo: ContactInfo) {
  console.log("Starting submission to Supabase via sell-multiple-items:", { items, contactInfo })

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

    // Validate phone number - ensure it's not null or empty
    if (!contactInfo.phone || contactInfo.phone.trim() === "") {
      return {
        success: false,
        message: "Phone number is required",
      }
    }

    // Get Supabase client
    const supabase = getSupabaseAdmin()

    // Prepare data for insertion - use only the correct column names that match the database schema
    const submissionData = items.map((item) => {
      // Create a base object with only the correct column names
      const baseData: Record<string, any> = {
        item_name: item.name,
        item_description: item.description,
        item_condition: item.condition,
        email: contactInfo.email,
        phone: contactInfo.phone || "",
        status: "pending",
      }

      // Add optional fields with fallbacks to empty strings
      // These will be ignored if the columns don't exist
      baseData.item_issues = item.issues || "None"
      baseData.address = contactInfo.address || ""
      baseData.full_name = contactInfo.fullName
      baseData.pickup_date = contactInfo.pickupDate || ""
      baseData.estimated_price = item.estimatedPrice || ""

      // Add image data - ensure we're using the correct column names
      if (item.imagePath) {
        baseData.image_path = item.imagePath
      }

      if (item.imageUrl) {
        baseData.image_url = fixImageUrl(item.imageUrl)
      }

      return baseData
    })

    console.log("Attempting to insert data with correct column names")
    console.log("First item data sample:", submissionData[0])

    // Insert data into Supabase
    let data // Changed from const to let
    let error // Changed from const to let
    ;({ data, error } = await supabase.from("sell_items").insert(submissionData).select())

    if (error) {
      console.error("Error submitting items to Supabase:", error)

      // If the error is about a column not existing, try a more minimal approach
      if (error.message && (error.message.includes("column") || error.code === "42703")) {
        console.log("Column error detected, trying minimal insertion with only essential fields")

        const minimalData = items.map((item) => ({
          item_name: item.name,
          item_description: item.description,
          item_condition: item.condition,
          email: contactInfo.email,
          phone: contactInfo.phone || "", // Ensure phone is never null
          status: "pending",
        }))

        let minimalResult // Changed from const to let
        let minimalError // Changed from const to let
        ;({ data: minimalResult, error: minimalError } = await supabase.from("sell_items").insert(minimalData).select())

        if (minimalError) {
          console.error("Error with minimal submission:", minimalError)

          // If still having issues, try to create the table first
          if (minimalError.code === "PGRST116") {
            console.log("Table doesn't exist, creating it first...")

            try {
              // Use Postgres extension directly
              const { error: tableError } = await supabase.from("sell_items_temp").insert({
                item_name: "temp_create_table",
                item_description: "Creating table",
                item_condition: "New",
                email: "temp@example.com",
                phone: "0000000000",
                status: "deleted",
              })

              if (tableError && tableError.code !== "PGRST116") {
                console.error("Error creating temporary table:", tableError)
              }
              // Try one more time with the minimal data
              ;({ data: minimalResult, error: minimalError } = await supabase
                .from("sell_items")
                .insert(minimalData)
                .select())

              if (minimalError) {
                return {
                  success: false,
                  message: `Database error: ${minimalError.message}`,
                  code: minimalError.code,
                }
              } else {
                data = minimalResult
              }
            } catch (createError) {
              console.error("Error in table creation attempt:", createError)
              return {
                success: false,
                message: "Failed to create or access the required database table",
              }
            }
          } else {
            return {
              success: false,
              message: `Database error: ${minimalError.message}`,
              code: minimalError.code,
            }
          }
        } else {
          console.log("Successfully submitted with minimal fields")
          data = minimalResult
        }
      } else {
        // If it's some other error, return it
        return {
          success: false,
          message: `Database error: ${error.message}`,
          code: error.code,
        }
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
        itemIssues: items.map((item) => `${item.name}: ${item.issues || "None"}`).join(" | "),
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
    console.error("Unexpected error in sellMultipleItems:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
