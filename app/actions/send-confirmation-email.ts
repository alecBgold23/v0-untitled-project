"use server"

import { Resend } from "resend"
import nodemailer from "nodemailer"

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
      imageUrl: data.imageUrl || "",
    }

    // Format the item condition to be more readable
    const formattedCondition = safeData.itemCondition
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")

    // 1. Send confirmation email to customer
    const customerEmailResult = await resend.emails.send({
      from: "BluBerry <onboarding@resend.dev>",
      to: safeData.email,
      subject: `We've received your ${safeData.itemName} submission!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #4f46e5; text-align: center;">Item Submission Confirmation</h2>
          <p>Hello ${safeData.fullName},</p>
          <p>Thank you for submitting your item to BluBerry! We've received your submission and will review it shortly.</p>
          
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #4f46e5;">Item Details</h3>
            <p><strong>Item Name:</strong> ${safeData.itemName}</p>
            <p><strong>Category:</strong> ${safeData.itemCategory}</p>
            <p><strong>Condition:</strong> ${formattedCondition}</p>
            <p><strong>Description:</strong> ${safeData.itemDescription}</p>
            <p><strong>Issues/Defects:</strong> ${safeData.itemIssues}</p>
            ${safeData.imageUrl ? `<p><strong>Image:</strong> <a href="${safeData.imageUrl}" target="_blank">View Image</a></p>` : ""}
          </div>
          
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #4f46e5;">What happens next:</h3>
            <ol>
              <li>Our team will evaluate your item details</li>
              <li>We'll email you a price offer within 24 hours</li>
              <li>If you accept, we'll schedule a convenient pickup time</li>
              <li>We'll arrive at the scheduled time and provide payment on the spot</li>
            </ol>
          </div>
          
          <p>If you have any questions, please reply to this email or call us at (555) 123-4567.</p>
          
          <p style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px;">
            &copy; ${new Date().getFullYear()} BluBerry. All rights reserved.
          </p>
        </div>
      `,
    })

    console.log("Customer email result:", customerEmailResult)

    // 2. Send notification email to admin
    const adminEmailResult = await resend.emails.send({
      from: "BluBerry Item Submission <onboarding@resend.dev>",
      to: adminEmail,
      subject: `New Item Submission: ${safeData.itemName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #4f46e5; text-align: center;">New Item Submission</h2>
          
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #4f46e5;">Customer Information</h3>
            <p><strong>Name:</strong> ${safeData.fullName}</p>
            <p><strong>Email:</strong> ${safeData.email}</p>
            <p><strong>Phone:</strong> ${safeData.phone}</p>
            <p><strong>Address:</strong> ${safeData.address}</p>
            <p><strong>Preferred Pickup Date:</strong> ${safeData.pickupDate}</p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #4f46e5;">Item Details</h3>
            <p><strong>Name:</strong> ${safeData.itemName}</p>
            <p><strong>Category:</strong> ${safeData.itemCategory}</p>
            <p><strong>Condition:</strong> ${formattedCondition}</p>
            <p><strong>Description:</strong> ${safeData.itemDescription}</p>
            <p><strong>Issues/Defects:</strong> ${safeData.itemIssues}</p>
            ${safeData.imageUrl ? `<p><strong>Image:</strong> <a href="${safeData.imageUrl}" target="_blank">View Image</a></p>` : ""}
          </div>
          
          <p>Please review this submission and respond to the customer within 24 hours.</p>
        </div>
      `,
    })

    console.log("Admin email result:", adminEmailResult)

    // Also send via nodemailer as a backup if available
    try {
      const contactEmail = process.env.CONTACT_EMAIL
      const emailPassword = process.env.EMAIL_PASSWORD

      if (contactEmail && emailPassword) {
        // Create a transporter
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: contactEmail,
            pass: emailPassword,
          },
          secure: true,
        })

        // Send the email to customer
        await transporter.sendMail({
          from: `"BluBerry Notification" <${contactEmail}>`,
          to: safeData.email,
          subject: `We've received your ${safeData.itemName} submission!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <h2 style="color: #4f46e5; text-align: center;">Item Submission Confirmation</h2>
              <p>Hello ${safeData.fullName},</p>
              <p>Thank you for submitting your item to BluBerry! We've received your submission and will review it shortly.</p>
              
              <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #4f46e5;">Item Details</h3>
                <p><strong>Item Name:</strong> ${safeData.itemName}</p>
                <p><strong>Category:</strong> ${safeData.itemCategory}</p>
                <p><strong>Condition:</strong> ${formattedCondition}</p>
                <p><strong>Description:</strong> ${safeData.itemDescription}</p>
                <p><strong>Issues/Defects:</strong> ${safeData.itemIssues}</p>
                ${safeData.imageUrl ? `<p><strong>Image:</strong> <a href="${safeData.imageUrl}" target="_blank">View Image</a></p>` : ""}
              </div>
              
              <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #4f46e5;">What happens next:</h3>
                <ol>
                  <li>Our team will evaluate your item details</li>
                  <li>We'll email you a price offer within 24 hours</li>
                  <li>If you accept, we'll schedule a convenient pickup time</li>
                  <li>We'll arrive at the scheduled time and provide payment on the spot</li>
                </ol>
              </div>
              
              <p>If you have any questions, please reply to this email or call us at (555) 123-4567.</p>
              
              <p style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px;">
                &copy; ${new Date().getFullYear()} BluBerry. All rights reserved.
              </p>
            </div>
          `,
        })

        console.log("Backup nodemailer email sent successfully")
      }
    } catch (nodemailerError) {
      console.error("Error sending backup nodemailer email:", nodemailerError)
      // Continue execution even if nodemailer fails
    }

    return { success: true }
  } catch (error) {
    console.error("Error sending email:", error)
    return {
      success: false,
      error: error.message || "Failed to send email",
    }
  }
}
