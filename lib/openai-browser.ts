import { getOpenAIKey } from "@/lib/env"
import { isServiceAvailable, recordFailure, recordSuccess } from "@/lib/circuit-breaker-browser"

// Constants
const MAX_RETRIES = 2
const RETRY_DELAY = 1000 // 1 second
const OPENAI_SERVICE = "openai"

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
  // Check if OpenAI is available according to the circuit breaker
  if (!isServiceAvailable(OPENAI_SERVICE)) {
    console.warn("OpenAI circuit is open, skipping request")
    throw new Error("OpenAI service is currently unavailable")
  }

  const apiKey = getOpenAIKey() // ✅ Using the environment variable getter function

  if (!apiKey) {
    throw new Error("OpenAI API key is not configured")
  }

  // Log API key usage (without exposing the key)
  console.log(`OpenAI API request to ${endpoint} at ${new Date().toISOString()}`)

  const url = `https://api.openai.com/v1${endpoint}`

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`, // ✅ Using the retrieved environment variable
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

    // If the response is not OK, record a failure
    if (!response.ok) {
      recordFailure(OPENAI_SERVICE)
      console.error(`OpenAI API request failed with status: ${response.status}`)
    } else {
      // Record a success to help reset the circuit breaker
      recordSuccess(OPENAI_SERVICE)
      console.log(`OpenAI API request succeeded at ${new Date().toISOString()}`)
    }

    return response
  } catch (error) {
    // Record a failure for network errors
    recordFailure(OPENAI_SERVICE)
    console.error("OpenAI API network error:", error)

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
 * Gets a price estimate for an item
 * @param description Item description
 * @param condition Item condition
 * @param category Optional category
 * @returns Price estimate with min and max values
 */
export async function getPriceEstimate(
  description: string,
  condition: string,
  category?: string,
): Promise<{ min: number; max: number; currency: string }> {
  try {
    // Extract price range from the generated estimate
    const priceText = await generateFallbackPrice(description, condition)

    // Parse the price range
    const priceMatch = priceText.match(/\$(\d+(?:\.\d+)?)-\$(\d+(?:\.\d+)?)/)

    if (priceMatch) {
      return {
        min: Number.parseFloat(priceMatch[1]),
        max: Number.parseFloat(priceMatch[2]),
        currency: "USD",
      }
    }

    // Check for single price format
    const singlePriceMatch = priceText.match(/\$(\d+(?:\.\d+)?)/)
    if (singlePriceMatch) {
      const price = Number.parseFloat(singlePriceMatch[1])
      return {
        min: price * 0.9, // 10% below the single price
        max: price * 1.1, // 10% above the single price
        currency: "USD",
      }
    }

    // Fallback to a default range
    return {
      min: 20,
      max: 100,
      currency: "USD",
    }
  } catch (error) {
    console.error("Error getting price estimate:", error)
    return {
      min: 20,
      max: 100,
      currency: "USD",
    }
  }
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

  // Check for specific high-value categories first

  // Cars and vehicles
  if (
    text.includes("car") ||
    text.includes("vehicle") ||
    text.includes("truck") ||
    text.includes("suv") ||
    text.includes("sedan") ||
    text.includes("motorcycle")
  ) {
    let vehicleBasePrice = 10000

    // Luxury brands
    if (
      text.includes("mercedes") ||
      text.includes("bmw") ||
      text.includes("audi") ||
      text.includes("lexus") ||
      text.includes("porsche") ||
      text.includes("tesla") ||
      text.includes("ferrari") ||
      text.includes("lamborghini")
    ) {
      vehicleBasePrice = 50000
    }
    // Electric vehicles
    else if (text.includes("electric") || text.includes("ev") || text.includes("hybrid") || text.includes("tesla")) {
      vehicleBasePrice = 30000
    }
    // SUVs and trucks
    else if (text.includes("suv") || text.includes("truck") || text.includes("pickup") || text.includes("4x4")) {
      vehicleBasePrice = 25000
    }
    // Motorcycles
    else if (text.includes("motorcycle") || text.includes("bike") || text.includes("harley")) {
      vehicleBasePrice = 8000
    }

    // Apply condition multiplier
    baseMin = Math.round(vehicleBasePrice * 0.8 * conditionMultiplier)
    baseMax = Math.round(vehicleBasePrice * 1.2 * conditionMultiplier)

    // Add some randomness
    const min = Math.floor(baseMin + Math.random() * 1000)
    const max = Math.floor(baseMax + Math.random() * 2000)

    return `$${min}-$${max}`
  }

  // Watches and jewelry
  if (
    text.includes("watch") ||
    text.includes("jewelry") ||
    text.includes("ring") ||
    text.includes("diamond") ||
    text.includes("gold")
  ) {
    let jewelryBasePrice = 200

    // Luxury watches
    if (
      text.includes("rolex") ||
      text.includes("omega") ||
      text.includes("tag heuer") ||
      text.includes("breitling") ||
      text.includes("patek")
    ) {
      jewelryBasePrice = 8000
    }
    // Diamond jewelry
    else if (text.includes("diamond") || text.includes("engagement ring")) {
      jewelryBasePrice = 3000
    }
    // Gold jewelry
    else if (text.includes("gold") || text.includes("14k") || text.includes("18k")) {
      jewelryBasePrice = 1000
    }

    // Apply condition multiplier
    baseMin = Math.round(jewelryBasePrice * 0.8 * conditionMultiplier)
    baseMax = Math.round(jewelryBasePrice * 1.2 * conditionMultiplier)

    // Add some randomness
    const min = Math.floor(baseMin + Math.random() * 100)
    const max = Math.floor(baseMax + Math.random() * 500)

    return `$${min}-$${max}`
  }

  // Art and collectibles
  if (
    text.includes("art") ||
    text.includes("painting") ||
    text.includes("collectible") ||
    text.includes("antique") ||
    text.includes("rare")
  ) {
    let artBasePrice = 300

    // Fine art
    if (text.includes("original") || text.includes("signed") || text.includes("artist")) {
      artBasePrice = 2000
    }
    // Antiques
    else if (text.includes("antique") || text.includes("century")) {
      artBasePrice = 1000
    }

    // Apply condition multiplier
    baseMin = Math.round(artBasePrice * 0.8 * conditionMultiplier)
    baseMax = Math.round(artBasePrice * 1.5 * conditionMultiplier)

    // Add some randomness
    const min = Math.floor(baseMin + Math.random() * 100)
    const max = Math.floor(baseMax + Math.random() * 500)

    return `$${min}-$${max}`
  }

  // Apply condition multiplier to base prices
  baseMin = Math.round(baseMin * conditionMultiplier)
  baseMax = Math.round(baseMax * conditionMultiplier)

  // Check for standard categories
  const categories = [
    { keywords: ["electronics", "computer", "laptop", "phone", "tablet", "camera"], basePrice: 100 },
    { keywords: ["furniture", "sofa", "chair", "table", "desk", "bed"], basePrice: 80 },
    { keywords: ["clothing", "shirt", "pants", "dress", "jacket", "coat"], basePrice: 25 },
    { keywords: ["toy", "game", "puzzle", "lego", "action figure"], basePrice: 20 },
    { keywords: ["book", "novel", "textbook", "comic"], basePrice: 10 },
    { keywords: ["sports", "equipment", "bicycle", "golf", "tennis"], basePrice: 50 },
  ]

  // Check if the description matches any category
  for (const category of categories) {
    for (const keyword of category.keywords) {
      if (text.includes(keyword)) {
        // Adjust the base price based on the category
        baseMin = Math.max(baseMin, Math.round(category.basePrice * 0.7 * conditionMultiplier))
        baseMax = Math.max(baseMax, Math.round(category.basePrice * 1.3 * conditionMultiplier))
        break
      }
    }
  }

  // Add some randomness
  const min = Math.floor(baseMin + Math.random() * 10)
  const max = Math.floor(baseMax + Math.random() * 20)

  return `$${min}-$${max}`
}
