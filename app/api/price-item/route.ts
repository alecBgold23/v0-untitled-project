import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getEbayOAuthToken } from "@/lib/ebay-auth"

// Cache to store recent price estimates
const priceCache: Record<string, { price: string; timestamp: number }> = {}
const CACHE_TTL = 86400000 // 24 hours in milliseconds

// Rate limiting settings
const API_CALL_INTERVAL = 10000 // 10 seconds between API calls
let lastApiCallTime = 0

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()
    const { description, itemId, name, condition, issues } = body

    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 })
    }

    // Generate cache key from description
    const cacheKey = description.trim().toLowerCase().substring(0, 100)

    // Check cache first
    const cachedResult = priceCache[cacheKey]
    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_TTL) {
      console.log("Using cached price estimate:", cachedResult.price)

      // If we have an itemId, save the cached price to the database
      if (itemId) {
        try {
          const supabase = createServerSupabaseClient()
          await supabase.from("sell_items").update({ estimated_price: cachedResult.price }).eq("id", itemId)
          console.log("Saved cached price to database for item:", itemId)
        } catch (dbError) {
          console.error("Failed to save cached price to database:", dbError)
        }
      }

      return NextResponse.json({ price: cachedResult.price })
    }

    // Generate a fallback price in case API calls fail
    const fallbackPrice = generateSinglePrice(description)
    console.log("Generated fallback price:", fallbackPrice)

    // Check if we can make an API call (not rate limited)
    const canMakeApiCall = Date.now() - lastApiCallTime > API_CALL_INTERVAL

    if (!canMakeApiCall) {
      console.log("Rate limited, using fallback price:", fallbackPrice)

      // Cache the fallback price
      priceCache[cacheKey] = { price: fallbackPrice, timestamp: Date.now() }

      // Save to database if we have an itemId
      if (itemId) {
        try {
          const supabase = createServerSupabaseClient()
          await supabase.from("sell_items").update({ estimated_price: fallbackPrice }).eq("id", itemId)
          console.log("Saved fallback price to database (rate limited)")
        } catch (dbError) {
          console.error("Failed to save fallback price to database:", dbError)
        }
      }

      return NextResponse.json({ price: fallbackPrice })
    }

    // Update last API call time
    lastApiCallTime = Date.now()

    // Try to get price from eBay first
    try {
      console.log("Attempting eBay API call...")

      // Create search query from available information
      const query = `${name || ""} ${description} ${condition || ""} ${issues || ""}`.trim()
      console.log("eBay search query:", query)

      // Get eBay OAuth token
      const ebayToken = await getEbayOAuthToken()

      // Call eBay Browse API
      const ebayRes = await fetch(
        `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${ebayToken}`,
            "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
            "Content-Type": "application/json",
          },
        },
      )

      if (!ebayRes.ok) {
        const errText = await ebayRes.text()
        console.error(`eBay API error (${ebayRes.status}):`, errText)
        throw new Error(`eBay API error: ${ebayRes.status}`)
      }

      const ebayData = await ebayRes.json()

      // Extract prices from eBay results
      const prices =
        ebayData.itemSummaries
          ?.map((item: any) => Number.parseFloat(item.price?.value))
          .filter((price: number) => !isNaN(price) && price > 0) || []

      if (prices.length > 0) {
        // Calculate average price from eBay results
        const avgPrice = (prices.reduce((a: number, b: number) => a + b, 0) / prices.length).toFixed(2)
        const finalPrice = `$${avgPrice}`
        console.log("eBay average price:", finalPrice, "from", prices.length, "items")

        // Cache the eBay price
        priceCache[cacheKey] = { price: finalPrice, timestamp: Date.now() }

        // Save to database if we have an itemId
        if (itemId) {
          try {
            const supabase = createServerSupabaseClient()
            await supabase.from("sell_items").update({ estimated_price: finalPrice }).eq("id", itemId)
            console.log("Saved eBay price to database for item:", itemId)
          } catch (dbError) {
            console.error("Failed to save eBay price to database:", dbError)
          }
        }

        return NextResponse.json({ price: finalPrice, source: "ebay", itemCount: prices.length })
      } else {
        console.log("No eBay results found, falling back to OpenAI")
      }
    } catch (ebayError) {
      console.error("Error during eBay API call:", ebayError)
      console.log("Falling back to OpenAI after eBay error")
    }

    // Try to use OpenAI as fallback
    if (process.env.PRICING_OPENAI_API_KEY) {
      try {
        console.log("Attempting OpenAI API call...")

        // Use a simple fetch to the OpenAI API
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.PRICING_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: `You are an expert in estimating the resale value of used items.
Only respond with a single price in USD like "$75". No ranges, no explanations.
Consider condition, brand, age, demand, depreciation.
Be realistic about the value - don't overestimate.
For common household items, prices should typically be $5-$100.
For electronics, consider age and condition heavily.
For collectibles, consider rarity and condition.`,
              },
              {
                role: "user",
                content: `Estimate the resale value of this item with a single price:
Name: ${name || "Unknown"}
Description: ${description}
Condition: ${condition || "Used"}
Issues: ${issues || "None"}`,
              },
            ],
            max_tokens: 10,
            temperature: 0.3,
          }),
        })

        // Check if the response is OK
        if (!response.ok) {
          console.log(`OpenAI API error (${response.status}), using fallback price`)
          throw new Error(`OpenAI API error: ${response.status}`)
        }

        // Parse the response data
        const data = await response.json()

        // Check for error in the response
        if (data.error) {
          console.log("OpenAI API returned an error, using fallback price")
          throw new Error(`OpenAI error: ${data.error.message}`)
        }

        // Validate the response structure
        if (
          !data ||
          !data.choices ||
          !Array.isArray(data.choices) ||
          data.choices.length === 0 ||
          !data.choices[0].message ||
          typeof data.choices[0].message.content !== "string"
        ) {
          console.log("Invalid OpenAI API response format, using fallback price")
          throw new Error("Invalid OpenAI response format")
        }

        // Extract the price from the response
        const aiPrice = data.choices[0].message.content.trim()
        console.log("OpenAI price estimate generated:", aiPrice)

        // Validate the AI price format (should be $X)
        const priceRegex = /\$\d+/
        const finalPrice = priceRegex.test(aiPrice) ? aiPrice : fallbackPrice

        if (finalPrice !== aiPrice) {
          console.log("AI price didn't match expected format, using fallback price")
        }

        // Cache the final price
        priceCache[cacheKey] = { price: finalPrice, timestamp: Date.now() }

        // Update the price in the database with the final price
        if (itemId) {
          try {
            const supabase = createServerSupabaseClient()
            await supabase.from("sell_items").update({ estimated_price: finalPrice }).eq("id", itemId)
            console.log("Updated with OpenAI price in database for item:", itemId)
          } catch (dbError) {
            console.error("Failed to update OpenAI price in database:", dbError)
          }
        }

        return NextResponse.json({ price: finalPrice, source: "openai" })
      } catch (apiError) {
        console.error("Error during OpenAI API call:", apiError)
        console.log("Using fallback price after OpenAI error:", fallbackPrice)
      }
    } else {
      console.log("No OpenAI API key available, using fallback price")
    }

    // If we get here, both eBay and OpenAI failed or weren't available
    // Cache the fallback price
    priceCache[cacheKey] = { price: fallbackPrice, timestamp: Date.now() }

    // Save to database if we have an itemId
    if (itemId) {
      try {
        const supabase = createServerSupabaseClient()
        await supabase.from("sell_items").update({ estimated_price: fallbackPrice }).eq("id", itemId)
        console.log("Saved fallback price to database after API failures")
      } catch (dbError) {
        console.error("Failed to save fallback price to database:", dbError)
      }
    }

    return NextResponse.json({ price: fallbackPrice, source: "algorithm" })
  } catch (error: any) {
    console.error("Error estimating price:", error)
    // Return a default fallback price in case of any error
    return NextResponse.json({ price: "$50", source: "default" })
  }
}

// Helper function to generate a single price estimate
function generateSinglePrice(description: string): string {
  const lowerDesc = description.toLowerCase()

  // Define category patterns and their base prices
  const categories = [
    {
      name: "Smartphones",
      patterns: ["iphone", "samsung", "pixel", "android phone", "smartphone"],
      basePrice: 150,
      premiumBrands: ["iphone", "samsung", "pixel", "pro", "max", "ultra"],
      premiumMultiplier: 2.5,
      ageImpact: 0.7, // Loses value quickly
    },
    {
      name: "Laptops",
      patterns: ["laptop", "macbook", "notebook", "chromebook"],
      basePrice: 250,
      premiumBrands: ["macbook", "pro", "air", "gaming", "alienware", "razer", "asus rog"],
      premiumMultiplier: 2,
      ageImpact: 0.6,
    },
    {
      name: "Tablets",
      patterns: ["ipad", "tablet", "surface", "galaxy tab", "kindle"],
      basePrice: 120,
      premiumBrands: ["ipad", "pro", "air", "surface", "samsung"],
      premiumMultiplier: 1.8,
      ageImpact: 0.7,
    },
    {
      name: "Cameras",
      patterns: ["camera", "dslr", "mirrorless", "canon", "nikon", "sony"],
      basePrice: 200,
      premiumBrands: ["sony", "canon", "nikon", "professional", "mirrorless"],
      premiumMultiplier: 2.2,
      ageImpact: 0.5,
    },
    {
      name: "TVs",
      patterns: ["tv", "television", "smart tv", "4k", "oled", "qled", "led tv"],
      basePrice: 200,
      premiumBrands: ["oled", "qled", "samsung", "lg", "sony", "65", "75"],
      premiumMultiplier: 2,
      ageImpact: 0.6,
    },
    {
      name: "Audio Equipment",
      patterns: ["headphones", "earbuds", "speaker", "soundbar", "airpods", "beats"],
      basePrice: 75,
      premiumBrands: ["bose", "sony", "airpods", "beats", "sennheiser", "pro"],
      premiumMultiplier: 1.7,
      ageImpact: 0.8,
    },
    {
      name: "Gaming",
      patterns: ["playstation", "ps4", "ps5", "xbox", "nintendo", "switch", "gaming"],
      basePrice: 200,
      premiumBrands: ["ps5", "series x", "oled", "pro", "limited edition"],
      premiumMultiplier: 1.5,
      ageImpact: 0.7,
    },
    {
      name: "Clothing",
      patterns: ["shirt", "pants", "dress", "jacket", "coat", "shoes", "boots", "clothing"],
      basePrice: 30,
      premiumBrands: ["designer", "leather", "nike", "adidas", "luxury", "cashmere", "wool"],
      premiumMultiplier: 3,
      ageImpact: 0.9,
    },
    {
      name: "Furniture",
      patterns: ["table", "chair", "sofa", "desk", "bed", "dresser", "cabinet", "furniture"],
      basePrice: 125,
      premiumBrands: ["solid wood", "leather", "vintage", "antique", "handmade", "custom"],
      premiumMultiplier: 2.5,
      ageImpact: 0.9, // Good furniture holds value
    },
    {
      name: "Jewelry",
      patterns: ["ring", "necklace", "bracelet", "earrings", "watch", "jewelry"],
      basePrice: 75,
      premiumBrands: ["gold", "silver", "diamond", "platinum", "gemstone", "designer"],
      premiumMultiplier: 5,
      ageImpact: 0.95, // Jewelry holds value well
    },
    {
      name: "Collectibles",
      patterns: ["collectible", "figure", "card", "comic", "statue", "limited edition"],
      basePrice: 60,
      premiumBrands: ["rare", "vintage", "limited", "exclusive", "signed", "numbered"],
      premiumMultiplier: 4,
      ageImpact: 1.1, // Can increase with age
    },
    {
      name: "Books",
      patterns: ["book", "novel", "textbook", "hardcover", "paperback"],
      basePrice: 15,
      premiumBrands: ["first edition", "signed", "rare", "collector", "vintage", "antique"],
      premiumMultiplier: 10,
      ageImpact: 1.05, // Can increase with age
    },
    {
      name: "Tools",
      patterns: ["tool", "drill", "saw", "hammer", "power tool", "toolbox"],
      basePrice: 45,
      premiumBrands: ["dewalt", "milwaukee", "makita", "professional", "industrial"],
      premiumMultiplier: 1.8,
      ageImpact: 0.8,
    },
    {
      name: "Kitchen",
      patterns: ["kitchen", "appliance", "mixer", "blender", "cookware", "knife", "pot", "pan"],
      basePrice: 40,
      premiumBrands: ["kitchenaid", "cuisinart", "all-clad", "vitamix", "professional"],
      premiumMultiplier: 2,
      ageImpact: 0.85,
    },
    {
      name: "Sports Equipment",
      patterns: ["bike", "bicycle", "golf", "tennis", "exercise", "fitness", "gym", "sports"],
      basePrice: 75,
      premiumBrands: ["specialized", "trek", "callaway", "wilson", "professional", "carbon"],
      premiumMultiplier: 2.2,
      ageImpact: 0.75,
    },
    // Default category for items that don't match any patterns
    {
      name: "General",
      patterns: [],
      basePrice: 45,
      premiumBrands: ["premium", "high-end", "quality", "professional"],
      premiumMultiplier: 1.5,
      ageImpact: 0.8,
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
  if (lowerDesc.includes("new") || lowerDesc.includes("sealed") || lowerDesc.includes("unopened")) {
    price *= 1.6
  } else if (lowerDesc.includes("like new") || lowerDesc.includes("excellent condition")) {
    price *= 1.35
  } else if (lowerDesc.includes("good condition")) {
    price *= 1.05
  } else if (lowerDesc.includes("fair condition") || lowerDesc.includes("used")) {
    price *= 0.75
  } else if (lowerDesc.includes("poor") || lowerDesc.includes("damaged") || lowerDesc.includes("broken")) {
    price *= 0.35
  }

  // Check for age indicators
  if (lowerDesc.includes("new") || lowerDesc.includes("2023") || lowerDesc.includes("2024")) {
    // Recent items hold value better
    price *= 1.25
  } else if (lowerDesc.includes("2020") || lowerDesc.includes("2021") || lowerDesc.includes("2022")) {
    // Slightly older
    price *= 1.0
  } else if (lowerDesc.includes("2018") || lowerDesc.includes("2019")) {
    // Older
    price *= category.ageImpact
  } else if (lowerDesc.includes("2015") || lowerDesc.includes("2016") || lowerDesc.includes("2017")) {
    // Much older
    price *= category.ageImpact * 0.8
  } else if (lowerDesc.match(/20(0|1)[0-9]/)) {
    // Very old (2000-2014)
    price *= category.ageImpact * 0.6
  }

  // Check for vintage/antique (which can increase value)
  if (
    (lowerDesc.includes("vintage") || lowerDesc.includes("antique") || lowerDesc.includes("retro")) &&
    (category.name === "Collectibles" || category.name === "Furniture" || category.name === "Jewelry")
  ) {
    price *= 2.0
  }

  // Add some randomness (±15%)
  const randomFactor = 0.85 + Math.random() * 0.3
  price = Math.round(price * randomFactor)

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
}
