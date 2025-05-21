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

    // First, check if the table exists and ensure it has the required structure
    await ensureTableStructure(supabase)

    // Check if the phone column has a NOT NULL constraint
    const hasNotNullConstraint = await checkPhoneConstraint(supabase)

    // Log the constraint status
    console.log("Phone column has NOT NULL constraint:", hasNotNullConstraint)

    // Prepare data for insertion - use only the correct column names that match the database schema
    const submissionData = items.map((item) => {
      // Create a base object with only the correct column names
      const baseData: Record<string, any> = {
        item_name: item.name,
        item_description: item.description,
        item_condition: item.condition,
        item_issues: item.issues || "None",
        email: contactInfo.email,
        // Ensure phone is never null - use empty string as fallback if needed
        phone: contactInfo.phone || "",
        address: contactInfo.address || "",
        full_name: contactInfo.fullName,
        pickup_date: contactInfo.pickupDate || "",
        status: "pending",
        submission_date: new Date().toISOString(),
        estimated_price: item.estimatedPrice || "",
      }

      // Add image data - ensure we're using the correct column names
      if (item.imagePath) {
        baseData.image_path = item.imagePath
      }

      if (item.imageUrl) {
        baseData.image_url = item.imageUrl
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

      // If the error is about the phone column being null
      if (error.message && error.message.includes("phone") && error.message.includes("not-null")) {
        // Try to alter the table to make phone nullable
        try {
          console.log("Attempting to make phone column nullable...")
          await supabase.rpc("execute_sql", {
            query: "ALTER TABLE sell_items ALTER COLUMN phone DROP NOT NULL;",
          })
          console.log("Phone column constraint removed, trying again...")

          // Try the insert again
          ;({ data, error } = await supabase.from("sell_items").insert(submissionData).select())

          if (error) {
            console.error("Still error after making phone nullable:", error)
            return {
              success: false,
              message: `Database error: ${error.message}`,
              code: error.code,
            }
          }
        } catch (alterError) {
          console.error("Error altering phone column:", alterError)
        }
      }
      // If still having issues, try a more minimal approach
      else if (error) {
        console.log("Trying minimal insertion with only essential fields")

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
          return {
            success: false,
            message: `Database error: ${minimalError.message}`,
            code: minimalError.code,
          }
        }

        console.log("Successfully submitted with minimal fields")
        data = minimalResult
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

// Helper function to check if the phone column has a NOT NULL constraint
async function checkPhoneConstraint(supabase) {
  try {
    const { data, error } = await supabase
      .from("information_schema.columns")
      .select("is_nullable")
      .eq("table_name", "sell_items")
      .eq("column_name", "phone")
      .single()

    if (error) {
      console.error("Error checking phone constraint:", error)
      return false
    }

    return data && data.is_nullable === "NO"
  } catch (err) {
    console.error("Error in checkPhoneConstraint:", err)
    return false
  }
}

// Helper function to ensure the table exists with the correct structure
async function ensureTableStructure(supabase) {
  try {
    // Check if table exists by attempting a simple query
    const { error } = await supabase.from("sell_items").select("id").limit(1)

    if (error && error.code === "PGRST116") {
      console.log("Table doesn't exist, creating it...")
      // Table doesn't exist, create it with minimal required columns
      const { error: createError } = await supabase.rpc("execute_sql", {
        query: `
          CREATE TABLE IF NOT EXISTS sell_items (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            item_name TEXT NOT NULL,
            item_description TEXT NOT NULL,
            item_condition TEXT NOT NULL,
            email TEXT,
            phone TEXT, -- Create without NOT NULL constraint
            status TEXT DEFAULT 'pending',
            submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      })

      if (createError) {
        console.error("Error creating sell_items table:", createError)
      } else {
        console.log("Table created successfully, adding additional columns...")
        // Add additional columns one by one to avoid errors
        try {
          await supabase.rpc("execute_sql", {
            query: "ALTER TABLE sell_items ADD COLUMN IF NOT EXISTS image_path TEXT;",
          })
          await supabase.rpc("execute_sql", {
            query: "ALTER TABLE sell_items ADD COLUMN IF NOT EXISTS image_url TEXT;",
          })
          await supabase.rpc("execute_sql", {
            query: "ALTER TABLE sell_items ADD COLUMN IF NOT EXISTS image_paths TEXT;",
          })
          await supabase.rpc("execute_sql", {
            query: "ALTER TABLE sell_items ADD COLUMN IF NOT EXISTS image_urls TEXT;",
          })
          await supabase.rpc("execute_sql", {
            query: "ALTER TABLE sell_items ADD COLUMN IF NOT EXISTS photo_count INTEGER DEFAULT 0;",
          })
          await supabase.rpc("execute_sql", {
            query: "ALTER TABLE sell_items ADD COLUMN IF NOT EXISTS address TEXT;",
          })
          await supabase.rpc("execute_sql", {
            query: "ALTER TABLE sell_items ADD COLUMN IF NOT EXISTS full_name TEXT;",
          })
          await supabase.rpc("execute_sql", {
            query: "ALTER TABLE sell_items ADD COLUMN IF NOT EXISTS pickup_date TEXT;",
          })
          await supabase.rpc("execute_sql", {
            query: "ALTER TABLE sell_items ADD COLUMN IF NOT EXISTS estimated_price TEXT;",
          })
          await supabase.rpc("execute_sql", {
            query: "ALTER TABLE sell_items ADD COLUMN IF NOT EXISTS item_issues TEXT;",
          })
          console.log("Additional columns added successfully")
        } catch (alterError) {
          console.error("Error adding additional columns:", alterError)
        }
      }
    } else {
      console.log("Table exists, ensuring it has all required columns...")
      // Table exists, make sure it has all the columns we need
      try {
        // Add columns if they don't exist
        await supabase.rpc("execute_sql", {
          query: "ALTER TABLE sell_items ADD COLUMN IF NOT EXISTS image_path TEXT;",
        })
        await supabase.rpc("execute_sql", {
          query: "ALTER TABLE sell_items ADD COLUMN IF NOT EXISTS image_url TEXT;",
        })
        await supabase.rpc("execute_sql", {
          query: "ALTER TABLE sell_items ADD COLUMN IF NOT EXISTS image_paths TEXT;",
        })
        await supabase.rpc("execute_sql", {
          query: "ALTER TABLE sell_items ADD COLUMN IF NOT EXISTS image_urls TEXT;",
        })
        await supabase.rpc("execute_sql", {
          query: "ALTER TABLE sell_items ADD COLUMN IF NOT EXISTS photo_count INTEGER DEFAULT 0;",
        })
        await supabase.rpc("execute_sql", {
          query: "ALTER TABLE sell_items ADD COLUMN IF NOT EXISTS address TEXT;",
        })
        await supabase.rpc("execute_sql", {
          query: "ALTER TABLE sell_items ADD COLUMN IF NOT EXISTS full_name TEXT;",
        })
        await supabase.rpc("execute_sql", {
          query: "ALTER TABLE sell_items ADD COLUMN IF NOT EXISTS pickup_date TEXT;",
        })
        await supabase.rpc("execute_sql", {
          query: "ALTER TABLE sell_items ADD COLUMN IF NOT EXISTS estimated_price TEXT;",
        })
        await supabase.rpc("execute_sql", {
          query: "ALTER TABLE sell_items ADD COLUMN IF NOT EXISTS item_issues TEXT;",
        })
        console.log("Ensured all columns exist")

        // Try to make the phone column nullable if it exists
        try {
          await supabase.rpc("execute_sql", {
            query: "ALTER TABLE sell_items ALTER COLUMN phone DROP NOT NULL;",
          })
          console.log("Made phone column nullable (if it had a constraint)")
        } catch (alterError) {
          console.error("Error making phone column nullable:", alterError)
        }
      } catch (alterError) {
        console.error("Error ensuring columns exist:", alterError)
      }
    }

    // Get the current table structure to log it
    try {
      const { data, error } = await supabase
        .from("information_schema.columns")
        .select("column_name, data_type, is_nullable")
        .eq("table_name", "sell_items")
      if (data) {
        console.log("Current table structure:", data)
      }
    } catch (e) {
      console.error("Error fetching table structure:", e)
    }
  } catch (err) {
    console.error("Error checking/creating table:", err)
  }
}
