import { NextResponse } from "next/server"
import OpenAI from "openai"
import { getOpenAIKey } from "@/lib/env"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Get validated OpenAI API key
    const apiKey = getOpenAIKey()

    if (!apiKey) {
      console.log("OpenAI API key not found or invalid, using fallback description generation")
      return NextResponse.json({
        description: generateFallbackDescription(prompt),
        fromFallback: true,
      })
    }

    try {
      // Initialize the OpenAI client
      const openai = new OpenAI({
        apiKey: apiKey,
      })

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that writes concise, detailed product descriptions for online marketplace listings.",
          },
          {
            role: "user",
            content: `Write a brief, enhanced description for this item: ${prompt}. Focus on features, condition, and what makes it valuable. Keep it under 100 words.`,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      })

      const description = completion.choices[0]?.message?.content?.trim() || ""

      if (!description) {
        throw new Error("No description generated")
      }

      return NextResponse.json({
        description,
        fromApi: true,
      })
    } catch (error) {
      console.error("OpenAI API error:", error)
      // Fallback to a generic description
      return NextResponse.json({
        description: generateFallbackDescription(prompt),
        fromFallback: true,
        error: error.message,
      })
    }
  } catch (error) {
    console.error("Error in generate-description route:", error)
    return NextResponse.json(
      {
        error: "Failed to create description",
        message: error.message,
      },
      { status: 500 },
    )
  }
}

function generateFallbackDescription(prompt: string): string {
  const adjectives = [
    "excellent",
    "good",
    "great",
    "fantastic",
    "well-maintained",
    "reliable",
    "quality",
    "impressive",
    "wonderful",
    "solid",
  ]

  const features = [
    "performs flawlessly",
    "works perfectly",
    "functions as expected",
    "is in great condition",
    "shows minimal wear",
    "offers great value",
    "meets all expectations",
    "is ready to use",
    "has been tested thoroughly",
    "will satisfy any buyer",
  ]

  // Get random elements from arrays
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const randomFeature = features[Math.floor(Math.random() * features.length)]

  return `This ${prompt} is in ${randomAdjective} condition and ${randomFeature}. It includes all essential components and has been well-maintained. Perfect for anyone looking for a reliable ${prompt.split(" ").slice(-1)[0] || "item"} at a great value.`
}
