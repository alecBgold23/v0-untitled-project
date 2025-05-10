import { NextResponse } from "next/server"
import { sendGmail } from "@/lib/nodemailer"

export async function GET() {
  try {
    const recipientEmail = process.env.CONTACT_EMAIL || "alecgold808@gmail.com"

    console.log("Testing email sending to:", recipientEmail)
    console.log("Using email credentials:", {
      email: process.env.CONTACT_EMAIL ? "Set" : "Not set",
      password: process.env.EMAIL_PASSWORD ? "Set" : "Not set",
    })

    const result = await sendGmail({
      to: recipientEmail,
      subject: "Test Email from BluBerry",
      html: `
        <h1>This is a test email</h1>
        <p>If you're receiving this, the email functionality is working correctly.</p>
        <p>Time sent: ${new Date().toLocaleString()}</p>
      `,
    })

    if (result.success) {
      return NextResponse.json({ success: true, message: "Test email sent successfully" })
    } else {
      return NextResponse.json(
        { success: false, message: "Failed to send test email", error: result.error },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in test-email route:", error)
    return NextResponse.json(
      { success: false, message: "Error in test-email route", error: String(error) },
      { status: 500 },
    )
  }
}
