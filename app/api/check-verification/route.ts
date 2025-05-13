import { NextResponse } from "next/server"
import twilio from "twilio"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { phoneNumber, code } = body

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { success: false, error: "Phone number and verification code are required" },
        { status: 400 },
      )
    }

    // Clean and format the phone number to ensure it's in E.164 format
    let cleanedPhoneNumber = phoneNumber.replace(/\s+/g, "").replace(/[()-]/g, "").trim()

    // Make sure it starts with a plus sign
    if (!cleanedPhoneNumber.startsWith("+")) {
      // If it's a 10-digit US number
      if (/^\d{10}$/.test(cleanedPhoneNumber)) {
        cleanedPhoneNumber = `+1${cleanedPhoneNumber}`
      }
      // If it's an 11-digit number starting with 1 (US with country code)
      else if (/^1\d{10}$/.test(cleanedPhoneNumber)) {
        cleanedPhoneNumber = `+${cleanedPhoneNumber}`
      }
      // For any other case, just add + prefix
      else {
        cleanedPhoneNumber = `+${cleanedPhoneNumber}`
      }
    }

    // Validate E.164 format
    if (!/^\+[1-9]\d{1,14}$/.test(cleanedPhoneNumber)) {
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
    const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID

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

    const client = twilio(accountSid, authToken)

    // Check verification code
    const verificationCheck = await client.verify.v2
      .services(verifySid)
      .verificationChecks.create({ to: cleanedPhoneNumber, code })

    console.log("Verification check:", verificationCheck.status)

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
        error: "Invalid verification code. Please try again.",
      })
    }
  } catch (error: any) {
    console.error("Error checking verification:", error)
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
