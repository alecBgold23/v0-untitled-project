// Ensure the OpenAI client is initialized with environment variables
import { OpenAI } from "openai"

/**
 * Content filter to check for inappropriate or blocked terms
 */
function isBlockedContent(text: string): boolean {
  const blockedTerms = ["whore", "nathan shub"]

  const normalizedText = text.toLowerCase().trim()

  return blockedTerms.some((term) => normalizedText.includes(term.toLowerCase()))
}

// Add or update the function that creates the OpenAI client
function createOpenAIClient() {
  // Try the pricing-specific key first, then fall back to the general key
  const apiKey = process.env.PRICING_OPENAI_API_KEY || process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error("OpenAI API key is not configured for pricing")
  }

  return new OpenAI({
    apiKey, // ✅ Using environment variable
  })
}

// Update any functions that use the OpenAI client to use this function
export async function generatePriceEstimate(
  itemDetails: string,
  condition: string,
  useTechDatabase = false,
): Promise<{ price: string; source: string; confidence: number }> {
  console.log("Generating price estimate for:", itemDetails, condition)

  // Check for blocked content first
  if (isBlockedContent(itemDetails)) {
    console.log("Blocked content detected, returning $0")
    return {
      price: "$0",
      source: "content_filter",
      confidence: 1.0,
    }
  }

  try {
    // Use tech database if enabled and applicable
    if (useTechDatabase) {
      const techPrice = await getTechItemPrice(itemDetails, condition)
      if (techPrice) {
        return techPrice
      }
    }

    // Otherwise use OpenAI
    const openai = createOpenAIClient() // ✅ Using the function that properly initializes with env vars

    // Rest of the function remains the same
  } catch (error) {
    console.error("Error generating price estimate:", error)
    return { price: "Unknown", source: "Error", confidence: 0 }
  }
}

async function getTechItemPrice(
  itemDetails: string,
  condition: string,
): Promise<{ price: string; source: string; confidence: number } | null> {
  return null
}

export async function generatePriceEstimateWithComparables(
  description: string,
  condition: string,
  category?: string,
): Promise<{
  estimatedPrice: string
  comparableItems: any[]
  source: string
}> {
  try {
    console.log("Generating price estimate with comparables for:", description, condition)

    // Check for blocked content first
    if (isBlockedContent(description)) {
      console.log("Blocked content detected, returning $0")
      return {
        estimatedPrice: "$0",
        comparableItems: [],
        source: "content_filter",
      }
    }

    // Rest of the existing function logic remains the same...
  } catch (error) {
    console.error("Error generating price estimate with comparables:", error)
    return { estimatedPrice: "Unknown", comparableItems: [], source: "Error" }
  }
}
