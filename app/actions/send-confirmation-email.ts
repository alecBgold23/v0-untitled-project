"use server"

import { Resend } from "resend"

// Initialize Resend client with your API key
const resend = new Resend("re_ScJSZp6x_8Gq33AABtqtiMLPUGqGaicCt")

type FormData = {
  fullName: string
  email: string
  itemName: string
  itemCategory: string
  itemCondition: string
}

export async function sendConfirmationEmail(data: FormData) {
  try {
    // Use default values for any missing data
    const safeData = {
      fullName: data.fullName || "Customer",
      email: data.email || "customer@example.com",
      itemName: data.itemName || "Item",
      itemCategory: data.itemCategory || "Uncategorized",
      itemCondition: data.itemCondition || "Not specified",
    }

    // Create plain text email content for customer
    const customerEmailContent = `
      Hello ${safeData.fullName},

      Thank you for submitting your ${safeData.itemName} to BluBerry! We've received your submission and our team is reviewing it now.

      Item Details:
      - Item: ${safeData.itemName}
      - Category: ${safeData.itemCategory}
      - Condition: ${safeData.itemCondition}

      What's Next?
      1. Our team will evaluate your item details
      2. We'll email you a price offer within 24 hours
      3. If you accept, we'll schedule a convenient pickup time
      4. We'll arrive at the scheduled time and provide payment on the spot

      If you have any questions, please reply to this email.

      © ${new Date().getFullYear()} BluBerry. All rights reserved.
    `

    // Create plain text email content for admin
    const adminEmailContent = `
      New Item Submission

      A new item has been submitted to BluBerry.

      Customer Details:
      - Name: ${safeData.fullName}
      - Email: ${safeData.email}

      Item Details:
      - Item: ${safeData.itemName}
      - Category: ${safeData.itemCategory}
      - Condition: ${safeData.itemCondition}

      Please review this submission and respond with an offer within 24 hours.
    `

    // Send email to customer
    const customerResponse = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "onboarding@resend.dev", // Using Resend's testing email
      subject: "Thank You for Your Submission to BluBerry",
      text: customerEmailContent,
    })

    if (customerResponse.error) {
      throw new Error(`Failed to send customer email: ${customerResponse.error.message}`)
    }

    // Send notification email to admin
    const adminResponse = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "onboarding@resend.dev", // Using Resend's testing email
      subject: `New Item Submission: ${safeData.itemName}`,
      text: adminEmailContent,
    })

    if (adminResponse.error) {
      throw new Error(`Failed to send admin email: ${adminResponse.error.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error: "Failed to send confirmation email: " + error.message }
  }
}
