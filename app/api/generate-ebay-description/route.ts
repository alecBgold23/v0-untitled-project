import { NextResponse } from "next/server"
import OpenAI from "openai"

// Initialize OpenAI client with the specific API key for eBay descriptions
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { itemName, condition = "used", extraDetails = "" } = await request.json()

    if (!itemName) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 })
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured", description: generateFallbackDescription(itemName, condition) },
        { status: 400 },
      )
    }

    // Create prompt for OpenAI
    const prompt = `Generate a professional eBay listing description for the following item:
    
Item: ${itemName}
Condition: ${condition}
Additional Details: ${extraDetails}

The description should be detailed, highlight key features, mention the condition accurately, and be optimized for eBay search. 
Format the description with proper paragraphs and bullet points for features.
Do not include pricing information or shipping details.
Keep the description between 150-250 words.`

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    })

    const description = completion.choices[0].message.content.trim()

    return NextResponse.json({ description })
  } catch (error: any) {
    console.error("Error generating description:", error)

    // Return a fallback description if there's an error
    return NextResponse.json(
      {
        error: error.message || "Failed to generate description",
        description: generateFallbackDescription(),
      },
      { status: 500 },
    )
  }
}

// Generate a fallback description if the API call fails
function generateFallbackDescription(itemName = "This item", condition = "used"): string {
  return `${itemName} is in ${condition} condition and has been well maintained. It shows normal signs of wear consistent with regular use but remains fully functional. Please review all photos carefully to assess the condition for yourself. 

Features:
• Authentic product
• Fully functional
• Well maintained
• Great value

This would make a great addition to your collection or for everyday use. Please feel free to ask any questions before purchasing.`
}
