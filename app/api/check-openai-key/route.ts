import { NextResponse } from "next/server"
import { isOpenAIKeyValid } from "@/lib/openai"

export async function GET() {
  try {
    const isValid = await isOpenAIKeyValid()

    return NextResponse.json({
      valid: isValid,
      message: isValid ? "OpenAI API key is valid" : "OpenAI API key is not configured or invalid",
    })
  } catch (error) {
    console.error("Error checking OpenAI API key:", error)

    return NextResponse.json({
      valid: false,
      message: "Error checking OpenAI API key",
    })
  }
}
