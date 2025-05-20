import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { generateAccuratePrice, detectCategory } from "@/lib/enhanced-pricing"

export async function POST(request: Request) {
  try {
    const { description, itemName, condition, defects, itemId } = await request.json()

    if (!description && !itemName) {
      return NextResponse.json({ error: "Description or item name is required" }, { status: 400 })
    }

    // Combine item name and description for better analysis
    const fullDescription = `${itemName || ""} ${description || ""}`.trim()

    // Log the request
    console.log(`Price estimation request at ${new Date().toISOString()}:`, {
      description: description?.substring(0, 50) + (description?.length > 50 ? "..." : ""),
      itemName,
      condition,
    })

    // First, try to get an accurate price from our enhanced pricing system
    try {
      const priceData = await generateAccuratePrice(
        description || "",
        itemName || "",
        condition || "used",
        defects || "",
      )

      const result = {
        price: priceData.price,
        source: priceData.source,
        confidence: priceData.confidence,
      }

      // If we have an item ID, save the price estimate to the database
      if (itemId && priceData.price) {
        try {
          const supabase = createServerSupabaseClient()
          await supabase
            .from("items")
            .update({
              estimated_price: priceData.price.replace(/^\$/, ""),
              price_source: priceData.source,
              price_confidence: priceData.confidence,
            })
            .eq("id", itemId)
        } catch (dbError) {
          console.error("Error saving price to database:", dbError)
          // Continue even if database update fails
        }
      }

      return NextResponse.json(result)
    } catch (priceError) {
      console.error("Error generating accurate price:", priceError)

      // Fall back to simpler price estimation
      try {
        // Use a simple algorithm-based estimate instead of OpenAI
        const { category, basePrice } = detectCategory(fullDescription)
        const roughEstimate = `$${Math.round(basePrice * 0.8)}-$${Math.round(basePrice * 1.2)}`

        return NextResponse.json({
          price: roughEstimate,
          source: "algorithm_fallback",
          confidence: 0.6,
        })
      } catch (fallbackError) {
        console.error("Error with fallback price estimation:", fallbackError)

        // Last resort - use a very basic estimate
        return NextResponse.json({
          price: "$20-$100",
          source: "basic_fallback",
          confidence: 0.4,
        })
      }
    }
  } catch (error) {
    console.error("Error in price-item API route:", error)
    return NextResponse.json(
      {
        price: "$20-$100",
        source: "error_fallback",
        confidence: 0.3,
        error: "Failed to estimate price, using fallback value",
      },
      { status: 200 },
    ) // Return 200 with fallback data instead of 500
  }
}
