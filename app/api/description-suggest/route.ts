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
          role: "user",
          content: `Complete this product name and include relevant info in 1 sentence: ${prompt}`,
        },
      ],
      max_tokens: 50,
    }),
  })

  const data = await completion.json()

  const suggestion = data?.choices?.[0]?.message?.content?.trim()

  return NextResponse.json({ suggestion })
}
