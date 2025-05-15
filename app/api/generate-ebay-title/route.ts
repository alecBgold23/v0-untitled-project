import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { itemName } = await request.json()

    if (!itemName) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 })
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.log("OpenAI API key not found, using fallback title generation")
      return NextResponse.json({ title: generateFallbackTitle(itemName) })
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
            content: `You are an expert at creating eBay listing titles. 
            Your task is to generate an optimized, keyword-rich title for an eBay listing.
            The title should be concise, descriptive, and include important keywords for search visibility.
            Maximum 80 characters.`,
          },
          {
            role: "user",
            content: `Create an optimized eBay listing title for this item: "${itemName}"
            
            Include:
            - Brand name (if applicable)
            - Model number (if applicable)
            - Key features
            - Size/dimensions (if applicable)
            - Color (if applicable)
            
            Make it concise, descriptive, and optimized for eBay search.
            Maximum 80 characters.`,
          },
        ],
        max_tokens: 100,
        temperature: 0.7,
      })

      const title = completion.choices[0]?.message?.content?.trim()

      if (!title) {
        throw new Error("No title generated")
      }

      return NextResponse.json({ title })
    } catch (error) {
      console.error("OpenAI API error:", error)
      // Fallback to demo title if OpenAI fails
      return NextResponse.json({ title: generateFallbackTitle(itemName) })
    }
  } catch (error) {
    console.error("Error in generate-ebay-title route:", error)
    return NextResponse.json({ error: "Failed to generate title" }, { status: 500 })
  }
}

// Generate fallback title without using OpenAI
function generateFallbackTitle(itemName: string): string {
  const itemNameLower = itemName.toLowerCase().trim()

  // Check for common electronics
  if (itemNameLower.includes("iphone")) {
    return `Apple iPhone Smartphone - Excellent Condition - Fully Functional - Fast Shipping`
  }

  if (itemNameLower.includes("samsung") && itemNameLower.includes("phone")) {
    return `Samsung Galaxy Smartphone - Excellent Condition - Fully Functional - Fast Shipping`
  }

  if (itemNameLower.includes("laptop")) {
    return `Premium Laptop Computer - Fast Performance - Excellent Condition - Free Shipping`
  }

  if (itemNameLower.includes("macbook")) {
    return `Apple MacBook Laptop - High Performance - Excellent Condition - Fast Shipping`
  }

  if (itemNameLower.includes("camera")) {
    return `Digital Camera - High Resolution - Professional Quality - Excellent Condition`
  }

  // Generic title for other items
  return `${itemName.charAt(0).toUpperCase() + itemName.slice(1)} - Premium Quality - Excellent Condition - Fast Shipping`
}
