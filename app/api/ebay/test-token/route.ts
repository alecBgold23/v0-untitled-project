import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  console.log("Starting eBay token test...")

  try {
    // Step 1: Check environment variables
    console.log("Checking environment variables...")
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.log("Missing Supabase config")
      return new Response("Missing Supabase environment variables", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      })
    }

    // Step 2: Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Step 3: Query database for eBay token
    const { data, error } = await supabase
      .from("ebay_tokens")
      .select("access_token")
      .eq("id", "singleton")
      .single()

    if (error || !data?.access_token) {
      console.log("Token error:", error?.message || "No token found")
      return new Response(
        JSON.stringify({
          error: "No valid access token found",
          details: error?.message || "Not set in database",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const accessToken = data.access_token
    console.log("Access token found, testing with eBay...")

    // Step 4: Test token with eBay API
    const ebayResponse = await fetch(
      "https://api.ebay.com/sell/account/v1/fulfillment_policy?marketplace_id=EBAY_US", // ✅ FIXED
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    )

    const ebayData = await ebayResponse.json()

    if (!ebayResponse.ok) {
      console.error("eBay API error:", ebayData)
      return new Response(
        JSON.stringify({
          error: "eBay API error",
          status: ebayResponse.status,
          ebayError: ebayData,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    console.log("Success!")
    return new Response(
      JSON.stringify({
        success: true,
        message: "eBay token is valid",
        ebayResponse: ebayData,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Caught error:", error)
    return new Response("Server error occurred", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    })
  }
}
