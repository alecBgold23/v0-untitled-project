import { NextResponse } from "next/server"
import { getEbayOAuthToken } from "@/lib/ebay-auth"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")
  const limit = searchParams.get("limit") || "10"

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 })
  }

  try {
    const token = await getEbayOAuthToken()

    const params = new URLSearchParams({
      q: query,
      limit: limit,
    })

    const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?${params.toString()}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("eBay Browse API error:", errorText)
      throw new Error(`eBay API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    return NextResponse.json({
      items: data.itemSummaries || [],
      total: data.total || 0,
    })
  } catch (error) {
    console.error("eBay search API error:", error)
    return NextResponse.json(
      {
        error: "Failed to search eBay",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
