import { NextResponse } from "next/server"
import redis from "@/lib/redis"  // <-- added this import for redis

const EBAY_APP_ID = process.env.EBAY_APP_ID

if (!EBAY_APP_ID) {
  throw new Error("Missing EBAY_APP_ID in environment variables")
}

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

// Allow 100 requests per hour — adjust as needed
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

  // --- ADD cache GET ---
  const cacheKey = `price-estimate:${title.toLowerCase()}`
  const cached = await redis.get(cacheKey)
  if (cached) {
    console.log("Cache hit for", title)
    return NextResponse.json(JSON.parse(cached))
  }
  console.log("Cache miss for", title)
  // ---------------------

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
      const result = {
        averagePrice: null,
        priceRange: null,
        confidence: "low",
        items: [],
      }
      // --- ADD cache SET ---
      await redis.set(cacheKey, JSON.stringify(result), { ex: 3600 })
      // ---------------------
      return NextResponse.json(result)
    }

    // Extract prices from items
    const prices = items
      .map((item: any) => {
        const priceString = item.sellingStatus?.[0]?.currentPrice?.[0]?._ || "0"
        return Number.parseFloat(priceString)
      })
      .filter((p: number) => !isNaN(p))

    if (prices.length === 0) {
      const result = {
        averagePrice: null,
        priceRange: null,
        confidence: "low",
        items,
      }
      // --- ADD cache SET ---
      await redis.set(cacheKey, JSON.stringify(result), { ex: 3600 })
      // ---------------------
      return NextResponse.json(result)
    }

    // Calculate average price and range
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length

    const priceRange = `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`

    const result = {
      averagePrice: Number.parseFloat(avgPrice.toFixed(2)),
      priceRange,
      confidence: "high",
      items,
    }

    // --- ADD cache SET ---
    await redis.set(cacheKey, JSON.stringify(result), { ex: 3600 })
    // ---------------------

    return NextResponse.json(result)
  } catch (error) {
    console.error("eBay price estimate API error:", error)
    return NextResponse.json({ error: "Failed to fetch eBay price data" }, { status: 500 })
  }
}
