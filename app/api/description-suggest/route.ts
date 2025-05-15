import { NextResponse } from "next/server"

// Generate template suggestion
function generateTemplateSuggestion(prompt: string): string {
  const promptLower = prompt.toLowerCase().trim()

  // Check for common electronics
  if (promptLower.includes("iphone") || promptLower.includes("phone")) {
    return `## Premium Smartphone - Excellent Condition

🔹 OVERVIEW:
This listing is for a premium smartphone in excellent condition. This device has been well-maintained and functions perfectly.

🔹 FEATURES & SPECIFICATIONS:
• High-quality display with vibrant colors and excellent touch response
• Powerful processor for smooth performance in all applications
• Advanced camera system for stunning photos and videos
• Long-lasting battery life for all-day usage
• Ample storage space for all your apps, photos, and videos

🔹 CONDITION DETAILS:
• Excellent condition with minimal signs of use
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

  if (promptLower.includes("laptop") || promptLower.includes("macbook") || promptLower.includes("computer")) {
    return `## Premium Laptop - Excellent Condition

🔹 OVERVIEW:
This listing is for a high-quality laptop in excellent condition. This device has been well-maintained and functions perfectly for all computing needs.

🔹 FEATURES & SPECIFICATIONS:
• Crisp, clear display with excellent color reproduction
• Fast processor for smooth multitasking and productivity
• Comfortable keyboard with responsive keys
• Long battery life for on-the-go usage
• Multiple ports for all your connectivity needs

🔹 CONDITION DETAILS:
• Excellent condition with minimal signs of previous use
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
  return `## ${prompt.charAt(0).toUpperCase() + prompt.slice(1)} - Excellent Condition

🔹 OVERVIEW:
This listing is for a ${prompt} in excellent condition. This item has been tested and is fully functional.

🔹 FEATURES & SPECIFICATIONS:
• Premium quality and performance
• Designed for reliability and ease of use
• Includes all standard features and functionality
• Compatible with standard accessories and add-ons
• Perfect for both casual and professional use

🔹 CONDITION DETAILS:
• Excellent condition
• Fully functional with all features working as expected
• May show minimal signs of use consistent with age
• Has been thoroughly tested and inspected
• Comes from a smoke-free, pet-free environment

🔹 WHAT'S INCLUDED:
• ${prompt} main unit
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

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Use template suggestion
    return NextResponse.json({
      suggestion: generateTemplateSuggestion(prompt),
      source: "template",
    })
  } catch (error) {
    console.error("Error in description-suggest route:", error)
    return NextResponse.json(
      {
        error: "Failed to generate suggestion",
        suggestion: generateTemplateSuggestion("item"),
        source: "error-fallback",
      },
      { status: 500 },
    )
  }
}
