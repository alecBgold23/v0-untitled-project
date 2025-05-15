import { NextResponse } from "next/server"

// Fallback titles for when OpenAI is not available
function generateFallbackTitle(itemName: string, condition = "excellent"): string {
  const itemNameLower = itemName.toLowerCase().trim()
  const formattedCondition = condition.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

  // Check for common items
  if (itemNameLower.includes("iphone") || itemNameLower.includes("phone")) {
    return `Premium Smartphone - ${formattedCondition} Condition - Fully Functional`
  }

  if (itemNameLower.includes("laptop") || itemNameLower.includes("computer")) {
    return `High-Performance Laptop - ${formattedCondition} Condition - Fast & Reliable`
  }

  if (itemNameLower.includes("camera")) {
    return `Digital Camera - ${formattedCondition} Condition - Perfect Working Order`
  }

  if (itemNameLower.includes("watch")) {
    return `Stylish Wristwatch - ${formattedCondition} Condition - Accurate Timekeeping`
  }

  if (itemNameLower.includes("tv") || itemNameLower.includes("television")) {
    return `Flat Screen TV - ${formattedCondition} Condition - Crystal Clear Display`
  }

  // Generic title for other items
  return `${itemName.charAt(0).toUpperCase() + itemName.slice(1)} - ${formattedCondition} Condition - Great Value`
}

export async function POST(request: Request) {
  try {
    const { itemName, itemCondition = "excellent" } = await request.json()

    if (!itemName) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 })
    }

    // Use fallback title
    return NextResponse.json({
      title: generateFallbackTitle(itemName, itemCondition),
      source: "template",
    })
  } catch (error) {
    console.error("Error in generate-ebay-title route:", error)
    return NextResponse.json(
      {
        error: "Failed to generate title",
        title: generateFallbackTitle("item", "good"),
        source: "error-fallback",
      },
      { status: 500 },
    )
  }
}
