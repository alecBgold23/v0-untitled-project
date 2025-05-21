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

    // First, check if the column exists and has a NOT NULL constraint
    const { data: columnCheck, error: checkError } = await supabase
      .from("information_schema.columns")
      .select("column_name, is_nullable")
      .eq("table_name", "sell_items")
      .eq("column_name", "phone")
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      return NextResponse.json({ error: "Error checking column existence", details: checkError }, { status: 500 })
    }

    // If column doesn't exist, create it without NOT NULL constraint
    if (!columnCheck) {
      console.log("phone column doesn't exist, creating it...")

      // Try to create the column
      const { error: createError } = await supabase.rpc("execute_sql", {
        query: "ALTER TABLE sell_items ADD COLUMN IF NOT EXISTS phone TEXT;",
      })

      if (createError) {
        console.error("Error creating phone column:", createError)
        return NextResponse.json(
          {
            error: "Failed to create phone column",
            details: createError,
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        message: "phone column created successfully without NOT NULL constraint",
      })
    }

    // If column exists but has NOT NULL constraint, remove it
    if (columnCheck && columnCheck.is_nullable === "NO") {
      console.log("phone column has NOT NULL constraint, removing it...")

      // Try to remove the NOT NULL constraint
      const { error: alterError } = await supabase.rpc("execute_sql", {
        query: "ALTER TABLE sell_items ALTER COLUMN phone DROP NOT NULL;",
      })

      if (alterError) {
        console.error("Error removing NOT NULL constraint:", alterError)
        return NextResponse.json(
          {
            error: "Failed to remove NOT NULL constraint",
            details: alterError,
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        message: "NOT NULL constraint removed from phone column",
      })
    }

    // Column already exists without NOT NULL constraint
    return NextResponse.json({
      success: true,
      message: "phone column already exists without NOT NULL constraint",
      columnDetails: columnCheck,
    })
  } catch (error) {
    console.error("Error in fix-phone-constraint:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: String(error),
      },
      { status: 500 },
    )
  }
}
