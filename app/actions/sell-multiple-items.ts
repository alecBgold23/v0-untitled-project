"use server"

import { createSupabaseServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { isBlockedContent } from "@/lib/content-filter"
import { Resend } from "resend"
import { sendConfirmationEmail } from "./send-confirmation-email"

interface ItemData {
  name: string
  description: string
  condition: string
  issues: string
  imagePath?: string
  imageUrl?: string
  imagePaths?: string[]
  imageUrls?: string[]
  estimatedPrice?: string
  photos?: Array<{
    name: string
    type: string
    size: number
  }>
}

interface ContactInfo {
  fullName: string
  email: string
  phone: string
  address: string
  pickupDate: string
}

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY || "re_ScJSZp6x_8Gq33AABtqtiMLPUGqGaicCt")

// Admin email to receive notifications
const adminEmail = process.env.ADMIN_EMAIL || "alecgold808@gmail.com"

// Helper function to format phone number
function formatPhoneNumber(phone) {
  if (!phone) return null

  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "")

  // Ensure US format if it's a 10-digit number
  if (cleaned.length === 10) {
    cleaned = `+1${cleaned}`
  } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
    cleaned = `+${cleaned}`
  }

  // If no plus sign, add it
  if (!cleaned.startsWith("+")) {
    cleaned = `+${cleaned}`
  }

  return cleaned
}

// Helper function to send confirmation email to user
async function sendUserConfirmationEmail(email: string, name: string, items: ItemData[]) {
  console.log("Attempting to send user confirmation email to:", email)

  try {
    const totalEstimatedValue = items
      .filter((item) => item.estimatedPrice)
      .reduce((total, item) => {
        const price = Number.parseFloat(item.estimatedPrice?.replace(/[^0-9.]/g, "") || "0")
        return total + price
      }, 0)

    // HTML version of the email for better formatting
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #4f46e5; text-align: center;">Item Submission Confirmation</h2>
      <p>Dear ${name},</p>
      <p>Thank you for submitting your items for sale! We have received the following ${items.length} item(s):</p>
      
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
        ${items
          .map(
            (item, index) => `
          <div style="margin-bottom: 15px; padding-bottom: 15px; ${index < items.length - 1 ? "border-bottom: 1px solid #e5e7eb;" : ""}">
            <h3 style="margin-top: 0; color: #4f46e5;">${index + 1}. ${item.name}</h3>
            <p><strong>Description:</strong> ${item.description}</p>
            <p><strong>Condition:</strong> ${item.condition}</p>
            ${item.estimatedPrice ? `<p><strong>Estimated Price:</strong> ${item.estimatedPrice}</p>` : "<p><strong>Price:</strong> To be determined</p>"}
            ${item.issues ? `<p><strong>Issues:</strong> ${item.issues}</p>` : ""}
            ${item.imageUrl ? `<p><img src="${item.imageUrl}" alt="${item.name}" style="max-width: 200px; max-height: 200px; border-radius: 5px;"></p>` : ""}
          </div>
        `,
          )
          .join("")}
        
        ${totalEstimatedValue > 0 ? `<p style="font-weight: bold; margin-top: 15px;">Total Estimated Value: $${totalEstimatedValue.toFixed(2)}</p>` : ""}
      </div>
      
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #4f46e5;">What happens next:</h3>
        <ol>
          <li>Our team will review your submission within 24-48 hours</li>
          <li>We'll contact you to schedule a pickup or drop-off</li>
          <li>Final pricing will be determined after physical inspection</li>
        </ol>
      </div>
      
      <p>If you have any questions, please don't hesitate to contact us.</p>
      
      <p><strong>Best regards,</strong><br>The Sales Team</p>
      
      <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
        <p><strong>Contact Information:</strong><br>
        Email: ${process.env.CONTACT_EMAIL || "support@yourcompany.com"}<br>
        Phone: ${process.env.CONTACT_PHONE || "(555) 123-4567"}</p>
        
        <p style="text-align: center; margin-top: 20px; font-size: 12px;">
          &copy; ${new Date().getFullYear()} BluBerry. All rights reserved.
        </p>
      </div>
    </div>
    `

    // Try sending email via Resend
    try {
      console.log("Attempting to send email via Resend...")
      const result = await resend.emails.send({
        from: "BluBerry <onboarding@resend.dev>",
        to: email,
        subject: "Item Submission Confirmation - Your Items Have Been Received",
        html: htmlContent,
      })

      console.log("Resend email result:", result)
      return { success: true, id: result.id }
    } catch (error) {
      console.error("Error sending user confirmation email with Resend:", error)
      return { success: false, error: error.message }
    }
  } catch (error) {
    console.error("Error in sendUserConfirmationEmail:", error)
    return { success: false, error: error.message }
  }
}

// Helper function to send notification email to admin
async function sendAdminNotificationEmail(contactInfo: ContactInfo, items: ItemData[]) {
  console.log("Attempting to send admin notification email")

  try {
    if (!adminEmail) {
      console.log("No admin email configured, skipping admin notification")
      return { success: false, error: "No admin email configured" }
    }

    console.log("Sending admin notification to:", adminEmail)

    const totalEstimatedValue = items
      .filter((item) => item.estimatedPrice)
      .reduce((total, item) => {
        const price = Number.parseFloat(item.estimatedPrice?.replace(/[^0-9.]/g, "") || "0")
        return total + price
      }, 0)

    // HTML version for better formatting
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #4f46e5; text-align: center;">New Item Submission Received</h2>
      
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #4f46e5;">Customer Information</h3>
        <p><strong>Name:</strong> ${contactInfo.fullName}</p>
        <p><strong>Email:</strong> ${contactInfo.email}</p>
        <p><strong>Phone:</strong> ${contactInfo.phone}</p>
        <p><strong>Address:</strong> ${contactInfo.address || "Not provided"}</p>
        <p><strong>Preferred Pickup Date:</strong> ${contactInfo.pickupDate || "Not specified"}</p>
      </div>
      
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #4f46e5;">Submission Details</h3>
        <p><strong>Number of Items:</strong> ${items.length}</p>
        <p><strong>Total Estimated Value:</strong> ${totalEstimatedValue > 0 ? `$${totalEstimatedValue.toFixed(2)}` : "Not calculated"}</p>
        <p><strong>Submission Time:</strong> ${new Date().toLocaleString()}</p>
      </div>
      
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #4f46e5;">Items Submitted</h3>
        ${items
          .map(
            (item, index) => `
          <div style="margin-bottom: 15px; padding-bottom: 15px; ${index < items.length - 1 ? "border-bottom: 1px solid #e5e7eb;" : ""}">
            <h4 style="margin-top: 0; color: #4f46e5;">${index + 1}. ${item.name}</h4>
            <p><strong>Description:</strong> ${item.description}</p>
            <p><strong>Condition:</strong> ${item.condition}</p>
            ${item.estimatedPrice ? `<p><strong>Estimated Price:</strong> ${item.estimatedPrice}</p>` : "<p><strong>Price:</strong> Not estimated</p>"}
            ${item.issues ? `<p><strong>Issues:</strong> ${item.issues}</p>` : "<p><strong>Issues:</strong> None reported</p>"}
            ${item.imageUrl ? `<p><strong>Image:</strong> <a href="${item.imageUrl}" target="_blank">View Image</a></p>` : "<p><strong>Image:</strong> No image provided</p>"}
          </div>
        `,
          )
          .join("")}
      </div>
      
      <p style="font-weight: bold;">Customer Contact: ${contactInfo.email} | ${contactInfo.phone}</p>
    </div>
    `

    // Try sending via Resend
    try {
      console.log("Attempting to send admin email via Resend...")
      const result = await resend.emails.send({
        from: "BluBerry Item Submission <onboarding@resend.dev>",
        to: adminEmail,
        subject: `New Item Submission from ${contactInfo.fullName} - ${items.length} Items`,
        html: htmlContent,
      })

      console.log("Admin email result:", result)
      return { success: true, id: result.id }
    } catch (error) {
      console.error("Error sending admin notification email with Resend:", error)
      return { success: false, error: error.message }
    }
  } catch (error) {
    console.error("Error in sendAdminNotificationEmail:", error)
    return { success: false, error: error.message }
  }
}

export async function sellMultipleItems(items: ItemData[], contactInfo: ContactInfo) {
  console.log("Starting submission to Supabase via sell-multiple-items:", {
    itemCount: items.length,
    contactInfo: { ...contactInfo, phone: contactInfo.phone ? "***" : "missing" },
  })

  try {
    // Validate inputs
    if (!items || items.length === 0) {
      return {
        success: false,
        message: "No items provided",
      }
    }

    if (!contactInfo.email || !contactInfo.fullName) {
      return {
        success: false,
        message: "Contact information is incomplete",
      }
    }

    // Validate phone number - ensure it's not null or empty
    if (!contactInfo.phone || contactInfo.phone.trim() === "") {
      return {
        success: false,
        message: "Phone number is required",
      }
    }

    // Create Supabase server client (bypasses RLS)
    const supabase = createSupabaseServerClient()
    console.log("Created Supabase server client")

    // Format phone number if needed
    const formattedPhone = formatPhoneNumber(contactInfo.phone)
    console.log("Phone formatted:", formattedPhone ? "success" : "failed")

    // Process each item directly without separate contact table
    const itemResults = []

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      console.log(`Processing item ${i + 1}/${items.length}: ${item.name}`)

      try {
        // Check for blocked content
        if (
          isBlockedContent(item.name || "") ||
          isBlockedContent(item.description || "") ||
          isBlockedContent(item.issues || "")
        ) {
          console.warn("Blocked content detected in item:", item.name)
          itemResults.push({ success: false, name: item.name, error: "Content policy violation" })
          continue // Skip this item
        }

        // Prepare data for insertion
        const itemData = {
          item_name: item.name || "Unnamed Item",
          item_description: item.description || "",
          item_condition: item.condition || "unknown",
          item_issues: item.issues || "None",
          email: contactInfo.email,
          phone: formattedPhone,
          full_name: contactInfo.fullName,
          status: "pending",
          address: contactInfo.address || null,
          pickup_date: contactInfo.pickupDate || null,
          image_path: item.imagePath || null,
          image_url: item.imageUrl || null,
          estimated_price: item.estimatedPrice || null,
        }

        console.log(`Attempting to insert item ${i + 1} with data:`, {
          ...itemData,
          item_description: itemData.item_description?.substring(0, 100) + "...",
        })

        // Insert data into Supabase using service role (bypasses RLS)
        const { data, error } = await supabase.from("sell_items").insert([itemData]).select()

        if (error) {
          console.error(`Error submitting item ${i + 1} to Supabase:`, error)
          console.error("Error details:", JSON.stringify(error, null, 2))
          itemResults.push({ success: false, name: item.name, error: error.message })
        } else {
          console.log(`Successfully submitted item ${i + 1}:`, data?.[0]?.id)
          itemResults.push({ success: true, name: item.name, id: data?.[0]?.id })
        }
      } catch (itemProcessError) {
        console.error(`Error processing item ${i + 1}:`, itemProcessError)
        itemResults.push({ success: false, name: item.name, error: "Processing error" })
      }
    }

    console.log("All items processed. Results:", itemResults)

    // Send both confirmation emails
    let userEmailSent = false
    let adminEmailSent = false

    try {
      console.log("Attempting to send confirmation emails...")

      // First try using the dedicated sendConfirmationEmail function
      try {
        console.log("Trying to use sendConfirmationEmail function...")

        // Prepare the first item data for the confirmation email
        const firstItem = items[0] || { name: "Item", description: "", condition: "", issues: "" }

        // Create a data object that matches what sendConfirmationEmail expects
        const emailData = {
          fullName: contactInfo.fullName,
          email: contactInfo.email,
          itemName: firstItem.name,
          itemCategory: firstItem.description.split(" ")[0] || "Item", // Use first word of description as category
          itemCondition: firstItem.condition,
          itemDescription: firstItem.description,
          itemIssues: firstItem.issues,
          phone: contactInfo.phone,
          address: contactInfo.address,
          pickupDate: contactInfo.pickupDate,
          imageUrl: firstItem.imageUrl || "",
        }

        const confirmationResult = await sendConfirmationEmail(emailData)

        if (confirmationResult.success) {
          console.log("Emails sent successfully via sendConfirmationEmail")
          userEmailSent = true
          adminEmailSent = true
        } else {
          console.log("sendConfirmationEmail failed, falling back to direct methods")
          throw new Error("sendConfirmationEmail failed")
        }
      } catch (confirmationError) {
        console.log("Error using sendConfirmationEmail, falling back to direct methods:", confirmationError)

        // Fall back to direct email sending methods
        // Send confirmation email to user
        try {
          const userEmailResult = await sendUserConfirmationEmail(contactInfo.email, contactInfo.fullName, items)
          userEmailSent = userEmailResult.success
          console.log("User email result:", userEmailResult.success ? "sent" : userEmailResult.error)
        } catch (userEmailError) {
          console.error("User email failed:", userEmailError)
        }

        // Send notification email to admin
        try {
          const adminEmailResult = await sendAdminNotificationEmail(contactInfo, items)
          adminEmailSent = adminEmailResult.success
          console.log("Admin email result:", adminEmailResult.success ? "sent" : adminEmailResult.error)
        } catch (adminEmailError) {
          console.error("Admin email failed:", adminEmailError)
        }
      }
    } catch (error) {
      console.error("Email sending error:", error)
      console.log("Email sending failed, but continuing with submission")
    }

    // Revalidate the path to update UI
    try {
      revalidatePath("/sell-multiple-items")
    } catch (revalidateError) {
      console.warn("Failed to revalidate path:", revalidateError)
    }

    const successfulItems = itemResults.filter((r) => r.success).length
    const failedItems = itemResults.filter((r) => !r.success).length

    // Create detailed success message
    let message = ""
    if (successfulItems > 0) {
      message = `Successfully submitted ${successfulItems} item(s)`
      if (failedItems > 0) {
        message += ` (${failedItems} failed)`
      }
    } else {
      message = "Failed to submit items to database"
    }

    if (userEmailSent && adminEmailSent) {
      message += " and sent confirmation emails"
    } else if (userEmailSent) {
      message += " and sent confirmation email to you"
    } else if (adminEmailSent) {
      message += " and notified our team"
    } else if (successfulItems > 0) {
      message += " (confirmation emails could not be sent)"
    }

    const isSuccess = successfulItems > 0

    console.log("Final result:", {
      success: isSuccess,
      successfulItems,
      failedItems,
      userEmailSent,
      adminEmailSent,
    })

    return {
      success: isSuccess,
      message,
      itemResults,
      userEmailSent,
      adminEmailSent,
    }
  } catch (error) {
    console.error("Unexpected error in sellMultipleItems:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
