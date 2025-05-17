import { NextResponse } from "next/server"
import { hasOpenAIKey, getOpenAIKey } from "@/lib/env"
import OpenAI from "openai"

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

    // Get the API key using our helper
    const apiKey = getOpenAIKey()

    try {
      // Initialize the OpenAI client
      const openai = new OpenAI({
        apiKey: apiKey!,
      })

      // Make a simple request to validate the key
      const response = await openai.models.list()

      return NextResponse.json({
        success: true,
        message: "OpenAI API key is valid",
        hasKey: true,
        models: response.data.length, // Just returning count for security
      })
    } catch (error) {
      console.error("Error validating OpenAI API key:", error)
      return NextResponse.json({
        success: false,
        message: error.message || "OpenAI API key is invalid",
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
