import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { itemName, itemCondition } = await request.json()

    if (!itemName) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 })
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.log("OpenAI API key not found, using fallback description generation")
      return NextResponse.json({ description: generateFallbackDescription(itemName, itemCondition) })
    }

    try {
      // Dynamically import OpenAI to prevent build-time initialization
      const { default: OpenAI } = await import("openai")

      // Create the client with the API key
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an expert at creating eBay item descriptions. 
            Your task is to generate a detailed, professional, and SEO-friendly description for an eBay listing.
            The description should highlight features, specifications, condition, and selling points.
            Format the description with bullet points, sections, and proper spacing for readability.`,
          },
          {
            role: "user",
            content: `Create a detailed eBay description for this item: "${itemName}"
            ${itemCondition ? `The condition is: ${itemCondition}` : ""}
            
            Include:
            - A brief introduction paragraph
            - Key features and specifications with bullet points
            - Condition details
            - What's included in the package
            - A closing statement
            
            Format it professionally with proper spacing and organization.
            Make it detailed, accurate, and optimized for eBay search.`,
          },
        ],
        max_tokens: 800,
        temperature: 0.7,
      })

      const description = completion.choices[0]?.message?.content?.trim()

      if (!description) {
        throw new Error("No description generated")
      }

      return NextResponse.json({ description })
    } catch (error) {
      console.error("OpenAI API error:", error)
      // Fallback to demo description if OpenAI fails
      return NextResponse.json({ description: generateFallbackDescription(itemName, itemCondition) })
    }
  } catch (error) {
    console.error("Error in generate-item-description route:", error)
    return NextResponse.json({ error: "Failed to generate description" }, { status: 500 })
  }
}

// Generate fallback description without using OpenAI
function generateFallbackDescription(itemName: string, itemCondition?: string): string {
  const condition = itemCondition || "Used - Good"
  const itemNameLower = itemName.toLowerCase().trim()

  // Check for common electronics
  if (itemNameLower.includes("iphone") || itemNameLower.includes("phone")) {
    return `## Premium Smartphone - ${condition}

🔹 OVERVIEW:
This listing is for a premium smartphone in ${condition.toLowerCase()} condition. This device has been well-maintained and functions perfectly.

🔹 FEATURES & SPECIFICATIONS:
• High-quality display with vibrant colors and excellent touch response
• Powerful processor for smooth performance in all applications
• Advanced camera system for stunning photos and videos
• Long-lasting battery life for all-day usage
• Ample storage space for all your apps, photos, and videos

🔹 CONDITION DETAILS:
• ${condition} with minimal signs of use
• Screen is free from cracks or scratches
• All buttons and features work perfectly
• Battery health is good, holding a charge throughout the day
• Comes from a smoke-free, pet-free environment

🔹 WHAT'S INCLUDED:
• Smartphone main unit
• Charging cable and adapter
• Original packaging (where available)
• User manual (digital copy available on request)

🔹 SHIPPING & HANDLING:
• Item will be carefully packaged to ensure safe delivery
• Ships within 1-2 business days after payment
• Tracking information provided after shipping

Please review all photos and details before purchasing. Feel free to message with any questions!

RETURNS ACCEPTED WITHIN 30 DAYS IF ITEM IS NOT AS DESCRIBED.`
  }

  if (itemNameLower.includes("laptop") || itemNameLower.includes("macbook")) {
    return `## Premium Laptop - ${condition}

🔹 OVERVIEW:
This listing is for a high-quality laptop in ${condition.toLowerCase()} condition. This device has been well-maintained and functions perfectly for all computing needs.

🔹 FEATURES & SPECIFICATIONS:
• Crisp, clear display with excellent color reproduction
• Fast processor for smooth multitasking and productivity
• Comfortable keyboard with responsive keys
• Long battery life for on-the-go usage
• Multiple ports for all your connectivity needs

🔹 CONDITION DETAILS:
• ${condition} with minimal signs of previous use
• Screen displays clear, vibrant images with no dead pixels
• Keyboard and trackpad respond perfectly
• All ports are fully functional
• Battery still holds a good charge

🔹 WHAT'S INCLUDED:
• Laptop main unit
• Power adapter and charging cable
• Original packaging (where available)
• User manual (digital copy available on request)

🔹 SHIPPING & HANDLING:
• Item will be carefully packaged to ensure safe delivery
• Ships within 1-2 business days after payment
• Tracking information provided after shipping

Please review all photos and details before purchasing. Feel free to message with any questions!

RETURNS ACCEPTED WITHIN 30 DAYS IF ITEM IS NOT AS DESCRIBED.`
  }

  // Generic template that works for most items
  return `## ${itemName.charAt(0).toUpperCase() + itemName.slice(1)} - ${condition}

🔹 OVERVIEW:
This listing is for a ${itemName} in ${condition.toLowerCase()} condition. This item has been tested and is fully functional.

🔹 FEATURES & SPECIFICATIONS:
• Premium quality and performance
• Designed for reliability and ease of use
• Includes all standard features and functionality
• Compatible with standard accessories and add-ons
• Perfect for both casual and professional use

🔹 CONDITION DETAILS:
• ${condition}
• Fully functional with all features working as expected
• May show minor signs of use consistent with age
• Has been thoroughly tested and inspected
• Comes from a smoke-free, pet-free environment

🔹 WHAT'S INCLUDED:
• ${itemName} main unit
• Standard accessories (if applicable)
• Original packaging (if available)
• User manual (digital copy available on request)

🔹 SHIPPING & HANDLING:
• Item will be carefully packaged to ensure safe delivery
• Ships within 1-2 business days after payment
• Tracking information provided after shipping

Please review all photos and details before purchasing. Feel free to message with any questions!

RETURNS ACCEPTED WITHIN 30 DAYS IF ITEM IS NOT AS DESCRIBED.`
}
