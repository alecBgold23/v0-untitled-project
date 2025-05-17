import { NextResponse } from "next/server"
import OpenAI from "openai"

// Initialize OpenAI client with the pricing-specific API key
const openai = new OpenAI({
  apiKey: process.env.PRICING_OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()
    const { description } = body

    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 })
    }

    // Check if API key is available
    if (!process.env.PRICING_OPENAI_API_KEY) {
      console.error("PRICING_OPENAI_API_KEY is not set")
      return NextResponse.json({ error: "API key configuration error" }, { status: 500 })
    }

    // Create the prompt for OpenAI
    const prompt = `
You are an expert in estimating the resale value of used items. 
Based on the following item description, provide a price range estimate in USD.
Only respond with the price range in the format "$MIN - $MAX" (e.g., "$50 - $75").
Do not include any other text, explanations, or formatting.

Item description: ${description}

Consider factors like:
- Condition (if mentioned)
- Brand/make/model (if mentioned)
- Age (if mentioned)
- Market demand for similar items
- Typical depreciation for this type of item

Price range:
`

    // Call OpenAI API
    const completion = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt,
      max_tokens: 20,
      temperature: 0.3,
    })

    // Extract the price from the response
    const price = completion.choices[0].text.trim()

    // Log for debugging
    console.log("Price estimate generated:", price)

    // Return the price estimate
    return NextResponse.json({ price })
  } catch (error) {
    console.error("Error estimating price:", error)
    return NextResponse.json({ error: "Failed to estimate price" }, { status: 500 })
  }
}
