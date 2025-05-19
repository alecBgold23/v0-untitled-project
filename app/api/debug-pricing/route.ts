import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check environment variables
    const hasPricingKey = !!process.env.PRICING_OPENAI_API_KEY
    const hasEbayClientId = !!process.env.EBAY_CLIENT_ID
    const hasEbayClientSecret = !!process.env.EBAY_CLIENT_SECRET

    // Generate a test price
    const testDescription = "Test item for debugging"
    const testPrice = generateTestPrice()

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: {
        hasPricingKey,
        hasEbayClientId,
        hasEbayClientSecret,
        node_env: process.env.NODE_ENV,
      },
      test: {
        description: testDescription,
        price: testPrice,
      },
    })
  } catch (error) {
    console.error("Error in debug pricing route:", error)
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

function generateTestPrice(): string {
  const basePrice = 45
  const variation = Math.floor(Math.random() * 20) - 5
  return `$${basePrice + variation}`
}
