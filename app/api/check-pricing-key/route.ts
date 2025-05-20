import { NextResponse } from "next/server"
import { OpenAI } from "openai"

export async function GET() {
  try {
    // Get the pricing API key from environment variables
    const apiKey = process.env.PRICING_OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        valid: false,
        error: "PRICING_OPENAI_API_KEY is not set in environment variables",
      })
    }

    // Create an OpenAI client with the pricing API key
    const openai = new OpenAI({
      apiKey,
    })

    // Make a simple request to check if the API key is valid
    const models = await openai.models.list()

    // If we get here, the API key is valid
    return NextResponse.json({
      valid: true,
      message: "PRICING_OPENAI_API_KEY is valid",
      models: models.data.slice(0, 3).map((model) => model.id), // Just return a few models to confirm it worked
    })
  } catch (error: any) {
    console.error("Error checking pricing API key:", error)

    // Return detailed error information
    return NextResponse.json({
      valid: false,
      error: error.message || "Unknown error occurred",
      details: error.response?.data || error.response || {},
    })
  }
}
