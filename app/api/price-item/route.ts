import { generateCombinedPriceEstimate } from "@/lib/pricing"
import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { generatePriceEstimate } from "@/lib/openai-pricing"

/**
 * Save price estimate to Supabase
 */
async function savePriceToSupabase(
  itemId: string | null | undefined,
  price: string,
  source: string,
  confidence: number,
  itemName?: string,
  description?: string,
) {
  if (!itemId) {
    console.log("No item ID provided, creating new item record")

    try {
      const supabase = createServerSupabaseClient()

      // Create a new item record
      const { data, error } = await supabase
        .from("items")
        .insert({
          item_name: itemName || "Unnamed Item",
          description: description || "",
          estimated_price: price.replace(/^\$/, ""),
          price_source: source,
          price_confidence: confidence,
          created_at: new Date().toISOString(),
        })
        .select()

      if (error) {
        console.error("Error creating new item record:", error)
        return { success: false, error }
      }

      console.log("Created new item record:", data)
      return { success: true, data }
    } catch (error) {
      console.error("Error saving to Supabase:", error)
      return { success: false, error }
    }
  } else {
    console.log("Updating existing item record:", itemId)

    try {
      const supabase = createServerSupabaseClient()

      // Update existing item record
      const { data, error } = await supabase
        .from("items")
        .update({
          estimated_price: price.replace(/^\$/, ""),
          price_source: source,
          price_confidence: confidence,
          updated_at: new Date().toISOString(),
        })
        .eq("id", itemId)
        .select()

      if (error) {
        console.error("Error updating item record:", error)
        return { success: false, error }
      }

      console.log("Updated item record:", data)
      return { success: true, data }
    } catch (error) {
      console.error("Error saving to Supabase:", error)
      return { success: false, error }
    }
  }
}

export async function POST(request: Request) {
  try {
    const { description, itemName, condition, defects, itemId, category } = await request.json()

    if (!description && !itemName) {
      return NextResponse.json({ error: "Description or item name is required" }, { status: 400 })
    }

    // Combine item name and description for better analysis
    const fullDescription = `${itemName || ""} ${description || ""}`.trim()

    console.log(`Price estimation request at ${new Date().toISOString()}:`, {
      description: description?.substring(0, 50) + (description?.length > 50 ? "..." : ""),
      itemName,
      condition,
      itemId,
    })

    // Check if the OpenAI API key exists
    const openAiKey = process.env.PRICING_OPENAI_API_KEY || process.env.OPENAI_API_KEY

    if (!openAiKey) {
      console.error("Missing OpenAI API key")
      return NextResponse.json(
        {
          error: "Pricing API key is missing. Please contact support.",
        },
        { status: 500 },
      )
    }

    try {
      // Generate price estimate using OpenAI with tech database enabled
      const { price, source, reasoning } = await generateCombinedPriceEstimate(
        itemName || "",
        description || "",
        condition || "used",
        defects || ""
      )
      console.log("Generated price estimate:", price, "Source:", source)

      // Save price to Supabase
      const saveResult = await savePriceToSupabase(itemId, price, source, 0.9, itemName, description)

      return NextResponse.json({
        price: price,
        source: source,
        confidence: 0.9,
        savedToSupabase: saveResult.success,
        supabaseData: saveResult.data,
      })
    } catch (error) {
      console.error("OpenAI request failed:", error)

      // Check if it's an API key error
      if (error instanceof Error && error.message.includes("API key")) {
        return NextResponse.json(
          {
            error: "Invalid pricing API key. Please contact support.",
          },
          { status: 401 },
        )
      }

      return NextResponse.json(
        {
          error: "Failed to connect to pricing service. Please try again later.",
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
