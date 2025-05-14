import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(request: Request) {
  try {
    const { itemName, itemCondition } = await request.json()

    if (!itemName) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 })
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const condition = itemCondition || "Used - Good"

    const prompt = `Write a concise, appealing description for a ${condition} condition ${itemName} that would be good for an online marketplace listing. Keep it under 100 words and highlight key features.`

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that writes concise, appealing product descriptions for online marketplace listings.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    })

    const description = response.choices[0]?.message?.content?.trim() || ""

    return NextResponse.json({ description })
  } catch (error: any) {
    console.error("Error generating item description:", error)

    return NextResponse.json(
      {
        error: "Failed to generate description",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
