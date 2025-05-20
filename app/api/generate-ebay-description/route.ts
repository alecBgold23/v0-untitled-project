import { OpenAI } from "openai"
import { NextResponse } from "next/server"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { title, condition, extraDetails } = await req.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Generate a title without using OpenAI
    const shortTitle = generateFallbackTitle(title, condition, extraDetails)

    return NextResponse.json({ shortTitle })
  } catch (error: any) {
    console.error("Server error:", error)
    return NextResponse.json(
      {
        error: "Server error",
        shortTitle: generateFallbackTitle("Unknown Item", "used"),
      },
      { status: 500 },
    )
  }
}

// Fallback function to generate a title without OpenAI
function generateFallbackTitle(title: string, condition?: string, extraDetails?: string): string {
  const conditionText = condition ? `${condition.charAt(0).toUpperCase() + condition.slice(1)} ` : ""

  // Clean up the title
  let cleanTitle = title.trim()

  // Add brand if it seems to be missing
  if (cleanTitle.toLowerCase().includes("iphone") && !cleanTitle.toLowerCase().includes("apple")) {
    cleanTitle = `Apple ${cleanTitle}`
  } else if (cleanTitle.toLowerCase().includes("galaxy") && !cleanTitle.toLowerCase().includes("samsung")) {
    cleanTitle = `Samsung ${cleanTitle}`
  } else if (cleanTitle.toLowerCase().includes("pixel") && !cleanTitle.toLowerCase().includes("google")) {
    cleanTitle = `Google ${cleanTitle}`
  }

  // Add condition if provided
  const formattedTitle = `${conditionText}${cleanTitle}`

  // Truncate if too long
  return formattedTitle.length > 80 ? formattedTitle.substring(0, 77) + "..." : formattedTitle
}
