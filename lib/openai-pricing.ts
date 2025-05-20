/**
 * Generates a price estimate based on item details and condition
 */
export function generatePriceEstimate(itemDetails: string, condition: string): Promise<string> {
  // Generate a simple price range based on the description
  const basePrice = getBasePrice(itemDetails)
  const adjustedPrice = adjustPriceForCondition(basePrice, condition)

  const min = Math.floor(adjustedPrice * 0.8)
  const max = Math.floor(adjustedPrice * 1.2)

  const priceRange = `$${min}-$${max}`

  // Return a promise to match the expected interface
  return Promise.resolve(priceRange)
}

/**
 * Generates a price estimate with comparable items
 */
export async function generatePriceEstimateWithComparables(
  description: string,
  condition: string,
  category?: string,
): Promise<{
  estimatedPrice: string
  comparableItems: any[]
  aiEstimate: string
}> {
  try {
    // Get AI-generated price estimate
    const aiEstimate = await generatePriceEstimate(description, condition)

    // Generate mock comparable items
    const basePrice = getBasePrice(description, category)
    const adjustedPrice = adjustPriceForCondition(basePrice, condition)
    const comparableItems = generateMockComparables(description, adjustedPrice, condition)

    return {
      estimatedPrice: aiEstimate,
      comparableItems: comparableItems,
      aiEstimate: aiEstimate,
    }
  } catch (error) {
    console.error("Error generating price estimate with comparables:", error)

    // Fallback to AI estimate only
    const aiEstimate = await generatePriceEstimate(description, condition)

    return {
      estimatedPrice: aiEstimate,
      comparableItems: [],
      aiEstimate: aiEstimate,
    }
  }
}

/**
 * Get a base price based on the description and category
 */
function getBasePrice(description: string, category?: string): number {
  const text = description.toLowerCase()

  // Electronics
  if (text.includes("iphone") || text.includes("samsung") || text.includes("laptop") || text.includes("computer")) {
    return 500
  }

  // Furniture
  if (text.includes("sofa") || text.includes("chair") || text.includes("table") || text.includes("desk")) {
    return 200
  }

  // Clothing
  if (text.includes("shirt") || text.includes("pants") || text.includes("dress") || text.includes("jacket")) {
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

  if (conditionLower.includes("like new") || conditionLower.includes("excellent")) {
    return basePrice * 0.9
  }

  if (conditionLower.includes("good")) {
    return basePrice * 0.7
  }

  if (conditionLower.includes("fair")) {
    return basePrice * 0.5
  }

  if (conditionLower.includes("poor") || conditionLower.includes("parts")) {
    return basePrice * 0.3
  }

  // Default to used condition
  return basePrice * 0.6
}

/**
 * Generate mock comparable items
 */
function generateMockComparables(
  description: string,
  price: number,
  condition: string,
): Array<{
  title: string
  price: { value: string; currency: string }
  condition: string
  url?: string
}> {
  const comparables = []
  const descriptionWords = description.split(" ")

  // Generate 3 comparable items
  for (let i = 0; i < 3; i++) {
    // Vary the price slightly
    const itemPrice = Math.round(price * (0.9 + Math.random() * 0.3))

    // Create a slightly different title
    let title = description
    if (descriptionWords.length > 3) {
      // Remove or replace a random word
      const randomIndex = Math.floor(Math.random() * descriptionWords.length)
      const newWords = [...descriptionWords]
      if (Math.random() > 0.5) {
        newWords.splice(randomIndex, 1)
      } else {
        const replacements = ["Premium", "Deluxe", "Standard", "Basic", "Special"]
        newWords[randomIndex] = replacements[Math.floor(Math.random() * replacements.length)]
      }
      title = newWords.join(" ")
    }

    comparables.push({
      title,
      price: { value: `${itemPrice}`, currency: "USD" },
      condition,
      url: `https://example.com/item-${i}`,
    })
  }

  return comparables
}
