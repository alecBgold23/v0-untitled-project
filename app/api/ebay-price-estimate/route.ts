import { NextResponse } from "next/server"
import { getEbayOAuthToken } from "@/lib/ebay-auth"

// Simple in-memory rate limiter
class RateLimiter {
  tokens: number
  lastRefill: number
  tokensPerInterval: number
  interval: number

  constructor(tokensPerInterval: number, interval: number) {
    this.tokensPerInterval = tokensPerInterval
    this.interval = interval
    this.tokens = tokensPerInterval
    this.lastRefill = Date.now()
  }

  removeTokens(count: number) {
    this.refillTokens()
    if (this.tokens >= count) {
      this.tokens -= count
      return true
    }
    return false
  }

  refillTokens() {
    const now = Date.now()
    const elapsed = now - this.lastRefill
    if (elapsed > this.interval) {
      this.tokens = this.tokensPerInterval
      this.lastRefill = now
    }
  }
}

// Allow 100 requests per hour
const limiter = new RateLimiter(100, 60 * 60 * 1000)

export async function GET(request: Request) {
  if (!limiter.removeTokens(1)) {
    return NextResponse.json({ error: "Rate limit exceeded, try again later" }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const title = searchParams.get("title")

  if (!title) {
    return NextResponse.json({ error: "Missing 'title' query parameter" }, { status: 400 })
  }

  try {
    // Get OAuth token
    const token = await getEbayOAuthToken()

    // Build Browse API URL with query parameters
    const params = new URLSearchParams({
      q: title,
      limit: "20",
      filter: "conditionIds:{3000|4000|5000}", // Used conditions
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
    const items = data.itemSummaries || []

    if (items.length === 0) {
      return NextResponse.json({
        averagePrice: null,
        priceRange: null,
        confidence: "low",
        items: [],
      })
    }

    const prices = items
      .map((item: any) => {
        const priceValue = item.price?.value
        return priceValue ? Number.parseFloat(priceValue) : null
      })
      .filter((p: number | null) => p !== null && !isNaN(p))

    if (prices.length === 0) {
      return NextResponse.json({
        averagePrice: null,
        priceRange: null,
        confidence: "low",
        items,
      })
    }

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
    return NextResponse.json(
      {
        error: "Failed to fetch eBay price data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
