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

    // Get Supabase client
    const supabase = getSupabaseAdmin()

    // First, check if the table exists and ensure it has the required structure
    await ensureTableStructure(supabase)

    // Get the actual column names from the table to ensure we're using the correct ones
    const { data: tableInfo, error: tableInfoError } = await supabase.from("sell_items").select().limit(1)

    if (tableInfoError && tableInfoError.code !== "PGRST116") {
      console.error("Error fetching table info:", tableInfoError)
      return {
        success: false,
        message: `Database error: ${tableInfoError.message}`,
      }
    }

    // Prepare data for insertion - use only the correct column names that match the database schema
    const submissionData = items.map((item) => {
      // Create a base object with only the correct column names
      const baseData: Record<string, any> = {
        item_name: item.name,
        item_description: item.description,
        item_condition: item.condition,
        item_issues: item.issues,
        image_path: item.imagePath || "",
        image_url: item.imageUrl || "",
        email: contactInfo.email,
        phone: contactInfo.phone,
        address: contactInfo.address,
        full_name: contactInfo.fullName,
        pickup_date: contactInfo.pickupDate,
        status: "pending",
        submission_date: new Date().toISOString(),
        estimated_price: item.estimatedPrice || null,
      }

      return baseData
    })

    console.log("Attempting to insert data with correct column names")

    // Insert data into Supabase
    let data // Changed from const to let
    let error // Changed from const to let
    ;({ data, error } = await supabase.from("sell_items").insert(submissionData).select())

    if (error) {
      console.error("Error submitting items to Supabase:", error)

      // If the error is about column names, try a more minimal approach
      if (error.message.includes("column") || error.code === "42703") {
        console.log("Trying minimal insertion with only essential fields")

        const minimalData = items.map((item) => ({
          item_name: item.name,
          item_description: item.description,
          item_condition: item.condition,
          email: contactInfo.email,
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
      } else {
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
    console.error("Unexpected error in sellMultipleItems:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
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
            query: "ALTER TABLE sell_items ADD COLUMN IF NOT EXISTS phone TEXT;",
          })
          await supabase.rpc("execute_sql", {
            query: "ALTER TABLE sell_items ADD COLUMN IF NOT EXISTS address TEXT;",
          })
          await supabase.rpc("execute_sql", {
            query: "ALTER TABLE sell_items ADD COLUMN IF NOT EXISTS fullname TEXT;",
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
          await supabase.rpc("execute_sql", {
            query: "ALTER TABLE sell_items ADD COLUMN IF NOT EXISTS full_name TEXT;",
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
          query: "ALTER TABLE sell_items ADD COLUMN IF NOT EXISTS phone TEXT;",
        })
        await supabase.rpc("execute_sql", {
          query: "ALTER TABLE sell_items ADD COLUMN IF NOT EXISTS address TEXT;",
        })
        await supabase.rpc("execute_sql", {
          query: "ALTER TABLE sell_items ADD COLUMN IF NOT EXISTS fullname TEXT;",
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
        await supabase.rpc("execute_sql", {
          query: "ALTER TABLE sell_items ADD COLUMN IF NOT EXISTS full_name TEXT;",
        })
        console.log("Ensured all columns exist")
      } catch (alterError) {
        console.error("Error ensuring columns exist:", alterError)
      }
    }

    // Get the current table structure to log it
    try {
      const { data, error } = await supabase
        .from("information_schema.columns")
        .select("column_name, data_type")
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
