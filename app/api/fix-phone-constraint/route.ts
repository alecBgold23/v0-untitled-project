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

    // First, check if the table exists
    const { data: tableExists, error: tableError } = await supabase.rpc("execute_sql", {
      query: `
        SELECT EXISTS (
          SELECT FROM pg_tables
          WHERE schemaname = 'public'
          AND tablename = 'sell_items'
        );
      `,
    })

    if (tableError) {
      return NextResponse.json({ error: "Error checking table existence", details: tableError }, { status: 500 })
    }

    if (!tableExists || !tableExists.length || !tableExists[0].exists) {
      return NextResponse.json({ error: "Table sell_items does not exist" }, { status: 404 })
    }

    // Check if the phone column exists and its constraints
    const { data: columnInfo, error: columnError } = await supabase.rpc("execute_sql", {
      query: `
        SELECT column_name, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'sell_items'
        AND column_name = 'phone'
        AND table_schema = 'public';
      `,
    })

    if (columnError) {
      return NextResponse.json({ error: "Error checking column info", details: columnError }, { status: 500 })
    }

    // If column doesn't exist, create it without NOT NULL constraint
    if (!columnInfo || !columnInfo.length) {
      console.log("phone column doesn't exist, creating it...")

      // Try to create the column
      const { error: createError } = await supabase.rpc("execute_sql", {
        query: "ALTER TABLE sell_items ADD COLUMN phone TEXT;",
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
    if (columnInfo[0].is_nullable === "NO") {
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
      columnDetails: columnInfo[0],
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
