import { NextResponse } from "next/server"

export async function GET() {
  const openAiKey = process.env.PRICING_OPENAI_API_KEY

  if (!openAiKey) {
    return NextResponse.json({ valid: false, error: "Missing PRICING_OPENAI_API_KEY" }, { status: 400 })
  }

  try {
    console.log("Testing OpenAI API key...")

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Say hello" },
        ],
        max_tokens: 5,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("OpenAI API error:", errorData)
      return NextResponse.json(
        {
          valid: false,
          error: `API error: ${response.status}`,
          details: errorData,
        },
        { status: 400 },
      )
    }

    const data = await response.json()

    return NextResponse.json({
      valid: true,
      message: "PRICING_OPENAI_API_KEY is valid",
      response: data,
    })
  } catch (error) {
    console.error("OpenAI request failed:", error)
    return NextResponse.json(
      {
        valid: false,
        error: "Request failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
