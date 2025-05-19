import { NextResponse } from "next/server"
import { generateOptimizedTitle } from "@/lib/openai-browser"

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

    // Generate optimized title using our fallback mechanism
    const title = await generateOptimizedTitle(description, platform)

    return NextResponse.json({
      title,
      source: "algorithm",
    })
  } catch (error: any) {
    console.error("Error generating title:", error)

    // Return a fallback title
    const body = await request.json() // Declare the body variable here
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
