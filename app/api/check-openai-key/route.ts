import { NextResponse } from "next/server"
import { hasOpenAIKey, getOpenAIKey } from "@/lib/env"
import { testOpenAIKey } from "@/lib/test-openai-key"

export async function GET() {
  const hasKey = hasOpenAIKey()
  const key = getOpenAIKey()
  let isValid = false
  let message = ""
  const timestamp = new Date().toISOString()

  // Mask the key for security
  const maskedKey = key ? `${key.substring(0, 3)}...${key.substring(key.length - 4)}` : ""

  if (hasKey) {
    try {
      isValid = await testOpenAIKey(key)
      message = isValid
        ? "OpenAI API key is valid and working correctly"
        : "OpenAI API key is configured but appears to be invalid"

      // Log the key check (without exposing the key)
      console.log(`OpenAI API key checked at: ${timestamp}. Valid: ${isValid}`)
    } catch (error) {
      console.error("Error testing OpenAI API key:", error)
      message = "Error testing OpenAI API key"
    }
  } else {
    message = "OpenAI API key is not configured"
  }

  return NextResponse.json({
    hasOpenAIKey: hasKey,
    isValid,
    message,
    timestamp,
    keyLength: key.length,
    maskedKey: hasKey ? maskedKey : "",
    isConfigured: hasKey,
  })
}
