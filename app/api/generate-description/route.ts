import { NextResponse } from "next/server"
import { generateProductDescription } from "@/lib/openai"
import { hasOpenAIKey } from "@/lib/env"

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

    // Check if OpenAI API key is available
    if (!hasOpenAIKey()) {
      console.warn("OpenAI API key is not configured, using fallback description generator")
      return NextResponse.json({
        description: generateFallbackDescription(title, condition, extraDetails),
        source: "fallback",
      })
    }

    // Generate description using OpenAI
    try {
      const description = await generateProductDescription(title, condition, extraDetails)

      if (description) {
        return NextResponse.json({
          description,
          source: "openai",
        })
      } else {
        throw new Error("OpenAI returned empty description")
      }
    } catch (openaiError) {
      console.error("Error with OpenAI description generation:", openaiError)

      return NextResponse.json({
        error: openaiError.message || "Error generating description with OpenAI",
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
