import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // This requires the service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

    if (!supabaseServiceKey) {
      return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is required" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if the photo_count column exists in the items table
    const { data: columns, error: columnsError } = await supabase.from("items").select("*").limit(1)

    if (columnsError) {
      // If the table doesn't exist, create it
      if (columnsError.message.includes("does not exist")) {
        const { error: createError } = await supabase.rpc("create_items_table")

        if (createError) {
          return NextResponse.json({ error: `Failed to create items table: ${createError.message}` }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          message: "Created items table with photo_count column",
        })
      }

      return NextResponse.json({ error: `Error checking columns: ${columnsError.message}` }, { status: 500 })
    }

    // Check if photo_count column exists by running a raw query
    const { data: columnExists, error: columnCheckError } = await supabase.rpc("column_exists", {
      table_name: "items",
      column_name: "photo_count",
    })

    if (columnCheckError) {
      // Create the function if it doesn't exist
      await supabase.rpc("create_column_exists_function")

      // Try again
      const { data: retryColumnExists, error: retryError } = await supabase.rpc("column_exists", {
        table_name: "items",
        column_name: "photo_count",
      })

      if (retryError) {
        return NextResponse.json({ error: `Error checking if column exists: ${retryError.message}` }, { status: 500 })
      }

      if (!retryColumnExists) {
        // Add the column
        const { error: alterError } = await supabase.rpc("add_photo_count_column")

        if (alterError) {
          return NextResponse.json(
            { error: `Failed to add photo_count column: ${alterError.message}` },
            { status: 500 },
          )
        }

        return NextResponse.json({
          success: true,
          message: "Added photo_count column to items table",
        })
      }
    }

    if (!columnExists) {
      // Add the column
      const { error: alterError } = await supabase.rpc("add_photo_count_column")

      if (alterError) {
        return NextResponse.json({ error: `Failed to add photo_count column: ${alterError.message}` }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "Added photo_count column to items table",
      })
    }

    return NextResponse.json({
      success: true,
      message: "photo_count column already exists",
    })
  } catch (error) {
    console.error("Error ensuring photo_count column:", error)
    return NextResponse.json({ error: "Failed to ensure photo_count column exists" }, { status: 500 })
  }
}
