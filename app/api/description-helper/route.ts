import { generateProductDescription } from "@/lib/openai-browser"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { title, condition, extraDetails } = await req.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const prompt = `
Create a professional eBay-style description for the following item:

Item: ${title}
Condition: ${condition || "Not specified"}
Extra Details: ${extraDetails || "None provided"}

The description should:
1. Be detailed and professional
2. Highlight key features and specifications
3. Mention the condition accurately
4. Include any relevant measurements or technical details
5. Be formatted in a clean, easy-to-read style with bullet points where appropriate
6. Include a section about shipping and returns policy
7. Be optimized for eBay search

Please provide ONLY the description text.
`

    const response = await generateProductDescription(prompt)
    const description = response.trim()
    return NextResponse.json({ description })
  } catch (error: any) {
    console.error("OpenAI error:", error)

    // Fallback description if API fails
    const fallbackDescription = generateFallbackDescription()
    return NextResponse.json({
      description: fallbackDescription,
      error: "Failed to generate description with AI. Using fallback description.",
    })
  }
}

function generateFallbackDescription(): string {
  return `Thank you for your interest in this item!

ITEM DESCRIPTION:
This is a quality item in good condition. Please refer to the photos for a detailed look at the actual item you will receive.

FEATURES:
• Quality construction
• Reliable performance
• Great value

CONDITION:
This item is in good used condition with normal signs of wear. All functions work as they should.

SHIPPING & RETURNS:
• Fast shipping within 1-2 business days
• Carefully packaged to ensure safe delivery
• Returns accepted within 30 days

Please feel free to ask any questions before purchasing!`
}
