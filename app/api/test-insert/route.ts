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

    // Create test data with explicit values for item_issues and image_url
    const testData = {
      item_name: "Test Item " + new Date().toISOString(),
      item_description: "This is a test item created via the test-insert API",
      item_condition: "good",
      item_issues: "Test issues - this should not be null", // Explicit value for item_issues
      image_url: "https://example.com/test-image.jpg", // Explicit value for image_url
      full_name: "Test User",
      email: "test@example.com",
      phone: "123-456-7890",
      status: "pending",
      submission_date: new Date().toISOString(),
    }

    // Insert the test data
    const { data, error } = await supabase.from("sell_items").insert([testData]).select()

    if (error) {
      return NextResponse.json({ error: "Failed to insert test data", details: error }, { status: 500 })
    }

    // Fetch the inserted record to verify
    const { data: fetchedData, error: fetchError } = await supabase
      .from("sell_items")
      .select("*")
      .eq("item_name", testData.item_name)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: "Failed to fetch inserted data", details: fetchError }, { status: 500 })
    }

    return NextResponse.json({
      message: "Test data inserted successfully",
      insertedData: data,
      fetchedData,
      testData,
    })
  } catch (error) {
    console.error("Error in test-insert:", error)
    return NextResponse.json({ error: "Failed to insert test data", details: String(error) }, { status: 500 })
  }
}
