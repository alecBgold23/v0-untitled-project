import { NextResponse } from "next/server"
import Resend from "resend"

// Initialize Resend client with your API key
const resend = new Resend("re_ScJSZp6x_8Gq33AABtqtiMLPUGqGaicCt")

export async function POST(request: Request) {
  try {
    const { name, email, inquiryType, message } = await request.json()

    const emailContent = `
      New contact form submission:
      - Name: ${name}
      - Email: ${email}
      - Inquiry Type: ${inquiryType}
      - Message: ${message}
      
      Submitted: ${new Date().toLocaleString()}
    `

    const response = await resend.emails.send({
      from: "BluBerry <onboarding@resend.dev>", // Use Resend's default sender or your verified domain
      to: "alecgold808@gmail.com", // Your email address (the recipient)
      subject: `New Contact Form Submission from ${name}`,
      text: emailContent,
    })

    return NextResponse.json({ message: "Email sent successfully!", response })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
