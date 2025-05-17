import { NextResponse } from "next/server"

export async function GET() {
  const pricingKey = process.env.PRICING_OPENAI_API_KEY

  // Log to server console
  console.log("Pricing OpenAI Key check:", {
    exists: !!pricingKey,
    length: pricingKey ? pricingKey.length : 0,
    prefix: pricingKey ? pricingKey.substring(0, 3) + "..." : "N/A",
  })

  // Return the status (without exposing the actual key)
  return NextResponse.json({
    hasPricingKey: !!pricingKey && pricingKey.length > 20,
    keyLength: pricingKey ? pricingKey.length : 0,
    timestamp: new Date().toISOString(),
  })
}
