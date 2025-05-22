import { NextResponse } from "next/server"
import OpenAI from "openai"

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not configured")
      return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 })
    }

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using GPT-4o, but you can change to another model
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that specializes in estimating the value of used items. Provide concise, accurate price estimates based on current market conditions.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
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
