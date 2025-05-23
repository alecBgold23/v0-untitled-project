import { OpenAI } from "openai"

// Initialize OpenAI client
const getOpenAIClient = () => {
  // First try to get the pricing-specific key, then fall back to the general key
  const apiKey = process.env.PRICING_OPENAI_API_KEY || process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error("OpenAI API key is not set")
  }

  // Log when the key is being used (without exposing the actual key)
  console.log(`OpenAI API key being used at: ${new Date().toISOString()}`)

  return new OpenAI({
    apiKey, // ✅ Using environment variable
  })
}

/**
 * Makes a request to the OpenAI API
 */
export async function openaiRequest<T>(callback: (openai: OpenAI) => Promise<T>): Promise<T> {
  try {
    const openai = getOpenAIClient()
    return await callback(openai)
  } catch (error) {
    console.error("OpenAI API request failed:", error)
    throw error
  }
}

/**
 * Generates a price estimate for an item based on its description and condition
 */
export async function generatePriceEstimate(
  itemName: string,
  description: string,
  condition: string,
): Promise<{ estimatedPrice: number; confidence: string; reasoning: string }> {
  try {
    const openai = getOpenAIClient()
    console.log(`Generating price estimate for item: ${itemName} at ${new Date().toISOString()}`)

    const prompt = `
      I need to estimate the resale value of the following item:
      
      Item Name: ${itemName}
      Description: ${description}
      Condition: ${condition}
      
      Please provide:
      1. An estimated price in USD (just the number)
      2. Your confidence level (low, medium, high)
      3. Brief reasoning for your estimate
      
      Format your response as JSON with keys: estimatedPrice, confidence, reasoning
    `

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a pricing expert who specializes in estimating the value of secondhand items.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    })

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
    console.error("Price estimation failed:", error)
    throw error
  }
}
