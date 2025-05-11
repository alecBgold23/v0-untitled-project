import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required and must be a string" }, { status: 400 })
    }

    const prompt = `
      You are a professional copywriter specializing in marketplace item descriptions.
      Please improve the following item description to make it more appealing, professional, and detailed.
      Focus on highlighting the item's best features, condition, and value.
      Keep the same factual information but make it more engaging.
      
      Original description:
      "${text}"
      
      Improved description:
    `

    const { text: improvedText } = await generateText({
      model: openai("gpt-4o"),
      prompt: prompt,
      maxTokens: 500,
    })

    return NextResponse.json({ result: improvedText.trim() })
  } catch (error) {
    console.error("Error in description-helper route:", error)
    return NextResponse.json({ error: "Failed to improve description" }, { status: 500 })
  }
}
