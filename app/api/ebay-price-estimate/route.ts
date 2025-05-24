import { NextResponse } from "next/server"

const EBAY_APP_ID = process.env.EBAY_APP_ID

if (!EBAY_APP_ID) {
  throw new Error("Missing EBAY_APP_ID in environment variables")
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get("title")

  if (!title) {
    return NextResponse.json({ error: "Missing 'title' query parameter" }, { status: 400 })
  }

  try {
    // Build eBay Finding API URL
    const endpoint = "https://svcs.ebay.com/services/search/FindingService/v1"
    const params = new URLSearchParams({
      "OPERATION-NAME": "findItemsByKeywords",
      "SERVICE-VERSION": "1.0.0",
      "SECURITY-APPNAME": EBAY_APP_ID,
      "RESPONSE-DATA-FORMAT": "JSON",
      "REST-PAYLOAD": "true",
      keywords: title,
      "paginationInput.entriesPerPage": "20",
      "itemFilter(0).name": "Condition",
      "itemFilter(0).value": "Used", // you can adjust or remove this filter
    })

    const url = `${endpoint}?${params.toString()}`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`eBay API error: ${response.statusText}`)
    }

    const data = await response.json()

    const items = data.findItemsByKeywordsResponse?.[0]?.searchResult?.[0]?.item || []

    if (items.length === 0) {
      return NextResponse.json({
        averagePrice: null,
        priceRange: null,
        confidence: "low",
        items: [],
      })
    }

    // Extract prices from items
    const prices = items
      .map((item: any) => {
        const priceString = item.sellingStatus?.[0]?.currentPrice?.[0]?._ || "0"
        return Number.parseFloat(priceString)
      })
      .filter((p: number) => !isNaN(p))

    if (prices.length === 0) {
      return NextResponse.json({
        averagePrice: null,
        priceRange: null,
        confidence: "low",
        items,
      })
    }

    // Calculate average price and range
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length

    const priceRange = `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`

    return NextResponse.json({
      averagePrice: Number.parseFloat(avgPrice.toFixed(2)),
      priceRange,
      confidence: "high",
      items,
    })
  } catch (error) {
    console.error("eBay price estimate API error:", error)
    return NextResponse.json({ error: "Failed to fetch eBay price data" }, { status: 500 })
  }
}
