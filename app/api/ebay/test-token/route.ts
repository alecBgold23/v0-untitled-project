import { getValidEbayAccessToken } from "@/lib/ebay/getValidEbayAccessToken"

export async function GET() {
  console.log("Starting eBay token test with automatic refresh...")

  try {
    // Use the getValidEbayAccessToken function which handles token refresh automatically
    const accessToken = await getValidEbayAccessToken()

    if (!accessToken) {
      console.error("Failed to get a valid access token")
      return new Response(JSON.stringify({ error: "Failed to get a valid access token" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Test the token with an eBay API call
    const ebayResponse = await fetch("https://api.ebay.com/sell/account/v1/fulfillment_policy?marketplace_id=EBAY_US", {
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
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "eBay token is valid and automatically refreshed if needed.",
        ebayResponse: ebayData,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  } catch (err: any) {
    console.error("Unexpected error:", err)
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: err.message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
