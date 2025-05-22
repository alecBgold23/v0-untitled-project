import { NextResponse } from "next/server"
import { getOpenAIKey } from "@/lib/env"

// Store the last usage timestamp
let lastUsageTimestamp: string | null = null

export function updateLastUsage() {
  lastUsageTimestamp = new Date().toISOString()
  console.log("OpenAI API usage timestamp updated:", lastUsageTimestamp)
}

export async function GET() {
  const hasKey = !!getOpenAIKey()

  return NextResponse.json({
    hasKey,
    lastUsed: lastUsageTimestamp,
    currentTime: new Date().toISOString(),
  })
}
