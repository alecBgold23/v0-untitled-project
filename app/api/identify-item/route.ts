import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(request: Request) {
  try {
    const { itemName } = await request.json()

    if (!itemName) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 })
    }

    // Check if we're in demo mode or if OpenAI API key is missing
    const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !process.env.OPENAI_API_KEY

    if (demoMode) {
      console.log("Using demo mode for item identification")
      return NextResponse.json({ itemDetails: generateDemoItemDetails(itemName) })
    }

    // If we have an API key, use OpenAI
    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an expert at identifying consumer electronics, gadgets, and other items based on minimal information. 
            Your task is to identify the exact model, specifications, and details of an item based on a brief description.
            Respond with a JSON object containing the identified details. Do not include any explanations or additional text.`,
          },
          {
            role: "user",
            content: `Identify this item: "${itemName}"
            
            Return a JSON object with the following fields:
            - exactModel: The precise model name and number
            - brand: The manufacturer or brand
            - specifications: An array of key specifications (storage, color, size, etc.)
            - features: An array of notable features
            - releaseYear: When this model was released
            - marketValue: Estimated current market value range for used items in good condition
            - category: Product category
            - listingTitle: A suggested eBay/marketplace listing title
            - keywords: SEO keywords for the listing
            
            For example, if I say "iPhone", you might identify it as "iPhone 15 Pro Max 256GB" with appropriate specs.
            If I say "oculus", you might identify it as "Meta Quest 3 128GB" with VR headset specs.
            Be specific and accurate. If you're uncertain about exact details, provide the most likely information based on current market trends.`,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 800,
      })

      const responseContent = completion.choices[0]?.message?.content?.trim()

      if (!responseContent) {
        throw new Error("No response content")
      }

      try {
        const itemDetails = JSON.parse(responseContent)
        return NextResponse.json({ itemDetails })
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError)
        throw new Error("Invalid response format")
      }
    } catch (error) {
      console.error("OpenAI API error:", error)
      // Fallback to demo item details if OpenAI fails
      return NextResponse.json({ itemDetails: generateDemoItemDetails(itemName) })
    }
  } catch (error) {
    console.error("Error in identify-item route:", error)
    return NextResponse.json({ error: "Failed to identify item" }, { status: 500 })
  }
}

// Generate demo item details without using OpenAI
function generateDemoItemDetails(itemName: string): any {
  const itemNameLower = itemName.toLowerCase().trim()

  // Demo database of common items
  const itemDatabase: Record<string, any> = {
    oculus: {
      exactModel: "Meta Quest 3 128GB",
      brand: "Meta",
      specifications: [
        "128GB Storage",
        "Snapdragon XR2 Gen 2 Processor",
        "2064 x 2208 pixels per eye",
        "Wireless",
        "White color",
      ],
      features: [
        "Mixed Reality Passthrough",
        "Hand Tracking 2.0",
        "Wireless PC VR Compatibility",
        "Standalone VR Headset",
        "Includes 2 Touch Plus Controllers",
      ],
      releaseYear: 2023,
      marketValue: "$350-$450",
      category: "Virtual Reality Headsets",
      listingTitle: "Meta Quest 3 128GB VR Headset - Complete with Controllers",
      keywords: ["Meta Quest 3", "VR Headset", "Virtual Reality", "Oculus", "128GB", "Gaming"],
    },
    iphone: {
      exactModel: "Apple iPhone 14 Pro 256GB",
      brand: "Apple",
      specifications: [
        "256GB Storage",
        "A16 Bionic Chip",
        "6.1-inch Super Retina XDR display",
        "48MP Main Camera",
        "Deep Purple color",
      ],
      features: ["Dynamic Island", "Always-On display", "ProMotion technology", "Face ID", "Ceramic Shield front"],
      releaseYear: 2022,
      marketValue: "$750-$900",
      category: "Smartphones",
      listingTitle: "Apple iPhone 14 Pro 256GB Deep Purple - Unlocked - Excellent Condition",
      keywords: ["iPhone 14 Pro", "256GB", "Deep Purple", "Unlocked", "Apple", "Smartphone"],
    },
    playstation: {
      exactModel: "Sony PlayStation 5 Digital Edition",
      brand: "Sony",
      specifications: ["825GB SSD Storage", "AMD Zen 2 CPU", "10.3 teraflops GPU", "16GB GDDR6 RAM", "White color"],
      features: ["4K Gaming", "Ray Tracing", "3D Audio", "Ultra-High Speed SSD", "DualSense Controller"],
      releaseYear: 2020,
      marketValue: "$350-$400",
      category: "Gaming Consoles",
      listingTitle: "Sony PlayStation 5 Digital Edition Console - White - Complete with Controller",
      keywords: ["PlayStation 5", "PS5", "Digital Edition", "Gaming Console", "Sony", "4K Gaming"],
    },
    macbook: {
      exactModel: "Apple MacBook Pro 14-inch M2 Pro",
      brand: "Apple",
      specifications: [
        "512GB SSD Storage",
        "16GB Unified Memory",
        "M2 Pro Chip with 10-core CPU",
        "16-core GPU",
        "Space Gray color",
      ],
      features: [
        "14.2-inch Liquid Retina XDR display",
        "ProMotion technology",
        "MagSafe charging",
        "HDMI port",
        "SD card slot",
      ],
      releaseYear: 2023,
      marketValue: "$1500-$1800",
      category: "Laptops",
      listingTitle: "Apple MacBook Pro 14-inch M2 Pro (2023) 512GB 16GB RAM - Space Gray",
      keywords: ["MacBook Pro", "M2 Pro", "14-inch", "Apple", "Laptop", "512GB", "16GB RAM"],
    },
    airpods: {
      exactModel: "Apple AirPods Pro (2nd Generation)",
      brand: "Apple",
      specifications: [
        "Active Noise Cancellation",
        "Transparency Mode",
        "H2 Chip",
        "MagSafe Charging Case",
        "White color",
      ],
      features: [
        "Personalized Spatial Audio",
        "Adaptive EQ",
        "Touch controls",
        "Water and sweat resistant",
        "Up to 6 hours of listening time",
      ],
      releaseYear: 2022,
      marketValue: "$180-$220",
      category: "Wireless Earbuds",
      listingTitle: "Apple AirPods Pro 2nd Generation - MagSafe Case - Excellent Condition",
      keywords: ["AirPods Pro", "2nd Generation", "Wireless Earbuds", "Noise Cancellation", "Apple"],
    },
    xbox: {
      exactModel: "Xbox Series X 1TB",
      brand: "Microsoft",
      specifications: ["1TB SSD Storage", "AMD Zen 2 CPU", "12 teraflops GPU", "16GB GDDR6 RAM", "Black color"],
      features: ["4K Gaming at 60 FPS", "Up to 120 FPS", "Ray Tracing", "Quick Resume", "Backward Compatibility"],
      releaseYear: 2020,
      marketValue: "$400-$500",
      category: "Gaming Consoles",
      listingTitle: "Microsoft Xbox Series X 1TB Console - Black - Complete with Controller",
      keywords: ["Xbox Series X", "1TB", "Gaming Console", "Microsoft", "4K Gaming"],
    },
    switch: {
      exactModel: "Nintendo Switch OLED Model",
      brand: "Nintendo",
      specifications: [
        "64GB Storage",
        "7-inch OLED Screen",
        "Enhanced Audio",
        "Wired LAN port in dock",
        "White Joy-Cons",
      ],
      features: ["Tabletop mode", "Handheld mode", "TV mode", "Detachable Joy-Con controllers", "Improved kickstand"],
      releaseYear: 2021,
      marketValue: "$300-$350",
      category: "Gaming Consoles",
      listingTitle: "Nintendo Switch OLED Model - White Joy-Con - Complete Set",
      keywords: ["Nintendo Switch", "OLED", "Gaming Console", "White Joy-Con", "Handheld"],
    },
  }

  // Check for exact matches first
  if (itemDatabase[itemNameLower]) {
    return itemDatabase[itemNameLower]
  }

  // Check for partial matches
  for (const key in itemDatabase) {
    if (itemNameLower.includes(key) || key.includes(itemNameLower)) {
      return itemDatabase[key]
    }
  }

  // Generic response for unknown items
  return {
    exactModel: `Unknown ${capitalizeFirstLetter(itemName)} Model`,
    brand: "Unknown",
    specifications: ["Please provide more details about this item"],
    features: ["Features unknown - please provide more specific information"],
    releaseYear: "Unknown",
    marketValue: "Cannot estimate without more information",
    category: "Unknown Category",
    listingTitle: `${capitalizeFirstLetter(itemName)} - Please Add More Details`,
    keywords: [itemName, "listing", "item"],
  }
}

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
