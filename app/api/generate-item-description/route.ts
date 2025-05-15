import { NextResponse } from "next/server"

// Fallback descriptions for when OpenAI is not available
const fallbackDescriptions = {
  electronics:
    "This electronic item is in excellent condition with all features working perfectly. It shows minimal signs of use and comes with all standard accessories.",
  clothing:
    "This clothing item is in excellent condition with no stains, tears, or defects. The fabric is still vibrant and the item fits true to size.",
  furniture:
    "This furniture piece is in excellent condition with minimal wear. It's sturdy, stable, and has been well-maintained in a smoke-free home.",
  jewelry:
    "This jewelry piece is in excellent condition with no visible scratches or damage. It retains its original shine and comes with its original packaging.",
  toys: "This toy is in excellent condition with all parts intact and working properly. It has been gently used and comes from a clean, smoke-free home.",
  books:
    "This book is in excellent condition with no markings, highlights, or dog-eared pages. The spine is intact and the cover shows minimal wear.",
  default:
    "This item is in excellent condition and has been well-maintained. It functions perfectly and shows minimal signs of previous use.",
}

export async function POST(request: Request) {
  try {
    const { itemName, itemCategory = "default" } = await request.json()

    if (!itemName) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 })
    }

    // Use fallback description
    const category = itemCategory in fallbackDescriptions ? itemCategory : "default"
    return NextResponse.json({
      description: fallbackDescriptions[category],
      source: "template",
    })
  } catch (error) {
    console.error("Error in generate-item-description route:", error)
    return NextResponse.json(
      {
        error: "Failed to generate description",
        description: fallbackDescriptions.default,
        source: "error-fallback",
      },
      { status: 500 },
    )
  }
}
