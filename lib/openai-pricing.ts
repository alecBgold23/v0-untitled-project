/**
 * Get a base price based on the description and category
 */
function getBasePrice(description: string, category?: string): number {
  const text = description.toLowerCase()

  // Electronics
  if (
    text.includes("iphone") ||
    text.includes("samsung") ||
    text.includes("laptop") ||
    text.includes("computer")
  ) {
    return 500
  }

  // Furniture
  if (
    text.includes("sofa") ||
    text.includes("chair") ||
    text.includes("table") ||
    text.includes("desk")
  ) {
    return 200
  }

  // Clothing
  if (
    text.includes("shirt") ||
    text.includes("pants") ||
    text.includes("dress") ||
    text.includes("jacket")
  ) {
    return 40
  }

  // Default
  return 50
}

/**
 * Adjust price based on condition
 */
function adjustPriceForCondition(basePrice: number, condition: string): number {
  const conditionLower = condition.toLowerCase()

  if (conditionLower.includes("new")) {
    return basePrice
  }

  if (
    conditionLower.includes("like new") ||
    conditionLower.includes("excellent")
  ) {
    return basePrice * 0.9
  }

  if (conditionLower.includes("good")) {
    return basePrice * 0.7
  }

  if (conditionLower.includes("fair")) {
    return basePrice * 0.5
  }

  if (
    conditionLower.includes("poor") ||
    conditionLower.includes("parts")
  ) {
    return basePrice * 0.3
  }

  // Default to used condition
  return basePrice * 0.6
}

/**
 * Generates a single price estimate
 */
export function generatePriceEstimate({
  description,
  condition,
  category,
}: {
  description: string
  condition: string
  category?: string
}): number {
  const basePrice = getBasePrice(description, category)
  const adjustedPrice = adjustPriceForCondition(basePrice, condition)
  return Math.floor(adjustedPrice)
}
