import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  console.log("Starting eBay token test...")

  try {
    // Simple test first - just return a basic response
    return NextResponse.json({
      message: "API endpoint is working",
      timestamp: new Date().toISOString(),
    })

    // Step 1: Check environment variables
    console.log("Checking environment variables...")
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
      console.log("Missing SUPABASE_URL")
      return new Response(JSON.stringify({ error: "Missing SUPABASE_URL" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!supabaseKey) {
      console.log("Missing SUPABASE_SERVICE_ROLE_KEY")
      return new Response(JSON.stringify({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    console.log("Environment variables OK")

    // Step 2: Create Supabase client
    console.log("Creating Supabase client...")
    const supabase = createClient(supabaseUrl, supabaseKey)
    console.log("Supabase client created")

    // Step 3: Query database
    console.log("Querying database...")
    const { data, error } = await supabase.from("ebay_tokens").select("access_token").eq("id", "singleton").single()

    if (error) {
      console.log("Database error:", error)
      return new Response(
        JSON.stringify({
          error: "Database error",
          details: error.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    if (!data?.access_token) {
      console.log("No access token found")
      return new Response(
        JSON.stringify({
          error: "No access token found",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    console.log("Access token found, testing with eBay...")

    // Step 4: Test with eBay
    const ebayResponse = await fetch("https://api.ebay.com/sell/account/v1/fulfillment_policy", {
      headers: {
        Authorization: `Bearer ${data.access_token}`,
        "Content-Type": "application/json",
      },
    })

    const ebayData = await ebayResponse.json()
    console.log("eBay response status:", ebayResponse.status)

    if (!ebayResponse.ok) {
      return new Response(
        JSON.stringify({
          error: "eBay API error",
          status: ebayResponse.status,
          ebayError: ebayData,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    console.log("Success!")
    return new Response(
      JSON.stringify({
        success: true,
        message: "Token is valid",
        ebayResponse: ebayData,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Caught error:", error)
    console.error("Error type:", typeof error)
    console.error("Error constructor:", error?.constructor?.name)

    return NextResponse.json(
      {
        error: "Failed to process request",
        message: error instanceof Error ? error.message : "Unknown error",
        type: typeof error,
      },
      { status: 500 },
    )
  }
}
