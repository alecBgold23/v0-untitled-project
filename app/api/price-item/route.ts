import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { generatePriceEstimate } from "@/lib/openai"
import { hasOpenAIKey } from "@/lib/env"

// Simple in-memory cache
const priceCache: Record<string, { price: string; timestamp: number; confidence: number }> = {}
const CACHE_TTL = 30 * 86400000 // 30 days in milliseconds

// Fallback price generator
function generateFallbackPrice(description: string): string {
  // Simple algorithm to generate a reasonable price
  const basePrice = 50
  const words = description.split(/\s+/).filter(Boolean).length

  // Adjust price based on description length
  let price = basePrice + words * 2

  // Add some randomness
  price = Math.round(price * (0.85 + Math.random() * 0.3))

  // Round to nearest $5
  price = Math.round(price / 5) * 5

  // Create a price range
  const min = Math.floor(price * 0.8)
  const max = Math.ceil(price * 1.2)

  return `$${min}-$${max}`
}

export async function POST(request: Request) {
  let body: any = {}

  try {
    // Parse the request body
    try {
      body = await request.json()
    } catch (e) {
      console.error("Error parsing request body:", e)
      return NextResponse.json(
        {
          error: "Invalid request body",
          price: generateFallbackPrice(""),
          source: "fallback",
        },
        { status: 200 },
      )
    }

    const { description, condition, itemId } = body

    if (!description) {
      return NextResponse.json(
        {
          error: "Description is required",
          price: generateFallbackPrice(""),
          source: "fallback",
        },
        { status: 200 },
      )
    }

    // Always generate a fallback price first as a safety measure
    const fallbackPrice = generateFallbackPrice(description)

    // Generate cache key
    const cacheKey = `${description}_${condition || ""}`.trim().toLowerCase().substring(0, 150)

    // Check cache first
    const cachedResult = priceCache[cacheKey]
    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_TTL) {
      console.log("Using cached price estimate:", cachedResult.price, "confidence:", cachedResult.confidence)

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

      return NextResponse.json({
        price: cachedResult.price,
        source: "cache",
        confidence: cachedResult.confidence,
      })
    }

    // Check if OpenAI API key is available
    if (!hasOpenAIKey()) {
      console.warn("OpenAI API key is not configured, using fallback price generator")

      // If we have an itemId, save the price to the database
      if (itemId) {
        try {
          const supabase = createServerSupabaseClient()
          await supabase.from("sell_items").update({ estimated_price: fallbackPrice }).eq("id", itemId)
        } catch (dbError) {
          console.error("Failed to save fallback price to database:", dbError)
        }
      }

      return NextResponse.json({
        price: fallbackPrice,
        source: "fallback",
        confidence: 0.5,
      })
    }

    // Get price estimate from OpenAI
    try {
      const priceRange = await generatePriceEstimate(description, condition)

      // If we got a valid price range
      if (priceRange && priceRange.includes("$")) {
        // Cache the price
        priceCache[cacheKey] = {
          price: priceRange,
          timestamp: Date.now(),
          confidence: 1, // Assuming full confidence from OpenAI
        }

        // If we have an itemId, save the price to the database
        if (itemId) {
          try {
            const supabase = createServerSupabaseClient()
            await supabase.from("sell_items").update({ estimated_price: priceRange }).eq("id", itemId)
            console.log("Saved price to database for item:", itemId)
          } catch (dbError) {
            console.error("Failed to save price to database:", dbError)
          }
        }

        return NextResponse.json({
          price: priceRange,
          source: "openai",
        })
      } else {
        console.warn("OpenAI returned invalid price format, using fallback:", priceRange)

        // If we have an itemId, save the fallback price to the database
        if (itemId) {
          try {
            const supabase = createServerSupabaseClient()
            await supabase.from("sell_items").update({ estimated_price: fallbackPrice }).eq("id", itemId)
          } catch (dbError) {
            console.error("Failed to save fallback price to database:", dbError)
          }
        }

        return NextResponse.json({
          error: "Failed to generate price with OpenAI",
          price: fallbackPrice,
          source: "fallback",
        })
      }
    } catch (openaiError) {
      console.error("Error with OpenAI price estimation:", openaiError)

      // If we have an itemId, save the fallback price to the database
      if (itemId) {
        try {
          const supabase = createServerSupabaseClient()
          await supabase.from("sell_items").update({ estimated_price: fallbackPrice }).eq("id", itemId)
        } catch (dbError) {
          console.error("Failed to save fallback price to database:", dbError)
        }
      }

      return NextResponse.json({
        error: openaiError.message || "Error generating price estimate with OpenAI",
        price: fallbackPrice,
        source: "fallback",
      })
    }
  } catch (error: any) {
    console.error("Error in price-item API:", error)

    // Return a fallback price
    return NextResponse.json(
      {
        error: error.message || "Error generating price estimate",
        price: generateFallbackPrice(body?.description || ""),
        source: "fallback",
      },
      { status: 200 },
    )
  }
}
