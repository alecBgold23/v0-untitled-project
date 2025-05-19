import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if the pricing API key is set
    const hasPricingKey = !!process.env.PRICING_OPENAI_API_KEY

    return NextResponse.json({
      available: hasPricingKey,
      error: hasPricingKey ? null : "PRICING_OPENAI_API_KEY is not configured",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error checking pricing key:", error)
    return NextResponse.json(
      {
        available: false,
        error: "Failed to check pricing key status",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
