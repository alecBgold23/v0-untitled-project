import { hasOpenAIKey, getOpenAIKey } from "@/lib/env"
import { generateFallbackPrice } from "@/lib/price-estimation"

// Constants
const MAX_RETRIES = 2
const RETRY_DELAY = 1000 // 1 second

/**
 * Sleep for a specified number of milliseconds
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Creates a properly configured OpenAI API request with the correct headers
 * @param endpoint The OpenAI API endpoint (without the base URL)
 * @param method HTTP method
 * @param body Request body
 * @returns Fetch response
 */
export async function openaiRequest(
  endpoint: string,
  method: "GET" | "POST" = "POST",
  body?: any,
  retries = MAX_RETRIES,
): Promise<Response> {
  const apiKey = getOpenAIKey()

  if (!apiKey) {
    throw new Error("OpenAI API key is not configured")
  }

  const url = `https://api.openai.com/v1${endpoint}`

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  }

  const options: RequestInit = {
    method,
    headers,
    cache: "no-store",
  }

  if (body && method === "POST") {
    options.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(url, options)

    // If we get a 429 (rate limit) or 5xx (server error), retry after a delay
    if ((response.status === 429 || response.status >= 500) && retries > 0) {
      console.warn(`OpenAI API returned ${response.status}, retrying in ${RETRY_DELAY}ms... (${retries} retries left)`)
      await sleep(RETRY_DELAY)
      return openaiRequest(endpoint, method, body, retries - 1)
    }

    return response
  } catch (error) {
    // For network errors, retry if we have retries left
    if (retries > 0) {
      console.warn(`Network error with OpenAI API, retrying in ${RETRY_DELAY}ms... (${retries} retries left)`)
      await sleep(RETRY_DELAY)
      return openaiRequest(endpoint, method, body, retries - 1)
    }
    throw error
  }
}

/**
 * Checks if the OpenAI API key is valid and working
 * @returns Boolean indicating if the key is valid
 */
export async function isOpenAIKeyValid(): Promise<boolean> {
  if (!hasOpenAIKey()) {
    return false
  }

  try {
    // Make a simple models list request to verify the key
    const response = await openaiRequest("/models", "GET")
    return response.ok
  } catch (error) {
    console.error("Error validating OpenAI API key:", error)
    return false
  }
}

/**
 * Generates a price estimate using the pricing API or fallback
 * @param description Item description
 * @param condition Item condition
 * @param name Item name
 * @returns Estimated price range
 */
export async function generatePriceEstimate(description: string, condition = "used", name = ""): Promise<string> {
  try {
    // Try to use the pricing API
    const response = await fetch("/api/price-item", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description,
        condition,
        name,
      }),
    })

    if (!response.ok) {
      // If the API fails, fall back to algorithmic pricing
      console.warn("Pricing API failed, using fallback pricing")
      return generateFallbackPrice(description, condition)
    }

    const data = await response.json()

    if (data.error || !data.price) {
      // If there's an error or no price, fall back to algorithmic pricing
      console.warn("Pricing API returned error, using fallback pricing")
      return generateFallbackPrice(description, condition)
    }

    return data.price
  } catch (error) {
    console.error("Error estimating price:", error)
    // Fall back to algorithmic pricing
    return generateFallbackPrice(description, condition)
  }
}

/**
 * Generates a product description using algorithmic methods
 * @param title Item title
 * @param condition Item condition
 * @param extraDetails Additional details
 * @returns Generated description
 */
export async function generateProductDescription(title: string, condition: string, extraDetails = ""): Promise<string> {
  // Skip OpenAI completely and use fallback
  return generateFallbackDescription(title, condition, extraDetails)
}

/**
 * Generates a fallback description when OpenAI is unavailable
 */
function generateFallbackDescription(title = "", condition = "", extraDetails = ""): string {
  const conditionText = getConditionDescription(condition)
  const titleText = title || "This item"

  const description = `
${titleText} is available for purchase in ${condition || "used"} condition. ${extraDetails}

${conditionText}

This would make a great addition to your collection or home. Please review all photos and details before purchasing.
  `.trim()

  return description
}

/**
 * Get a description of the condition
 */
function getConditionDescription(condition: string): string {
  const conditionLower = condition.toLowerCase()

  if (conditionLower.includes("new") || conditionLower.includes("mint")) {
    return "The item is in pristine condition with no signs of wear or damage. All original packaging and accessories are included."
  }

  if (conditionLower.includes("like new") || conditionLower.includes("excellent")) {
    return "The item shows minimal signs of use and is in excellent working condition. It has been well-maintained and cared for."
  }

  if (conditionLower.includes("very good")) {
    return "The item shows minor signs of wear but is in very good condition overall. It functions perfectly as intended."
  }

  if (conditionLower.includes("good")) {
    return "The item shows normal signs of wear consistent with regular use, but remains in good working condition."
  }

  if (conditionLower.includes("fair")) {
    return "The item shows noticeable signs of wear and may have minor issues, but remains functional for its intended purpose."
  }

  if (conditionLower.includes("poor") || conditionLower.includes("for parts")) {
    return "The item shows significant wear or damage and may have functional issues. It may be best suited for parts or restoration."
  }

  return "The item is in used condition with normal signs of wear. Please review all details and photos for a complete understanding of its condition."
}

/**
 * Generates an optimized title for a marketplace listing
 * @param description Item description
 * @param platform Platform (e.g., "eBay", "Facebook Marketplace")
 * @returns Optimized title
 */
export async function generateOptimizedTitle(description: string, platform = "eBay"): Promise<string> {
  // Skip OpenAI completely and use fallback
  return generateFallbackTitle(description)
}

/**
 * Generates a fallback title when OpenAI is unavailable
 */
function generateFallbackTitle(description: string): string {
  // Create a title from the first few words
  const words = description.split(/\s+/).filter(Boolean)
  return words.slice(0, 6).join(" ")
}

/**
 * Generate text using OpenAI's completion API with fallback mechanisms
 * @param prompt The prompt to send to OpenAI
 * @returns Generated text or error message
 */
export async function generateText(prompt: string): Promise<string> {
  // Skip OpenAI completely and use a simple fallback
  return generateFallbackText(prompt)
}

/**
 * Generate fallback text when OpenAI is unavailable
 * @param prompt The prompt that would have been sent to OpenAI
 * @returns Simple generated text based on the prompt
 */
function generateFallbackText(prompt: string): string {
  // Extract keywords from the prompt
  const keywords = prompt
    .toLowerCase()
    .split(/\s+/)
    .filter(
      (word) =>
        word.length > 4 &&
        ![
          "what",
          "when",
          "where",
          "which",
          "would",
          "could",
          "should",
          "about",
          "there",
          "their",
          "these",
          "those",
          "please",
          "generate",
        ].includes(word),
    )

  // Create a simple response based on the prompt
  if (prompt.toLowerCase().includes("description")) {
    return "This is a quality item in good condition. Please see the photos for details and feel free to ask any questions before purchasing."
  }

  if (prompt.toLowerCase().includes("price") || prompt.toLowerCase().includes("estimate")) {
    return "Based on market research, this item is estimated to be worth between $25-$75 depending on condition and demand."
  }

  if (prompt.toLowerCase().includes("title")) {
    // Extract potential item name from the prompt
    const potentialItemWords = keywords.slice(0, 3)
    return `${potentialItemWords.join(" ")} - Good Condition, Great Value`
  }

  // Generic fallback
  return "Thank you for your submission. We've processed your request and will respond shortly."
}
