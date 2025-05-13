import { NextResponse } from "next/server"
import twilio from "twilio"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { phoneNumber } = body

    console.log("Received verification request for:", phoneNumber)

    if (!phoneNumber) {
      return NextResponse.json({ success: false, error: "Phone number is required" }, { status: 400 })
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

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID || process.env.TWILIO_SERVICE_SID

    console.log("Twilio credentials check:", {
      accountSid: accountSid ? "Set" : "Missing",
      authToken: authToken ? "Set" : "Missing",
      verifySid: verifySid ? "Set" : "Missing",
    })

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

    // Check if we're using a test account
    const isTestAccount = accountSid.startsWith("AC") && accountSid.length === 34

    if (isTestAccount) {
      console.log("Using Twilio test account - verification may only work with verified numbers")
    }

    try {
      // Send verification code via Twilio Verify
      console.log("Attempting to send verification to:", phoneNumber, "using service:", verifySid)

      const verification = await client.verify.v2
        .services(verifySid)
        .verifications.create({ to: phoneNumber, channel: "sms" })

      console.log("Verification sent successfully:", verification.sid, "Status:", verification.status)

      return NextResponse.json({
        success: true,
        sid: verification.sid,
        status: verification.status,
      })
    } catch (twilioError: any) {
      console.error("Twilio API Error:", twilioError)

      // Handle specific Twilio errors
      if (twilioError.code === 60200) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid phone number. Please check the number and try again.",
            details: twilioError.message,
          },
          { status: 400 },
        )
      } else if (twilioError.code === 60203) {
        return NextResponse.json(
          {
            success: false,
            error: "Max send attempts reached. Please try again later.",
            details: twilioError.message,
          },
          { status: 429 },
        )
      } else {
        return NextResponse.json(
          {
            success: false,
            error: "Twilio API error",
            details: twilioError.message || String(twilioError),
            code: twilioError.code,
          },
          { status: 500 },
        )
      }
    }
  } catch (error: any) {
    console.error("General error in verification API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send verification code",
        details: error.message || String(error),
      },
      { status: 500 },
    )
  }
}
