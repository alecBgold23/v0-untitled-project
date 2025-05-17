import { NextResponse } from "next/server"

export async function GET() {
  // Log to server console
  console.log("Pricing OpenAI Key loaded:", !!process.env.PRICING_OPENAI_API_KEY)

  // Return the status (without exposing the actual key)
  return NextResponse.json({
    hasPricingKey: !!process.env.PRICING_OPENAI_API_KEY,
    timestamp: new Date().toISOString(),
  })
}
