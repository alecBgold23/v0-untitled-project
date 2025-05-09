import { NextResponse } from "next/server"
import { Resend } from "resend"

// Initialize Resend client with your API key
const resend = new Resend("re_ScJSZp6x_8Gq33AABtqtiMLPUGqGaicCt")

export async function POST(request) {
  try {
    // Parse the request body
    const body = await request.json()
    const { itemName, itemDescription, itemCondition, pickupLocation, email } = body

    // Create email content
    const emailContent = `
      New item submission details:
      - Item Name: ${itemName || "Not provided"}
      - Item Description: ${itemDescription || "Not provided"}
      - Item Condition: ${itemCondition || "Not provided"}
      - Pickup Location: ${pickupLocation || "Not provided"}
      - Customer Email: ${email || "Not provided"}
      
      Submitted on: ${new Date().toLocaleString()}
    `

    // Send the email using Resend's emails.send method
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "onboarding@resend.dev", // Using Resend's testing email address
      subject: `New Item Submission: ${itemName || "Unnamed Item"}`,
      text: emailContent,
    })

    if (error) {
      console.error("Resend API error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Email sent successfully!" })
  } catch (error) {
    console.error("Error in send-item-email API route:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
