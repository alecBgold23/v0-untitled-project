import { NextResponse } from "next/server"
import { Resend } from "resend"

// Initialize Resend client with your API key
const resendApiKey = "re_ScJSZp6x_8Gq33AABtqtiMLPUGqGaicCt"
const resend = new Resend(resendApiKey)

export async function POST(request) {
  console.log("Contact email API route called")

  try {
    // Parse the request body
    const body = await request.json()
    console.log("Request body:", body)

    const { name, email, inquiryType, message } = body

    // Create email content
    const emailContent = `
      New contact form submission:
      - Name: ${name || "Not provided"}
      - Email: ${email || "Not provided"}
      - Inquiry Type: ${inquiryType || "Not provided"}
      - Message: ${message || "Not provided"}
      
      Submitted on: ${new Date().toLocaleString()}
    `

    console.log("Preparing to send email with content:", emailContent)
    console.log("Using Resend API key:", resendApiKey.substring(0, 5) + "...")

    // Send the email
    const { data, error } = await resend.emails.send({
      from: "BluBerry <onboarding@resend.dev>",
      to: ["alecgold808@gmail.com"],
      subject: `New Contact Form Submission from ${name || "Unknown User"}`,
      text: emailContent,
    })

    // Log the response
    if (error) {
      console.error("Resend API error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("Email sent successfully:", data)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error in send-contact-email API route:", error)
    return NextResponse.json({ error: "Failed to send email: " + (error.message || "Unknown error") }, { status: 500 })
  }
}
