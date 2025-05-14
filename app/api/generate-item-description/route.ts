import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { itemName, itemCondition } = await req.json()

    if (!itemName || itemName.length < 2) {
      return NextResponse.json({ error: "Item name too short" }, { status: 400 })
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: "OpenAI API key not configured",
          description: "Please add your OpenAI API key in the environment variables.",
        },
        { status: 500 },
      )
    }

    const prompt = `
    Write a detailed, professional description for the following item that I'm selling:
    
    Item Name: ${itemName}
    Condition: ${itemCondition || "Not specified"}
    
    The description should be 2-3 sentences long, highlight key features, and be appropriate for a marketplace listing.
    Focus on the item's quality, functionality, and appeal. Do not include pricing information.
    `

    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that writes concise, appealing product descriptions for marketplace listings.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    })

    const data = await completion.json()

    if (!data.choices || data.choices.length === 0) {
      console.error("Unexpected API response:", data)
      return NextResponse.json(
        { error: "Failed to generate description", description: "An error occurred while generating the description." },
        { status: 500 },
      )
    }

    const description = data.choices[0].message.content.trim()

    return NextResponse.json({ description })
  } catch (error) {
    console.error("Error generating description:", error)
    return NextResponse.json(
      { error: "Failed to generate description", description: "An error occurred while generating the description." },
      { status: 500 },
    )
  }
}
