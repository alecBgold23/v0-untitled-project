import { NextResponse } from "next/server"

export async function GET() {
  // Hardcoded credentials from the curl command
  const accountSid = "AC71c11b0625ac2c63b63b7cf04cbe3dca"
  const authToken = "b11e8f94465770fce4904c39584b398f" // You'll need to change this later
  const serviceSid = "VAa16503cbafc02cea0db79f5e3f4e5279"

  const hasCredentials = !!accountSid && !!authToken && !!serviceSid

  return NextResponse.json({
    hasCredentials,
    accountSidExists: !!accountSid,
    authTokenExists: !!authToken,
    serviceSidExists: !!serviceSid,
  })
}
