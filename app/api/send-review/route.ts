import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend("re_ScJSZp6x_8Gq33AABtqtiMLPUGqGaicCt")

export async function POST(request) {
  try {
    const { name, email, rating, comment } = await request.json()

    // Validate form data
    if (!name || !email || !rating || !comment) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    const data = await resend.emails.send({
      from: "BluBerry Reviews <no-reply@bluberryhq.com>",
      to: "alecgold808@gmail.com",
      subject: `New Review from BluBerryHQ: ${rating} Stars`,
      html: `
        <h2>New Review Submitted</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Rating:</strong> ${rating} Stars</p>
        <p><strong>Review:</strong><br/>${comment.replace(/\n/g, "<br>")}</p>
        <p><em>Submitted at: ${new Date().toLocaleString()}</em></p>
      `,
    })

    console.log("Email sent successfully:", data)
    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    console.error("Resend error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to send email.", error: String(error) },
      { status: 500 },
    )
  }
}
