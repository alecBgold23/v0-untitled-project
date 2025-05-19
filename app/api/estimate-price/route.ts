import { type NextRequest, NextResponse } from "next/server"
import { generatePriceEstimate } from "@/lib/openai-browser"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { itemName, briefDescription, condition, issues } = body

  if (!itemName || !briefDescription || !condition) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 })
  }

  try {
    // Use our browser-compatible price estimation
    const priceRange = await generatePriceEstimate(`${itemName} ${briefDescription} ${issues || ""}`, condition)

    // Extract a numeric value from the price range
    const priceMatch = priceRange.match(/\$(\d+)(?:-\$(\d+))?/)
    let price = 0

    if (priceMatch) {
      if (priceMatch[2]) {
        // If it's a range, take the average
        price = (Number.parseInt(priceMatch[1]) + Number.parseInt(priceMatch[2])) / 2
      } else {
        // If it's a single value
        price = Number.parseInt(priceMatch[1])
      }
    } else {
      // Fallback if no match
      price = 25
    }

    return NextResponse.json({
      price: price.toFixed(2),
      priceRange,
      source: "algorithm",
    })
  } catch (err) {
    console.error("Unexpected error:", err)
    return NextResponse.json(
      {
        error: "Internal server error.",
        price: "25.00",
        source: "fallback",
      },
      { status: 200 },
    )
  }
}
