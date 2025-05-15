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

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: "OpenAI API key is not configured",
          shortTitle: generateFallbackTitle(title, condition),
        },
        { status: 400 },
      )
    }

    const prompt = `
Based on the input below, return a **short, formatted product title** like one used on eBay.

Input: "${title}", Condition: "${condition || "used"}", Extra Details: "${extraDetails || ""}"

Respond with only the short product title, like:
"Oculus Meta Quest 3 128GB White" or "iPhone 13 Pro Max 256GB Graphite (Unlocked)"
`

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4", // Or use 'gpt-3.5-turbo' for lower cost
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
      })

      const shortTitle = response.choices[0].message.content?.trim()
      return NextResponse.json({ shortTitle })
    } catch (error: any) {
      console.error("OpenAI error:", error)
      return NextResponse.json(
        {
          error: "Failed to generate short title",
          shortTitle: generateFallbackTitle(title, condition),
        },
        { status: 500 },
      )
    }
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
function generateFallbackTitle(title: string, condition?: string): string {
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

  return `${conditionText}${cleanTitle}`
}
