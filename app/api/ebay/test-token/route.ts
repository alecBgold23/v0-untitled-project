import { getValidEbayAccessToken } from "@/lib/ebay/getValidEbayAccessToken"

export async function GET() {
  console.log("Starting eBay token test...")

  try {
    // Get valid token (automatically refreshes if needed)
    const token = await getValidEbayAccessToken()

    console.log("Valid token obtained, testing with eBay...")

    // Test with eBay API
    const ebayResponse = await fetch("https://api.ebay.com/sell/account/v1/fulfillment_policy", {
      headers: {
        Authorization: `Bearer ${token}`,
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
        message: "Token is valid and working",
        ebayResponse: ebayData,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Token test error:", error)

    return new Response(
      JSON.stringify({
        error: "Token test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
