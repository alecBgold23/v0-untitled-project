"use server"

import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { prepareImageUrlsForStorage } from "@/lib/image-url-utils"

interface ItemData {
  name: string
  description: string
  condition: string
  issues: string
  imagePath?: string
  imageUrl?: string // This will map to image_url column
  imagePaths?: string[]
  imageUrls?: string[]
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
    const submissionData = items.map((item) => {
      // Create base data object
      const itemData = {
        item_name: item.name,
        item_description: item.description,
        item_condition: item.condition,
        item_issues: item.issues || "None",
        // Standardize on image_urls as the primary field
        image_urls: prepareImageUrlsForStorage(item.imageUrls || item.imageUrl),
        // Keep image_url for backward compatibility (first URL)
        image_url: item.imageUrl || (item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : ""),
        email: contactInfo.email,
        phone: contactInfo.phone,
        address: contactInfo.address,
        full_name: contactInfo.fullName,
        pickup_date: contactInfo.pickupDate,
        status: "pending",
        submission_date: new Date().toISOString(),
      }

      return itemData
    })

    // Ensure the table exists before inserting
    await initializeTable(supabase)

    // Insert data into Supabase
    let data = null
    try {
      const { data: insertData, error } = await supabase.from("sell_items").insert(submissionData).select()

      if (error) {
        console.error("Error submitting items to Supabase:", error)

        // If the error is related to missing columns, try a fallback approach
        if (error.message && (error.message.includes("column") || error.message.includes("schema"))) {
          console.log("Attempting fallback insertion without image arrays...")

          // Create simplified data without the problematic columns
          const simplifiedData = items.map((item) => ({
            item_name: item.name,
            item_description: item.description,
            item_condition: item.condition,
            item_issues: item.issues || "None",
            // Standardize on image_urls as the primary field
            image_urls: prepareImageUrlsForStorage(item.imageUrls || item.imageUrl),
            // Keep image_url for backward compatibility (first URL)
            image_url: item.imageUrl || (item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : ""),
            email: contactInfo.email,
            phone: contactInfo.phone,
            address: contactInfo.address,
            full_name: contactInfo.fullName,
            pickup_date: contactInfo.pickupDate,
            status: "pending",
            submission_date: new Date().toISOString(),
          }))

          // Try insertion again with simplified data
          const fallbackResult = await supabase.from("sell_items").insert(simplifiedData).select()

          if (fallbackResult.error) {
            console.error("Fallback insertion also failed:", fallbackResult.error)
            return {
              success: false,
              message: `Database error: ${fallbackResult.error.message}`,
              code: fallbackResult.error.code,
            }
          }

          data = fallbackResult.data
          return {
            success: true,
            data,
            message: `Successfully submitted ${items.length} item(s) with fallback method`,
          }
        }

        return {
          success: false,
          message: `Database error: ${error.message}`,
          code: error.code,
        }
      }

      data = insertData
      return {
        success: true,
        data,
        message: `Successfully submitted ${items.length} item(s)`,
      }
    } catch (insertError) {
      console.error("Exception during database insertion:", insertError)
      return {
        success: false,
        message: `Unexpected error during submission: ${insertError.message || "Unknown error"}`,
      }
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
      const { error: createError } = await supabase.sql`CREATE TABLE IF NOT EXISTS sell_items (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          item_name TEXT NOT NULL,
          item_description TEXT NOT NULL,
          image_path TEXT,
          image_url TEXT, -- Ensure this column exists
          email TEXT,
          item_condition TEXT NOT NULL,
          item_issues TEXT, -- Ensure this column exists
          phone TEXT,
          address TEXT,
          full_name TEXT,
          pickup_date TEXT,
          status TEXT DEFAULT 'pending',
          submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          image_paths TEXT[],
          image_urls TEXT[]
        );
      `

      if (createError) {
        console.error("Error creating sell_items table:", createError)
      }
    } else {
      // Table exists, check if columns exist and add them if they don't
      try {
        // Try to add image_url column if it doesn't exist
        await supabase.sql`DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT FROM information_schema.columns 
              WHERE table_name = 'sell_items' AND column_name = 'image_url'
            ) THEN
              ALTER TABLE sell_items ADD COLUMN image_url TEXT;
            END IF;
          END $$;
        `

        // Try to add image_paths column if it doesn't exist
        await supabase.sql`DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT FROM information_schema.columns 
              WHERE table_name = 'sell_items' AND column_name = 'image_paths'
            ) THEN
              ALTER TABLE sell_items ADD COLUMN image_paths TEXT[];
            END IF;
          END $$;
        `

        // Try to add image_urls column if it doesn't exist
        await supabase.sql`DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT FROM information_schema.columns 
              WHERE table_name = 'sell_items' AND column_name = 'image_urls'
            ) THEN
              ALTER TABLE sell_items ADD COLUMN image_urls TEXT[];
            END IF;
          END $$;
        `
      } catch (alterError) {
        console.error("Error altering table:", alterError)
      }
    }
  } catch (err) {
    console.error("Error checking/creating table:", err)
  }
}
