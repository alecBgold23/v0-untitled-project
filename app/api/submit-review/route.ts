import { NextResponse } from "next/server"
import { sendGmail } from "@/lib/nodemailer"

export async function POST(request) {
  try {
    const { name, email, rating, comment } = await request.json()

    // Validate form data
    if (!name || !email || !rating || !comment) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    const recipientEmail = process.env.CONTACT_EMAIL || "alecgold808@gmail.com"

    console.log("Sending review notification to:", recipientEmail)

    // Use our new email utility function
    const result = await sendGmail({
      to: recipientEmail,
      subject: `New Review Submission: ${rating} Stars from ${name}`,
      html: `
        <h1>New Review Submission</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Rating:</strong> ${rating} Stars</p>
        <p><strong>Review:</strong></p>
        <p>${comment.replace(/\n/g, "<br>")}</p>
        <p><em>Submitted at: ${new Date().toLocaleString()}</em></p>
      `,
    })

    if (result.success) {
      return NextResponse.json({ success: true, message: "Review submitted successfully!" }, { status: 200 })
    } else {
      console.error("Error in email service:", result.error)
      return NextResponse.json(
        { success: false, message: "Failed to submit review. Please try again later.", error: result.error },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error sending review email:", error)
    return NextResponse.json(
      { success: false, message: "Failed to submit review. Please try again later.", error: String(error) },
      { status: 500 },
    )
  }
}
