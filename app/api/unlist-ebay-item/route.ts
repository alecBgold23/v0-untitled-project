import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getValidEbayAccessToken } from "@/lib/ebay/getValidEbayAccessToken"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  console.log("🔄 Starting eBay item unlisting process")

  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      console.error("❌ Missing required parameter: id")
      return NextResponse.json({ error: "Missing required parameter: id" }, { status: 400 })
    }

    console.log(`📋 Unlisting item id=${id}`)

    // ✅ Fetch ebay_sku and ebay_offer_id directly from Supabase
    console.log("🗂️ Fetching eBay SKU and offerId from Supabase...")
    const { data: item, error } = await supabase
      .from("sell_items")
      .select("ebay_sku, ebay_offer_id")
      .eq("id", id)
      .single()

    if (error || !item?.ebay_sku) {
      console.error("❌ ebay_sku not found or error:", error)
      return NextResponse.json({ error: "ebay_sku not found" }, { status: 400 })
    }

    const sku = item.ebay_sku
    const offerId = item.ebay_offer_id

    console.log(`🏷️ Using existing eBay SKU from Supabase: '${sku}'`)
    console.log(`🆔 Using existing eBay offerId from Supabase: '${offerId}'`)

    if (!offerId) {
      console.error("❌ ebay_offer_id is missing in Supabase")
      return NextResponse.json({ error: "ebay_offer_id not found" }, { status: 400 })
    }

    // Get valid eBay access token
    console.log("🔑 Getting eBay access token")
    const accessToken = await getValidEbayAccessToken()
    console.log("✅ Access token obtained")

    // Withdraw the offer
    console.log(`🗑️ Withdrawing offerId=${offerId}`)
    const withdrawRes = await fetch(
      `https://api.ebay.com/sell/inventory/v1/offer/${offerId}/withdraw`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "Accept-Language": "en-US", // ✅ required by eBay API
        },
      }
    )

    console.log(`📊 Withdraw status: ${withdrawRes.status}`)

    if (!withdrawRes.ok) {
      const withdrawError = await withdrawRes.text()
      console.error("❌ Withdraw failed:", withdrawError)

      try {
        const parsedError = JSON.parse(withdrawError)
        return NextResponse.json({ error: parsedError }, { status: withdrawRes.status })
      } catch {
        return NextResponse.json({ error: withdrawError }, { status: withdrawRes.status })
      }
    }

    console.log("✅ Item successfully unlisted.")

    // Update DB status to 'unlisted'
    const { error: updateError } = await supabase
      .from("sell_items")
      .update({ ebay_status: "unlisted" })
      .eq("id", id)

    if (updateError) {
      console.warn("⚠️ Failed to update item status in database:", updateError)
    } else {
      console.log("📝 Database updated with unlisted status")
    }

    return NextResponse.json({
      success: true,
      message: "Item successfully unlisted.",
      offerId: offerId,
    })
  } catch (error) {
    console.error("❌ Unexpected error during unlisting:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
