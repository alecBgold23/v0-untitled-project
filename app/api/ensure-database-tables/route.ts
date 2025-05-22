import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Missing Supabase environment variables" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // First, check if the table exists by attempting a query
    const { error: checkError } = await supabase.from("sell_items").select("id").limit(1)

    if (checkError) {
      console.log("Error checking table or table doesn't exist:", checkError.message)

      // Try to create a sell_items table with the minimal structure
      // We'll use insert with a temporary record to attempt creation
      try {
        // Create a temporary table to copy structure from
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

        // Now try to insert into the sell_items table
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
          return NextResponse.json(
            {
              error: "Failed to create sell_items table",
              details: createError,
            },
            { status: 500 },
          )
        }

        return NextResponse.json({
          success: true,
          message: "sell_items table created or already exists",
        })
      } catch (error) {
        console.error("Error in table creation process:", error)
        return NextResponse.json(
          {
            error: "Failed to create database table",
            details: String(error),
          },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: "sell_items table already exists",
    })
  } catch (error) {
    console.error("Error in ensure-database-tables:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: String(error),
      },
      { status: 500 },
    )
  }
}
