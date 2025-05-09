import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

// Initialize Resend client with your API key
const resend = new Resend("re_ScJSZp6x_8Gq33AABtqtiMLPUGqGaicCt")

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      itemName,
      itemCategory,
      itemDescription,
      itemCondition,
      itemIssues,
      fullName,
      email,
      phone,
      zipCode,
      address,
      pickupDate,
    } = body

    const emailContent = `
      New Item Submission:
      
      Item Details:
      - Name: ${itemName || "Not provided"}
      - Category: ${itemCategory || "Not provided"}
      - Description: ${itemDescription || "Not provided"}
      - Condition: ${itemCondition || "Not provided"}
      - Issues/Defects: ${itemIssues || "None mentioned"}
      
      Customer Information:
      - Name: ${fullName || "Not provided"}
      - Email: ${email || "Not provided"}
      - Phone: ${phone || "Not provided"}
      - ZIP Code: ${zipCode || "Not provided"}
      - Address: ${address || "Not provided"}
      - Preferred Pickup Date: ${pickupDate || "Not specified"}
      
      This submission was received on ${new Date().toLocaleString()}.
    `

    const response = await resend.emails.send({
      from: "BluBerry <alecgold808@gmail.com>", // Update with your sender email
      to: ["alecgold808@gmail.com"], // Update with recipient email
      subject: `New Item Submission: ${itemName || "Unnamed Item"}`,
      text: emailContent,
    })

    return NextResponse.json({ message: "Email sent successfully!", data: response }, { status: 200 })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
