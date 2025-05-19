import { NextResponse } from "next/server"
import { generateProductDescription } from "@/lib/openai-browser"

// Fallback description generator
function generateFallbackDescription(title = "", condition = "", extraDetails = ""): string {
  return `
    ${title}
    
    This item is in ${condition || "used"} condition. ${extraDetails}
    
    Please contact the seller for more information about this item.
  `.trim()
}

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
          description: generateFallbackDescription(),
          source: "fallback",
        },
        { status: 200 },
      )
    }

    const { title, condition, extraDetails } = body

    if (!title) {
      return NextResponse.json(
        {
          error: "Title is required",
          description: generateFallbackDescription("Untitled Item", condition, extraDetails),
          source: "fallback",
        },
        { status: 200 },
      )
    }

    // Generate description using our fallback mechanism
    try {
      const description = await generateProductDescription(title, condition, extraDetails)

      if (description) {
        return NextResponse.json({
          description,
          source: "algorithm",
        })
      } else {
        throw new Error("Failed to generate description")
      }
    } catch (genError) {
      console.error("Error with description generation:", genError)

      return NextResponse.json({
        error: genError.message || "Error generating description",
        description: generateFallbackDescription(title, condition, extraDetails),
        source: "fallback",
      })
    }
  } catch (error: any) {
    console.error("Error in generate-description API:", error)

    // Return a fallback description
    return NextResponse.json(
      {
        error: error.message || "Error generating description",
        description: generateFallbackDescription(body?.title, body?.condition, body?.extraDetails),
        source: "fallback",
      },
      { status: 200 },
    )
  }
}
