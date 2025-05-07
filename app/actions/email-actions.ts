"use server"

import nodemailer from "nodemailer"

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "alecgold808@gmail.com", // Your Gmail address
    pass: process.env.EMAIL_PASSWORD, // Using the environment variable
  },
  secure: true,
})

// The recipient email address (your email)
const RECIPIENT_EMAIL = "alecgold808@gmail.com"

export async function sendContactFormEmail(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const inquiryType = formData.get("inquiryType") as string
    const message = formData.get("message") as string

    // Validate form data
    if (!name || !email || !inquiryType || !message) {
      return { success: false, message: "All fields are required" }
    }

    // Email content
    const mailOptions = {
      from: `"BluBerry Contact Form" <alecgold808@gmail.com>`,
      to: RECIPIENT_EMAIL,
      subject: `New Contact Form Submission: ${inquiryType}`,
      html: `
        <h1>New Contact Form Submission</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Inquiry Type:</strong> ${inquiryType}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    }

    console.log("Sending email with:", mailOptions)

    // Send the email - this line is now active
    const info = await transporter.sendMail(mailOptions)
    console.log("Email sent:", info.response)

    return { success: true, message: "Message sent successfully!" }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, message: "Failed to send message. Please try again later." }
  }
}

export async function sendItemSubmissionEmail(formData: FormData) {
  try {
    // Extract form data
    const itemCategory = formData.get("itemCategory") as string
    const itemName = formData.get("itemName") as string
    const itemDescription = formData.get("itemDescription") as string
    const itemCondition = formData.get("itemCondition") as string
    const itemIssues = formData.get("itemIssues") as string
    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const zipCode = formData.get("zipCode") as string

    // Validate form data
    if (
      !itemCategory ||
      !itemName ||
      !itemDescription ||
      !itemCondition ||
      !itemIssues ||
      !fullName ||
      !email ||
      !phone ||
      !zipCode
    ) {
      return { success: false, message: "All fields are required" }
    }

    // Handle photo data (in a real implementation, you would upload these to storage)
    // For now, we'll just count them
    const photoCount = formData.getAll("photos").length

    // Email content
    const mailOptions = {
      from: `"BluBerry Item Submission" <alecgold808@gmail.com>`,
      to: RECIPIENT_EMAIL,
      subject: `New Item Submission: ${itemName}`,
      html: `
        <h1>New Item Submission</h1>
        <h2>Item Details</h2>
        <p><strong>Category:</strong> ${itemCategory}</p>
        <p><strong>Name:</strong> ${itemName}</p>
        <p><strong>Description:</strong> ${itemDescription}</p>
        <p><strong>Photos:</strong> ${photoCount} photos uploaded</p>
        
        <h2>Condition</h2>
        <p><strong>Condition:</strong> ${itemCondition}</p>
        <p><strong>Issues/Defects:</strong> ${itemIssues.replace(/\n/g, "<br>")}</p>
        
        <h2>Contact Information</h2>
        <p><strong>Full Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>ZIP Code:</strong> ${zipCode}</p>
      `,
    }

    console.log("Sending email with:", mailOptions)

    // Send the email - this line is now active
    const info = await transporter.sendMail(mailOptions)
    console.log("Email sent:", info.response)

    return { success: true, message: "Item submitted successfully!" }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, message: "Failed to submit item. Please try again later." }
  }
}
