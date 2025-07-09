import { NextResponse } from "next/server"
import { Resend } from "resend"

const resendApiKey = "re_ScJSZp6x_8Gq33AABtqtiMLPUGqGaicCt"
const resend = new Resend(resendApiKey)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      phone,
      zipCode,
      city,
      state,
      serviceType,
      itemTypes,
      estimatedValue,
      timeframe,
      additionalInfo,
    } = body

    const emailContent = `
  New Service Area Request:
  
  Contact Information:
  - Name: ${name}
  - Email: ${email}
  - Phone: ${phone}
  
  Location Details:
  - City: ${city}
  - State: ${state}
  - ZIP Code: ${zipCode}
  
  Service Details:
  - Service Type: ${serviceType}
  - Item Types: ${itemTypes || "Not specified"}
  - Estimated Value: ${estimatedValue || "Not specified"}
  - Preferred Timeframe: ${timeframe || "Not specified"}
  
  Additional Information:
  ${additionalInfo || "None provided"}
  
  Submitted on: ${new Date().toLocaleString()}
`

    const { data, error } = await resend.emails.send({
      from: "BluBerry Service Request <onboarding@resend.dev>",
      to: ["alecgold808@gmail.com"],
      subject: `Service Area Request: ${city}, ${state} ${zipCode} - ${name}`,
      text: emailContent,
    })

    if (error) {
      console.error("Resend API error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error in send-service-request API route:", error)
    return NextResponse.json(
      {
        error: "Failed to send service request: " + (error.message || "Unknown error"),
      },
      { status: 500 },
    )
  }
}
