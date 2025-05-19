/**
 * Client-side price estimation utility
 * This provides a fallback when the API is unavailable
 */

export interface PriceEstimateResult {
  price: string
  minPrice?: number
  maxPrice?: number
  confidence?: "low" | "medium" | "high"
  source: "client"
}

export function estimateItemPrice(description = "", name = "", condition = "", issues = ""): PriceEstimateResult {
  // Combine all text for analysis
  const combinedText = `${name} ${description} ${condition} ${issues}`.toLowerCase()

  // Base price range based on condition
  const basePrice = 50 // Default base price
  let multiplier = 1.0

  // Adjust for condition
  if (condition) {
    if (condition.includes("new") || condition === "like-new") multiplier = 2.0
    else if (condition === "excellent") multiplier = 1.5
    else if (condition === "good") multiplier = 1.2
    else if (condition === "fair") multiplier = 0.8
    else if (condition === "poor") multiplier = 0.5
  }

  // Check for premium keywords
  const premiumKeywords = ["antique", "vintage", "rare", "collectible", "limited", "designer", "luxury"]
  const premiumCount = premiumKeywords.filter((word) => combinedText.includes(word)).length
  multiplier += premiumCount * 0.2

  // Check for brand names (simplified)
  const brands = ["apple", "samsung", "sony", "lg", "nike", "adidas", "gucci", "prada", "ikea"]
  const hasBrand = brands.some((brand) => combinedText.includes(brand))
  if (hasBrand) multiplier += 0.3

  // Check for issue keywords
  const issueKeywords = ["broken", "damaged", "scratched", "cracked", "worn", "tear", "stain"]
  const issueCount = issueKeywords.filter((word) => combinedText.includes(word)).length
  multiplier -= issueCount * 0.15

  // Adjust for description length (more detailed descriptions suggest better items)
  if (description && description.length > 100) multiplier += 0.1

  // Calculate final price
  let finalPrice = Math.round(basePrice * multiplier)

  // Ensure minimum price
  finalPrice = Math.max(finalPrice, 10)

  // Add some randomness for realistic variation (±10%)
  const randomFactor = 0.9 + Math.random() * 0.2
  finalPrice = Math.round(finalPrice * randomFactor)

  // Calculate price range
  const minPrice = Math.round(finalPrice * 0.8)
  const maxPrice = Math.round(finalPrice * 1.2)

  // Determine confidence level
  let confidence: "low" | "medium" | "high" = "medium"
  if (premiumCount > 0 && hasBrand && description.length > 100) {
    confidence = "high"
  } else if (issueCount > 2 || !condition || !description) {
    confidence = "low"
  }

  return {
    price: `$${finalPrice}`,
    minPrice,
    maxPrice,
    confidence,
    source: "client",
  }
}
