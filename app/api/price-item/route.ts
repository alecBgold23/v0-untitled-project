import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

/**
 * Generates a fallback price estimate based on description length and keywords
 */
function generateFallbackPrice(description = "", condition = "used"): string {
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

/**
 * Save price estimate to Supabase
 */
async function savePriceToSupabase(
  itemId: string | null | undefined,
  price: string,
  source: string,
  confidence: number,
  itemName?: string,
  description?: string,
) {
  if (!itemId) {
    console.log("No item ID provided, creating new item record")

    try {
      const supabase = createServerSupabaseClient()

      // Create a new item record
      const { data, error } = await supabase
        .from("items")
        .insert({
          item_name: itemName || "Unnamed Item",
          description: description || "",
          estimated_price: price.replace(/^\$/, ""),
          price_source: source,
          price_confidence: confidence,
          created_at: new Date().toISOString(),
        })
        .select()

      if (error) {
        console.error("Error creating new item record:", error)
        return { success: false, error }
      }

      console.log("Created new item record:", data)
      return { success: true, data }
    } catch (error) {
      console.error("Error saving to Supabase:", error)
      return { success: false, error }
    }
  } else {
    console.log("Updating existing item record:", itemId)

    try {
      const supabase = createServerSupabaseClient()

      // Update existing item record
      const { data, error } = await supabase
        .from("items")
        .update({
          estimated_price: price.replace(/^\$/, ""),
          price_source: source,
          price_confidence: confidence,
          updated_at: new Date().toISOString(),
        })
        .eq("id", itemId)
        .select()

      if (error) {
        console.error("Error updating item record:", error)
        return { success: false, error }
      }

      console.log("Updated item record:", data)
      return { success: true, data }
    } catch (error) {
      console.error("Error saving to Supabase:", error)
      return { success: false, error }
    }
  }
}

export async function POST(request: Request) {
  try {
    const { description, itemName, condition, defects, itemId, category } = await request.json()

    if (!description && !itemName) {
      return NextResponse.json({ error: "Description or item name is required" }, { status: 400 })
    }

    // Combine item name and description for better analysis
    const fullDescription = `${itemName || ""} ${description || ""}`.trim()

    console.log(`Price estimation request at ${new Date().toISOString()}:`, {
      description: description?.substring(0, 50) + (description?.length > 50 ? "..." : ""),
      itemName,
      condition,
      itemId,
    })

    const prompt = `
You are a professional appraiser for used consumer items. Estimate a fair market resale price in USD for the following item. 
Be concise and return only the number, no dollar sign or explanation.

Item description: ${fullDescription}
Condition: ${condition || "used"}
${defects ? `Defects: ${defects}` : ""}
`

    const openAiKey = process.env.PRICING_OPENAI_API_KEY

    if (!openAiKey) {
      console.error("Missing PRICING_OPENAI_API_KEY")
      const fallbackPrice = generateFallbackPrice(fullDescription, condition)

      // Save fallback price to Supabase
      await savePriceToSupabase(itemId, fallbackPrice, "fallback_no_api_key", 0.4, itemName, description)

      return NextResponse.json({
        price: fallbackPrice,
        source: "fallback_no_api_key",
        confidence: 0.4,
        error: "Missing API key - using fallback price",
        savedToSupabase: true,
      })
    }

    try {
      console.log("Making request to OpenAI API...")

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openAiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo", // Using gpt-3.5-turbo for cost efficiency
          messages: [
            {
              role: "system",
              content: "You are an expert in pricing used consumer goods. Only return a price estimate as a number.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 10,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("OpenAI API error:", errorData)
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      console.log("OpenAI API response:", data)

      if (!data.choices || data.choices.length === 0) {
        throw new Error("Invalid response from OpenAI API")
      }

      const priceText = data.choices[0]?.message?.content?.trim() || "0"
      const priceNumber = Number.parseFloat(priceText.replace(/[^0-9.]/g, ""))
      const formattedPrice = `$${priceNumber.toFixed(2)}`

      console.log("Generated price estimate:", formattedPrice)

      // Save price to Supabase
      const saveResult = await savePriceToSupabase(itemId, formattedPrice, "openai", 0.8, itemName, description)

      // Generate mock comparable items
      const comparableItems = generateMockComparables(fullDescription, priceNumber, condition || "used")

      return NextResponse.json({
        price: formattedPrice,
        source: "openai",
        confidence: 0.8,
        comparableItems,
        savedToSupabase: saveResult.success,
        supabaseData: saveResult.data,
      })
    } catch (error) {
      console.error("OpenAI request failed:", error)
      const fallbackPrice = generateFallbackPrice(fullDescription, condition)

      // Save fallback price to Supabase
      const saveResult = await savePriceToSupabase(
        itemId,
        fallbackPrice,
        "fallback_api_error",
        0.5,
        itemName,
        description,
      )

      return NextResponse.json({
        price: fallbackPrice,
        source: "fallback_api_error",
        confidence: 0.5,
        error: "API request failed - using fallback price",
        savedToSupabase: saveResult.success,
      })
    }
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json(
      {
        price: "$0.00",
        source: "error",
        confidence: 0,
        error: "Server error",
        savedToSupabase: false,
      },
      { status: 500 },
    )
  }
}
