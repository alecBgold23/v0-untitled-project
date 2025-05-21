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

    // First, check if the column exists
    const { data: columnCheck, error: checkError } = await supabase
      .from("information_schema.columns")
      .select("column_name, data_type")
      .eq("table_name", "sell_items")
      .eq("column_name", "image_paths")
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      return NextResponse.json({ error: "Error checking column existence", details: checkError }, { status: 500 })
    }

    // If column doesn't exist, create it
    if (!columnCheck) {
      console.log("image_paths column doesn't exist, creating it...")

      // Try to create the column
      const { error: createError } = await supabase.rpc("execute_sql", {
        query: "ALTER TABLE sell_items ADD COLUMN IF NOT EXISTS image_paths TEXT;",
      })

      if (createError) {
        console.error("Error creating image_paths column:", createError)

        // Try direct SQL as a fallback
        try {
          const { error: directSqlError } = await supabase.sql`
            ALTER TABLE sell_items ADD COLUMN IF NOT EXISTS image_paths TEXT;
          `

          if (directSqlError) {
            return NextResponse.json(
              {
                error: "Failed to create image_paths column",
                details: directSqlError,
              },
              { status: 500 },
            )
          }
        } catch (sqlError) {
          return NextResponse.json(
            {
              error: "Failed to create image_paths column with direct SQL",
              details: String(sqlError),
            },
            { status: 500 },
          )
        }
      }

      // Verify the column was created
      const { data: verifyData, error: verifyError } = await supabase
        .from("information_schema.columns")
        .select("column_name, data_type")
        .eq("table_name", "sell_items")
        .eq("column_name", "image_paths")
        .single()

      if (verifyError) {
        return NextResponse.json(
          {
            error: "Failed to verify image_paths column creation",
            details: verifyError,
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        message: "image_paths column created successfully",
        columnDetails: verifyData,
      })
    }

    // Column already exists
    return NextResponse.json({
      success: true,
      message: "image_paths column already exists",
      columnDetails: columnCheck,
    })
  } catch (error) {
    console.error("Error in fix-image-paths-column:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: String(error),
      },
      { status: 500 },
    )
  }
}
