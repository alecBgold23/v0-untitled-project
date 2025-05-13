import { NextResponse } from "next/server"
import twilio from "twilio"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { phoneNumber } = body

    if (!phoneNumber) {
      return NextResponse.json({ success: false, error: "Phone number is required" }, { status: 400 })
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
      console.error("Invalid phone number format:", cleanedPhoneNumber)
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

    console.log("Sending verification to:", cleanedPhoneNumber)
    const client = twilio(accountSid, authToken)

    // Send verification code via Twilio Verify
    const verification = await client.verify.v2
      .services(verifySid)
      .verifications.create({ to: cleanedPhoneNumber, channel: "sms" })

    console.log("Verification sent:", verification.sid)

    return NextResponse.json({
      success: true,
      sid: verification.sid,
      status: verification.status,
    })
  } catch (error: any) {
    console.error("Error sending verification:", error)
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
