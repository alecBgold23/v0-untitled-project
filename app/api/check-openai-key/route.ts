import { NextResponse } from "next/server"

export async function GET() {
  // Return a placeholder response since this will be set up later
  return NextResponse.json({
    hasOpenAIKey: false,
    message: "OpenAI API key will be configured later",
    timestamp: new Date().toISOString(),
  })
}
