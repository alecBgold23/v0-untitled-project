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

    // Validate contact info
    if (!contactInfo.fullName || !contactInfo.email || !contactInfo.phone) {
      return { success: false, message: "Missing required contact information" }
    }

    // Format phone number if needed
    const formattedPhone = formatPhoneNumber(contactInfo.phone)

    // Insert contact info first
    const { data: contactData, error: contactError } = await supabase
      .from("contacts")
      .upsert(
        {
          name: contactInfo.fullName,
          email: contactInfo.email,
          phone: formattedPhone,
          address: contactInfo.address || null,
          preferred_pickup_date: contactInfo.pickupDate || null,
          created_at: new Date().toISOString(),
        },
        { onConflict: "email" },
      )
      .select()

    if (contactError) {
      console.error("Error inserting contact:", contactError)
      return { success: false, message: "Failed to save contact information" }
    }

    const contactId = contactData?.[0]?.id

    if (!contactId) {
      return { success: false, message: "Failed to create or retrieve contact record" }
    }

    // Process each item
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

        // Prepare data for insertion - use only the correct column names that match the database schema
        const baseData: Record<string, any> = {
          contact_id: contactId,
          name: item.name || "Unnamed Item",
          description: enhancedDescription || item.description || "",
          condition: item.condition || "unknown",
          item_issues: item.issues || "",
          status: "pending",
          created_at: new Date().toISOString(),
        }

        // Add image data - ensure we're using the correct column names
        if (item.imagePath) {
          baseData.image_path = item.imagePath
        }

        if (item.imageUrl) {
          baseData.image_url = fixImageUrl(item.imageUrl)
        }

        // Insert data into Supabase
        let data // Changed from const to let
        let error // Changed from const to let
        ;({ data, error } = await supabase.from("sell_items").insert([baseData]).select())

        if (error) {
          console.error("Error submitting items to Supabase:", error)

          // If the error is about a column not existing, try a more minimal approach
          if (error.message && (error.message.includes("column") || error.code === "42703")) {
            console.log("Column error detected, trying minimal insertion with only essential fields")

            const minimalData = {
              contact_id: contactId,
              name: item.name || "Unnamed Item",
              description: item.description || "",
              condition: item.condition || "unknown",
              status: "pending",
              created_at: new Date().toISOString(),
            }

            let minimalResult // Changed from const to let
            let minimalError // Changed from const to let
            ;({ data: minimalResult, error: minimalError } = await supabase
              .from("sell_items")
              .insert([minimalData])
              .select())

            if (minimalError) {
              console.error("Error with minimal submission:", minimalError)

              // If still having issues, try to create the table first
              if (minimalError.code === "PGRST116") {
                console.log("Table doesn't exist, creating it first...")

                try {
                  // Use Postgres extension directly
                  const { error: tableError } = await supabase.from("sell_items_temp").insert({
                    contact_id: contactId,
                    name: "temp_create_table",
                    description: "Creating table",
                    condition: "New",
                    status: "deleted",
                    created_at: new Date().toISOString(),
                  })

                  if (tableError && tableError.code !== "PGRST116") {
                    console.error("Error creating temporary table:", tableError)
                  }
                  // Try one more time with the minimal data
                  ;({ data: minimalResult, error: minimalError } = await supabase
                    .from("sell_items")
                    .insert([minimalData])
                    .select())

                  if (minimalError) {
                    return {
                      success: false,
                      message: `Database error: ${minimalError.message}`,
                      code: minimalError.code,
                    }
                  } else {
                    data = minimalResult
                  }
                } catch (createError) {
                  console.error("Error in table creation attempt:", createError)
                  return {
                    success: false,
                    message: "Failed to create or access the required database table",
                  }
                }
              } else {
                return {
                  success: false,
                  message: `Database error: ${minimalError.message}`,
                  code: minimalError.code,
                }
              }
            } else {
              console.log("Successfully submitted with minimal fields")
              data = minimalResult
            }
          } else {
            // If it's some other error, return it
            return {
              success: false,
              message: `Database error: ${error.message}`,
              code: error.code,
            }
          }
        }

        itemResults.push({ success: true, name: item.name, id: data?.[0]?.id })
      } catch (itemProcessError) {
        console.error("Error processing item:", itemProcessError)
        itemResults.push({ success: false, name: item.name, error: "Processing error" })
      }
    }

    console.log("Successfully submitted to Supabase")

    // Send confirmation email
    try {
      const emailResult = await sendConfirmationEmail(contactInfo.email, contactInfo.fullName, items)

      console.log("Email result:", emailResult)
    } catch (error) {
      console.error("Error sending confirmation email:", error)
    }

    // Revalidate the path to update UI
    revalidatePath("/sell-multiple-items")

    return {
      success: true,
      message: `Successfully submitted ${items.length} item(s)`,
      contactId,
      itemResults,
    }
  } catch (error) {
    console.error("Unexpected error in sellMultipleItems:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Helper function to send confirmation email
async function sendConfirmationEmail(email, name, items) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/send-item-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: email,
        name,
        items: items.map((item) => ({
          name: item.name,
          description: item.description,
          condition: item.condition,
          estimatedPrice: item.estimatedPrice,
        })),
      }),
    })

    if (!response.ok) {
      throw new Error(`Email API responded with status: ${response.status}`)
    }

    return true
  } catch (error) {
    console.error("Error sending confirmation email:", error)
    return false
  }
}
