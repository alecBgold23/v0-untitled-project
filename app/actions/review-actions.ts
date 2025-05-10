"use server"

import { sendEmail } from "@/lib/email"

export async function sendReviewEmail(formData: {
  name: string
  email: string
  rating: string
  comment: string
}) {
  try {
    const { name, email, rating, comment } = formData

    // Validate form data
    if (!name || !email || !rating || !comment) {
      return { success: false, message: "All fields are required" }
    }

    // Use the existing email utility function
    const result = await sendEmail({
      to: process.env.CONTACT_EMAIL || "alecgold808@gmail.com",
      subject: `New Review Submission: ${rating} Stars from ${name}`,
      html: `
        <h1>New Review Submission</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Rating:</strong> ${rating} Stars</p>
        <p><strong>Review:</strong></p>
        <p>${comment.replace(/\n/g, "<br>")}</p>
      `,
    })

    if (result.success) {
      return { success: true, message: "Review submitted successfully!" }
    } else {
      console.error("Error in email service:", result.error)
      return { success: false, message: "Failed to submit review. Please try again later." }
    }
  } catch (error) {
    console.error("Error sending review email:", error)
    return { success: false, message: "Failed to submit review. Please try again later." }
  }
}
