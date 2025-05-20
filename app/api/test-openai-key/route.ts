import { NextResponse } from "next/server"
import { OpenAI } from "openai"

export async function GET() {
  try {
    console.log("Testing OpenAI API key...")

    // Get the API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      console.error("OpenAI API key is not set")
      return NextResponse.json({
        success: false,
        error: "OpenAI API key is not set in environment variables",
      })
    }

    console.log("API key found, initializing OpenAI client...")

    // Initialize the OpenAI client
    const openai = new OpenAI({
      apiKey,
    })

    console.log("Making test request to OpenAI API...")

    // Make a simple request to test the API key
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Hello, this is a test message to verify the API key is working.",
        },
      ],
      max_tokens: 10,
    })

    console.log("OpenAI API response received:", completion)

    // If we get here, the API key is working
    return NextResponse.json({
      success: true,
      message: "OpenAI API key is valid and working",
      response: completion.choices[0]?.message?.content,
    })
  } catch (error: any) {
    console.error("Error testing OpenAI API key:", error)

    return NextResponse.json({
      success: false,
      error: error.message || "Unknown error occurred",
      details: error.response?.data || error.response || {},
    })
  }
}
