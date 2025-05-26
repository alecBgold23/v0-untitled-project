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

// Helper function to calculate median (more robust than mean for pricing)
function calculateMedian(numbers: number[]): number {
  const sorted = [...numbers].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

// Helper function to remove outliers using IQR method
function removeOutliers(prices: number[]): number[] {
  if (prices.length < 4) return prices

  const sorted = [...prices].sort((a, b) => a - b)
  const q1Index = Math.floor(sorted.length * 0.25)
  const q3Index = Math.floor(sorted.length * 0.75)
  const q1 = sorted[q1Index]
  const q3 = sorted[q3Index]
  const iqr = q3 - q1
  const lowerBound = q1 - 1.5 * iqr
  const upperBound = q3 + 1.5 * iqr

  return prices.filter((price) => price >= lowerBound && price <= upperBound)
}

// Helper function to calculate relevance score
function calculateRelevanceScore(searchTerm: string, itemTitle: string): number {
  const searchWords = searchTerm.toLowerCase().split(/\s+/)
  const titleWords = itemTitle.toLowerCase().split(/\s+/)

  let score = 0
  let exactMatches = 0

  for (const searchWord of searchWords) {
    if (searchWord.length < 3) continue // Skip very short words

    for (const titleWord of titleWords) {
      if (titleWord.includes(searchWord)) {
        if (titleWord === searchWord) {
          exactMatches++
          score += 2 // Exact match gets higher score
        } else {
          score += 1 // Partial match
        }
      }
    }
  }

  // Bonus for having most search terms
  const matchRatio = exactMatches / searchWords.length
  score += matchRatio * 3

  return score
}

export async function GET(request: Request) {
  if (!limiter.removeTokens(1)) {
    return NextResponse.json({ error: "Rate limit exceeded, try again later" }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const title = searchParams.get("title")
  const condition = searchParams.get("condition") || "all"
  const category = searchParams.get("category")

  if (!title) {
    return NextResponse.json({ error: "Missing 'title' query parameter" }, { status: 400 })
  }

  try {
    // Get OAuth token
    const token = await getEbayOAuthToken()

    // Build comprehensive condition filter (all conditions, not just used)
    let conditionFilter = ""
    if (condition !== "all") {
      const conditionMap: { [key: string]: string } = {
        new: "1000",
        like_new: "1500|1750",
        excellent: "2000|2500",
        good: "3000",
        fair: "4000",
        poor: "5000",
        parts: "7000",
      }

      if (conditionMap[condition.toLowerCase()]) {
        conditionFilter = `conditionIds:{${conditionMap[condition.toLowerCase()]}}`
      }
    }

    // Build filter - removed restrictive condition filter, increased sample size
    let filter = "buyingOptions:{AUCTION|FIXED_PRICE}"
    if (conditionFilter) {
      filter += `,${conditionFilter}`
    }

    // Add category filter if provided
    if (category && category !== "auto-detect") {
      // Map common categories to eBay category IDs
      const categoryMap: { [key: string]: string } = {
        electronics: "293",
        clothing: "11450",
        automotive: "6000",
        jewelry: "281",
        collectibles: "1",
        home: "11700",
        sports: "888",
      }

      if (categoryMap[category.toLowerCase()]) {
        filter += `,categoryIds:{${categoryMap[category.toLowerCase()]}}`
      }
    }

    // Build search parameters with larger sample size
    const params = new URLSearchParams({
      q: title,
      limit: "100", // Increased from 20 to 100 for better sample size
      filter,
      sort: "price", // Sort by price for better distribution
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
        medianPrice: null,
        priceRange: null,
        confidence: "low",
        items: [],
        sampleSize: 0,
        message: "No items found matching your criteria",
      })
    }

    // Extract and validate prices with currency checking
    const priceData = items
      .map((item: any) => {
        const priceValue = item.price?.value
        const currency = item.price?.currency

        // Only include USD prices to avoid currency mixing
        if (currency !== "USD") return null

        const numericPrice = priceValue ? Number.parseFloat(priceValue) : null
        if (!numericPrice || isNaN(numericPrice) || numericPrice <= 0) return null

        // Calculate relevance score
        const relevanceScore = calculateRelevanceScore(title, item.title || "")

        return {
          price: numericPrice,
          title: item.title,
          relevance: relevanceScore,
          condition: item.condition,
          itemId: item.itemId,
        }
      })
      .filter((item) => item !== null)

    if (priceData.length === 0) {
      return NextResponse.json({
        averagePrice: null,
        medianPrice: null,
        priceRange: null,
        confidence: "low",
        items,
        sampleSize: 0,
        message: "No valid USD prices found",
      })
    }

    // Sort by relevance and take top 50% most relevant items
    priceData.sort((a, b) => b.relevance - a.relevance)
    const relevantItems = priceData.slice(0, Math.max(10, Math.floor(priceData.length * 0.5)))

    // Extract prices from relevant items
    let prices = relevantItems.map((item) => item.price)

    // Remove outliers for more accurate pricing
    const cleanedPrices = removeOutliers(prices)

    // Use cleaned prices if we still have enough data points
    if (cleanedPrices.length >= Math.min(5, prices.length * 0.7)) {
      prices = cleanedPrices
    }

    if (prices.length === 0) {
      return NextResponse.json({
        averagePrice: null,
        medianPrice: null,
        priceRange: null,
        confidence: "low",
        items,
        sampleSize: 0,
        message: "No valid prices after filtering",
      })
    }

    // Calculate statistics
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
    const medianPrice = calculateMedian(prices)

    // Use median as primary price (more robust than mean)
    const primaryPrice = medianPrice

    // Calculate confidence based on sample size and price variance
    let confidence: "high" | "medium" | "low" = "low"
    const sampleSize = prices.length
    const priceVariance = prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length
    const coefficientOfVariation = Math.sqrt(priceVariance) / avgPrice

    if (sampleSize >= 20 && coefficientOfVariation < 0.5) {
      confidence = "high"
    } else if (sampleSize >= 10 && coefficientOfVariation < 0.8) {
      confidence = "medium"
    }

    const priceRange = `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`

    return NextResponse.json({
      averagePrice: Number.parseFloat(avgPrice.toFixed(2)),
      medianPrice: Number.parseFloat(medianPrice.toFixed(2)),
      primaryPrice: Number.parseFloat(primaryPrice.toFixed(2)),
      priceRange,
      confidence,
      sampleSize,
      originalSampleSize: items.length,
      items: relevantItems.slice(0, 10), // Return top 10 most relevant items
      statistics: {
        min: minPrice,
        max: maxPrice,
        mean: avgPrice,
        median: medianPrice,
        variance: priceVariance,
        coefficientOfVariation,
      },
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
