import { openaiRequest } from "@/lib/openai"
import type { EbayComparable } from "@/lib/ebay-api"

/**
 * Generate a price estimate using OpenAI with eBay comparables
 * @param description Item description
 * @param condition Item condition
 * @param comparables eBay comparable items
 * @returns Price estimate with confidence and reasoning
 */
export async function generatePriceEstimateWithComparables(
  description: string,
  condition: string,
  comparables: EbayComparable[],
): Promise<{ estimatedPrice: number; confidence: string; reasoning: string }> {
  try {
    console.log(`Generating price estimate with ${comparables.length} eBay comparables`)

    const prompt = `
      I need to estimate the resale value of the following item:
      
      Item Description: ${description}
      Condition: ${condition}
      
      Here are ${comparables.length} similar items from eBay:
      ${JSON.stringify(comparables, null, 2)}
      
      Based on these comparable items and the description, please provide:
      1. An estimated price in USD (just the number)
      2. Your confidence level (low, medium, high)
      3. Brief reasoning for your estimate
      
      Format your response as JSON with keys: estimatedPrice, confidence, reasoning
    `

    const response = await openaiRequest((openai) =>
      openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a pricing expert who specializes in estimating the value of items based on market comparables.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    )

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error("No response from OpenAI")
    }

    try {
      const result = JSON.parse(content)
      return {
        estimatedPrice: Number.parseFloat(result.estimatedPrice),
        confidence: result.confidence,
        reasoning: result.reasoning,
      }
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError)
      throw new Error("Invalid response format from price estimation service")
    }
  } catch (error) {
    console.error("Price estimation with comparables failed:", error)
    throw error
  }
}

/**
 * Fallback price estimation when eBay data is not available
 * @param description Item description
 * @param condition Item condition
 * @returns Price estimate
 */
export async function fallbackPriceEstimation(
  description: string,
  condition: string,
): Promise<{ estimatedPrice: number; confidence: string; reasoning: string }> {
  try {
    console.log("Using fallback price estimation without eBay data")

    const prompt = `
      I need to estimate the resale value of the following item without market comparables:
      
      Item Description: ${description}
      Condition: ${condition}
      
      Please provide:
      1. An estimated price in USD (just the number)
      2. Your confidence level (low, medium, high)
      3. Brief reasoning for your estimate
      
      Format your response as JSON with keys: estimatedPrice, confidence, reasoning
    `

    const response = await openaiRequest((openai) =>
      openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a pricing expert who specializes in estimating the value of secondhand items.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    )

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error("No response from OpenAI")
    }

    try {
      const result = JSON.parse(content)
      return {
        estimatedPrice: Number.parseFloat(result.estimatedPrice),
        confidence: result.confidence,
        reasoning: result.reasoning,
      }
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError)
      throw new Error("Invalid response format from price estimation service")
    }
  } catch (error) {
    console.error("Fallback price estimation failed:", error)
    throw error
  }
}
