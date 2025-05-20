import { NextResponse } from "next/server"

export async function GET() {
  const requiredEnvVars = ["EMAIL_PASSWORD", "CONTACT_EMAIL"]

  const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

  return NextResponse.json({
    success: missingEnvVars.length === 0,
    missingVars: missingEnvVars,
  })
}
