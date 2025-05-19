import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Get Supabase URL and service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json({ error: "Missing Supabase environment variables" }, { status: 500 })
    }

    // Create a new client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    })

    // Check table schema
    const { data: columns, error: columnsError } = await supabase.rpc("get_table_columns", {
      table_name: "sell_items",
    })

    if (columnsError) {
      // Fallback to a simpler query if the RPC doesn't exist
      const { data: tableInfo, error: tableError } = await supabase
        .from("information_schema.columns")
        .select("column_name, data_type, is_nullable")
        .eq("table_name", "sell_items")

      if (tableError) {
        return NextResponse.json({ error: "Failed to get table schema", details: tableError }, { status: 500 })
      }

      return NextResponse.json({
        message: "Table schema retrieved using information_schema",
        columns: tableInfo,
      })
    }

    // Get a sample row to see actual data
    const { data: sampleData, error: sampleError } = await supabase.from("sell_items").select("*").limit(1).single()

    return NextResponse.json({
      message: "Database schema information",
      columns,
      sampleData: sampleData || "No data found",
      sampleError: sampleError ? sampleError.message : null,
    })
  } catch (error) {
    console.error("Error in debug-database-schema:", error)
    return NextResponse.json({ error: "Failed to get database schema", details: String(error) }, { status: 500 })
  }
}
