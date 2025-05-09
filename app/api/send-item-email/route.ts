import { NextResponse } from "next/server"
import { Resend } from "resend"

// Initialize Resend client with your API key
const resend = new Resend("re_ScJSZp6x_8Gq33AABtqtiMLPUGqGaicCt")

export async function POST(request) {
  try {
    const body = await request.json()
    const { itemName, itemDescription, itemCondition, pickupLocation, email } = body

    const emailContent = `
      New item submission details:
      - Item Name: ${itemName}
      - Item Description: ${itemDescription}
      - Item Condition: ${itemCondition}
      - Pickup Location: ${pickupLocation}
      - Customer Email: ${email}
    `

    const response = await resend.emails.send({
      from: "onboarding@resend.dev", // Default verified sender
      to: ["alecgold808@gmail.com"], // Your email address
      subject: `New Item Submission: ${itemName}`,
      text: emailContent,
    })

    return NextResponse.json({ message: "Email sent successfully!", data: response })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
