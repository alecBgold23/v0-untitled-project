import { getSupabaseAdmin } from "./supabase-admin"

export async function ensureSellItemsTable() {
  try {
    const supabase = getSupabaseAdmin()

    // Check if table exists by attempting a simple query
    const { error } = await supabase.from("sell_items").select("id").limit(1)

    if (error && error.code === "PGRST116") {
      console.log("Table doesn't exist, attempting to create it...")

      // Try to create a template for the structure
      const { error: tempError } = await supabase.from("sell_items_temp").insert({
        item_name: "Template Item",
        item_description: "This is a template to create the table structure",
        item_condition: "New",
        email: "template@example.com",
        phone: "0000000000",
        status: "template",
      })

      if (tempError && tempError.code !== "PGRST116") {
        console.error("Error creating temporary table:", tempError)
      }

      // Try to create the actual table
      const { error: createError } = await supabase.from("sell_items").insert({
        item_name: "Setup Item",
        item_description: "This item was created to set up the table structure",
        item_condition: "New",
        email: "setup@example.com",
        phone: "0000000000",
        status: "setup",
      })

      if (createError && createError.code !== "23505") {
        // Ignore duplicate key errors
        console.error("Error creating sell_items table:", createError)
        return {
          success: false,
          error: createError,
        }
      }

      return {
        success: true,
        message: "sell_items table created",
      }
    }

    return {
      success: true,
      message: "sell_items table already exists",
    }
  } catch (err) {
    console.error("Error ensuring sell_items table:", err)
    return {
      success: false,
      error: err,
    }
  }
}
