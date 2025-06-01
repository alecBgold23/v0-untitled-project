import { createClient } from "@supabase/supabase-js"

export async function GET() {
  console.log("Starting eBay token test...")

  try {
    // ✅ Step 1: Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      const missing = !supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL" : "SUPABASE_SERVICE_ROLE_KEY"
      console.error(`Missing environment variable: ${missing}`)
      return new Response(`Missing environment variable: ${missing}`, {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      })
    }

    // ✅ Step 2: Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    // ✅ Step 3: Query Supabase for access token
    const { data, error } = await supabase
      .from("ebay_tokens")
      .select("access_token")
      .eq("id", "singleton")
      .single()

    if (error) {
      console.error("Error querying Supabase:", error.message)
      return new Response(
        JSON.stringify({ error: "Supabase query failed", details: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    const accessToken = data?.access_token
    if (!accessToken) {
      console.error("No access token found in Supabase")
      return new Response(
        JSON.stringify({ error: "No access token found in Supabase" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // ✅ Step 4: Test token by hitting eBay API
    const ebayResponse = await fetch("https://api.ebay.com/sell/account/v1/fulfillment_policy", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    const ebayData = await ebayResponse.json()

    if (!ebayResponse.ok) {
      console.error("eBay API responded with an error:", ebayData)
      return new Response(
        JSON.stringify({
          error: "eBay API error",
          status: ebayResponse.status,
          ebayError: ebayData,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // ✅ Success
    return new Response(
      JSON.stringify({
        success: true,
        message: "eBay token is valid.",
        ebayResponse: ebayData,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (err: any) {
    console.error("Unexpected error:", err)
    return new Response("Internal server error", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    })
  }
}
