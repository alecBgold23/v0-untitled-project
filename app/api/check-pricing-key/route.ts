import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if the PRICING_OPENAI_API_KEY environment variable is set
    const hasPricingKey = !!process.env.PRICING_OPENAI_API_KEY

    // Log the status for debugging
    console.log("PRICING_OPENAI_API_KEY status:", hasPricingKey ? "Available" : "Not available")

    // Return the status
    return NextResponse.json({
      hasPricingKey,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error checking pricing API key:", error)
    return NextResponse.json(
      {
        hasPricingKey: false,
        error: "Failed to check pricing API key",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
