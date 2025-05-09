import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

// Initialize Resend client with your API key
// In production, you should use environment variables for API keys
const resend = new Resend("re_ScJSZp6x_8Gq33AABtqtiMLPUGqGaicCt")

export async function POST(request: NextRequest) {
  try {
    const { email, subject, message } = await request.json()

    if (!email || !subject || !message) {
      return NextResponse.json({ error: "Email, subject, and message are required" }, { status: 400 })
    }

    // Send the email via Resend API
    const response = await resend.emails.send({
      from: "BluBerry <alecgold808@gmail.com>", // Update with your verified sender
      to: [email], // Send to the provided email
      subject: subject,
      text: message,
      // You can also use HTML for more formatted emails
      // html: `<p>${message}</p>`,
    })

    return NextResponse.json({ message: "Email sent successfully!", data: response }, { status: 200 })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
