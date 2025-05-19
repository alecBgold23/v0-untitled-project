import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { generatePriceEstimate } from "@/lib/openai-browser"

// Simple in-memory cache
const priceCache: Record<string, { price: string; timestamp: number; confidence: number }> = {}
const CACHE_TTL = 30 * 86400000 // 30 days in milliseconds

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
          price: "$20-$50", // Default fallback price
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
          price: "$20-$50", // Default fallback price
          source: "fallback",
        },
        { status: 200 },
      )
    }

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

    // Get price estimate (this now uses the fallback directly)
    const priceRange = await generatePriceEstimate(description, condition)

    // Cache the price
    priceCache[cacheKey] = {
      price: priceRange,
      timestamp: Date.now(),
      confidence: 0.8, // Slightly lower confidence for algorithmic pricing
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
      source: "algorithm",
    })
  } catch (error: any) {
    console.error("Error in price-item API:", error)

    // Return a default fallback price
    return NextResponse.json(
      {
        error: error.message || "Error generating price estimate",
        price: "$20-$50", // Default fallback price
        source: "fallback",
      },
      { status: 200 },
    )
  }
}
