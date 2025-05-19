import { hasOpenAIKey, getOpenAIKey } from "@/lib/env"

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
 * Generates a price estimate using algorithmic methods
 * @param description Item description
 * @param condition Item condition
 * @returns Estimated price range
 */
export async function generatePriceEstimate(description: string, condition = "used"): Promise<string> {
  // Use algorithmic pricing directly - skip OpenAI completely
  return generateFallbackPrice(description, condition)
}

/**
 * Generates a fallback price estimate based on description length and keywords
 * @param description Item description
 * @param condition Item condition
 * @returns Estimated price range
 */
function generateFallbackPrice(description: string, condition = "used"): string {
  const text = description.toLowerCase()
  const conditionLower = condition.toLowerCase()

  // Base price factors
  let baseMin = 15
  let baseMax = 50

  // Adjust based on description length
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length > 20) {
    baseMin += 20
    baseMax += 100
  } else if (words.length > 10) {
    baseMin += 10
    baseMax += 50
  }

  // Check for premium keywords
  const premiumKeywords = [
    "vintage",
    "antique",
    "rare",
    "limited",
    "edition",
    "collector",
    "brand new",
    "unopened",
    "sealed",
    "mint",
    "perfect",
    "excellent",
    "designer",
    "luxury",
    "premium",
    "high-end",
    "professional",
  ]

  let premiumCount = 0
  premiumKeywords.forEach((keyword) => {
    if (text.includes(keyword)) {
      premiumCount++
    }
  })

  // Adjust for premium items
  if (premiumCount > 3) {
    baseMin *= 3
    baseMax *= 4
  } else if (premiumCount > 0) {
    baseMin *= 1.5
    baseMax *= 2
  }

  // Adjust based on condition
  const conditionMultipliers: Record<string, number> = {
    new: 1.5,
    "like new": 1.3,
    excellent: 1.2,
    "very good": 1.1,
    good: 1.0,
    fair: 0.8,
    poor: 0.6,
    "for parts": 0.4,
  }

  // Find the best matching condition
  let conditionMultiplier = 1.0
  for (const [conditionKey, multiplier] of Object.entries(conditionMultipliers)) {
    if (conditionLower.includes(conditionKey)) {
      conditionMultiplier = multiplier
      break
    }
  }

  // Apply condition multiplier
  baseMin = Math.round(baseMin * conditionMultiplier)
  baseMax = Math.round(baseMax * conditionMultiplier)

  // Add some randomness
  const min = Math.floor(baseMin + Math.random() * 10)
  const max = Math.floor(baseMax + Math.random() * 20)

  return `$${min}-$${max}`
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
