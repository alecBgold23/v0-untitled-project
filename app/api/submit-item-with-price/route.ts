import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create Supabase client with service role key for admin access
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: Request) {
  try {
    const { title, description, image_url } = await req.json()

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 })
    }

    // Get the site URL for the API call
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"

    // Call your pricing API endpoint with the item description
    const pricingRes = await fetch(`${siteUrl}/api/price-item`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    })

    if (!pricingRes.ok) {
      console.error("Pricing API error:", await pricingRes.text())
      return NextResponse.json({ error: "Failed to get price estimate" }, { status: 500 })
    }

    const { price } = await pricingRes.json()

    // Insert the item data with the estimated price into Supabase
    const { data, error } = await supabase
      .from("sell_items")
      .insert([
        {
          item_name: title,
          item_description: description,
          image_url,
          estimated_price: price,
          submission_date: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      price,
      message: "Item submitted successfully with price estimate",
    })
  } catch (err) {
    console.error("Server error:", err)
    return NextResponse.json({ error: "Server error", details: String(err) }, { status: 500 })
  }
}
