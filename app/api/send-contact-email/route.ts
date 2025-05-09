import { NextResponse } from "next/server"
import { Resend } from "resend"

// Initialize Resend client with your API key
const resend = new Resend("re_ScJSZp6x_8Gq33AABtqtiMLPUGqGaicCt")

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, message } = body

    const emailContent = `
      New contact form submission:
      - Name: ${name}
      - Email: ${email}
      - Message: ${message}
    `

    const response = await resend.emails.send({
      from: "onboarding@resend.dev", // Default verified sender
      to: ["alecgold808@gmail.com"], // Your email address
      subject: `New Contact Form Submission from ${name}`,
      text: emailContent,
    })

    return NextResponse.json({ message: "Email sent successfully!", data: response })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
