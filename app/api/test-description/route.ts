import { NextResponse } from "next/server"
import { hasOpenAIKey, getOpenAIKey } from "@/lib/env"

export async function GET() {
  return NextResponse.json({
    hasOpenAIKey: hasOpenAIKey(),
    keyPrefix: getOpenAIKey()?.substring(0, 5) + "..." || "not-configured",
    timestamp: new Date().toISOString(),
  })
}
