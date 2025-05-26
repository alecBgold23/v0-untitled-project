/**
 * Improved eBay price estimation with better accuracy
 */

import { isBlockedContent } from "@/lib/content-filter"

interface ImprovedEbayPriceEstimate {
  price: string
  medianPrice: string
  minPrice: number
  maxPrice: number
  confidence: "high" | "medium" | "low"
  source: "ebay_improved" | "ebay_basic" | "openai" | "local" | "content_filter"
  referenceCount: number
  priceRange: string
  analysis?: {
    outliers: number
    priceDistribution: Record<string, number>
    conditionBreakdown: Record<string, number>
  }
}

/**
 * Get improved price estimate using enhanced eBay Browse API implementation
 */
export async function getImprovedEbayPriceEstimate(
  itemName: string,
  description: string,
  condition = "good",
  issues = "",
  includeShipping = false,
): Promise<ImprovedEbayPriceEstimate> {
  // Check for blocked content first
  if (isBlockedContent(itemName) || isBlockedContent(description) || isBlockedContent(issues)) {
    return {
      price: "$0",
      medianPrice: "$0",
      minPrice: 0,
      maxPrice: 0,
      confidence: "high",
      source: "content_filter",
      referenceCount: 0,
      priceRange: "$0 - $0",
    }
  }

  // 1. Try improved eBay Browse API first
  try {
    console.log("Attempting improved eBay Browse API price estimation for:", itemName)

    const searchQuery = itemName || description
    if (!searchQuery.trim()) {
      throw new Error("No search query available")
    }

    // Call our improved eBay price estimate endpoint
    const params = new URLSearchParams({
      title: searchQuery.trim(),
      includeShipping: includeShipping.toString(),
    })

    const ebayResponse = await fetch(`/api/ebay-price-estimate-improved?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (ebayResponse.ok) {
      const ebayData = await ebayResponse.json()
      console.log("Improved eBay API response:", ebayData)

      if (ebayData.averagePrice && ebayData.averagePrice > 0) {
        return {
          price: `$${Math.round(ebayData.averagePrice)}`,
          medianPrice: `$${Math.round(ebayData.medianPrice || ebayData.averagePrice)}`,
          minPrice: Math.round(ebayData.minPrice || 0),
          maxPrice: Math.round(ebayData.maxPrice || 0),
          confidence: ebayData.confidence || "medium",
          source: "ebay_improved",
          referenceCount: ebayData.sampleSize || 0,
          priceRange: ebayData.priceRange || `$${ebayData.minPrice} - $${ebayData.maxPrice}`,
          analysis: ebayData.analysis,
        }
      }
    } else {
      console.warn("Improved eBay API request failed:", ebayResponse.status, await ebayResponse.text())
    }
  } catch (error) {
    console.warn("Improved eBay Browse API failed, falling back to basic eBay:", error)
  }

  // 2. Fallback to basic eBay API
  try {
    console.log("Falling back to basic eBay price estimation")

    const searchQuery = itemName || description
    const ebayResponse = await fetch(`/api/ebay-price-estimate?title=${encodeURIComponent(searchQuery.trim())}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (ebayResponse.ok) {
      const ebayData = await ebayResponse.json()
      console.log("Basic eBay API response:", ebayData)

      if (ebayData.averagePrice && ebayData.averagePrice > 0) {
        const avgPrice = Math.round(ebayData.averagePrice)
        const minPrice = Math.round(avgPrice * 0.8)
        const maxPrice = Math.round(avgPrice * 1.2)

        return {
          price: `$${avgPrice}`,
          medianPrice: `$${avgPrice}`, // Same as average for basic version
          minPrice,
          maxPrice,
          confidence: ebayData.confidence === "high" ? "medium" : "low", // Downgrade confidence
          source: "ebay_basic",
          referenceCount: ebayData.items?.length || 0,
          priceRange: ebayData.priceRange || `$${minPrice} - $${maxPrice}`,
        }
      }
    }
  } catch (error) {
    console.warn("Basic eBay API failed, falling back to OpenAI:", error)
  }

  // 3. Fallback to OpenAI API
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
        let price = openaiData.price
        if (price && typeof price === "string") {
          price = price.replace(/[$,]/g, "")
          const numPrice = Number.parseFloat(price)
          if (!isNaN(numPrice) && numPrice > 0) {
            const roundedPrice = Math.round(numPrice)
            return {
              price: `$${roundedPrice}`,
              medianPrice: `$${roundedPrice}`,
              minPrice: openaiData.minPrice || Math.round(numPrice * 0.8),
              maxPrice: openaiData.maxPrice || Math.round(numPrice * 1.2),
              confidence: "medium",
              source: "openai",
              referenceCount: 0,
              priceRange: openaiData.priceRange || `$${Math.round(numPrice * 0.8)} - $${Math.round(numPrice * 1.2)}`,
            }
          }
        }
      }
    }
  } catch (error) {
    console.warn("OpenAI API failed, falling back to local estimation:", error)
  }

  // 4. Final fallback to local estimation
  try {
    console.log("Using local price estimation as final fallback")

    const { detectCategory, adjustForCondition } = await import("@/lib/enhanced-pricing")

    const { category, basePrice, confidence } = detectCategory(description, itemName)
    const adjustedPrice = adjustForCondition(basePrice, condition, description, issues)

    const variation = 0.9 + Math.random() * 0.2
    const finalPrice = Math.round(adjustedPrice * variation)
    const minPrice = Math.round(finalPrice * 0.85)
    const maxPrice = Math.round(finalPrice * 1.15)

    return {
      price: `$${finalPrice}`,
      medianPrice: `$${finalPrice}`,
      minPrice,
      maxPrice,
      confidence: confidence > 0.8 ? "high" : confidence > 0.6 ? "medium" : "low",
      source: "local",
      referenceCount: 0,
      priceRange: `$${minPrice} - $${maxPrice}`,
    }
  } catch (error) {
    console.error("All price estimation methods failed:", error)

    return {
      price: "$25",
      medianPrice: "$25",
      minPrice: 20,
      maxPrice: 30,
      confidence: "low",
      source: "local",
      referenceCount: 0,
      priceRange: "$20 - $30",
    }
  }
}
