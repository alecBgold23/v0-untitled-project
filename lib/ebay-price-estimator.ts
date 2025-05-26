/**
 * eBay-first price estimation with proper fallback hierarchy
 * eBay Browse API → OpenAI → Local estimation
 */

import { isBlockedContent } from "@/lib/content-filter"

interface EbayPriceEstimate {
  price: string
  minPrice: number
  maxPrice: number
  confidence: "high" | "medium" | "low"
  source: "ebay" | "openai" | "local" | "content_filter"
  referenceCount?: number
  priceRange?: string
}

/**
 * Get price estimate using eBay Browse API first, with fallbacks
 */
export async function getEbayPriceEstimate(
  itemName: string,
  description: string,
  condition = "good",
  issues = "",
): Promise<EbayPriceEstimate> {
  // Check for blocked content first
  if (isBlockedContent(itemName) || isBlockedContent(description) || isBlockedContent(issues)) {
    return {
      price: "$0",
      minPrice: 0,
      maxPrice: 0,
      confidence: "high",
      source: "content_filter",
    }
  }

  // 1. Try eBay Browse API first
  try {
    console.log("Attempting eBay Browse API price estimation for:", itemName)

    const searchQuery = itemName || description
    if (!searchQuery.trim()) {
      throw new Error("No search query available")
    }

    // Build query parameters for improved API
    const queryParams = new URLSearchParams({
      title: searchQuery.trim(),
      condition: condition || "all",
    })

    // Add category if we can detect it
    const detectedCategory = detectCategoryFromDescription(description, itemName)
    if (detectedCategory) {
      queryParams.append("category", detectedCategory)
    }

    // Call our improved eBay price estimate endpoint
    const ebayResponse = await fetch(`/api/ebay-price-estimate?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (ebayResponse.ok) {
      const ebayData = await ebayResponse.json()
      console.log("eBay API response:", ebayData)

      // Use median price as primary (more robust than average)
      const primaryPrice = ebayData.medianPrice || ebayData.averagePrice

      if (primaryPrice && primaryPrice > 0) {
        const price = Math.round(primaryPrice)
        const minPrice = Math.round(price * 0.85) // 15% below median
        const maxPrice = Math.round(price * 1.15) // 15% above median

        return {
          price: `$${price}`,
          minPrice,
          maxPrice,
          confidence: ebayData.confidence === "high" ? "high" : "medium",
          source: "ebay",
          referenceCount: ebayData.sampleSize || 0,
          priceRange: ebayData.priceRange,
        }
      }
    } else {
      console.warn("eBay API request failed:", ebayResponse.status, await ebayResponse.text())
    }
  } catch (error) {
    console.warn("eBay Browse API failed, falling back to OpenAI:", error)
  }

  // 2. Fallback to OpenAI API
  try {
    console.log("Falling back to OpenAI price estimation")

    const openaiResponse = await fetch("/api/estimate-price", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        itemName: itemName || "",
        briefDescription: description || "",
        condition: condition || "good",
        issues: issues || "",
      }),
      cache: "no-store",
    })

    if (openaiResponse.ok) {
      const openaiData = await openaiResponse.json()
      console.log("OpenAI API response:", openaiData)

      if (openaiData.price || openaiData.priceRange) {
        // Parse price from OpenAI response
        let price = openaiData.price
        if (price && typeof price === "string") {
          price = price.replace(/[$,]/g, "")
          const numPrice = Number.parseFloat(price)
          if (!isNaN(numPrice) && numPrice > 0) {
            return {
              price: `$${Math.round(numPrice)}`,
              minPrice: openaiData.minPrice || Math.round(numPrice * 0.8),
              maxPrice: openaiData.maxPrice || Math.round(numPrice * 1.2),
              confidence: "medium",
              source: "openai",
              priceRange: openaiData.priceRange,
            }
          }
        }
      }
    } else {
      console.warn("OpenAI API request failed:", openaiResponse.status)
    }
  } catch (error) {
    console.warn("OpenAI API failed, falling back to local estimation:", error)
  }

  // 3. Final fallback to local estimation
  try {
    console.log("Using local price estimation as final fallback")

    const { detectCategory, adjustForCondition } = await import("@/lib/enhanced-pricing")

    const { category, basePrice, confidence } = detectCategory(description, itemName)
    const adjustedPrice = adjustForCondition(basePrice, condition, description, issues)

    // Add some natural variation (±10%)
    const variation = 0.9 + Math.random() * 0.2
    const finalPrice = Math.round(adjustedPrice * variation)
    const minPrice = Math.round(finalPrice * 0.85)
    const maxPrice = Math.round(finalPrice * 1.15)

    return {
      price: `$${finalPrice}`,
      minPrice,
      maxPrice,
      confidence: confidence > 0.8 ? "high" : confidence > 0.6 ? "medium" : "low",
      source: "local",
    }
  } catch (error) {
    console.error("All price estimation methods failed:", error)

    // Ultimate fallback
    return {
      price: "$25",
      minPrice: 20,
      maxPrice: 30,
      confidence: "low",
      source: "local",
    }
  }
}

/**
 * Get multiple price estimates for an array of items
 */
export async function getMultipleEbayPriceEstimates(
  items: Array<{
    name: string
    description: string
    condition: string
    issues: string
  }>,
): Promise<EbayPriceEstimate[]> {
  const estimates = []

  for (const item of items) {
    const estimate = await getEbayPriceEstimate(item.name, item.description, item.condition, item.issues)
    estimates.push(estimate)

    // Small delay to avoid overwhelming APIs
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  return estimates
}

// Helper function to detect category from description
function detectCategoryFromDescription(description: string, itemName: string): string | null {
  const text = `${description} ${itemName}`.toLowerCase()

  // Electronics keywords
  if (
    text.match(
      /\b(iphone|samsung|laptop|computer|tablet|tv|camera|headphones|speaker|gaming|xbox|playstation|nintendo)\b/,
    )
  ) {
    return "electronics"
  }

  // Automotive keywords
  if (text.match(/\b(car|truck|auto|vehicle|engine|tire|wheel|brake|transmission|honda|toyota|ford|bmw|mercedes)\b/)) {
    return "automotive"
  }

  // Jewelry keywords
  if (text.match(/\b(ring|necklace|bracelet|watch|diamond|gold|silver|jewelry|rolex|cartier)\b/)) {
    return "jewelry"
  }

  // Clothing keywords
  if (text.match(/\b(shirt|pants|dress|shoes|jacket|coat|jeans|nike|adidas|gucci|louis vuitton)\b/)) {
    return "clothing"
  }

  // Collectibles keywords
  if (text.match(/\b(vintage|antique|collectible|rare|signed|autograph|comic|card|coin|stamp)\b/)) {
    return "collectibles"
  }

  return null
}
