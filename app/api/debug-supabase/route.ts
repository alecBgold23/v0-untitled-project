import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        message: "Missing Supabase credentials",
        env: {
          hasSupabaseUrl: !!process.env.SUPABASE_URL,
          hasNextPublicSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        },
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Test the connection by fetching a count from the sell_items table
    const { count, error } = await supabase.from("sell_items").select("*", { count: "exact", head: true })

    if (error) {
      return NextResponse.json({
        success: false,
        message: "Failed to connect to Supabase",
        error: error.message,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Successfully connected to Supabase",
      count,
    })
  } catch (error) {
    console.error("Error testing Supabase connection:", error)
    return NextResponse.json({
      success: false,
      message: "An unexpected error occurred",
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
