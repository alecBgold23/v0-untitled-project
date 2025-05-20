import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getItemPriceEstimate, getEbayConditionId } from "@/lib/ebay-api"
import { generatePriceEstimateWithComparables, fallbackPriceEstimation } from "@/lib/openai-pricing"
import { generateCacheKey, getCachedData, cacheData } from "@/lib/ebay-cache"

export async function POST(request: Request) {
  try {
    const { description, itemName, condition, defects, itemId, category } = await request.json()

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
      category,
    })

    // Check cache first
    const cacheKey = generateCacheKey("price", {
      description: fullDescription,
      condition,
      category,
    })

    const cachedResult = getCachedData(cacheKey)
    if (cachedResult) {
      console.log("Using cached price estimation result")

      // If we have an item ID, save the price estimate to the database
      if (itemId && cachedResult.price) {
        try {
          const supabase = createServerSupabaseClient()
          await supabase
            .from("items")
            .update({
              estimated_price: cachedResult.price.replace(/^\$/, ""),
              price_source: cachedResult.source,
              price_confidence: cachedResult.confidence,
            })
            .eq("id", itemId)

          console.log("Saved cached price to database for item:", itemId)
        } catch (dbError) {
          console.error("Error saving cached price to database:", dbError)
          // Continue even if database update fails
        }
      }

      return NextResponse.json(cachedResult)
    }

    // Convert condition to eBay condition ID if possible
    const conditionId = getEbayConditionId(condition || "used")

    // Try to get eBay price data
    try {
      console.log("Fetching eBay price data...")
      const ebayPriceData = await getItemPriceEstimate(fullDescription, category, conditionId)

      if (ebayPriceData?.comparables && ebayPriceData.comparables.length > 0) {
        console.log(`Using ${ebayPriceData.comparables.length} eBay comparables for OpenAI pricing`)

        // Use OpenAI with eBay comparables
        const openAiEstimate = await generatePriceEstimateWithComparables(
          fullDescription,
          condition || "used",
          ebayPriceData.comparables,
        )

        const result = {
          price: `$${openAiEstimate.estimatedPrice.toFixed(2)}`,
          source: "ebay_openai",
          confidence: openAiEstimate.confidence === "high" ? 0.9 : openAiEstimate.confidence === "medium" ? 0.7 : 0.5,
          reasoning: openAiEstimate.reasoning,
          comparables: ebayPriceData.comparables.slice(0, 3), // Include a few comparables in the response
        }

        // Cache the result
        cacheData(cacheKey, result)

        // If we have an item ID, save the price estimate to the database
        if (itemId) {
          try {
            const supabase = createServerSupabaseClient()
            await supabase
              .from("items")
              .update({
                estimated_price: openAiEstimate.estimatedPrice.toFixed(2),
                price_source: "ebay_openai",
                price_confidence: result.confidence,
              })
              .eq("id", itemId)

            console.log("Saved eBay+OpenAI price to database for item:", itemId)
          } catch (dbError) {
            console.error("Error saving price to database:", dbError)
            // Continue even if database update fails
          }
        }

        return NextResponse.json(result)
      } else {
        console.log("No eBay comparables found, using fallback pricing")
      }
    } catch (ebayError) {
      console.error("Error getting price from eBay:", ebayError)
      // Fall back to OpenAI only
    }

    // Fallback to OpenAI only if eBay data is not available
    try {
      console.log("Using OpenAI fallback pricing without eBay data")
      const fallbackEstimate = await fallbackPriceEstimation(fullDescription, condition || "used")

      const result = {
        price: `$${fallbackEstimate.estimatedPrice.toFixed(2)}`,
        source: "openai_only",
        confidence: fallbackEstimate.confidence === "high" ? 0.8 : fallbackEstimate.confidence === "medium" ? 0.6 : 0.4,
        reasoning: fallbackEstimate.reasoning,
      }

      // Cache the result
      cacheData(cacheKey, result)

      // If we have an item ID, save the price estimate to the database
      if (itemId) {
        try {
          const supabase = createServerSupabaseClient()
          await supabase
            .from("items")
            .update({
              estimated_price: fallbackEstimate.estimatedPrice.toFixed(2),
              price_source: "openai_only",
              price_confidence: result.confidence,
            })
            .eq("id", itemId)

          console.log("Saved OpenAI-only price to database for item:", itemId)
        } catch (dbError) {
          console.error("Error saving price to database:", dbError)
          // Continue even if database update fails
        }
      }

      return NextResponse.json(result)
    } catch (openAiError) {
      console.error("Error with OpenAI fallback pricing:", openAiError)

      // Last resort - return a generic estimate
      return NextResponse.json({
        price: "$50-$100",
        source: "generic_fallback",
        confidence: 0.3,
        reasoning: "Unable to generate a specific estimate due to technical issues.",
      })
    }
  } catch (error) {
    console.error("Error in price-with-ebay API route:", error)
    return NextResponse.json({ error: "Failed to estimate price" }, { status: 500 })
  }
}
