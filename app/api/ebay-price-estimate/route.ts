import { NextResponse } from "next/server"
import { getItemPriceEstimate } from "@/lib/ebay-api"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()
    const { description, categoryId, condition, itemId } = body

    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 })
    }

    // Get price estimate from eBay
    const priceData = await getItemPriceEstimate(description, categoryId, condition)

    if (!priceData || !priceData.estimatedPrice) {
      return NextResponse.json(
        {
          error: "Unable to estimate price from eBay",
          fallbackPrice: generateFallbackPrice(description),
        },
        { status: 200 },
      )
    }

    // Format the price for display
    const formattedPrice = `$${priceData.estimatedPrice.value}`

    // If we have an itemId, save the price to the database
    if (itemId) {
      try {
        const supabase = createServerSupabaseClient()
        await supabase.from("sell_items").update({ estimated_price: formattedPrice }).eq("id", itemId)
      } catch (dbError) {
        console.error("Failed to save price to database:", dbError)
      }
    }

    return NextResponse.json({
      price: formattedPrice,
      currency: priceData.estimatedPrice.currency,
      referenceCount: priceData.totalReferences,
      references: priceData.referenceItems,
    })
  } catch (error: any) {
    console.error("Error estimating price from eBay:", error)

    // Return a fallback price
    return NextResponse.json(
      {
        error: "Error accessing eBay API",
        fallbackPrice: generateFallbackPrice(error.description || ""),
      },
      { status: 200 },
    )
  }
}

// Fallback price generator (simplified version of your existing algorithm)
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

  return `$${price}`
}
