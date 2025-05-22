import { NextResponse } from "next/server"
import OpenAI from "openai"

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { prompt, model, temperature, systemPrompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not configured")
      return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 })
    }

    // Set defaults for optional parameters
    const modelToUse = model || "gpt-4o"
    const tempToUse = temperature !== undefined ? temperature : 0.7
    const systemPromptToUse =
      systemPrompt || "You are a helpful assistant that specializes in estimating the value of used items."

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: modelToUse,
      messages: [
        {
          role: "system",
          content: systemPromptToUse,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: tempToUse,
    })

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("Error calling OpenAI:", error)
    return NextResponse.json(
      { error: error.message || "An error occurred while processing your request" },
      { status: 500 },
    )
  }
}
