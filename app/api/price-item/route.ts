import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { generateAccuratePrice, detectCategory } from "@/lib/enhanced-pricing"
import { getPriceEstimate } from "@/lib/openai-browser"
import { getItemPriceEstimate, getEbayConditionId } from "@/lib/ebay-api"
import { generatePriceEstimateWithComparables } from "@/lib/openai-pricing"
import { generateCacheKey, getCachedData, cacheData } from "@/lib/ebay-cache"

export async function POST(request: Request) {
  try {
    const { description, itemName, condition, defects, itemId, category } = await request.json()

    if (!description && !itemName) {
      console.warn("⚠️ Missing description and itemName in request.")
      return NextResponse.json({ error: "Description or item name is required" }, { status: 400 })
    }

    const fullDescription = `${itemName || ""} ${description || ""}`.trim()

    console.log(`🟢 [Pricing Request] - ${new Date().toISOString()}`)
    console.log("📝 Input Data:", { itemName, description, condition, category, defects, itemId })
    console.log("🔤 Full Description:", fullDescription)

    const cacheKey = generateCacheKey("price", {
      description: fullDescription,
      condition,
      category,
    })
    console.log("🔑 Cache Key:", cacheKey)

    const cachedResult = getCachedData(cacheKey)
    if (cachedResult) {
      console.log("📦 Using cached price:", cachedResult)

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

          console.log("💾 Saved cached price to DB for item:", itemId)
        } catch (dbError) {
          console.error("❌ Error saving cached price to DB:", dbError)
        }
      }

      return NextResponse.json(cachedResult)
    }

    const conditionId = getEbayConditionId(condition || "used")
    console.log("🔢 eBay Condition ID:", conditionId)

    try {
      console.log("🔍 Fetching eBay price data...")
      const ebayPriceData = await getItemPriceEstimate(fullDescription, category, conditionId)

      console.log("📊 eBay price data received:", ebayPriceData)

      if (ebayPriceData?.comparables?.length > 0) {
        console.log(`✅ Found ${ebayPriceData.comparables.length} eBay comparables`)

        const openAiEstimate = await generatePriceEstimateWithComparables(
          fullDescription,
          condition || "used",
          ebayPriceData.comparables,
        )

        console.log("🤖 OpenAI price estimate from eBay comparables:", openAiEstimate)

        const result = {
          price: `$${openAiEstimate.estimatedPrice.toFixed(2)}`,
          source: "ebay_openai",
          confidence: openAiEstimate.confidence === "high" ? 0.9 : openAiEstimate.confidence === "medium" ? 0.7 : 0.5,
          reasoning: openAiEstimate.reasoning,
          comparables: ebayPriceData.comparables.slice(0, 3),
        }

        cacheData(cacheKey, result)

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

            console.log("💾 Saved eBay+OpenAI price to DB for item:", itemId)
          } catch (dbError) {
            console.error("❌ Error saving eBay+OpenAI price to DB:", dbError)
          }
        }

        return NextResponse.json(result)
      } else {
        console.warn("⚠️ No eBay comparables found, falling back...")
      }
    } catch (ebayError) {
      console.error("❌ Error fetching from eBay:", ebayError)
    }

    try {
      console.log("🧠 Running enhanced OpenAI pricing fallback...")
      const priceData = await generateAccuratePrice(
        description || "",
        itemName || "",
        condition || "used",
        defects || "",
      )

      console.log("🎯 Enhanced price result:", priceData)

      const result = {
        price: priceData.price,
        source: priceData.source,
        confidence: priceData.confidence,
      }

      cacheData(cacheKey, result)

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

          console.log("💾 Saved enhanced price to DB for item:", itemId)
        } catch (dbError) {
          console.error("❌ Error saving enhanced price to DB:", dbError)
        }
      }

      return NextResponse.json(result)
    } catch (priceError) {
      console.error("❌ Error generating enhanced price:", priceError)

      try {
        console.log("🔄 Using basic OpenAI fallback pricing...")
        const estimatedPrice = await getPriceEstimate(fullDescription, condition || "used")

        const result = {
          price: estimatedPrice,
          source: "fallback",
          confidence: 0.6,
        }

        cacheData(cacheKey, result)

        return NextResponse.json(result)
      } catch (fallbackError) {
        console.error("🔥 Final fallback failed:", fallbackError)

        const { category, basePrice } = detectCategory(fullDescription)
        const roughEstimate = `$${Math.round(basePrice * 0.8)}-$${Math.round(basePrice * 1.2)}`

        console.log("📉 Returning basic range estimate:", roughEstimate)

        return NextResponse.json({
          price: roughEstimate,
          source: "basic_fallback",
          confidence: 0.4,
        })
      }
    }
  } catch (error) {
    console.error("❌ Fatal error in pricing route:", error)
    return NextResponse.json({ error: "Failed to estimate price" }, { status: 500 })
  }
}
