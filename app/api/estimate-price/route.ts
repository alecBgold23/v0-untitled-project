import { NextResponse } from "next/server"
import { generatePriceEstimate } from "@/lib/openai-pricing"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { itemName, briefDescription, condition, issues } = body

    if (!itemName || !briefDescription || !condition) {
      return NextResponse.json(
        { error: "Missing required fields: itemName, briefDescription, condition." },
        { status: 400 },
      )
    }

    // Combine fields into one string for pricing prompt
    const itemDetails = `${itemName} ${briefDescription} ${issues || ""}`.trim()

    // Call OpenAI to generate price range
    const priceRange = await generatePriceEstimate(itemDetails, condition)

    // Extract numeric price from response (e.g., "$20-$30" or "$25")
    const priceMatch = priceRange.match(/\$(\d+)(?:-(\$(\d+)))?/)
    let price = 25 // default fallback

    if (priceMatch) {
      if (priceMatch[2]) {
        // Range: average the two numbers
        price = (Number(priceMatch[1]) + Number(priceMatch[3])) / 2
      } else {
        // Single value
        price = Number(priceMatch[1])
      }
    }

    return NextResponse.json({
      price: price.toFixed(2),
      priceRange,
      source: "openai",
    })
  } catch (err) {
    console.error("Pricing API error:", err)
    return NextResponse.json(
      {
        error: "Internal server error.",
        price: "25.00",
        source: "fallback",
      },
      { status: 500 },
    )
  }
}
