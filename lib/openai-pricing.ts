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
  comparableItems: any[]
  aiEstimate: string
}> {
  try {
    // Get AI-generated price estimate
    const aiEstimate = await generatePriceEstimate(description, condition)

    // Get comparable items from eBay
    const comparableItems = await getPriceEstimates(description, category, condition)

    // Calculate average price from eBay data
    const averagePrice = calculateAveragePrice(comparableItems)

    let estimatedPrice = aiEstimate

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
      }
    }

    return {
      estimatedPrice,
      comparableItems: comparableItems.slice(0, 5),
      aiEstimate,
    }
  } catch (error) {
    console.error("Error generating price estimate with comparables:", error)

    // Fallback to AI estimate only
    const aiEstimate = await generatePriceEstimate(description, condition)

    return {
      estimatedPrice: aiEstimate,
      comparableItems: [],
      aiEstimate,
    }
  }
}
