import { NextResponse } from "next/server"
import { hasOpenAIKey, getOpenAIKey } from "@/lib/env"

export async function GET() {
  const hasKey = hasOpenAIKey()
  const key = getOpenAIKey()

  // Mask the key for security
  const maskedKey = key ? `${key.substring(0, 3)}...${key.substring(key.length - 4)}` : ""

  return NextResponse.json({
    hasKey,
    keyLength: key.length,
    maskedKey: hasKey ? maskedKey : "",
  })
}
