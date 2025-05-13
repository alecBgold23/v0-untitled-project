import { NextResponse } from "next/server"
import twilio from "twilio"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { phoneNumber, code } = body

    console.log("Received verification check request for:", phoneNumber)

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { success: false, error: "Phone number and verification code are required" },
        { status: 400 },
      )
    }

    // Validate E.164 format
    if (!/^\+\d{10,15}$/.test(phoneNumber)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid phone number format. Must be in E.164 format (e.g., +12125551234).",
        },
        { status: 400 },
      )
    }

    // Validate code format
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ success: false, error: "Verification code must be 6 digits" }, { status: 400 })
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID || process.env.TWILIO_SERVICE_SID

    if (!accountSid || !authToken || !verifySid) {
      console.error("Missing Twilio credentials")
      return NextResponse.json(
        {
          success: false,
          error: "Server configuration error: Missing Twilio credentials",
        },
        { status: 500 },
      )
    }

    // Create Twilio client
    const client = twilio(accountSid, authToken)

    try {
      // Check verification code
      console.log("Checking verification code for:", phoneNumber)

      const verificationCheck = await client.verify.v2
        .services(verifySid)
        .verificationChecks.create({ to: phoneNumber, code })

      console.log("Verification check result:", verificationCheck.status)

      if (verificationCheck.status === "approved") {
        return NextResponse.json({
          success: true,
          verified: true,
          status: verificationCheck.status,
        })
      } else {
        return NextResponse.json({
          success: true,
          verified: false,
          status: verificationCheck.status,
          error: "Verification code is invalid or expired",
        })
      }
    } catch (twilioError: any) {
      console.error("Twilio API Error during verification check:", twilioError)

      return NextResponse.json(
        {
          success: false,
          error: "Failed to verify code",
          details: twilioError.message || String(twilioError),
          code: twilioError.code,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("General error in verification check API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to verify code",
        details: error.message || String(error),
      },
      { status: 500 },
    )
  }
}
