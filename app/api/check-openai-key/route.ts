import { NextResponse } from "next/server"
import { hasOpenAIKey } from "@/lib/env"

export async function GET() {
  try {
    const hasKey = hasOpenAIKey()

    if (!hasKey) {
      return NextResponse.json({
        success: false,
        message: "OpenAI API key is not configured",
        hasKey: false,
      })
    }

    // Get the API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY

    try {
      // Make a simple fetch request to OpenAI API to validate the key
      const response = await fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`OpenAI API returned status: ${response.status}`)
      }

      return NextResponse.json({
        success: true,
        message: "OpenAI API key is valid",
        hasKey: true,
      })
    } catch (error) {
      console.error("Error validating OpenAI API key:", error)
      return NextResponse.json({
        success: false,
        message: "OpenAI API key is invalid",
        hasKey: true,
        error: error.message,
      })
    }
  } catch (error) {
    console.error("Error checking OpenAI API key:", error)
    return NextResponse.json({
      success: false,
      message: "Error checking OpenAI API key",
      error: error.message,
    })
  }
}
