import { OpenAI } from "openai"
import { updateLastUsage } from "@/app/api/openai-key-usage/route"

/**
 * Generates a price estimate based on item details and condition
 */
export async function generatePriceEstimate(itemDetails: string, condition: string): Promise<string> {
  try {
    console.log("Generating price estimate for:", itemDetails, condition)

    // Get the API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY || process.env.PRICING_OPENAI_API_KEY

    if (!apiKey) {
      console.error("OpenAI API key is not set")
      return generateFallbackPrice(itemDetails, condition)
    }

    console.log("API key found, initializing OpenAI client...")

    // Initialize the OpenAI client
    const openai = new OpenAI({
      apiKey,
    })

    console.log("Making request to OpenAI API for price estimate...")

    const prompt = `
You are a professional appraiser for used consumer items. Estimate a fair market resale price in USD for the following item. 
Provide your estimate as a price range (e.g., $50-$75) to account for variations in the market.

Item description: ${itemDetails}
Condition: ${condition}

Return only the price range in the format $X-$Y, with no additional text.
`

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert in pricing used consumer goods. Only return a price estimate as a price range in the format $X-$Y.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 20,
      temperature: 0.7,
    })

    console.log("OpenAI API response received:", JSON.stringify(response))

    // Update the last usage timestamp
    updateLastUsage()

    const priceText = response.choices[0]?.message?.content?.trim() || "0"

    // If the response doesn't contain a dollar sign, add one
    const formattedPrice = priceText.includes("$") ? priceText : `$${priceText}`

    console.log("Generated price estimate:", formattedPrice)

    return formattedPrice
  } catch (error) {
    console.error("Error generating price estimate:", error)
    return generateFallbackPrice(itemDetails, condition)
  }
}

/**
 * Generates a fallback price estimate based on description length and keywords
 */
function generateFallbackPrice(description: string, condition = "used"): string {
  console.log("Using fallback price generator for:", description, condition)

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

  const result = `$${min}-$${max}`
  console.log("Generated fallback price:", result)

  return result
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
    console.log("Generating price estimate with comparables for:", description, condition)

    // Get AI-generated price estimate
    const aiEstimate = await generatePriceEstimate(description, condition)

    console.log("AI estimate received:", aiEstimate)

    // Generate mock comparable items
    const priceText = aiEstimate.replace(/[^0-9.]/g, "")
    const basePrice = Number.parseFloat(priceText) || 50
    const comparableItems = generateMockComparables(description, basePrice, condition)

    return {
      estimatedPrice: aiEstimate,
      comparableItems: comparableItems,
      aiEstimate: aiEstimate,
    }
  } catch (error) {
    console.error("Error generating price estimate with comparables:", error)

    // Fallback to a default estimate
    const fallbackPrice = generateFallbackPrice(description, condition)
    return {
      estimatedPrice: fallbackPrice,
      comparableItems: [],
      aiEstimate: fallbackPrice,
    }
  }
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
