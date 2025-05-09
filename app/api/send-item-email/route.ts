import { NextResponse } from "next/server"
import { Resend } from "resend"

// Initialize Resend client with your API key
const resend = new Resend("re_ScJSZp6x_8Gq33AABtqtiMLPUGqGaicCt")

export async function POST(request) {
  try {
    const body = await request.json()
    const { itemName, itemDescription, itemCondition, pickupLocation, email } = body

    const emailContent = `
      New item submission:
      - Item Name: ${itemName || "Not provided"}
      - Item Description: ${itemDescription || "Not provided"}
      - Item Condition: ${itemCondition || "Not provided"}
      - Pickup Location: ${pickupLocation || "Not provided"}
      - Customer Email: ${email || "Not provided"}
      
      This submission was received on ${new Date().toLocaleString()}.
    `

    const response = await resend.emails.send({
      from: "onboarding@resend.dev", // Default verified sender
      to: ["alecgold808@gmail.com"], // Your email address
      subject: `New Item Submission: ${itemName || "Unnamed Item"}`,
      text: emailContent,
    })

    return NextResponse.json({ message: "Email sent successfully!", data: response })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
