"use server"

import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"
import { isBlockedContent } from "@/lib/content-filter"
import { OpenAI } from "openai"
import { fixImageUrl } from "@/lib/fix-image-urls"

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

// Initialize OpenAI client with proper API key
const getOpenAIClient = () => {
  // First try to get the pricing-specific key, then fall back to the general key
  const apiKey = process.env.PRICING_OPENAI_API_KEY || process.env.OPENAI_API_KEY

  if (!apiKey) {
    console.error("OpenAI API key is not set")
    return null
  }

  console.log(`OpenAI API key being used at: ${new Date().toISOString()}`)

  return new OpenAI({
    apiKey,
  })
}

// Helper function to generate AI description if needed
async function generateItemDescription(itemName, itemDescription) {
  try {
    const openai = getOpenAIClient()
    if (!openai) return null

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates detailed item descriptions for selling items.",
        },
        {
          role: "user",
          content: `Create a detailed description for this item: ${itemName}. Current description: ${itemDescription}`,
        },
      ],
      max_tokens: 150,
    })

    return response.choices[0]?.message?.content || null
  } catch (error) {
    console.error("Error generating item description:", error)
    return null
  }
}

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

// Helper function to send confirmation email directly
async function sendConfirmationEmailDirect(email: string, name: string, items: ItemData[]) {
  try {
    // Import nodemailer dynamically to avoid issues
    const nodemailer = await import("nodemailer")

    // Create transporter
    const transporter = nodemailer.createTransporter({
      service: "gmail",
      auth: {
        user: process.env.CONTACT_EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    // Create email content
    const itemsList = items
      .map(
        (item, index) => `
      ${index + 1}. ${item.name}
         - Description: ${item.description}
         - Condition: ${item.condition}
         ${item.estimatedPrice ? `- Estimated Price: ${item.estimatedPrice}` : ""}
         ${item.issues ? `- Issues: ${item.issues}` : ""}
    `,
      )
      .join("\n")

    const emailContent = `
      Dear ${name},

      Thank you for submitting your items for sale! We have received the following items:

      ${itemsList}

      We will review your submission and contact you within 24-48 hours with next steps.

      Best regards,
      The Sales Team
    `

    // Send email
    await transporter.sendMail({
      from: process.env.CONTACT_EMAIL,
      to: email,
      subject: "Item Submission Confirmation",
      text: emailContent,
    })

    return { success: true }
  } catch (error) {
    console.error("Error sending email directly:", error)
    return { success: false, error: error.message }
  }
}

export async function sellMultipleItems(items: ItemData[], contactInfo: ContactInfo) {
  console.log("Starting submission to Supabase via sell-multiple-items:", { items, contactInfo })

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

    // Create Supabase client
    const supabase = getSupabaseAdmin()

    // Format phone number if needed
    const formattedPhone = formatPhoneNumber(contactInfo.phone)

    // Process each item directly without separate contact table
    const itemResults = []

    for (const item of items) {
      try {
        // Check for blocked content
        if (
          isBlockedContent(item.name || "") ||
          isBlockedContent(item.description || "") ||
          isBlockedContent(item.issues || "")
        ) {
          console.warn("Blocked content detected in item:", item.name)
          continue // Skip this item
        }

        // Enhance description with AI if needed
        let enhancedDescription = item.description
        if (item.description && item.description.length < 50 && item.name) {
          const aiDescription = await generateItemDescription(item.name, item.description)
          if (aiDescription) {
            enhancedDescription = aiDescription
          }
        }

        // Prepare data for insertion - include contact info directly in sell_items
        const itemData: Record<string, any> = {
          item_name: item.name || "Unnamed Item",
          item_description: enhancedDescription || item.description || "",
          item_condition: item.condition || "unknown",
          email: contactInfo.email,
          phone: formattedPhone,
          full_name: contactInfo.fullName,
          address: contactInfo.address || null,
          pickup_date: contactInfo.pickupDate || null,
          status: "pending",
          submission_date: new Date().toISOString(),
        }

        // Add image data if available
        if (item.imagePath) {
          itemData.image_path = item.imagePath
        }

        if (item.imageUrl) {
          itemData.image_url = fixImageUrl(item.imageUrl)
        }

        if (item.estimatedPrice) {
          itemData.estimated_price = item.estimatedPrice
        }

        if (item.issues) {
          itemData.item_issues = item.issues
        }

        console.log("Attempting to insert item data:", itemData)

        // Insert data into Supabase
        const { data, error } = await supabase.from("sell_items").insert([itemData]).select()

        if (error) {
          console.error("Error submitting item to Supabase:", error)
          console.error("Error details:", JSON.stringify(error, null, 2))

          // If the error is about a column not existing, try a more minimal approach
          if (error.message && (error.message.includes("column") || error.code === "42703")) {
            console.log("Column error detected, trying minimal insertion with only essential fields")

            const minimalData = {
              item_name: item.name || "Unnamed Item",
              item_description: item.description || "",
              item_condition: item.condition || "unknown",
              email: contactInfo.email,
              phone: formattedPhone,
              full_name: contactInfo.fullName,
              status: "pending",
              submission_date: new Date().toISOString(),
            }

            const { data: minimalResult, error: minimalError } = await supabase
              .from("sell_items")
              .insert([minimalData])
              .select()

            if (minimalError) {
              console.error("Error with minimal submission:", minimalError)
              console.error("Minimal error details:", JSON.stringify(minimalError, null, 2))

              // If table doesn't exist, return a helpful error
              if (minimalError.code === "PGRST116") {
                return {
                  success: false,
                  message: "Database table 'sell_items' does not exist. Please contact support.",
                  code: minimalError.code,
                }
              }

              return {
                success: false,
                message: `Database error: ${minimalError.message}`,
                code: minimalError.code,
              }
            } else {
              console.log("Successfully submitted with minimal fields")
              itemResults.push({ success: true, name: item.name, id: minimalResult?.[0]?.id })
            }
          } else {
            // If it's some other error, return it
            return {
              success: false,
              message: `Database error: ${error.message}`,
              code: error.code,
            }
          }
        } else {
          console.log("Successfully submitted item:", data?.[0])
          itemResults.push({ success: true, name: item.name, id: data?.[0]?.id })
        }
      } catch (itemProcessError) {
        console.error("Error processing item:", itemProcessError)
        itemResults.push({ success: false, name: item.name, error: "Processing error" })
      }
    }

    console.log("Successfully submitted items to Supabase")

    // Send confirmation email (optional - don't fail if this doesn't work)
    let emailSent = false
    try {
      console.log("Attempting to send confirmation email...")

      // Try direct email sending first
      const emailResult = await sendConfirmationEmailDirect(contactInfo.email, contactInfo.fullName, items)

      if (emailResult.success) {
        console.log("Confirmation email sent successfully via direct method")
        emailSent = true
      } else {
        console.log("Direct email failed, trying API method...")

        // Fallback to API method if direct method fails
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/send-item-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: contactInfo.email,
              name: contactInfo.fullName,
              items: items.map((item) => ({
                name: item.name,
                description: item.description,
                condition: item.condition,
                estimatedPrice: item.estimatedPrice,
              })),
            }),
          },
        )

        if (response.ok) {
          console.log("Confirmation email sent successfully via API")
          emailSent = true
        } else {
          console.log("API email method also failed")
        }
      }
    } catch (error) {
      console.log("Email sending failed, but continuing with submission:", error.message)
      // Don't return error here - email is optional
    }

    // Revalidate the path to update UI
    revalidatePath("/sell-multiple-items")

    const successfulItems = itemResults.filter((r) => r.success).length
    const message = emailSent
      ? `Successfully submitted ${successfulItems} item(s) and sent confirmation email`
      : `Successfully submitted ${successfulItems} item(s) (confirmation email could not be sent)`

    return {
      success: true,
      message,
      itemResults,
      emailSent,
    }
  } catch (error) {
    console.error("Unexpected error in sellMultipleItems:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
