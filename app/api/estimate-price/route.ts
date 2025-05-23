import { NextResponse } from "next/server"
import { OpenAI } from "openai"

// Initialize OpenAI client with proper API key
const getOpenAIClient = () => {
  // First try to get the pricing-specific key, then fall back to the general key
  const apiKey = process.env.PRICING_OPENAI_API_KEY || process.env.OPENAI_API_KEY

  if (!apiKey) {
    console.error("OpenAI API key is not set")
    throw new Error("OpenAI API key is not configured")
  }

  console.log(`OpenAI API key being used at: ${new Date().toISOString()}`)

  return new OpenAI({
    apiKey,
  })
}

// Function to generate price estimate using OpenAI
async function generatePriceEstimateWithOpenAI(
  itemName: string,
  description: string,
  condition: string,
  issues: string,
) {
  try {
    const openai = getOpenAIClient()

    const prompt = `
      I need to estimate the resale value of the following item:
      
      Item Name: ${itemName}
      Description: ${description}
      Condition: ${condition}
      Issues: ${issues || "None reported"}
      
      Please provide:
      1. An estimated price range in USD (e.g. $50-$75)
      2. A single price point that represents your best estimate
      3. Brief reasoning for your estimate
      
      Format your response as JSON with keys: priceRange, price (number only), reasoning
    `

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a pricing expert who specializes in estimating the value of secondhand items.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error("No response from OpenAI")
    }

    try {
      const result = JSON.parse(content)

      // Extract min and max prices from the price range
      let minPrice = 0
      let maxPrice = 0

      if (result.priceRange) {
        const matches = result.priceRange.match(/\$(\d+)(?:\.\d+)?-\$(\d+)(?:\.\d+)?/)
        if (matches && matches.length >= 3) {
          minPrice = Number.parseFloat(matches[1])
          maxPrice = Number.parseFloat(matches[2])
        }
      }

      // If we couldn't extract from range, calculate from the price
      if (minPrice === 0 && maxPrice === 0 && result.price) {
        const price = Number.parseFloat(result.price)
        minPrice = price * 0.85
        maxPrice = price * 1.15
      }

      return {
        priceRange: result.priceRange,
        price: result.price,
        minPrice,
        maxPrice,
        reasoning: result.reasoning,
        source: "openai",
      }
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError)
      throw new Error("Invalid response format from price estimation service")
    }
  } catch (error) {
    console.error("Price estimation with OpenAI failed:", error)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    const { itemName, briefDescription, condition, issues, category } = await request.json()

    // Combine item name and description for better analysis
    const fullDescription = `${itemName || ""} ${briefDescription || ""}`.trim()

    if (!fullDescription) {
      return NextResponse.json({ error: "Item description is required" }, { status: 400 })
    }

    console.log(`Price estimation request at ${new Date().toISOString()}:`, {
      itemName,
      briefDescription: briefDescription?.substring(0, 50) + (briefDescription?.length > 50 ? "..." : ""),
      condition,
    })

    // Check if the API key exists
    const apiKey = process.env.OPENAI_API_KEY || process.env.PRICING_OPENAI_API_KEY

    if (!apiKey) {
      console.error("Missing OpenAI API key for pricing")
      return NextResponse.json(
        {
          error: "Pricing API key is missing. Please contact support.",
        },
        { status: 500 },
      )
    }

    try {
      // Generate price estimate with OpenAI
      const result = await generatePriceEstimateWithOpenAI(
        itemName,
        briefDescription,
        condition || "used",
        issues || "",
      )

      return NextResponse.json({
        price: result.price,
        priceRange: result.priceRange,
        minPrice: result.minPrice,
        maxPrice: result.maxPrice,
        source: result.source,
        reasoning: result.reasoning,
      })
    } catch (error: any) {
      console.error("Error generating price estimate:", error)

      // Check if it's an API key error
      if (error.message && error.message.includes("API key")) {
        return NextResponse.json(
          {
            error: "Invalid pricing API key. Please contact support.",
          },
          { status: 401 },
        )
      }

      return NextResponse.json(
        {
          error: "Failed to generate price estimate. Please try again later.",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json(
      {
        error: "Server error. Please try again later.",
      },
      { status: 500 },
    )
  }
}
