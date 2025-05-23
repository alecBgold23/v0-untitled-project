/**
 * Technology pricing database with known prices for common tech items
 */
export const TECH_PRICE_DATABASE: Record<string, number> = {
  // Apple MacBooks - exact matches
  "macbook air 13 m4": 1000,
  "macbook air 13-inch m4": 1000,
  "macbook air 13 inch m4": 1000,
  "macbook air m4": 1000,
  "macbook air 13 m3": 900,
  "macbook air 13-inch m3": 900,
  "macbook air 13 inch m3": 900,
  "macbook air m3": 900,
  "macbook air 13 m2": 800,
  "macbook air 13-inch m2": 800,
  "macbook air 13 inch m2": 800,
  "macbook air m2": 800,
  "macbook air 13 m1": 700,
  "macbook air 13-inch m1": 700,
  "macbook air 13 inch m1": 700,
  "macbook air m1": 700,
  "macbook air 15 m3": 1100,
  "macbook air 15-inch m3": 1100,
  "macbook air 15 inch m3": 1100,
  "macbook air 15 m2": 1000,
  "macbook air 15-inch m2": 1000,
  "macbook air 15 inch m2": 1000,
  "macbook pro 14 m3": 1600,
  "macbook pro 14-inch m3": 1600,
  "macbook pro 14 inch m3": 1600,
  "macbook pro 14 m2": 1400,
  "macbook pro 14-inch m2": 1400,
  "macbook pro 14 inch m2": 1400,
  "macbook pro 14 m1": 1200,
  "macbook pro 14-inch m1": 1200,
  "macbook pro 14 inch m1": 1200,
  "macbook pro 16 m3": 2000,
  "macbook pro 16-inch m3": 2000,
  "macbook pro 16 inch m3": 2000,
  "macbook pro 16 m2": 1800,
  "macbook pro 16-inch m2": 1800,
  "macbook pro 16 inch m2": 1800,
  "macbook pro 16 m1": 1600,
  "macbook pro 16-inch m1": 1600,
  "macbook pro 16 inch m1": 1600,

  // Apple iPhones
  "iphone 15 pro max": 1100,
  "iphone 15 pro": 1000,
  "iphone 15 plus": 900,
  "iphone 15": 800,
  "iphone 14 pro max": 900,
  "iphone 14 pro": 800,
  "iphone 14 plus": 700,
  "iphone 14": 600,
  "iphone 13 pro max": 700,
  "iphone 13 pro": 600,
  "iphone 13": 500,
  "iphone 12": 400,
  "iphone 11": 300,

  // Apple iPads
  "ipad pro 12.9 m2": 1000,
  "ipad pro 11 m2": 800,
  "ipad air m2": 600,
  "ipad 10th gen": 400,
  "ipad mini 6": 500,

  // Samsung phones
  "samsung galaxy s24 ultra": 1200,
  "samsung galaxy s24 plus": 1000,
  "samsung galaxy s24": 800,
  "samsung galaxy s23 ultra": 900,
  "samsung galaxy s23 plus": 800,
  "samsung galaxy s23": 700,
  "samsung galaxy s22": 600,

  // Other popular tech
  "airpods pro 2": 200,
  "airpods 3": 150,
  "apple watch series 9": 400,
  "apple watch ultra 2": 800,
  "samsung galaxy watch 6": 300,
  "meta quest 3": 500,
  "playstation 5": 500,
  "xbox series x": 500,
  "nintendo switch oled": 350,
  "nintendo switch": 300,
}

/**
 * Check if an item is a technology item based on keywords
 */
export function isTechItem(description: string): boolean {
  const techKeywords = [
    "macbook",
    "laptop",
    "computer",
    "pc",
    "desktop",
    "iphone",
    "smartphone",
    "phone",
    "ipad",
    "tablet",
    "airpods",
    "headphones",
    "earbuds",
    "watch",
    "smart watch",
    "tv",
    "monitor",
    "gaming",
    "console",
    "playstation",
    "xbox",
    "nintendo",
    "switch",
    "processor",
    "cpu",
    "gpu",
    "graphics card",
    "ssd",
    "hard drive",
    "ram",
    "memory",
  ]

  const lowerDesc = description.toLowerCase()
  return techKeywords.some((keyword) => lowerDesc.includes(keyword))
}

/**
 * Get price from tech database if item matches
 */
export function getTechDatabasePrice(description: string, condition: string): number | null {
  const lowerDesc = description.toLowerCase()
  console.log("Checking tech database for:", lowerDesc)

  // Try to find exact matches first
  for (const [key, price] of Object.entries(TECH_PRICE_DATABASE)) {
    if (lowerDesc.includes(key)) {
      console.log(`Found match for "${key}" with price ${price}`)
      // Apply condition-based adjustments
      return adjustPriceForCondition(price, condition)
    }
  }

  // Try to match MacBook Air with M4
  if ((lowerDesc.includes("macbook air") || lowerDesc.includes("macbook air 13")) && lowerDesc.includes("m4")) {
    console.log("Matched MacBook Air M4")
    return adjustPriceForCondition(1000, condition)
  }

  // Try to match MacBook Air with M3
  if ((lowerDesc.includes("macbook air") || lowerDesc.includes("macbook air 13")) && lowerDesc.includes("m3")) {
    console.log("Matched MacBook Air M3")
    return adjustPriceForCondition(900, condition)
  }

  // Try to match MacBook Air with M2
  if ((lowerDesc.includes("macbook air") || lowerDesc.includes("macbook air 13")) && lowerDesc.includes("m2")) {
    console.log("Matched MacBook Air M2")
    return adjustPriceForCondition(800, condition)
  }

  // Try to match MacBook Air with M1
  if ((lowerDesc.includes("macbook air") || lowerDesc.includes("macbook air 13")) && lowerDesc.includes("m1")) {
    console.log("Matched MacBook Air M1")
    return adjustPriceForCondition(700, condition)
  }

  // Try to match partial tech items
  // For example, if someone just says "MacBook Air" without specifying model
  if (
    lowerDesc.includes("macbook air") &&
    !lowerDesc.includes("m1") &&
    !lowerDesc.includes("m2") &&
    !lowerDesc.includes("m3") &&
    !lowerDesc.includes("m4")
  ) {
    console.log("Matched generic MacBook Air")
    // Default to newest model with a slight discount
    return adjustPriceForCondition(900, condition) // Assuming M3 is newest at $900
  }

  if (
    lowerDesc.includes("macbook pro") &&
    !lowerDesc.includes("m1") &&
    !lowerDesc.includes("m2") &&
    !lowerDesc.includes("m3") &&
    !lowerDesc.includes("m4")
  ) {
    console.log("Matched generic MacBook Pro")
    // Default to 14" newest model with a slight discount
    return adjustPriceForCondition(1500, condition) // Assuming M3 14" is $1600
  }

  if (
    lowerDesc.includes("iphone") &&
    !lowerDesc.includes("11") &&
    !lowerDesc.includes("12") &&
    !lowerDesc.includes("13") &&
    !lowerDesc.includes("14") &&
    !lowerDesc.includes("15")
  ) {
    console.log("Matched generic iPhone")
    // Default to iPhone 13 if no model specified
    return adjustPriceForCondition(500, condition)
  }

  console.log("No tech database match found")
  return null
}

/**
 * Adjust price based on condition
 */
export function adjustPriceForCondition(basePrice: number, condition: string): number {
  const conditionLower = condition.toLowerCase()
  console.log(`Adjusting price ${basePrice} for condition: ${conditionLower}`)

  // Condition multipliers
  const multipliers: Record<string, number> = {
    new: 1.0,
    "brand new": 1.0,
    "like new": 0.9,
    excellent: 0.8,
    "very good": 0.7,
    good: 0.6,
    fair: 0.5,
    poor: 0.4,
    "for parts": 0.2,
  }

  // Find the best matching condition
  for (const [condKey, multiplier] of Object.entries(multipliers)) {
    if (conditionLower.includes(condKey)) {
      const adjustedPrice = Math.round(basePrice * multiplier)
      console.log(`Applied ${condKey} multiplier (${multiplier}): ${adjustedPrice}`)
      return adjustedPrice
    }
  }

  // Default to "good" condition if not specified
  const defaultPrice = Math.round(basePrice * 0.6)
  console.log(`Applied default "good" multiplier (0.6): ${defaultPrice}`)
  return defaultPrice
}

/**
 * Generate tech-specific comparable items
 */
export function generateTechComparables(
  description: string,
  price: number,
  condition: string,
): Array<{
  title: string
  price: { value: string; currency: string }
  condition: string
  url?: string
}> {
  const lowerDesc = description.toLowerCase()

  if (lowerDesc.includes("macbook")) {
    // Generate MacBook comparables
    return [
      {
        title: lowerDesc.includes("air")
          ? 'Apple MacBook Air 13" (Previous Generation)'
          : "Apple MacBook Pro (Previous Generation)",
        price: { value: `${Math.round(price * 0.8)}`, currency: "USD" },
        condition: condition,
        url: "https://example.com/macbook-previous",
      },
      {
        title: lowerDesc.includes("air")
          ? 'Apple MacBook Air 13" (Same Model, Different Specs)'
          : "Apple MacBook Pro (Same Model, Different Specs)",
        price: { value: `${Math.round(price * 0.9)}`, currency: "USD" },
        condition: condition,
        url: "https://example.com/macbook-different-specs",
      },
      {
        title: lowerDesc.includes("air") ? 'Apple MacBook Air 13" (Refurbished)' : "Apple MacBook Pro (Refurbished)",
        price: { value: `${Math.round(price * 0.85)}`, currency: "USD" },
        condition: "Refurbished",
        url: "https://example.com/macbook-refurbished",
      },
    ]
  }

  if (lowerDesc.includes("iphone")) {
    // Generate iPhone comparables
    return [
      {
        title: "Apple iPhone (Previous Generation, Same Size)",
        price: { value: `${Math.round(price * 0.8)}`, currency: "USD" },
        condition: condition,
        url: "https://example.com/iphone-previous",
      },
      {
        title: "Apple iPhone (Same Model, Different Storage)",
        price: { value: `${Math.round(price * 0.9)}`, currency: "USD" },
        condition: condition,
        url: "https://example.com/iphone-different-storage",
      },
      {
        title: "Apple iPhone (Certified Refurbished)",
        price: { value: `${Math.round(price * 0.85)}`, currency: "USD" },
        condition: "Refurbished",
        url: "https://example.com/iphone-refurbished",
      },
    ]
  }

  // Default tech comparables
  return [
    {
      title: "Similar Tech Item (Previous Model)",
      price: { value: `${Math.round(price * 0.8)}`, currency: "USD" },
      condition: condition,
      url: "https://example.com/tech-previous",
    },
    {
      title: "Similar Tech Item (Different Brand)",
      price: { value: `${Math.round(price * 0.9)}`, currency: "USD" },
      condition: condition,
      url: "https://example.com/tech-different-brand",
    },
    {
      title: "Similar Tech Item (Refurbished)",
      price: { value: `${Math.round(price * 0.85)}`, currency: "USD" },
      condition: "Refurbished",
      url: "https://example.com/tech-refurbished",
    },
  ]
}
