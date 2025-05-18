"use server"

import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type SubmitItemData = {
  name: string
  description: string
  condition: string
  imageUrl: string
}

export async function submitItemWithImage(data: SubmitItemData) {
  try {
    if (!data.name || !data.description || !data.condition) {
      return {
        success: false,
        message: "Missing required fields",
      }
    }

    // Get the site URL (production or local)
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"

    // 🔍 Call the pricing API
    const pricingRes = await fetch(`${siteUrl}/api/price-item`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: data.description }),
    })

    if (!pricingRes.ok) {
      console.error("Pricing API error:", await pricingRes.text())
      return {
        success: false,
        message: "Failed to get price estimate",
      }
    }

    const { price } = await pricingRes.json()
    console.log("Estimated price from OpenAI:", price)

    // Save item + price to Supabase
    const { data: insertedData, error } = await supabase
      .from("items")
      .insert([
        {
          name: data.name,
          description: data.description,
          condition: data.condition,
          image_url: data.imageUrl,
          estimated_price: price,
        },
      ])
      .select()

    if (error) {
      console.error("Error inserting data:", error)
      return {
        success: false,
        message: "Failed to submit item",
      }
    }

    return {
      success: true,
      message: "Item submitted successfully with price estimate!",
      data: insertedData,
    }
  } catch (error) {
    console.error("Unexpected error:", error)
    return {
      success: false,
      message: "An unexpected error occurred.",
    }
  }
}
