import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message: "API key is required",
        },
        { status: 400 },
      )
    }

    try {
      // Validate the API key with a simple request to OpenAI
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

      // In a real application, you would save this key to a secure storage
      // For this demo, we'll just return success
      // Note: In a production app, you would store this in a secure database or environment variable

      return NextResponse.json({
        success: true,
        message: "API key is valid",
      })
    } catch (error) {
      console.error("Error validating OpenAI API key:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Invalid API key",
          error: error.message,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Error setting OpenAI API key:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error setting API key",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
