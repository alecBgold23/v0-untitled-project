import { NextResponse } from "next/server"
import { Twilio } from "twilio"

export async function GET() {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID

    // Check if environment variables are set
    if (!accountSid || !authToken || !serviceSid) {
      return NextResponse.json({
        configured: false,
        message: "Twilio environment variables are not fully configured",
        missing: {
          accountSid: !accountSid,
          authToken: !authToken,
          serviceSid: !serviceSid,
        },
      })
    }

    // In development, we can skip the actual Twilio check
    if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_SKIP_SMS_VERIFICATION === "true") {
      return NextResponse.json({
        configured: true,
        message: "Development mode: Twilio check skipped",
        skipVerification: true,
      })
    }

    // Try to initialize Twilio client to verify credentials
    const twilioClient = new Twilio(accountSid, authToken)

    // Try to fetch the service to verify it exists
    const service = await twilioClient.verify.v2.services(serviceSid).fetch()

    return NextResponse.json({
      configured: true,
      message: "Twilio is properly configured",
      service: {
        sid: service.sid,
        friendlyName: service.friendlyName,
        status: service.status,
      },
    })
  } catch (error) {
    console.error("Error checking Twilio configuration:", error)

    return NextResponse.json({
      configured: false,
      message: "Failed to verify Twilio configuration",
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
