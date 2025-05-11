import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid input. Please provide a text field." }, { status: 400 })
    }

    const prompt = `
    You are a professional copywriter specializing in marketplace item descriptions.
    Improve the following item description to make it more appealing to potential buyers.
    Focus on highlighting the item's best features, condition, and value.
    Keep the same information but make it more professional and engaging.
    Don't add any fictional details - only work with what's provided.
    
    Original description:
    ${text}
    
    Improved description:
    `

    const { text: improvedText } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      maxTokens: 500,
    })

    return NextResponse.json({ result: improvedText.trim() })
  } catch (error) {
    console.error("Error in description-helper API:", error)
    return NextResponse.json({ error: "Failed to improve description" }, { status: 500 })
  }
}
