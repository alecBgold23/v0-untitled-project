import { NextResponse } from "next/server"
import { getEbayOAuthToken } from "@/lib/ebay-auth"

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    status: "UNKNOWN" as "WORKING" | "BROKEN" | "LIMITED" | "UNKNOWN",
    issues: [] as string[],
    details: {} as any,
  }

  try {
    // 1. Check environment variables
    const requiredEnvVars = ["EBAY_CLIENT_ID", "EBAY_CLIENT_SECRET"]
    const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

    if (missingEnvVars.length > 0) {
      diagnostics.issues.push(`Missing environment variables: ${missingEnvVars.join(", ")}`)
      diagnostics.status = "BROKEN"
      return NextResponse.json(diagnostics)
    }

    // 2. Test OAuth token generation
    let token: string
    try {
      token = await getEbayOAuthToken()
      diagnostics.details.tokenGeneration = "SUCCESS"
      diagnostics.details.tokenLength = token.length
    } catch (error) {
      diagnostics.issues.push(
        `OAuth token generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
      diagnostics.status = "BROKEN"
      diagnostics.details.tokenGeneration = "FAILED"
      return NextResponse.json(diagnostics)
    }

    // 3. Test actual API call
    const testUrl = "https://api.ebay.com/buy/browse/v1/item_summary/search"
    const params = new URLSearchParams({
      q: "iPhone 13",
      limit: "5",
    })

    const response = await fetch(`${testUrl}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
      },
    })

    diagnostics.details.apiCall = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    }

    if (response.ok) {
      const data = await response.json()
      diagnostics.details.apiResponse = {
        itemCount: data.itemSummaries?.length || 0,
        total: data.total || 0,
        hasItems: !!(data.itemSummaries && data.itemSummaries.length > 0),
      }

      if (data.itemSummaries && data.itemSummaries.length > 0) {
        // API is working but has limitations
        diagnostics.status = "LIMITED"
        diagnostics.issues.push("API works but only returns ACTIVE listings, not sold items")
        diagnostics.issues.push("Price estimates will be based on asking prices, not sale prices")
        diagnostics.issues.push("This makes price estimates unreliable for actual market value")

        // Sample the first item to show what we're getting
        const sampleItem = data.itemSummaries[0]
        diagnostics.details.sampleItem = {
          title: sampleItem.title,
          price: sampleItem.price,
          condition: sampleItem.condition,
          buyingOptions: sampleItem.buyingOptions,
          itemWebUrl: sampleItem.itemWebUrl,
        }
      } else {
        diagnostics.status = "LIMITED"
        diagnostics.issues.push("API responds but returns no items")
      }
    } else {
      const errorText = await response.text()
      diagnostics.issues.push(`API call failed: ${response.status} - ${errorText}`)
      diagnostics.status = "BROKEN"
      diagnostics.details.errorResponse = errorText
    }
  } catch (error) {
    diagnostics.issues.push(`Diagnostic failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    diagnostics.status = "BROKEN"
  }

  return NextResponse.json(diagnostics)
}
