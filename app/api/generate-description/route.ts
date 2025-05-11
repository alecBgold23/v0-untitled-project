import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Invalid prompt. Please provide a text prompt." }, { status: 400 })
    }

    // Generate an enhanced description using OpenAI
    const { text: description } = await generateText({
      model: openai("gpt-4o"),
      prompt: `
        You are a professional copywriter specializing in creating compelling product descriptions.
        
        Your task is to enhance the following item description to make it more appealing, professional, and detailed.
        Focus on highlighting the item's best features and qualities.
        
        Keep the tone professional but engaging. Do not exaggerate or make claims not supported by the original description.
        Do not add specific pricing information unless it was in the original text.
        
        Original description:
        ${prompt}
        
        Enhanced description:
      `,
      temperature: 0.7,
      maxTokens: 500,
    })

    return NextResponse.json({ description })
  } catch (error) {
    console.error("Error generating description:", error)
    return NextResponse.json({ error: "Failed to generate description. Please try again." }, { status: 500 })
  }
}
