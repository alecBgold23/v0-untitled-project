import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.log("OpenAI API key not found, using fallback description generation")
      return NextResponse.json({
        description: `This ${prompt} is in excellent condition and functions perfectly. It includes all essential components and has been well-maintained. The item shows minimal signs of use and represents great value.`,
      })
    }

    try {
      // Use the newer OpenAI SDK
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that writes concise, detailed product descriptions.",
          },
          {
            role: "user",
            content: `Write a brief, enhanced description for this item: ${prompt}. Keep it under 100 words and focus on what a buyer would want to know.`,
          },
        ],
        max_tokens: 150,
      })

      const description = completion.choices[0]?.message?.content?.trim() || ""

      if (!description) {
        throw new Error("No description created")
      }

      return NextResponse.json({ description })
    } catch (error) {
      console.error("OpenAI API error:", error)
      // Fallback to a generic description
      return NextResponse.json({
        description: `This ${prompt} is in excellent condition and functions perfectly. It includes all essential components and has been well-maintained. The item shows minimal signs of use and represents great value.`,
      })
    }
  } catch (error) {
    console.error("Error in generate-description route:", error)
    return NextResponse.json({ error: "Failed to create description" }, { status: 500 })
  }
}
