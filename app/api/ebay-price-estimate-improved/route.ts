import { NextResponse } from "next/server"
import { getEbayOAuthToken } from "@/lib/ebay-auth"

// Rate limiter (same as before)
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

const limiter = new RateLimiter(100, 60 * 60 * 1000)

interface EbayItem {
  title: string
  price: {
    value: string
    currency: string
  }
  condition: string
  itemId: string
  seller: {
    feedbackPercentage: number
    feedbackScore: number
  }
  shippingOptions?: Array<{
    shippingCost: {
      value: string
      currency: string
    }
  }>
}

interface PriceAnalysis {
  averagePrice: number
  medianPrice: number
  minPrice: number
  maxPrice: number
  priceRange: string
  confidence: "high" | "medium" | "low"
  sampleSize: number
  items: EbayItem[]
  analysis: {
    outliers: number
    priceDistribution: {
      under50: number
      between50and100: number
      between100and200: number
      over200: number
    }
    conditionBreakdown: Record<string, number>
  }
}

function calculateStatistics(prices: number[]): {
  mean: number
  median: number
  min: number
  max: number
  outliers: number[]
} {
  if (prices.length === 0) return { mean: 0, median: 0, min: 0, max: 0, outliers: [] }

  const sorted = [...prices].sort((a, b) => a - b)
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length
  const median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)]

  // Detect outliers using IQR method
  const q1 = sorted[Math.floor(sorted.length * 0.25)]
  const q3 = sorted[Math.floor(sorted.length * 0.75)]
  const iqr = q3 - q1
  const lowerBound = q1 - 1.5 * iqr
  const upperBound = q3 + 1.5 * iqr

  const outliers = prices.filter((p) => p < lowerBound || p > upperBound)

  return {
    mean,
    median,
    min: Math.min(...prices),
    max: Math.max(...prices),
    outliers,
  }
}

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
          score += 2 // Exact word match
          exactMatches++
        } else {
          score += 1 // Partial match
        }
      }
    }
  }

  // Bonus for having most search terms
  const matchRatio = exactMatches / searchWords.filter((w) => w.length >= 3).length
  score += matchRatio * 5

  return score
}

function filterRelevantItems(items: EbayItem[], searchTerm: string, minRelevanceScore = 3): EbayItem[] {
  return items
    .map((item) => ({
      ...item,
      relevanceScore: calculateRelevanceScore(searchTerm, item.title),
    }))
    .filter((item) => item.relevanceScore >= minRelevanceScore)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
}

export async function GET(request: Request) {
  if (!limiter.removeTokens(1)) {
    return NextResponse.json({ error: "Rate limit exceeded, try again later" }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const title = searchParams.get("title")
  const includeShipping = searchParams.get("includeShipping") === "true"

  if (!title) {
    return NextResponse.json({ error: "Missing 'title' query parameter" }, { status: 400 })
  }

  try {
    const token = await getEbayOAuthToken()

    // Strategy 1: Broad search with multiple approaches
    const searchStrategies = [
      {
        name: "exact_phrase",
        params: {
          q: `"${title}"`, // Exact phrase search
          limit: "50",
          sort: "price", // Sort by price to get variety
        },
      },
      {
        name: "keyword_search",
        params: {
          q: title,
          limit: "50",
          sort: "newlyListed", // Get recent listings
        },
      },
      {
        name: "broad_search",
        params: {
          q: title.split(" ").slice(0, 3).join(" "), // First 3 words only
          limit: "30",
          sort: "bestMatch",
        },
      },
    ]

    const allItems: EbayItem[] = []

    // Execute multiple search strategies
    for (const strategy of searchStrategies) {
      try {
        const params = new URLSearchParams(strategy.params)
        const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?${params.toString()}`

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
          },
        })

        if (response.ok) {
          const data = await response.json()
          const items = data.itemSummaries || []
          allItems.push(...items)
        }

        // Small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        console.warn(`Search strategy ${strategy.name} failed:`, error)
      }
    }

    // Remove duplicates based on itemId
    const uniqueItems = allItems.filter(
      (item, index, self) => index === self.findIndex((i) => i.itemId === item.itemId),
    )

    if (uniqueItems.length === 0) {
      return NextResponse.json({
        averagePrice: null,
        medianPrice: null,
        priceRange: null,
        confidence: "low",
        sampleSize: 0,
        items: [],
        message: "No items found",
      })
    }

    // Filter for relevance
    const relevantItems = filterRelevantItems(uniqueItems, title)

    if (relevantItems.length === 0) {
      return NextResponse.json({
        averagePrice: null,
        medianPrice: null,
        priceRange: null,
        confidence: "low",
        sampleSize: uniqueItems.length,
        items: uniqueItems.slice(0, 10),
        message: "No relevant items found",
      })
    }

    // Extract and validate prices
    const pricesData = relevantItems
      .map((item) => {
        const basePrice = item.price?.value ? Number.parseFloat(item.price.value) : null
        let shippingCost = 0

        if (includeShipping && item.shippingOptions?.[0]?.shippingCost?.value) {
          shippingCost = Number.parseFloat(item.shippingOptions[0].shippingCost.value)
        }

        const totalPrice = basePrice ? basePrice + shippingCost : null

        return {
          item,
          basePrice,
          shippingCost,
          totalPrice,
        }
      })
      .filter((data) => data.totalPrice !== null && !isNaN(data.totalPrice) && data.totalPrice > 0)

    if (pricesData.length === 0) {
      return NextResponse.json({
        averagePrice: null,
        medianPrice: null,
        priceRange: null,
        confidence: "low",
        sampleSize: relevantItems.length,
        items: relevantItems.slice(0, 10),
        message: "No valid prices found",
      })
    }

    const prices = pricesData.map((d) => d.totalPrice!)
    const stats = calculateStatistics(prices)

    // Remove outliers for better accuracy
    const filteredPrices = prices.filter((p) => !stats.outliers.includes(p))
    const finalStats = filteredPrices.length > 0 ? calculateStatistics(filteredPrices) : stats

    // Determine confidence based on sample size and price consistency
    let confidence: "high" | "medium" | "low" = "low"
    if (filteredPrices.length >= 10) {
      const priceVariation = (finalStats.max - finalStats.min) / finalStats.median
      if (priceVariation < 1.0) confidence = "high"
      else if (priceVariation < 2.0) confidence = "medium"
    } else if (filteredPrices.length >= 5) {
      confidence = "medium"
    }

    // Price distribution analysis
    const priceDistribution = {
      under50: filteredPrices.filter((p) => p < 50).length,
      between50and100: filteredPrices.filter((p) => p >= 50 && p < 100).length,
      between100and200: filteredPrices.filter((p) => p >= 100 && p < 200).length,
      over200: filteredPrices.filter((p) => p >= 200).length,
    }

    // Condition breakdown
    const conditionBreakdown: Record<string, number> = {}
    relevantItems.forEach((item) => {
      const condition = item.condition || "Unknown"
      conditionBreakdown[condition] = (conditionBreakdown[condition] || 0) + 1
    })

    const result: PriceAnalysis = {
      averagePrice: Number.parseFloat(finalStats.mean.toFixed(2)),
      medianPrice: Number.parseFloat(finalStats.median.toFixed(2)),
      minPrice: finalStats.min,
      maxPrice: finalStats.max,
      priceRange: `$${finalStats.min.toFixed(2)} - $${finalStats.max.toFixed(2)}`,
      confidence,
      sampleSize: filteredPrices.length,
      items: relevantItems.slice(0, 15), // Return top 15 most relevant items
      analysis: {
        outliers: stats.outliers.length,
        priceDistribution,
        conditionBreakdown,
      },
    }

    return NextResponse.json(result)
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
