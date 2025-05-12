import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Invalid prompt. Please provide a text prompt." }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 })
    }

    const res = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: `Write a compelling product description for: ${prompt}`,
        max_tokens: 100,
        temperature: 0.7,
      }),
    })

    const data = await res.json()

    if (data.choices && data.choices.length > 0) {
      return NextResponse.json({ description: data.choices[0].text.trim() })
    } else {
      return NextResponse.json({ error: "No description generated" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error generating description:", error)
    return NextResponse.json({ error: "Failed to generate description. Please try again." }, { status: 500 })
  }
}
