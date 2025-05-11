import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json()

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json({ error: "Invalid API key format" }, { status: 400 })
    }

    // Validate the API key format (basic check)
    if (!apiKey.startsWith("sk-") || apiKey.length < 20) {
      return NextResponse.json(
        { error: 'Invalid API key format. OpenAI keys should start with "sk-"' },
        { status: 400 },
      )
    }

    // In a real implementation, you would store this securely
    // For example, in a database or a secure environment variable service
    // This is a simplified example

    // For demonstration purposes, we'll just return success
    // In a real app, you would:
    // 1. Store the key securely (e.g., in a database with encryption)
    // 2. Set up proper authentication to ensure only authorized users can set the key
    // 3. Implement proper error handling for storage failures

    // Mock successful storage
    const success = true

    if (success) {
      return NextResponse.json({ message: "API key saved successfully" }, { status: 200 })
    } else {
      return NextResponse.json({ error: "Failed to save API key" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error setting API key:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
