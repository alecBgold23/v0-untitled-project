import { type NextRequest, NextResponse } from "next/server"
import { Twilio } from "twilio"

// Helper function to format phone number to E.164
function formatToE164(phone: string): string {
  if (!phone) return ""

  // Remove all non-digit characters except the leading +
  let cleaned = phone.replace(/[^\d+]/g, "")

  // If it doesn't start with +, assume it's a US number
  if (!cleaned.startsWith("+")) {
    // If it's a 10-digit US number
    if (cleaned.length === 10) {
      cleaned = `+1${cleaned}`
    }
    // If it's an 11-digit number starting with 1 (US with country code)
    else if (cleaned.length === 11 && cleaned.startsWith("1")) {
      cleaned = `+${cleaned}`
    }
    // For any other case, add + prefix
    else {
      cleaned = `+${cleaned}`
    }
  }

  return cleaned
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  let { phone, demoMode } = body

  if (!phone) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
  }

  // Check if we should use demo mode
  const useDemoMode = demoMode === true || process.env.NEXT_PUBLIC_DEMO_MODE === "true"

  // If in demo mode, just return success
  if (useDemoMode) {
    console.log("Using demo mode for phone verification")
    return NextResponse.json({ status: "pending", demoMode: true })
  }

  // Format the phone number to E.164 format
  phone = formatToE164(phone)

  // Validate the phone number format
  if (!phone.match(/^\+[1-9]\d{1,14}$/)) {
    console.error("Invalid phone format:", phone)
    return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 })
  }

  console.log("Sending verification to formatted number:", phone)

  // Hardcoded credentials from the curl command
  const accountSid = "AC71c11b0625ac2c63b63b7cf04cbe3dca"
  const authToken = "b11e8f94465770fce4904c39584b398f" // You'll need to change this later
  const serviceSid = "VAa16503cbafc02cea0db79f5e3f4e5279"

  // Log credentials availability (without exposing values)
  console.log("Credentials available:", {
    accountSid: !!accountSid,
    authToken: !!authToken,
    serviceSid: !!serviceSid,
  })

  try {
    const client = new Twilio(accountSid, authToken)

    console.log("Twilio client created, sending verification...")

    const verification = await client.verify.v2.services(serviceSid).verifications.create({
      to: phone,
      channel: "sms",
    })

    console.log("Verification sent successfully:", verification.status)

    return NextResponse.json({ status: verification.status })
  } catch (error: any) {
    console.error("Error sending verification code:", error.message)
    console.error("Error details:", error)

    // If there's an error with Twilio, fall back to demo mode
    if (
      error.message.includes("not a valid phone number") ||
      error.message.includes("did not match the expected pattern")
    ) {
      console.log("Falling back to demo mode due to phone number format error")
      return NextResponse.json({ status: "pending", demoMode: true })
    }

    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
