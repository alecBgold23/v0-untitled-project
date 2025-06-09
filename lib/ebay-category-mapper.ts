/**
 * Comprehensive eBay Category Mapping System
 * Handles intelligent category selection with multiple fallback strategies
 */

interface CategorySuggestion {
  categoryId: string
  categoryName: string
  confidence: number
  source: "ebay_api" | "keyword_match" | "brand_match" | "fallback"
}

interface ItemAttributes {
  name: string
  description: string
  brand?: string
  condition?: string
  type?: string
}

/**
 * Smart category mapping based on keywords and patterns
 */
const CATEGORY_MAPPINGS = {
  // Electronics
  electronics: {
    // Mobile Phones
    "iphone|android|smartphone|cell phone|mobile phone": {
      categoryId: "9355",
      categoryName: "Cell Phones & Smartphones",
      keywords: ["phone", "iphone", "android", "smartphone", "mobile"],
    },

    // Tablets
    "ipad|tablet|kindle fire": {
      categoryId: "171485",
      categoryName: "Tablets & eBook Readers",
      keywords: ["ipad", "tablet", "kindle", "ebook"],
    },

    // Laptops
    "laptop|notebook|macbook|chromebook": {
      categoryId: "177",
      categoryName: "Laptops & Netbooks",
      keywords: ["laptop", "notebook", "macbook", "chromebook"],
    },

    // Desktop Computers
    "desktop|pc|computer tower|imac": {
      categoryId: "171957",
      categoryName: "Desktop & All-In-One Computers",
      keywords: ["desktop", "pc", "computer", "tower", "imac"],
    },

    // Gaming Consoles
    "playstation|xbox|nintendo|ps4|ps5|switch": {
      categoryId: "139971",
      categoryName: "Video Game Consoles",
      keywords: ["playstation", "xbox", "nintendo", "ps4", "ps5", "switch", "console"],
    },

    // Headphones
    "headphones|earbuds|airpods|beats": {
      categoryId: "15052",
      categoryName: "Headphones",
      keywords: ["headphones", "earbuds", "airpods", "beats", "audio"],
    },

    // Cameras
    "camera|canon|nikon|sony camera|dslr": {
      categoryId: "625",
      categoryName: "Digital Cameras",
      keywords: ["camera", "canon", "nikon", "sony", "dslr", "photography"],
    },

    // Smart Watches
    "apple watch|smartwatch|fitbit|garmin watch": {
      categoryId: "178893",
      categoryName: "Smart Watches",
      keywords: ["apple watch", "smartwatch", "fitbit", "garmin", "wearable"],
    },
  },

  // Clothing & Accessories
  clothing: {
    "shirt|t-shirt|blouse|top": {
      categoryId: "15687",
      categoryName: "Tops & Blouses",
      keywords: ["shirt", "t-shirt", "blouse", "top"],
    },

    "jeans|pants|trousers": {
      categoryId: "11554",
      categoryName: "Jeans",
      keywords: ["jeans", "pants", "trousers", "denim"],
    },

    "dress|gown": {
      categoryId: "63861",
      categoryName: "Dresses",
      keywords: ["dress", "gown", "formal"],
    },

    "shoes|sneakers|boots|heels": {
      categoryId: "95672",
      categoryName: "Athletic Shoes",
      keywords: ["shoes", "sneakers", "boots", "heels", "footwear"],
    },
  },

  // Home & Garden
  home: {
    "furniture|chair|table|sofa": {
      categoryId: "3197",
      categoryName: "Furniture",
      keywords: ["furniture", "chair", "table", "sofa", "desk"],
    },

    "kitchen|cookware|appliance": {
      categoryId: "20625",
      categoryName: "Small Kitchen Appliances",
      keywords: ["kitchen", "cookware", "appliance", "cooking"],
    },
  },

  // Collectibles
  collectibles: {
    "vintage|antique|collectible|rare": {
      categoryId: "1",
      categoryName: "Collectibles",
      keywords: ["vintage", "antique", "collectible", "rare", "classic"],
    },
  },

  // Books
  books: {
    "book|novel|textbook|manual": {
      categoryId: "267",
      categoryName: "Books",
      keywords: ["book", "novel", "textbook", "manual", "reading"],
    },
  },

  // Sports
  sports: {
    "golf|tennis|basketball|football|soccer": {
      categoryId: "888",
      categoryName: "Sporting Goods",
      keywords: ["golf", "tennis", "basketball", "football", "soccer", "sports"],
    },
  },
}

/**
 * Brand-specific category mappings
 */
const BRAND_CATEGORY_MAPPINGS = {
  apple: {
    iphone: "9355", // Cell Phones
    ipad: "171485", // Tablets
    macbook: "177", // Laptops
    imac: "171957", // Desktops
    "apple watch": "178893", // Smart Watches
    airpods: "15052", // Headphones
    default: "9355", // Default to phones for Apple
  },
  samsung: {
    galaxy: "9355", // Cell Phones
    tablet: "171485", // Tablets
    default: "9355",
  },
  sony: {
    playstation: "139971", // Gaming Consoles
    camera: "625", // Cameras
    headphones: "15052", // Headphones
    default: "625",
  },
  microsoft: {
    xbox: "139971", // Gaming Consoles
    surface: "171485", // Tablets
    default: "139971",
  },
  nintendo: {
    default: "139971", // Gaming Consoles
  },
}

/**
 * Fallback categories based on general item types
 */
const FALLBACK_CATEGORIES = {
  electronics: "293", // Consumer Electronics
  clothing: "11450", // Clothing, Shoes & Accessories
  home: "11700", // Home & Garden
  automotive: "6000", // eBay Motors
  books: "267", // Books
  toys: "220", // Toys & Hobbies
  sports: "888", // Sporting Goods
  jewelry: "281", // Jewelry & Watches
  health: "26395", // Health & Beauty
  business: "12576", // Business & Industrial
  default: "293", // Consumer Electronics as ultimate fallback
}

/**
 * Extract brand from item name/description
 */
function extractBrand(text: string): string | undefined {
  const normalizedText = text.toLowerCase()
  const brands = Object.keys(BRAND_CATEGORY_MAPPINGS)

  return brands.find((brand) => normalizedText.includes(brand.toLowerCase()))
}

/**
 * Calculate confidence score for a category suggestion
 */
function calculateConfidence(
  categoryName: string,
  itemAttributes: ItemAttributes,
  source: CategorySuggestion["source"],
): number {
  let confidence = 0

  // Base confidence by source
  switch (source) {
    case "ebay_api":
      confidence = 0.8
      break
    case "keyword_match":
      confidence = 0.7
      break
    case "brand_match":
      confidence = 0.6
      break
    case "fallback":
      confidence = 0.3
      break
  }

  // Boost confidence if category name contains item keywords
  const itemText = `${itemAttributes.name} ${itemAttributes.description}`.toLowerCase()
  const categoryWords = categoryName.toLowerCase().split(/[\s&-]+/)

  const matchingWords = categoryWords.filter((word) => word.length > 2 && itemText.includes(word))

  confidence += matchingWords.length * 0.1

  // Cap at 1.0
  return Math.min(confidence, 1.0)
}

/**
 * Find category using keyword matching
 */
function findCategoryByKeywords(itemAttributes: ItemAttributes): CategorySuggestion | null {
  const searchText = `${itemAttributes.name} ${itemAttributes.description}`.toLowerCase()

  for (const [categoryType, categories] of Object.entries(CATEGORY_MAPPINGS)) {
    for (const [pattern, categoryInfo] of Object.entries(categories)) {
      const regex = new RegExp(pattern, "i")
      if (regex.test(searchText)) {
        return {
          categoryId: categoryInfo.categoryId,
          categoryName: categoryInfo.categoryName,
          confidence: calculateConfidence(categoryInfo.categoryName, itemAttributes, "keyword_match"),
          source: "keyword_match",
        }
      }
    }
  }

  return null
}

/**
 * Find category using brand matching
 */
function findCategoryByBrand(itemAttributes: ItemAttributes): CategorySuggestion | null {
  const brand = extractBrand(`${itemAttributes.name} ${itemAttributes.description}`)
  if (!brand) return null

  const brandMapping = BRAND_CATEGORY_MAPPINGS[brand]
  if (!brandMapping) return null

  const itemText = `${itemAttributes.name} ${itemAttributes.description}`.toLowerCase()

  // Try to find specific product type for the brand
  for (const [productType, categoryId] of Object.entries(brandMapping)) {
    if (productType !== "default" && itemText.includes(productType)) {
      return {
        categoryId,
        categoryName: `${brand} ${productType}`,
        confidence: calculateConfidence(`${brand} ${productType}`, itemAttributes, "brand_match"),
        source: "brand_match",
      }
    }
  }

  // Use brand default
  return {
    categoryId: brandMapping.default,
    categoryName: `${brand} Products`,
    confidence: calculateConfidence(`${brand} Products`, itemAttributes, "brand_match"),
    source: "brand_match",
  }
}

/**
 * Get intelligent fallback category
 */
function getIntelligentFallback(itemAttributes: ItemAttributes): CategorySuggestion {
  const itemText = `${itemAttributes.name} ${itemAttributes.description}`.toLowerCase()

  // Try to determine general category type
  if (itemText.match(/phone|tablet|laptop|computer|electronic|tech|digital/)) {
    return {
      categoryId: FALLBACK_CATEGORIES.electronics,
      categoryName: "Consumer Electronics",
      confidence: 0.4,
      source: "fallback",
    }
  }

  if (itemText.match(/shirt|pants|dress|shoes|clothing|apparel/)) {
    return {
      categoryId: FALLBACK_CATEGORIES.clothing,
      categoryName: "Clothing & Accessories",
      confidence: 0.4,
      source: "fallback",
    }
  }

  if (itemText.match(/furniture|home|kitchen|garden|decor/)) {
    return {
      categoryId: FALLBACK_CATEGORIES.home,
      categoryName: "Home & Garden",
      confidence: 0.4,
      source: "fallback",
    }
  }

  if (itemText.match(/book|novel|textbook|manual|reading/)) {
    return {
      categoryId: FALLBACK_CATEGORIES.books,
      categoryName: "Books",
      confidence: 0.4,
      source: "fallback",
    }
  }

  if (itemText.match(/toy|game|puzzle|doll/)) {
    return {
      categoryId: FALLBACK_CATEGORIES.toys,
      categoryName: "Toys & Hobbies",
      confidence: 0.4,
      source: "fallback",
    }
  }

  // Ultimate fallback
  return {
    categoryId: FALLBACK_CATEGORIES.default,
    categoryName: "Consumer Electronics",
    confidence: 0.2,
    source: "fallback",
  }
}

/**
 * Validate eBay API category suggestion
 */
function validateEbaySuggestion(suggestion: any, itemAttributes: ItemAttributes): CategorySuggestion | null {
  if (!suggestion?.category?.categoryId || !suggestion?.category?.categoryName) {
    return null
  }

  const confidence = calculateConfidence(suggestion.category.categoryName, itemAttributes, "ebay_api")

  // Reject suggestions with very low confidence
  if (confidence < 0.3) {
    console.warn(`⚠️ Rejecting low-confidence eBay suggestion: ${suggestion.category.categoryName} (${confidence})`)
    return null
  }

  return {
    categoryId: suggestion.category.categoryId,
    categoryName: suggestion.category.categoryName,
    confidence,
    source: "ebay_api",
  }
}

/**
 * Get the best category for an item using multiple strategies
 */
export async function getOptimalCategory(
  itemAttributes: ItemAttributes,
  accessToken: string,
): Promise<CategorySuggestion> {
  const suggestions: CategorySuggestion[] = []

  // Strategy 1: Try eBay API suggestion
  try {
    const query = `${itemAttributes.name} ${itemAttributes.description}`.trim()
    const res = await fetch(
      `https://api.ebay.com/commerce/taxonomy/v1_beta/category_tree/0/get_category_suggestions?q=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "Accept-Language": "en-US",
        },
      },
    )

    if (res.ok) {
      const json = await res.json()
      if (json?.categorySuggestions?.length > 0) {
        // Validate and add multiple suggestions
        for (const suggestion of json.categorySuggestions.slice(0, 3)) {
          const validated = validateEbaySuggestion(suggestion, itemAttributes)
          if (validated) {
            suggestions.push(validated)
          }
        }
      }
    }
  } catch (error) {
    console.warn("⚠️ eBay category suggestion API failed:", error)
  }

  // Strategy 2: Keyword-based matching
  const keywordMatch = findCategoryByKeywords(itemAttributes)
  if (keywordMatch) {
    suggestions.push(keywordMatch)
  }

  // Strategy 3: Brand-based matching
  const brandMatch = findCategoryByBrand(itemAttributes)
  if (brandMatch) {
    suggestions.push(brandMatch)
  }

  // Strategy 4: Intelligent fallback
  const fallback = getIntelligentFallback(itemAttributes)
  suggestions.push(fallback)

  // Select the best suggestion based on confidence
  const bestSuggestion = suggestions.reduce((best, current) => (current.confidence > best.confidence ? current : best))

  console.log(`🎯 Category selection for "${itemAttributes.name}":`)
  console.log(`   Selected: ${bestSuggestion.categoryName} (${bestSuggestion.categoryId})`)
  console.log(`   Confidence: ${(bestSuggestion.confidence * 100).toFixed(1)}%`)
  console.log(`   Source: ${bestSuggestion.source}`)
  console.log(
    `   All suggestions:`,
    suggestions.map((s) => `${s.categoryName} (${(s.confidence * 100).toFixed(1)}% - ${s.source})`),
  )

  return bestSuggestion
}

/**
 * Legacy function for backward compatibility
 */
export async function getSuggestedCategoryId(query: string, accessToken: string): Promise<string> {
  const itemAttributes: ItemAttributes = {
    name: query,
    description: "",
  }

  const suggestion = await getOptimalCategory(itemAttributes, accessToken)
  return suggestion.categoryId
}
