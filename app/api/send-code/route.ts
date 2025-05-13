import { NextResponse } from "next/server"
import { Twilio } from "twilio"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { phoneNumber } = body

    console.log("Received request body:", body)
    console.log("Phone number from request:", phoneNumber)

    if (!phoneNumber || typeof phoneNumber !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Phone number is required and must be a string",
        },
        { status: 400 },
      )
    }

    // Clean the phone number to ensure it's in E.164 format
    let cleanedPhoneNumber = phoneNumber.trim()

    // Make sure it starts with +
    if (!cleanedPhoneNumber.startsWith("+")) {
      // If it's a 10-digit US number, add +1
      if (/^\d{10}$/.test(cleanedPhoneNumber)) {
        cleanedPhoneNumber = `+1${cleanedPhoneNumber}`
      } else if (/^1\d{10}$/.test(cleanedPhoneNumber)) {
        // If it's an 11-digit number starting with 1, add +
        cleanedPhoneNumber = `+${cleanedPhoneNumber}`
      } else {
        // Otherwise just add +
        cleanedPhoneNumber = `+${cleanedPhoneNumber}`
      }
    }

    // Final validation check for E.164 format
    if (!/^\+[1-9]\d{1,14}$/.test(cleanedPhoneNumber)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid phone number format. Phone must be in E.164 format (e.g., +12125551234).",
          receivedPhoneNumber: phoneNumber,
          cleanedPhoneNumber: cleanedPhoneNumber,
        },
        { status: 400 },
      )
    }

    // Use the cleaned phone number for the rest of the function
    console.log("Validated phone number:", cleanedPhoneNumber)

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      console.error("Missing Twilio credentials")
      return NextResponse.json(
        {
          success: false,
          error: "Server configuration error: Missing Twilio credentials",
          accountSid: accountSid ? "Set" : "Missing",
          authToken: authToken ? "Set" : "Missing",
          twilioPhoneNumber: twilioPhoneNumber ? "Set" : "Missing",
        },
        { status: 500 },
      )
    }

    try {
      console.log("Initializing Twilio client...")
      const client = new Twilio(accountSid, authToken)

      // Generate a random 6-digit code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

      console.log("Generated verification code:", verificationCode)
      console.log("Sending SMS to:", cleanedPhoneNumber)
      console.log("From Twilio number:", twilioPhoneNumber)

      // Send SMS with the verification code
      const message = await client.messages.create({
        body: `Your verification code is: ${verificationCode}`,
        from: twilioPhoneNumber,
        to: cleanedPhoneNumber,
      })

      console.log("SMS sent successfully. Message SID:", message.sid)

      // In a real application, you would store this code securely
      // For this demo, we'll return it in the response (not secure for production)
      return NextResponse.json({
        success: true,
        sid: message.sid,
        // Don't return the code in production
        // code: verificationCode,
      })
    } catch (twilioError: any) {
      console.error("Twilio API error:", twilioError)

      // Extract the specific error message from Twilio
      const twilioMessage = twilioError.message || "Unknown Twilio error"
      const twilioCode = twilioError.code || "Unknown error code"

      return NextResponse.json(
        {
          success: false,
          error: "Failed to send verification code",
          details: twilioMessage,
          code: twilioCode,
          phoneNumber: cleanedPhoneNumber,
        },
        { status: 400 },
      )
    }
  } catch (error: any) {
    console.error("Error sending verification code:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send verification code",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
