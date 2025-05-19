/**
 * Generate a reliable price estimate based on item details
 * @param description Item description
 * @param name Optional item name
 * @param condition Optional item condition
 * @param issues Optional item issues
 * @returns A price estimate string (e.g. "$50")
 */
export function generateReliablePrice(description: string, name?: string, condition?: string, issues?: string): string {
  try {
    const lowerDesc = ((description || "") + " " + (name || "") + " " + (issues || "")).toLowerCase()
    const lowerCondition = (condition || "").toLowerCase()

    // Define category patterns and their base prices
    const categories = [
      {
        name: "Smartphones",
        patterns: ["iphone", "samsung", "pixel", "android phone", "smartphone"],
        basePrice: 150,
        premiumBrands: ["iphone", "samsung", "pixel", "pro", "max", "ultra"],
        premiumMultiplier: 2.5,
      },
      {
        name: "Laptops",
        patterns: ["laptop", "macbook", "notebook", "chromebook"],
        basePrice: 250,
        premiumBrands: ["macbook", "pro", "air", "gaming", "alienware", "razer", "asus rog"],
        premiumMultiplier: 2,
      },
      {
        name: "Tablets",
        patterns: ["ipad", "tablet", "surface", "galaxy tab", "kindle"],
        basePrice: 120,
        premiumBrands: ["ipad", "pro", "air", "surface", "samsung"],
        premiumMultiplier: 1.8,
      },
      {
        name: "Cameras",
        patterns: ["camera", "dslr", "mirrorless", "canon", "nikon", "sony"],
        basePrice: 200,
        premiumBrands: ["sony", "canon", "nikon", "professional", "mirrorless"],
        premiumMultiplier: 2.2,
      },
      {
        name: "TVs",
        patterns: ["tv", "television", "smart tv", "4k", "oled", "qled", "led tv"],
        basePrice: 200,
        premiumBrands: ["oled", "qled", "samsung", "lg", "sony", "65", "75"],
        premiumMultiplier: 2,
      },
      {
        name: "Audio Equipment",
        patterns: ["headphones", "earbuds", "speaker", "soundbar", "airpods", "beats"],
        basePrice: 75,
        premiumBrands: ["bose", "sony", "airpods", "beats", "sennheiser", "pro"],
        premiumMultiplier: 1.7,
      },
      {
        name: "Gaming",
        patterns: ["playstation", "ps4", "ps5", "xbox", "nintendo", "switch", "gaming"],
        basePrice: 200,
        premiumBrands: ["ps5", "series x", "oled", "pro", "limited edition"],
        premiumMultiplier: 1.5,
      },
      {
        name: "Clothing",
        patterns: ["shirt", "pants", "dress", "jacket", "coat", "shoes", "boots", "clothing"],
        basePrice: 30,
        premiumBrands: ["designer", "leather", "nike", "adidas", "luxury", "cashmere", "wool"],
        premiumMultiplier: 3,
      },
      {
        name: "Furniture",
        patterns: ["table", "chair", "sofa", "desk", "bed", "dresser", "cabinet", "furniture"],
        basePrice: 125,
        premiumBrands: ["solid wood", "leather", "vintage", "antique", "handmade", "custom"],
        premiumMultiplier: 2.5,
      },
      {
        name: "Jewelry",
        patterns: ["ring", "necklace", "bracelet", "earrings", "watch", "jewelry"],
        basePrice: 75,
        premiumBrands: ["gold", "silver", "diamond", "platinum", "gemstone", "designer"],
        premiumMultiplier: 5,
      },
      {
        name: "Collectibles",
        patterns: ["collectible", "figure", "card", "comic", "statue", "limited edition"],
        basePrice: 60,
        premiumBrands: ["rare", "vintage", "limited", "exclusive", "signed", "numbered"],
        premiumMultiplier: 4,
      },
      {
        name: "Books",
        patterns: ["book", "novel", "textbook", "hardcover", "paperback"],
        basePrice: 15,
        premiumBrands: ["first edition", "signed", "rare", "collector", "vintage", "antique"],
        premiumMultiplier: 10,
      },
      {
        name: "Tools",
        patterns: ["tool", "drill", "saw", "hammer", "power tool", "toolbox"],
        basePrice: 45,
        premiumBrands: ["dewalt", "milwaukee", "makita", "professional", "industrial"],
        premiumMultiplier: 1.8,
      },
      {
        name: "Kitchen",
        patterns: ["kitchen", "appliance", "mixer", "blender", "cookware", "knife", "pot", "pan"],
        basePrice: 40,
        premiumBrands: ["kitchenaid", "cuisinart", "all-clad", "vitamix", "professional"],
        premiumMultiplier: 2,
      },
      {
        name: "Sports Equipment",
        patterns: ["bike", "bicycle", "golf", "tennis", "exercise", "fitness", "gym", "sports"],
        basePrice: 75,
        premiumBrands: ["specialized", "trek", "callaway", "wilson", "professional", "carbon"],
        premiumMultiplier: 2.2,
      },
      // Default category for items that don't match any patterns
      {
        name: "General",
        patterns: [],
        basePrice: 45,
        premiumBrands: ["premium", "high-end", "quality", "professional"],
        premiumMultiplier: 1.5,
      },
    ]

    // Find matching category
    let category = categories[categories.length - 1] // Default to General
    for (const cat of categories) {
      if (cat.patterns.some((pattern) => lowerDesc.includes(pattern))) {
        category = cat
        break
      }
    }

    // Start with base price from the category
    let price = category.basePrice

    // Check for premium brands/features
    const hasPremiumFeatures = category.premiumBrands.some((brand) => lowerDesc.includes(brand))
    if (hasPremiumFeatures) {
      price *= category.premiumMultiplier
    }

    // Check for condition
    if (
      lowerCondition.includes("new") ||
      lowerDesc.includes("new") ||
      lowerDesc.includes("sealed") ||
      lowerDesc.includes("unopened")
    ) {
      price *= 1.6
    } else if (
      lowerCondition.includes("like-new") ||
      lowerDesc.includes("like new") ||
      lowerDesc.includes("excellent")
    ) {
      price *= 1.35
    } else if (lowerCondition.includes("good") || lowerDesc.includes("good condition")) {
      price *= 1.05
    } else if (lowerCondition.includes("fair") || lowerDesc.includes("fair") || lowerDesc.includes("used")) {
      price *= 0.75
    } else if (
      lowerCondition.includes("poor") ||
      lowerDesc.includes("poor") ||
      lowerDesc.includes("damaged") ||
      lowerDesc.includes("broken") ||
      (issues && issues.length > 10)
    ) {
      price *= 0.35
    }

    // Add more variation to make prices look more natural
    const variationFactor = 0.8 + Math.random() * 0.4 // 0.8 to 1.2 range
    price = Math.round(price * variationFactor)

    // Ensure price is reasonable
    price = Math.max(5, price) // Minimum price is $5

    // Round prices to make them look more natural
    if (price > 1000) {
      price = Math.round(price / 100) * 100 // Round to nearest $100
    } else if (price > 200) {
      price = Math.round(price / 50) * 50 // Round to nearest $50
    } else if (price > 50) {
      price = Math.round(price / 10) * 10 // Round to nearest $10
    } else {
      price = Math.round(price / 5) * 5 // Round to nearest $5
    }

    return `$${price}`
  } catch (error) {
    console.error("Error in generateReliablePrice:", error)
    // Ultimate fallback - return a reasonable default price range
    return generateFallbackPrice(description, condition || "used")
  }
}

/**
 * Generates a fallback price estimate based on description length and keywords
 * @param description Item description
 * @param condition Item condition
 * @returns Estimated price range
 */
export function generateFallbackPrice(description: string, condition = "used"): string {
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

  // Check for specific categories
  const categoryDefinitions = [
    { keywords: ["electronics", "computer", "laptop", "phone", "tablet", "camera"], basePrice: 100 },
    { keywords: ["furniture", "sofa", "chair", "table", "desk", "bed"], basePrice: 80 },
    { keywords: ["clothing", "shirt", "pants", "dress", "jacket", "coat"], basePrice: 25 },
    { keywords: ["jewelry", "gold", "silver", "diamond", "ring", "necklace"], basePrice: 150 },
    { keywords: ["toy", "game", "puzzle", "lego", "action figure"], basePrice: 20 },
    { keywords: ["book", "novel", "textbook", "comic"], basePrice: 10 },
    { keywords: ["art", "painting", "sculpture", "print"], basePrice: 75 },
    { keywords: ["sports", "equipment", "bicycle", "golf", "tennis"], basePrice: 50 },
  ]

  // Check if the description matches any category
  for (const category of categoryDefinitions) {
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

/**
 * Extracts a numeric price from a price range string
 * @param priceRange Price range string (e.g., "$10-$20")
 * @returns Average price as a number
 */
export function extractAveragePrice(priceRange: string): number {
  const matches = priceRange.match(/\$(\d+)(?:\s*-\s*\$(\d+))?/)
  if (!matches) return 0

  const min = Number.parseInt(matches[1])
  const max = matches[2] ? Number.parseInt(matches[2]) : min

  return (min + max) / 2
}
