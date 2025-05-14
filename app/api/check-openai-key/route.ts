import { NextResponse } from "next/server"

export async function GET() {
  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY

    if (!OPENAI_API_KEY) {
      return NextResponse.json({
        valid: false,
        message: "OpenAI API key is not configured. Please add it to your environment variables.",
      })
    }

    // Make a simple request to the OpenAI API to verify the key
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
    })

    if (response.ok) {
      return NextResponse.json({
        valid: true,
        message: "OpenAI API key is valid.",
      })
    } else {
      const error = await response.json().catch(() => ({}))
      return NextResponse.json({
        valid: false,
        message: `OpenAI API key is invalid: ${error.error?.message || "Unknown error"}`,
        details: error,
      })
    }
  } catch (error) {
    console.error("Error checking OpenAI API key:", error)
    return NextResponse.json({
      valid: false,
      message: "Error checking OpenAI API key. See server logs for details.",
    })
  }
}
