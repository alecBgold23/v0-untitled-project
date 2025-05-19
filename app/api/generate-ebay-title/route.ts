import { NextResponse } from "next/server"
import { generateOptimizedTitle } from "@/lib/openai"
import { hasOpenAIKey } from "@/lib/env"
import { body } from "express-validator" // Assuming this is the missing import

// Fallback title generator
function generateFallbackTitle(description: string): string {
  const words = description.split(/\s+/).filter(Boolean)
  return words.slice(0, 6).join(" ")
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()
    const { description, platform = "eBay" } = body

    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 })
    }

    // Check if OpenAI API key is available
    if (!hasOpenAIKey()) {
      return NextResponse.json(
        {
          error: "OpenAI API key is not configured",
          title: generateFallbackTitle(description),
          source: "fallback",
        },
        { status: 200 },
      )
    }

    // Generate optimized title using OpenAI
    const title = await generateOptimizedTitle(description, platform)

    return NextResponse.json({
      title,
      source: "openai",
    })
  } catch (error: any) {
    console.error("Error generating title:", error)

    // Return a fallback title
    return NextResponse.json(
      {
        error: error.message || "Error generating title",
        title: generateFallbackTitle(body?.description || ""),
        source: "fallback",
      },
      { status: 200 },
    )
  }
}
