import { generatePriceEstimate } from "./openai-pricing" // adjust if file name differs

export async function generateCombinedPriceEstimate(
  itemName: string,
  description: string,
  condition: string,
  issues?: string,
) {
  try {
    const ebayResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/ebay-price-estimate?title=${encodeURIComponent(itemName)}`,
    )
    const ebayData = await ebayResponse.json()

    if (ebayData && ebayData.averagePrice) {
      return {
        price: `$${ebayData.averagePrice.toFixed(2)}`,
        priceRange: ebayData.priceRange,
        source: "ebay",
        reasoning: "Based on current active listings on eBay",
      }
    } else {
      // Fallback to OpenAI
      const openAiResult = await generatePriceEstimate(
        `${itemName}. ${description}. Issues: ${issues || "none"}`,
        condition,
      )
      return {
        price: openAiResult.price,
        priceRange: null,
        source: "openai",
        reasoning: "eBay returned low confidence data, used AI instead",
      }
    }
  } catch (error) {
    console.error("Combined pricing error:", error)
    return {
      price: "Unknown",
      priceRange: null,
      source: "Error",
      reasoning: "Failed to fetch eBay or OpenAI data",
    }
  }
}
