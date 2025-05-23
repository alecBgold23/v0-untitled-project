import { createServerSupabaseClient } from "@/lib/supabase-server"
import { OpenAI } from "openai"

// Types for price data
type PriceData = {
  min: number
  max: number
  avg: number
  count: number
}

// Cache for market data
const marketDataCache: Record<string, { data: PriceData; timestamp: number }> = {}
const CACHE_TTL = 7 * 86400000 // 7 days in milliseconds

/**
 * Get cached market data if available
 */
function getCachedMarketData(category: string): PriceData | null {
  const cached = marketDataCache[category]
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  return null
}

/**
 * Store market data in cache
 */
function cacheMarketData(category: string, data: PriceData): void {
  marketDataCache[category] = {
    data,
    timestamp: Date.now(),
  }
}

/**
 * Get market data from database or external sources
 */
export async function getMarketData(category: string): Promise<PriceData | null> {
  try {
    // Check cache first
    const cachedData = getCachedMarketData(category)
    if (cachedData) {
      return cachedData
    }

    // Try to get data from our database
    try {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase.from("market_prices").select("*").eq("category", category).single()

      if (data && !error) {
        const priceData: PriceData = {
          min: data.min_price,
          max: data.max_price,
          avg: data.avg_price,
          count: data.data_points,
        }

        // Cache the data
        cacheMarketData(category, priceData)
        return priceData
      }
    } catch (error) {
      console.error("Error fetching market data from database:", error)
      // Continue to return null
    }

    // If no data in database, return null
    return null
  } catch (error) {
    console.error("Error fetching market data:", error)
    return null // Return null instead of throwing
  }
}

// Initialize OpenAI client with proper API key
const getOpenAIClient = () => {
  // First try to get the pricing-specific key, then fall back to the general key
  const apiKey = process.env.PRICING_OPENAI_API_KEY || process.env.OPENAI_API_KEY

  if (!apiKey) {
    console.error("OpenAI API key is not set")
    return null
  }

  return new OpenAI({
    apiKey,
  })
}

/**
 * Detect category and base price for an item
 */
export function detectCategory(
  description: string,
  name = "",
): {
  category: string
  basePrice: number
  confidence: number
} {
  const text = `${name} ${description}`.toLowerCase()

  // Define categories with keywords and base prices
  const categories = [
    {
      name: "electronics",
      keywords: ["phone", "laptop", "computer", "tv", "tablet", "monitor", "speaker", "headphone", "camera", "gaming"],
      basePrice: 150,
    },
    {
      name: "furniture",
      keywords: ["sofa", "couch", "chair", "table", "desk", "bed", "dresser", "cabinet", "bookshelf", "furniture"],
      basePrice: 120,
    },
    {
      name: "clothing",
      keywords: ["shirt", "pants", "dress", "jacket", "coat", "shoes", "boots", "clothing", "apparel", "wear"],
      basePrice: 25,
    },
    {
      name: "appliances",
      keywords: ["refrigerator", "fridge", "washer", "dryer", "dishwasher", "microwave", "oven", "stove", "appliance"],
      basePrice: 200,
    },
    {
      name: "toys",
      keywords: ["toy", "game", "puzzle", "doll", "action figure", "board game", "lego", "playset"],
      basePrice: 20,
    },
    {
      name: "sports",
      keywords: ["bike", "bicycle", "treadmill", "weights", "exercise", "fitness", "sports", "athletic", "gym"],
      basePrice: 80,
    },
    {
      name: "jewelry",
      keywords: ["jewelry", "necklace", "ring", "bracelet", "watch", "gold", "silver", "diamond"],
      basePrice: 100,
    },
    {
      name: "books",
      keywords: ["book", "novel", "textbook", "cookbook", "magazine", "comic", "literature"],
      basePrice: 10,
    },
    {
      name: "tools",
      keywords: ["tool", "drill", "saw", "hammer", "screwdriver", "wrench", "power tool", "toolbox"],
      basePrice: 50,
    },
    {
      name: "art",
      keywords: ["art", "painting", "print", "sculpture", "canvas", "poster", "artwork", "decor"],
      basePrice: 60,
    },
  ]

  // Find matching categories and calculate confidence
  let bestMatch = { category: "miscellaneous", basePrice: 30, confidence: 0.3 }

  for (const category of categories) {
    let matchCount = 0
    for (const keyword of category.keywords) {
      if (text.includes(keyword)) {
        matchCount++
      }
    }

    if (matchCount > 0) {
      const confidence = Math.min(0.3 + (matchCount / category.keywords.length) * 0.7, 0.95)

      if (confidence > bestMatch.confidence) {
        bestMatch = {
          category: category.name,
          basePrice: category.basePrice,
          confidence: confidence,
        }
      }
    }
  }

  return bestMatch
}

/**
 * Adjust price based on condition
 */
export function adjustForCondition(basePrice: number, condition: string, description = "", issues = ""): number {
  // Condition multipliers
  const conditionMultipliers = {
    "like-new": 1.0,
    excellent: 0.9,
    good: 0.7,
    fair: 0.5,
    poor: 0.3,
    unknown: 0.6,
  }

  // Default to 'unknown' if condition not recognized
  const multiplier = conditionMultipliers[condition] || conditionMultipliers.unknown

  // Check for premium brands or features in description
  const premiumKeywords = ["premium", "luxury", "high-end", "designer", "limited edition", "rare", "vintage"]
  let premiumBonus = 0

  for (const keyword of premiumKeywords) {
    if (description.toLowerCase().includes(keyword)) {
      premiumBonus += 0.1 // Add 10% for each premium keyword
    }
  }

  // Cap premium bonus at 50%
  premiumBonus = Math.min(premiumBonus, 0.5)

  // Check for issues that might reduce value
  const issueKeywords = ["broken", "damaged", "cracked", "scratched", "stained", "torn", "missing", "not working"]
  let issuesPenalty = 0

  for (const keyword of issueKeywords) {
    if (issues.toLowerCase().includes(keyword)) {
      issuesPenalty += 0.1 // Reduce by 10% for each issue keyword
    }
  }

  // Cap issues penalty at 50%
  issuesPenalty = Math.min(issuesPenalty, 0.5)

  // Calculate final price
  const adjustedPrice = basePrice * multiplier * (1 + premiumBonus) * (1 - issuesPenalty)

  // Ensure minimum price of $5
  return Math.max(Math.round(adjustedPrice), 5)
}

/**
 * Generate an accurate price estimate
 */
export async function generateAccuratePrice(
  description: string,
  name?: string,
  condition?: string,
  issues?: string,
): Promise<{ price: string; source: string; confidence: number }> {
  try {
    // Detect category
    const { category, basePrice, confidence } = detectCategory(description, name)

    // Try to get market data
    let marketData = null
    try {
      marketData = await getMarketData(category)
    } catch (error) {
      console.error("Error getting market data:", error)
      // Continue with null marketData
    }

    // If we have market data, use it
    if (marketData) {
      // Adjust market price based on condition
      const adjustedPrice = adjustForCondition(marketData.avg, condition, description, issues)
      return {
        price: `$${Math.round(adjustedPrice)}`,
        source: "market_data",
        confidence: confidence * 0.9 + 0.1, // Boost confidence with market data
      }
    }

    // Otherwise use our base price and adjust for condition
    const adjustedPrice = adjustForCondition(basePrice, condition, description, issues)

    // Add some natural variation
    const finalPrice = Math.round(adjustedPrice * (0.95 + Math.random() * 0.1))

    return {
      price: `$${finalPrice}`,
      source: "algorithm",
      confidence: confidence,
    }
  } catch (error) {
    console.error("Error generating accurate price:", error)
    // Return a fallback price instead of throwing
    return {
      price: "$20-$100",
      source: "error_fallback",
      confidence: 0.3,
    }
  }
}

// Function to get a more accurate price using OpenAI (if available)
export async function getAIPriceEstimate(
  itemName: string,
  description: string,
  condition: string,
  issues: string,
): Promise<{ price: number; confidence: number } | null> {
  try {
    const openai = getOpenAIClient()
    if (!openai) return null

    const prompt = `
      I need to estimate the resale value of the following item:
      
      Item Name: ${itemName}
      Description: ${description}
      Condition: ${condition}
      Issues: ${issues || "None reported"}
      
      Please provide:
      1. An estimated price in USD (just the number)
      2. Your confidence level as a number between 0 and 1
      
      Format your response as JSON with keys: price, confidence
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
    if (!content) return null

    try {
      const result = JSON.parse(content)
      return {
        price: Number(result.price),
        confidence: Number(result.confidence),
      }
    } catch (error) {
      console.error("Failed to parse AI price estimate:", error)
      return null
    }
  } catch (error) {
    console.error("Error getting AI price estimate:", error)
    return null
  }
}
