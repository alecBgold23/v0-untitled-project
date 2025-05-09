"use server"

import { Resend } from "resend"

// Initialize Resend with your API key
const resend = new Resend("re_ScJSZp6x_8Gq33AABtqtiMLPUGqGaicCt")

// Admin email to receive notifications
const adminEmail = "alecgold808@gmail.com"

export async function sendConfirmationEmail(data) {
  console.log("Sending confirmation email with data:", data)

  try {
    // Ensure we have valid data
    const safeData = {
      fullName: data.fullName || "Customer",
      email: data.email || "test@example.com",
      itemName: data.itemName || "Item",
      itemCategory: data.itemCategory || "Not specified",
      itemCondition: data.itemCondition || "Not specified",
      itemDescription: data.itemDescription || "No description provided",
      itemIssues: data.itemIssues || "None reported",
      phone: data.phone || "Not provided",
      address: data.address || "Not provided",
      pickupDate: data.pickupDate || "Not specified",
    }

    // 1. Send confirmation email to customer
    const customerEmailResult = await resend.emails.send({
      from: "BluBerry <onboarding@resend.dev>",
      to: safeData.email,
      subject: `We've received your ${safeData.itemName} submission!`,
      text: `
Hello ${safeData.fullName},

Thank you for submitting your item to BluBerry! We've received your submission and will review it shortly.

Item Details:
- Name: ${safeData.itemName}
- Category: ${safeData.itemCategory}
- Condition: ${safeData.itemCondition}
- Description: ${safeData.itemDescription}
${safeData.itemIssues ? `- Issues: ${safeData.itemIssues}` : ""}

What happens next:
1. Our team will evaluate your item details
2. We'll email you a price offer within 24 hours
3. If you accept, we'll schedule a convenient pickup time
4. We'll arrive at the scheduled time and provide payment on the spot

If you have any questions, please reply to this email or call us at (555) 123-4567.

Thank you for choosing BluBerry!

The BluBerry Team
      `,
    })

    console.log("Customer email result:", customerEmailResult)

    // 2. Send notification email to admin
    const adminEmailResult = await resend.emails.send({
      from: "BluBerry Item Submission <onboarding@resend.dev>",
      to: adminEmail,
      subject: `New Item Submission: ${safeData.itemName}`,
      text: `
New item submission details:

Customer Information:
- Name: ${safeData.fullName}
- Email: ${safeData.email}
- Phone: ${safeData.phone}
- Address: ${safeData.address}
- Preferred Pickup Date: ${safeData.pickupDate}

Item Details:
- Name: ${safeData.itemName}
- Category: ${safeData.itemCategory}
- Condition: ${safeData.itemCondition}
- Description: ${safeData.itemDescription}
${safeData.itemIssues ? `- Issues: ${safeData.itemIssues}` : ""}

Please review this submission and respond to the customer within 24 hours.
      `,
    })

    console.log("Admin email result:", adminEmailResult)

    return { success: true }
  } catch (error) {
    console.error("Error sending email:", error)
    return {
      success: false,
      error: error.message || "Failed to send email",
    }
  }
}
