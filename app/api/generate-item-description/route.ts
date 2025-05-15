import { NextResponse } from "next/server"
import OpenAI from "openai"

// Create OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { itemName, itemCondition } = await request.json()

    if (!itemName || !itemCondition) {
      return NextResponse.json({ error: "Item name and condition are required" }, { status: 400 })
    }

    // Demo mode - return a pre-generated description
    const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

    if (demoMode) {
      console.log("Using demo mode for item description generation")

      // Generate a description based on the item name and condition without using OpenAI
      const descriptions = {
        "like-new": `This ${itemName} is in like-new condition. It shows minimal signs of use and functions perfectly. The item appears almost as if it just came out of the box, with all original parts and features working flawlessly.`,
        excellent: `This ${itemName} is in excellent condition. It has been well-maintained and shows only minor signs of previous use. All functions work as intended, and the item presents very well overall.`,
        good: `This ${itemName} is in good condition. It shows normal signs of use but has been properly maintained. All essential functions work correctly, though there may be some cosmetic imperfections.`,
        fair: `This ${itemName} is in fair condition. It shows noticeable signs of previous use including some wear and tear. The item remains functional but may have some cosmetic issues or minor functional imperfections.`,
        poor: `This ${itemName} is in poor condition. It shows significant wear and has several cosmetic issues. While the core functionality works, there are noticeable problems that affect its performance or appearance.`,
      }

      const description =
        descriptions[itemCondition] ||
        `This ${itemName} is in ${itemCondition} condition. It has been previously used but still functions as intended.`

      return NextResponse.json({ description })
    }

    // If not in demo mode, try to use OpenAI
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that writes concise, detailed product descriptions for secondhand items.",
          },
          {
            role: "user",
            content: `Write a concise but detailed description for a ${itemName} that is in ${itemCondition} condition. Focus on what a buyer would want to know. Keep it under 100 words.`,
          },
        ],
        max_tokens: 150,
      })

      const description = completion.choices[0]?.message?.content?.trim()

      if (!description) {
        throw new Error("No description created")
      }

      return NextResponse.json({ description })
    } catch (error) {
      console.error("OpenAI API error:", error)

      // Fallback to demo description if OpenAI fails
      const fallbackDescription = `This ${itemName} is in ${itemCondition} condition. It has been previously used but still functions as intended.`

      return NextResponse.json({ description: fallbackDescription })
    }
  } catch (error) {
    console.error("Error in create-item-description route:", error)
    return NextResponse.json({ error: "Failed to create description" }, { status: 500 })
  }
}
