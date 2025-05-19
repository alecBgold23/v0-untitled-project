import { NextResponse } from "next/server"
import { isOpenAIKeyValid } from "@/lib/openai"
import { hasOpenAIKey } from "@/lib/env"

export async function GET() {
  try {
    // Check if OpenAI API key is configured
    const isConfigured = hasOpenAIKey()

    if (!isConfigured) {
      return NextResponse.json({
        isValid: false,
        isConfigured: false,
        message: "OpenAI API key is not configured.",
      })
    }

    // Check if the key is valid
    const isValid = await isOpenAIKeyValid()

    if (isValid) {
      return NextResponse.json({
        isValid: true,
        isConfigured: true,
        message: "OpenAI API key is valid and working.",
      })
    } else {
      return NextResponse.json({
        isValid: false,
        isConfigured: true,
        message: "OpenAI API key is configured but not working. It may be invalid or expired.",
      })
    }
  } catch (error: any) {
    console.error("Error checking OpenAI API key:", error)

    return NextResponse.json(
      {
        isValid: false,
        isConfigured: hasOpenAIKey(),
        error: error.message || "Error checking OpenAI API key.",
      },
      { status: 500 },
    )
  }
}
