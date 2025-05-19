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

    // Check if we have API key
    if (!process.env.PRICING_OPENAI_API_KEY) {
      throw new Error("PRICING_OPENAI_API_KEY is not set")
    }

    // Try to get data from our database
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

    // If no data in database, return null
    return null
  } catch (error) {
    console.error("Error fetching market data:", error)
    throw error // Re-throw to propagate the error
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

  // Gaming Consoles
  if (
    text.includes("playstation") ||
    text.includes("ps5") ||
    text.includes("ps4") ||
    text.includes("xbox") ||
    text.includes("nintendo") ||
    text.includes("switch") ||
    text.includes("steam deck")
  ) {
    if (text.includes("ps5") || text.includes("playstation 5")) {
      return { category: "console_ps5", basePrice: 499, confidence: 0.9 }
    } else if (text.includes("ps4") || text.includes("playstation 4")) {
      return { category: "console_ps4", basePrice: 299, confidence: 0.9 }
    } else if (text.includes("xbox series x")) {
      return { category: "console_xbox_series_x", basePrice: 499, confidence: 0.9 }
    } else if (text.includes("xbox series s")) {
      return { category: "console_xbox_series_s", basePrice: 299, confidence: 0.9 }
    } else if (text.includes("xbox one")) {
      return { category: "console_xbox_one", basePrice: 249, confidence: 0.9 }
    } else if (text.includes("switch") && text.includes("nintendo")) {
      return { category: "console_switch", basePrice: 299, confidence: 0.9 }
    } else if (text.includes("steam deck")) {
      return { category: "console_steam_deck", basePrice: 399, confidence: 0.9 }
    } else {
      return { category: "gaming_console", basePrice: 299, confidence: 0.7 }
    }
  }

  // Smartphones with better model detection
  if (
    text.includes("iphone") ||
    text.includes("samsung") ||
    text.includes("pixel") ||
    text.includes("android phone") ||
    text.includes("smartphone")
  ) {
    // iPhone models
    if (text.includes("iphone 15 pro max") || text.includes("iphone 15 pro max")) {
      return { category: "phone_iphone_15_pro_max", basePrice: 1199, confidence: 0.9 }
    } else if (text.includes("iphone 15 pro")) {
      return { category: "phone_iphone_15_pro", basePrice: 999, confidence: 0.9 }
    } else if (text.includes("iphone 15")) {
      return { category: "phone_iphone_15", basePrice: 799, confidence: 0.9 }
    } else if (text.includes("iphone 14 pro max")) {
      return { category: "phone_iphone_14_pro_max", basePrice: 999, confidence: 0.9 }
    } else if (text.includes("iphone 14 pro")) {
      return { category: "phone_iphone_14_pro", basePrice: 899, confidence: 0.9 }
    } else if (text.includes("iphone 14")) {
      return { category: "phone_iphone_14", basePrice: 699, confidence: 0.9 }
    } else if (text.includes("iphone 13")) {
      return { category: "phone_iphone_13", basePrice: 599, confidence: 0.9 }
    } else if (text.includes("iphone 12")) {
      return { category: "phone_iphone_12", basePrice: 499, confidence: 0.9 }
    } else if (text.includes("iphone")) {
      return { category: "phone_iphone", basePrice: 399, confidence: 0.8 }
    }

    // Samsung models
    if (text.includes("samsung") && text.includes("s23 ultra")) {
      return { category: "phone_samsung_s23_ultra", basePrice: 1199, confidence: 0.9 }
    } else if (text.includes("samsung") && text.includes("s23")) {
      return { category: "phone_samsung_s23", basePrice: 799, confidence: 0.9 }
    } else if (text.includes("samsung") && text.includes("s22")) {
      return { category: "phone_samsung_s22", basePrice: 699, confidence: 0.9 }
    } else if (text.includes("samsung") && text.includes("fold")) {
      return { category: "phone_samsung_fold", basePrice: 1799, confidence: 0.9 }
    } else if (text.includes("samsung") && text.includes("flip")) {
      return { category: "phone_samsung_flip", basePrice: 999, confidence: 0.9 }
    } else if (text.includes("samsung")) {
      return { category: "phone_samsung", basePrice: 499, confidence: 0.8 }
    }

    // Google Pixel
    if (text.includes("pixel 7 pro")) {
      return { category: "phone_pixel_7_pro", basePrice: 899, confidence: 0.9 }
    } else if (text.includes("pixel 7")) {
      return { category: "phone_pixel_7", basePrice: 599, confidence: 0.9 }
    } else if (text.includes("pixel")) {
      return { category: "phone_pixel", basePrice: 499, confidence: 0.8 }
    }

    // Generic smartphone
    return { category: "smartphone", basePrice: 299, confidence: 0.7 }
  }

  // Laptops with better model detection
  if (text.includes("laptop") || text.includes("macbook") || text.includes("notebook") || text.includes("chromebook")) {
    // MacBooks
    if (text.includes("macbook pro") && text.includes("m2")) {
      return { category: "laptop_macbook_pro_m2", basePrice: 1999, confidence: 0.9 }
    } else if (text.includes("macbook pro") && text.includes("m1")) {
      return { category: "laptop_macbook_pro_m1", basePrice: 1499, confidence: 0.9 }
    } else if (text.includes("macbook pro")) {
      return { category: "laptop_macbook_pro", basePrice: 1299, confidence: 0.9 }
    } else if (text.includes("macbook air") && text.includes("m2")) {
      return { category: "laptop_macbook_air_m2", basePrice: 1199, confidence: 0.9 }
    } else if (text.includes("macbook air") && text.includes("m1")) {
      return { category: "laptop_macbook_air_m1", basePrice: 899, confidence: 0.9 }
    } else if (text.includes("macbook air")) {
      return { category: "laptop_macbook_air", basePrice: 799, confidence: 0.9 }
    } else if (text.includes("macbook")) {
      return { category: "laptop_macbook", basePrice: 899, confidence: 0.8 }
    }

    // Gaming laptops
    if (
      text.includes("gaming laptop") ||
      (text.includes("laptop") &&
        (text.includes("gaming") ||
          text.includes("rtx") ||
          text.includes("nvidia") ||
          text.includes("amd") ||
          text.includes("radeon")))
    ) {
      return { category: "laptop_gaming", basePrice: 1299, confidence: 0.8 }
    }

    // Chromebooks
    if (text.includes("chromebook")) {
      return { category: "laptop_chromebook", basePrice: 299, confidence: 0.9 }
    }

    // Generic laptop
    return { category: "laptop", basePrice: 599, confidence: 0.7 }
  }

  // Tablets
  if (
    text.includes("ipad") ||
    text.includes("tablet") ||
    text.includes("surface") ||
    text.includes("galaxy tab") ||
    text.includes("kindle")
  ) {
    // iPads
    if (text.includes("ipad pro")) {
      return { category: "tablet_ipad_pro", basePrice: 799, confidence: 0.9 }
    } else if (text.includes("ipad air")) {
      return { category: "tablet_ipad_air", basePrice: 599, confidence: 0.9 }
    } else if (text.includes("ipad mini")) {
      return { category: "tablet_ipad_mini", basePrice: 499, confidence: 0.9 }
    } else if (text.includes("ipad")) {
      return { category: "tablet_ipad", basePrice: 329, confidence: 0.9 }
    }

    // Surface
    if (text.includes("surface pro")) {
      return { category: "tablet_surface_pro", basePrice: 899, confidence: 0.9 }
    } else if (text.includes("surface")) {
      return { category: "tablet_surface", basePrice: 599, confidence: 0.9 }
    }

    // Samsung tablets
    if (text.includes("galaxy tab s")) {
      return { category: "tablet_galaxy_tab_s", basePrice: 649, confidence: 0.9 }
    } else if (text.includes("galaxy tab")) {
      return { category: "tablet_galaxy_tab", basePrice: 349, confidence: 0.9 }
    }

    // Kindle
    if (text.includes("kindle")) {
      return { category: "tablet_kindle", basePrice: 139, confidence: 0.9 }
    }

    // Generic tablet
    return { category: "tablet", basePrice: 199, confidence: 0.7 }
  }

  // TVs
  if (
    text.includes("tv") ||
    text.includes("television") ||
    text.includes("smart tv") ||
    text.includes("4k") ||
    text.includes("oled") ||
    text.includes("qled")
  ) {
    // OLED TVs
    if (text.includes("oled")) {
      return { category: "tv_oled", basePrice: 1299, confidence: 0.9 }
    }

    // QLED TVs
    if (text.includes("qled")) {
      return { category: "tv_qled", basePrice: 899, confidence: 0.9 }
    }

    // 4K TVs
    if (text.includes("4k")) {
      return { category: "tv_4k", basePrice: 499, confidence: 0.9 }
    }

    // Smart TVs
    if (text.includes("smart tv") || text.includes("smart television")) {
      return { category: "tv_smart", basePrice: 399, confidence: 0.9 }
    }

    // Generic TV
    return { category: "tv", basePrice: 299, confidence: 0.7 }
  }

  // Cameras
  if (
    text.includes("camera") ||
    text.includes("dslr") ||
    text.includes("mirrorless") ||
    text.includes("canon") ||
    text.includes("nikon") ||
    (text.includes("sony") && (text.includes("alpha") || text.includes("a7")))
  ) {
    // Mirrorless cameras
    if (text.includes("mirrorless")) {
      return { category: "camera_mirrorless", basePrice: 899, confidence: 0.9 }
    }

    // DSLR cameras
    if (text.includes("dslr")) {
      return { category: "camera_dslr", basePrice: 699, confidence: 0.9 }
    }

    // Sony Alpha
    if (text.includes("sony") && (text.includes("alpha") || text.includes("a7"))) {
      return { category: "camera_sony_alpha", basePrice: 1799, confidence: 0.9 }
    }

    // Generic camera
    return { category: "camera", basePrice: 399, confidence: 0.7 }
  }

  // Audio Equipment
  if (
    text.includes("headphones") ||
    text.includes("earbuds") ||
    text.includes("speaker") ||
    text.includes("soundbar") ||
    text.includes("airpods") ||
    text.includes("beats")
  ) {
    // AirPods
    if (text.includes("airpods pro")) {
      return { category: "audio_airpods_pro", basePrice: 249, confidence: 0.9 }
    } else if (text.includes("airpods")) {
      return { category: "audio_airpods", basePrice: 159, confidence: 0.9 }
    }

    // Beats
    if (text.includes("beats")) {
      return { category: "audio_beats", basePrice: 199, confidence: 0.9 }
    }

    // Headphones
    if (text.includes("headphones")) {
      return { category: "audio_headphones", basePrice: 149, confidence: 0.8 }
    }

    // Earbuds
    if (text.includes("earbuds")) {
      return { category: "audio_earbuds", basePrice: 99, confidence: 0.8 }
    }

    // Speakers
    if (text.includes("speaker")) {
      return { category: "audio_speaker", basePrice: 129, confidence: 0.8 }
    }

    // Soundbars
    if (text.includes("soundbar")) {
      return { category: "audio_soundbar", basePrice: 199, confidence: 0.9 }
    }

    // Generic audio
    return { category: "audio_equipment", basePrice: 99, confidence: 0.7 }
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
  // Check if pricing API key is available
  if (!process.env.PRICING_OPENAI_API_KEY) {
    throw new Error("PRICING_OPENAI_API_KEY is not set")
  }

  try {
    // Detect category
    const { category, basePrice, confidence } = detectCategory(description, name)

    // Try to get market data
    const marketData = await getMarketData(category)

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
    throw error // Re-throw to propagate the error
  }
}
