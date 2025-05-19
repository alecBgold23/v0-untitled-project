import { NextResponse } from "next/server"
import { hasEnv } from "@/lib/env"

export async function GET() {
  try {
    const apiKey = process.env.PRICING_OPENAI_API_KEY

    if (!apiKey || !hasEnv("PRICING_OPENAI_API_KEY")) {
      return NextResponse.json({ valid: false, error: "API key not configured" })
    }

    // Make a simple request to OpenAI to check if the key is valid
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (response.ok) {
      return NextResponse.json({ valid: true })
    } else {
      const error = await response.json()
      return NextResponse.json({
        valid: false,
        error: error.error?.message || "Invalid API key",
      })
    }
  } catch (error) {
    console.error("Error checking pricing API key:", error)
    return NextResponse.json({
      valid: false,
      error: "Error checking API key",
    })
  }
}
