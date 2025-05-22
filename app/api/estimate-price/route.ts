import { NextResponse } from "next/server"
import { generatePriceEstimate } from "@/lib/openai-pricing"
import { updateLastUsage } from "@/app/api/openai-key-usage/route"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { itemName, briefDescription, condition, issues } = body

    if (!itemName && !briefDescription) {
      return NextResponse.json(
        { error: "Missing required fields: either itemName or briefDescription must be provided." },
        { status: 400 },
      )
    }

    // Combine fields into one string for pricing prompt
    const itemDetails = `${itemName || ""} ${briefDescription || ""} ${issues || ""}`.trim()

    console.log("Estimate price API called with details:", itemDetails, "condition:", condition)

    // Call OpenAI to generate price range
    const priceRange = await generatePriceEstimate(itemDetails, condition || "Good")

    // Update the last usage timestamp
    updateLastUsage()

    console.log("Price range received from OpenAI:", priceRange)

    // Extract numeric price from response (e.g., "$20-$30" or "$25")
    const priceMatch = priceRange.match(/\$(\d+)(?:-\$?(\d+))?/)
    let price = 25 // default fallback
    let minPrice = null
    let maxPrice = null

    if (priceMatch) {
      if (priceMatch[2]) {
        // Range: average the two numbers
        minPrice = Number(priceMatch[1])
        maxPrice = Number(priceMatch[2])
        price = (minPrice + maxPrice) / 2
      } else {
        // Single value
        price = Number(priceMatch[1])
        minPrice = price * 0.9
        maxPrice = price * 1.1
      }
    }

    return NextResponse.json({
      price: price.toFixed(2),
      priceRange,
      minPrice: minPrice?.toFixed(2) || null,
      maxPrice: maxPrice?.toFixed(2) || null,
      source: "openai",
    })
  } catch (err) {
    console.error("Pricing API error:", err)
    return NextResponse.json(
      {
        error: "Internal server error.",
        price: "25.00",
        priceRange: "$20-$30",
        source: "fallback",
      },
      { status: 500 },
    )
  }
}
