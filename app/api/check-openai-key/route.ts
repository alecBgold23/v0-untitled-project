import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function GET() {
  try {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        valid: false,
        message: "OpenAI API key is not configured. Please add your API key in settings.",
      })
    }

    // Initialize the OpenAI client
    const openai = new OpenAI({
      apiKey,
    })

    // Make a simple API call to verify the key works
    await openai.models.list()

    // If we get here, the key is valid
    return NextResponse.json({
      valid: true,
      message: "OpenAI API key is valid",
    })
  } catch (error: any) {
    console.error("Error checking OpenAI API key:", error)

    // Check for specific error messages
    if (error.message?.includes("API key")) {
      return NextResponse.json({
        valid: false,
        message: "Invalid OpenAI API key. Please check your API key in settings.",
      })
    }

    return NextResponse.json({
      valid: false,
      message: "Error validating OpenAI API key. Please check your connection and try again.",
    })
  }
}
