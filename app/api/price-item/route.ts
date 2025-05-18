import { NextResponse } from "next/server"
import OpenAI from "openai"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()
    const { description, itemId } = body

    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 })
    }

    if (!process.env.PRICING_OPENAI_API_KEY) {
      console.error("PRICING_OPENAI_API_KEY is not set")
      return NextResponse.json({ error: "API key configuration error" }, { status: 500 })
    }

    console.log("Using PRICING_OPENAI_API_KEY:", process.env.PRICING_OPENAI_API_KEY.substring(0, 5) + "...")

    const openai = new OpenAI({
      apiKey: process.env.PRICING_OPENAI_API_KEY,
    })

    // Use chat completions API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert in estimating the resale value of used items.
Only respond with a price range in USD like "$MIN - $MAX". No explanations.
Consider condition, brand, age, demand, depreciation.`,
        },
        { role: "user", content: description },
      ],
      max_tokens: 20,
      temperature: 0.3,
    })

    const price = completion.choices[0].message.content.trim()
    console.log("Price estimate generated:", price)

    // If an itemId was provided, store the price in Supabase
    if (itemId) {
      try {
        const supabase = createServerSupabaseClient()

        // Update the item with the estimated price
        const { data, error } = await supabase
          .from("sell_items")
          .update({ estimated_price: price })
          .eq("id", itemId)
          .select()

        if (error) {
          console.error("Error updating price in database:", error)
          // Continue execution - we'll still return the price to the frontend
        } else {
          console.log("Successfully stored price in database for item:", itemId)
        }
      } catch (dbError) {
        console.error("Database error when storing price:", dbError)
        // Continue execution - we'll still return the price to the frontend
      }
    } else {
      console.log("No itemId provided, price not stored in database")
    }

    return NextResponse.json({ price })
  } catch (error: any) {
    console.error("Error estimating price:", error)
    return NextResponse.json(
      {
        error: "Failed to estimate price",
        details: error.message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
