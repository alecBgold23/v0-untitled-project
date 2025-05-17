import { NextResponse } from "next/server"
import { OpenAI } from "openai"

export async function GET() {
  try {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        hasKey: false,
        message: "OpenAI API key is not configured",
      })
    }

    // Initialize the OpenAI client with the API key
    const openai = new OpenAI({
      apiKey,
    })

    // Make a simple API call to verify the key works
    try {
      // Use a simple models list call to verify the key
      await openai.models.list()

      return NextResponse.json({
        success: true,
        message: "OpenAI API key is valid",
      })
    } catch (error: any) {
      console.error("OpenAI API error:", error)

      // Check for specific error types
      if (error.status === 401) {
        return NextResponse.json({
          success: false,
          hasKey: true,
          message: "Invalid API key or unauthorized access",
        })
      } else {
        return NextResponse.json({
          success: false,
          hasKey: true,
          message: error.message || "Error validating OpenAI API key",
        })
      }
    }
  } catch (error: any) {
    console.error("Server error:", error)
    return NextResponse.json({
      success: false,
      message: "Server error checking API key",
    })
  }
}
