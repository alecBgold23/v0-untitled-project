import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { prompt } = await req.json()

  if (!prompt || prompt.length < 3) {
    return NextResponse.json({ error: "Prompt too short" }, { status: 400 })
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY

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
            "You are an eBay listing assistant. Provide clear, concise product descriptions with just enough detail for a good eBay listing.",
        },
        {
          role: "user",
          content: `Based on this product name: "${prompt}", provide a good eBay-style product title with the right amount of detail (brand, model, size, color, etc). For example, if someone types "oculus", respond with "Oculus Meta Quest 2 64GB VR Headset - White".`,
        },
      ],
      max_tokens: 80,
      temperature: 0.4,
    }),
  })

  const data = await completion.json()

  const suggestion = data?.choices?.[0]?.message?.content?.trim()

  return NextResponse.json({ suggestion })
}
