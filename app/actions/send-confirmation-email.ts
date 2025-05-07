"use server"

import nodemailer from "nodemailer"

type FormData = {
  fullName: string
  email: string
  itemName: string
  itemCategory: string
  itemCondition: string
}

export async function sendConfirmationEmail(data: FormData) {
  try {
    const contactEmail = process.env.CONTACT_EMAIL
    const emailPassword = process.env.EMAIL_PASSWORD

    if (!contactEmail || !emailPassword) {
      throw new Error("Email configuration is missing")
    }

    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: contactEmail,
        pass: emailPassword,
      },
    })

    // Email to customer
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #0066ff; margin-bottom: 10px;">BluBerry</h1>
          <div style="height: 4px; width: 100px; background: linear-gradient(to right, #0066ff, #6a5acd, #8c52ff); margin: 0 auto 20px;"></div>
        </div>
        
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hello ${data.fullName},</p>
        
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Thank you for submitting your ${data.itemName} to BluBerry! We've received your submission and our team is reviewing it now.</p>
        
        <div style="background-color: #f5f8ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #0066ff; font-size: 18px; margin-top: 0;">Item Details</h2>
          <p style="margin: 5px 0;"><strong>Item:</strong> ${data.itemName}</p>
          <p style="margin: 5px 0;"><strong>Category:</strong> ${data.itemCategory}</p>
          <p style="margin: 5px 0;"><strong>Condition:</strong> ${data.itemCondition}</p>
        </div>
        
        <h2 style="color: #0066ff; font-size: 18px;">What's Next?</h2>
        <ol style="color: #333; padding-left: 20px;">
          <li style="margin-bottom: 10px;">Our team will evaluate your item details</li>
          <li style="margin-bottom: 10px;">We'll email you a price offer within 24 hours</li>
          <li style="margin-bottom: 10px;">If you accept, we'll schedule a convenient pickup time</li>
          <li style="margin-bottom: 10px;">We'll arrive at the scheduled time and provide payment on the spot</li>
        </ol>
        
        <p style="font-size: 16px; color: #333; margin-top: 30px;">If you have any questions, please reply to this email or contact us at ${contactEmail}.</p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #666; font-size: 14px;">© ${new Date().getFullYear()} BluBerry. All rights reserved.</p>
        </div>
      </div>
    `

    // Email to admin
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #0066ff; margin-bottom: 10px;">New Item Submission</h1>
        </div>
        
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">A new item has been submitted to BluBerry.</p>
        
        <div style="background-color: #f5f8ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #0066ff; font-size: 18px; margin-top: 0;">Customer Details</h2>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${data.fullName}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${data.email}</p>
        </div>
        
        <div style="background-color: #f5f8ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #0066ff; font-size: 18px; margin-top: 0;">Item Details</h2>
          <p style="margin: 5px 0;"><strong>Item:</strong> ${data.itemName}</p>
          <p style="margin: 5px 0;"><strong>Category:</strong> ${data.itemCategory}</p>
          <p style="margin: 5px 0;"><strong>Condition:</strong> ${data.itemCondition}</p>
        </div>
        
        <p style="font-size: 16px; color: #333; margin-top: 30px;">Please review this submission and respond with an offer within 24 hours.</p>
      </div>
    `

    // Send email to customer
    await transporter.sendMail({
      from: `"BluBerry" <${contactEmail}>`,
      to: data.email,
      subject: "Thank You for Your Submission to BluBerry",
      html: customerEmailHtml,
    })

    // Send notification email to admin
    await transporter.sendMail({
      from: `"BluBerry System" <${contactEmail}>`,
      to: contactEmail,
      subject: `New Item Submission: ${data.itemName}`,
      html: adminEmailHtml,
    })

    return { success: true }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error: "Failed to send confirmation email" }
  }
}
