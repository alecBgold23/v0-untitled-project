import { NextResponse } from "next/server"

// In a real application, you would store and retrieve codes from a secure database
// For this demo, we'll just accept any valid code
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { phoneNumber, code } = body

    console.log("Received request body:", body)
    console.log("Phone number from request:", phoneNumber)
    console.log("Code from request:", code)

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { success: false, error: "Phone number and verification code are required" },
        { status: 400 },
      )
    }

    // Validate phone number format (E.164 format: +[country code][number])
    if (!phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid phone number format. Phone must be in E.164 format (e.g., +12125551234).",
          receivedPhoneNumber: phoneNumber,
        },
        { status: 400 },
      )
    }

    // Validate code format (6 digits)
    if (!code.match(/^\d{6}$/)) {
      return NextResponse.json(
        { success: false, error: "Invalid verification code. Code must be 6 digits." },
        { status: 400 },
      )
    }

    console.log("Validated phone number:", phoneNumber)
    console.log("Validated code:", code)

    // In a real application, you would verify the code against what was stored
    // For this demo, we'll accept any valid 6-digit code
    return NextResponse.json({
      success: true,
      verified: true,
      message: "Phone number verified successfully",
    })
  } catch (error: any) {
    console.error("Error verifying code:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Verification failed",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
