import { NextResponse } from "next/server"
import { OpenAI } from "openai"

export async function POST(req: Request) {
  try {
    const { title, condition, extraDetails } = await req.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: "OpenAI API key is not configured",
          description: generateFallbackDescription(title, condition, extraDetails),
        },
        { status: 400 },
      )
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const prompt = `
Create a professional, detailed eBay-style product description for the following item:

Item: "${title}"
Condition: "${condition || "Used - Good"}"
Additional Details: "${extraDetails || "N/A"}"

The description should:
1. Be professional and appealing to buyers
2. Highlight key features and specifications
3. Mention the condition clearly
4. Include any relevant details from the "Additional Details" section
5. Be formatted with proper spacing and bullet points where appropriate
6. Be between 100-200 words

Return ONLY the description text without any additional commentary.
`

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      })

      const description = response.choices[0].message.content?.trim()
      return NextResponse.json({ description })
    } catch (error: any) {
      console.error("OpenAI error:", error)
      return NextResponse.json(
        {
          error: "Failed to generate description",
          description: generateFallbackDescription(title, condition, extraDetails),
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Server error:", error)
    return NextResponse.json(
      {
        error: "Server error",
        description: generateFallbackDescription("Unknown Item", "Used", ""),
      },
      { status: 500 },
    )
  }
}

// Fallback function to generate a description without OpenAI
function generateFallbackDescription(title: string, condition?: string, extraDetails?: string): string {
  const conditionText = condition || "Used - Good condition"
  const details = extraDetails ? `Additional details: ${extraDetails}` : ""

  return `
${title} - ${conditionText}

This listing is for a ${title} in ${conditionText.toLowerCase()}. ${details}

Features:
• Standard features for this type of item
• Quality construction
• Reliable performance

Please review all photos carefully and ask any questions before purchasing. 
Shipping will be handled promptly after payment is received.
`
}
