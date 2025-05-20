import OpenAI from "openai"
import { getPriceEstimates, calculateAveragePrice } from "./ebay-api"

const openai = new OpenAI({
  apiKey: process.env.PRICING_OPENAI_API_KEY,
})

export async function generatePriceEstimate(itemDetails: string, condition: string): Promise<string> {
  const prompt = `You are an expert pricing assistant. Given the following item details and condition, provide a price range in USD with the format "$xx-$yy" or a single price "$xx". 
  
Item Details: ${itemDetails}
Condition: ${condition}

Please respond only with the price range or single price.`

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 30,
  })

  return completion.choices[0].message.content.trim()
}

/**
 * Generates a price estimate with comparable items from eBay
 * @param description Item description
 * @param condition Item condition
 * @param category Optional category
 * @returns Price estimate with comparable items
 */
export async function generatePriceEstimateWithComparables(
  description: string,
  condition: string,
  category?: string,
): Promise<{
  estimatedPrice: string
  priceRange: string
  comparableItems?: Array<{
    title: string
    price: string
    condition: string
    url?: string
  }>
}> {
  try {
    // Get AI-generated price estimate
    const aiEstimate = await generatePriceEstimate(description, condition)

    // Get comparable items from eBay
    const comparableItems = await getPriceEstimates(description, category, condition)

    // Calculate average price from eBay data
    const averagePrice = calculateAveragePrice(comparableItems)

    let estimatedPrice = aiEstimate
    let priceRange = aiEstimate

    // If we have eBay data, combine it with AI estimate
    if (averagePrice) {
      // Extract min and max from AI estimate
      const aiMatch = aiEstimate.match(/\$(\d+(?:\.\d+)?)-\$(\d+(?:\.\d+)?)/)

      if (aiMatch) {
        const aiMin = Number.parseFloat(aiMatch[1])
        const aiMax = Number.parseFloat(aiMatch[2])
        const ebayPrice = Number.parseFloat(averagePrice.value)

        // Blend AI and eBay prices (60% AI, 40% eBay)
        const blendedMin = Math.round(aiMin * 0.6 + ebayPrice * 0.4)
        const blendedMax = Math.round(aiMax * 0.6 + ebayPrice * 0.4)

        estimatedPrice = `$${blendedMin}-$${blendedMax}`
        priceRange = `$${blendedMin}-$${blendedMax}`
      }
    }

    return {
      estimatedPrice,
      priceRange,
      comparableItems: comparableItems.slice(0, 5),
    }
  } catch (error) {
    console.error("Error generating price estimate with comparables:", error)

    // Fallback to AI estimate only
    const aiEstimate = await generatePriceEstimate(description, condition)

    return {
      estimatedPrice: aiEstimate,
      priceRange: aiEstimate,
      comparableItems: [],
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
  price: string
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
      price: `$${itemPrice}`,
      condition,
    })
  }

  return comparables
}
