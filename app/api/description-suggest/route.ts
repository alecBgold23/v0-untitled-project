import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { itemName } = await request.json()

    if (!itemName) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 })
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.log("OpenAI API key not found, using fallback suggestion")
      return NextResponse.json({ suggestion: generateFallbackSuggestion(itemName) })
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
            content: `You are an expert at identifying items and providing detailed specifications.
            Your task is to provide a more specific and detailed name for an item based on a generic description.`,
          },
          {
            role: "user",
            content: `I have an item described as: "${itemName}"
            
            Please provide a more specific and detailed name for this item that would be suitable for an online listing.
            Include brand names, model numbers, or specific features if you can reasonably infer them.
            Keep your response concise - just the improved item name, no explanations.`,
          },
        ],
        max_tokens: 100,
        temperature: 0.7,
      })

      const suggestion = completion.choices[0]?.message?.content?.trim()

      if (!suggestion) {
        throw new Error("No suggestion generated")
      }

      return NextResponse.json({ suggestion })
    } catch (error) {
      console.error("OpenAI API error:", error)
      // Fallback to demo suggestion if OpenAI fails
      return NextResponse.json({ suggestion: generateFallbackSuggestion(itemName) })
    }
  } catch (error) {
    console.error("Error in description-suggest route:", error)
    return NextResponse.json({ error: "Failed to generate suggestion" }, { status: 500 })
  }
}

// Generate fallback suggestion without using OpenAI
function generateFallbackSuggestion(itemName: string): string {
  const itemNameLower = itemName.toLowerCase().trim()

  // Check for common electronics
  if (itemNameLower.includes("phone")) {
    if (itemNameLower.includes("iphone")) {
      return "Apple iPhone 13 Pro Max - 256GB - Graphite (Unlocked)"
    }
    if (itemNameLower.includes("samsung")) {
      return "Samsung Galaxy S22 Ultra - 512GB - Phantom Black (Unlocked)"
    }
    if (itemNameLower.includes("google")) {
      return "Google Pixel 6 Pro - 128GB - Stormy Black (Unlocked)"
    }
    return "Premium Smartphone - 128GB - Black (Unlocked)"
  }

  if (itemNameLower.includes("laptop")) {
    if (itemNameLower.includes("macbook")) {
      return "Apple MacBook Pro 16-inch (2023) - M2 Pro - 16GB RAM - 512GB SSD"
    }
    if (itemNameLower.includes("dell")) {
      return "Dell XPS 15 (2023) - Intel Core i7 - 16GB RAM - 1TB SSD - 4K Display"
    }
    if (itemNameLower.includes("hp")) {
      return "HP Spectre x360 14 (2023) - Intel Core i7 - 16GB RAM - 1TB SSD - OLED Display"
    }
    return "Premium Laptop - Intel Core i7 - 16GB RAM - 512GB SSD - Full HD Display"
  }

  if (itemNameLower.includes("camera")) {
    if (itemNameLower.includes("canon")) {
      return "Canon EOS R5 Mirrorless Camera - 45MP - 8K Video - With 24-105mm Lens"
    }
    if (itemNameLower.includes("sony")) {
      return "Sony Alpha a7 IV Mirrorless Camera - 33MP - 4K Video - With 28-70mm Lens"
    }
    if (itemNameLower.includes("nikon")) {
      return "Nikon Z7 II Mirrorless Camera - 45.7MP - 4K Video - With 24-70mm Lens"
    }
    return "Professional Digital Camera - 24MP - 4K Video - With Standard Zoom Lens"
  }

  if (itemNameLower.includes("watch") || itemNameLower.includes("timepiece")) {
    if (itemNameLower.includes("apple")) {
      return "Apple Watch Series 8 - 45mm - GPS + Cellular - Stainless Steel Case"
    }
    if (itemNameLower.includes("rolex")) {
      return "Rolex Submariner Date - 41mm - Stainless Steel - Black Dial - Ref. 126610LN"
    }
    if (itemNameLower.includes("omega")) {
      return "Omega Seamaster Professional 300M - 42mm - Blue Dial - Stainless Steel"
    }
    return "Luxury Wristwatch - 42mm - Stainless Steel - Automatic Movement"
  }

  // Generic suggestion for other items
  return `Premium ${itemName.charAt(0).toUpperCase() + itemName.slice(1)} - Professional Grade - Latest Model`
}
