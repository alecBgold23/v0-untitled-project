import { createServerSupabaseClient } from "@/lib/supabase-server"

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

/**
 * Enhanced category detection with more specific categories
 */
export function detectCategory(
  description: string,
  name?: string,
): {
  category: string
  basePrice: number
  confidence: number
} {
  const text = `${name || ""} ${description}`.toLowerCase()

  // VR Headsets - more specific detection
  if (
    text.includes("oculus") ||
    text.includes("quest") ||
    text.includes("rift") ||
    text.includes("vr headset") ||
    text.includes("virtual reality") ||
    (text.includes("vr") && text.includes("headset")) ||
    text.includes("htc vive") ||
    text.includes("valve index") ||
    text.includes("playstation vr") ||
    text.includes("psvr")
  ) {
    // Detect specific models
    if (text.includes("quest 3")) {
      return { category: "vr_quest_3", basePrice: 499, confidence: 0.9 }
    } else if (text.includes("quest 2")) {
      return { category: "vr_quest_2", basePrice: 299, confidence: 0.9 }
    } else if (text.includes("quest pro")) {
      return { category: "vr_quest_pro", basePrice: 999, confidence: 0.9 }
    } else if (text.includes("quest")) {
      return { category: "vr_quest", basePrice: 299, confidence: 0.8 }
    } else if (text.includes("rift s")) {
      return { category: "vr_rift_s", basePrice: 399, confidence: 0.9 }
    } else if (text.includes("rift")) {
      return { category: "vr_rift", basePrice: 349, confidence: 0.8 }
    } else if (text.includes("valve index")) {
      return { category: "vr_valve_index", basePrice: 999, confidence: 0.9 }
    } else if (text.includes("htc vive")) {
      return { category: "vr_htc_vive", basePrice: 499, confidence: 0.9 }
    } else if (text.includes("playstation vr") || text.includes("psvr")) {
      return { category: "vr_psvr", basePrice: 299, confidence: 0.9 }
    } else {
      return { category: "vr_headset", basePrice: 299, confidence: 0.7 }
    }
  }

  // Cars and Vehicles
  if (
    text.includes("car") ||
    text.includes("vehicle") ||
    text.includes("auto") ||
    text.includes("truck") ||
    text.includes("suv") ||
    text.includes("sedan") ||
    text.includes("coupe") ||
    text.includes("convertible") ||
    text.includes("motorcycle") ||
    text.includes("bike")
  ) {
    // Luxury car brands
    if (
      text.includes("mercedes") ||
      text.includes("bmw") ||
      text.includes("audi") ||
      text.includes("lexus") ||
      text.includes("porsche") ||
      text.includes("tesla") ||
      text.includes("ferrari") ||
      text.includes("lamborghini") ||
      text.includes("maserati") ||
      text.includes("bentley") ||
      text.includes("rolls royce")
    ) {
      return { category: "vehicle_luxury", basePrice: 50000, confidence: 0.9 }
    }

    // Sports cars
    if (
      text.includes("sports car") ||
      text.includes("performance") ||
      text.includes("turbo") ||
      text.includes("supercharged") ||
      text.includes("v8") ||
      text.includes("v12")
    ) {
      return { category: "vehicle_sports", basePrice: 35000, confidence: 0.9 }
    }

    // Electric vehicles
    if (
      text.includes("electric") ||
      text.includes("ev") ||
      text.includes("hybrid") ||
      text.includes("tesla") ||
      text.includes("leaf") ||
      text.includes("bolt") ||
      text.includes("prius")
    ) {
      return { category: "vehicle_electric", basePrice: 30000, confidence: 0.9 }
    }

    // SUVs
    if (
      text.includes("suv") ||
      text.includes("crossover") ||
      text.includes("4x4") ||
      text.includes("off-road") ||
      text.includes("all-wheel drive") ||
      text.includes("awd")
    ) {
      return { category: "vehicle_suv", basePrice: 25000, confidence: 0.9 }
    }

    // Trucks
    if (
      text.includes("truck") ||
      text.includes("pickup") ||
      text.includes("f-150") ||
      text.includes("silverado") ||
      text.includes("ram") ||
      text.includes("tacoma") ||
      text.includes("tundra")
    ) {
      return { category: "vehicle_truck", basePrice: 28000, confidence: 0.9 }
    }

    // Motorcycles
    if (
      text.includes("motorcycle") ||
      text.includes("bike") ||
      text.includes("harley") ||
      text.includes("honda") ||
      text.includes("yamaha") ||
      text.includes("kawasaki") ||
      text.includes("ducati") ||
      text.includes("triumph")
    ) {
      return { category: "vehicle_motorcycle", basePrice: 8000, confidence: 0.9 }
    }

    // Sedan/standard cars
    if (
      text.includes("sedan") ||
      text.includes("toyota") ||
      text.includes("honda") ||
      text.includes("nissan") ||
      text.includes("ford") ||
      text.includes("chevrolet") ||
      text.includes("hyundai") ||
      text.includes("kia")
    ) {
      return { category: "vehicle_sedan", basePrice: 18000, confidence: 0.9 }
    }

    // Generic vehicle
    return { category: "vehicle", basePrice: 15000, confidence: 0.8 }
  }

  // Watches and Jewelry (high-value items)
  if (
    text.includes("watch") ||
    text.includes("jewelry") ||
    text.includes("ring") ||
    text.includes("necklace") ||
    text.includes("bracelet") ||
    text.includes("earrings") ||
    text.includes("diamond") ||
    text.includes("gold") ||
    text.includes("silver") ||
    text.includes("platinum")
  ) {
    // Luxury watches
    if (
      text.includes("rolex") ||
      text.includes("omega") ||
      text.includes("tag heuer") ||
      text.includes("breitling") ||
      text.includes("patek philippe") ||
      text.includes("audemars piguet") ||
      text.includes("cartier") ||
      text.includes("iwc") ||
      text.includes("hublot") ||
      text.includes("tudor")
    ) {
      return { category: "watch_luxury", basePrice: 8000, confidence: 0.9 }
    }

    // Diamond jewelry
    if (
      text.includes("diamond") ||
      text.includes("engagement ring") ||
      text.includes("wedding ring") ||
      text.includes("carat")
    ) {
      return { category: "jewelry_diamond", basePrice: 3000, confidence: 0.9 }
    }

    // Gold jewelry
    if (text.includes("gold") || text.includes("14k") || text.includes("18k") || text.includes("24k")) {
      return { category: "jewelry_gold", basePrice: 1000, confidence: 0.9 }
    }

    // Standard watches
    if (text.includes("watch")) {
      return { category: "watch", basePrice: 200, confidence: 0.8 }
    }

    // Generic jewelry
    return { category: "jewelry", basePrice: 300, confidence: 0.8 }
  }

  // Default for other categories
  return { category: "general", basePrice: 49, confidence: 0.5 }
}

/**
 * Adjust price based on condition
 */
export function adjustForCondition(
  basePrice: number,
  condition?: string,
  description?: string,
  issues?: string,
): number {
  const text = `${description || ""} ${condition || ""} ${issues || ""}`.toLowerCase()

  // New/sealed items
  if (text.includes("new") || text.includes("sealed") || text.includes("unopened") || text.includes("brand new")) {
    return basePrice * 1.0 // 100% of base price for new items
  }

  // Like new
  if (
    text.includes("like new") ||
    text.includes("barely used") ||
    text.includes("excellent condition") ||
    text.includes("mint condition")
  ) {
    return basePrice * 0.9 // 90% of base price
  }

  // Good condition
  if (
    text.includes("good condition") ||
    text.includes("works perfectly") ||
    text.includes("works great") ||
    text.includes("minor wear")
  ) {
    return basePrice * 0.8 // 80% of base price
  }

  // Fair condition
  if (
    text.includes("fair condition") ||
    text.includes("used") ||
    text.includes("wear and tear") ||
    text.includes("scratches") ||
    text.includes("scuffs")
  ) {
    return basePrice * 0.7 // 70% of base price
  }

  // Poor condition
  if (
    text.includes("poor condition") ||
    text.includes("heavily used") ||
    text.includes("damaged") ||
    text.includes("broken") ||
    text.includes("not working") ||
    text.includes("for parts") ||
    text.includes("needs repair")
  ) {
    return basePrice * 0.4 // 40% of base price
  }

  // Default to good condition if not specified
  return basePrice * 0.8 // 80% of base price
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
