import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const { itemId, price } = await request.json()

    if (!itemId || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create Supabase client
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase configuration missing" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Update the item with the estimated price
    // Note: Adjust the table name and column names to match your Supabase schema
    const { error } = await supabase
      .from("items") // Replace with your actual table name
      .update({ estimated_price: price })
      .eq("id", itemId)

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to save price to database" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving price:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
