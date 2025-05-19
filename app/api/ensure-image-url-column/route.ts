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

    // Create the stored procedure if it doesn't exist
    const { error: procedureError } = await supabase.query(`
      CREATE OR REPLACE FUNCTION ensure_image_url_column()
      RETURNS void AS $$
      BEGIN
        IF NOT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'sell_items' AND column_name = 'image_url'
        ) THEN
          ALTER TABLE sell_items ADD COLUMN image_url TEXT;
        END IF;
      END;
      $$ LANGUAGE plpgsql;
    `)

    if (procedureError) {
      console.error("Error creating stored procedure:", procedureError)
      return NextResponse.json({ error: "Failed to create stored procedure" }, { status: 500 })
    }

    // Execute the stored procedure to ensure the column exists
    const { error: executeError } = await supabase.rpc("ensure_image_url_column")

    if (executeError) {
      console.error("Error executing stored procedure:", executeError)
      return NextResponse.json({ error: "Failed to execute stored procedure" }, { status: 500 })
    }

    // Check if the column exists
    const { data, error: checkError } = await supabase.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'sell_items' AND column_name = 'image_url'
    `)

    if (checkError) {
      console.error("Error checking column:", checkError)
      return NextResponse.json({ error: "Failed to check column" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Image URL column check completed",
      columnExists: data.length > 0,
      columnDetails: data,
    })
  } catch (error) {
    console.error("Error in ensure-image-url-column:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
