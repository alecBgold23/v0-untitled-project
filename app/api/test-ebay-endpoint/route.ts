import { NextResponse } from "next/server"
import { getEbayOAuthToken } from "@/lib/ebay-auth"

export async function GET() {
  try {
    // Get the configured endpoint
    const configuredEndpoint = process.env.EBAY_BROWSE_API_ENDPOINT || "https://api.ebay.com/buy/browse/v1"

    // Extract the base endpoint
    let baseEndpoint = configuredEndpoint
    if (configuredEndpoint.includes("/item_summary/search")) {
      baseEndpoint = configuredEndpoint.split("/item_summary/search")[0]
    }

    // Test the token
    let tokenInfo = { status: "Not tested" }
    try {
      const token = await getEbayOAuthToken()
      tokenInfo = {
        status: "Success",
        tokenStart: token.substring(0, 10) + "...",
        length: token.length,
      }
    } catch (error: any) {
      tokenInfo = {
        status: "Failed",
        error: error.message,
      }
    }

    // Test a simple search
    let searchInfo = { status: "Not tested" }
    try {
      const token = await getEbayOAuthToken()
      const searchUrl = `${baseEndpoint}/item_summary/search?q=test&limit=1`

      const response = await fetch(searchUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
        },
      })

      if (response.ok) {
        const data = await response.json()
        searchInfo = {
          status: "Success",
          totalResults: data.total || 0,
          hasResults: !!data.itemSummaries && data.itemSummaries.length > 0,
        }
      } else {
        const errorText = await response.text()
        searchInfo = {
          status: "Failed",
          statusCode: response.status,
          error: errorText,
        }
      }
    } catch (error: any) {
      searchInfo = {
        status: "Failed",
        error: error.message,
      }
    }

    return NextResponse.json({
      configuredEndpoint,
      baseEndpoint,
      tokenTest: tokenInfo,
      searchTest: searchInfo,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
