import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getValidEbayAccessToken } from "@/lib/ebay/getValidEbayAccessToken"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  console.log("🔄 Starting eBay item unlisting process")

  try {
    // Parse request body
    const body = await request.json()
    const { id } = body

    if (!id) {
      console.error("❌ Missing required parameter: id")
      return NextResponse.json({ error: "Missing required parameter: id" }, { status: 400 })
    }

    console.log(`📋 Unlisting item id=${id}`)

    // 1. Fetch submission_date to reconstruct SKU
    const { data: item, error } = await supabase.from("sell_items").select("submission_date").eq("id", id).single()

    if (error || !item?.submission_date) {
      console.error("❌ submission_date not found or error:", error)
      return NextResponse.json({ error: "submission_date not found" }, { status: 400 })
    }

    // 2. Rebuild SKU (must exactly match listing SKU pattern)
    const timestamp = new Date(item.submission_date).getTime()
    const sku = `ITEM-${id}-${timestamp}`
    console.log(`🏷️ Rebuilt SKU: ${sku}`)

    // Get valid eBay access token
    console.log("🔑 Getting eBay access token")
    const accessToken = await getValidEbayAccessToken()
    console.log("✅ Access token obtained")

    // 3. Look up offer by SKU
    console.log(`🔍 Looking up offer by SKU: ${sku}`)
    const offerLookupRes = await fetch(`https://api.ebay.com/sell/inventory/v1/offer?sku=${sku}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    // Log the raw response for debugging
    console.log(`📊 Offer lookup status: ${offerLookupRes.status}`)

    const offerData = await offerLookupRes.json()
    console.log("📄 Offer lookup response:", JSON.stringify(offerData, null, 2))

    if (!offerLookupRes.ok || !offerData.offers || offerData.offers.length === 0) {
      console.error("❌ Offer lookup failed:", offerData)
      return NextResponse.json({ error: "No offer found for this SKU" }, { status: 404 })
    }

    const offerId = offerData.offers[0].offerId
    console.log(`🆔 Offer found with offerId: ${offerId}`)

    // 4. Withdraw the offer
    console.log(`🗑️ Withdrawing offerId=${offerId}`)
    const withdrawRes = await fetch(`https://api.ebay.com/sell/inventory/v1/offer/${offerId}/withdraw`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    // Log the raw response for debugging
    console.log(`📊 Withdraw status: ${withdrawRes.status}`)

    if (!withdrawRes.ok) {
      const withdrawError = await withdrawRes.text()
      console.error("❌ Withdraw failed:", withdrawError)

      try {
        // Try to parse as JSON if possible
        const parsedError = JSON.parse(withdrawError)
        return NextResponse.json({ error: parsedError }, { status: withdrawRes.status })
      } catch {
        // If not JSON, return as text
        return NextResponse.json({ error: withdrawError }, { status: withdrawRes.status })
      }
    }

    console.log("✅ Item successfully unlisted.")

    // 5. Update the item status in the database (optional)
    const { error: updateError } = await supabase.from("sell_items").update({ ebay_status: "unlisted" }).eq("id", id)

    if (updateError) {
      console.warn("⚠️ Failed to update item status in database:", updateError)
      // Continue anyway since the unlisting was successful
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
      { status: 500 },
    )
  }
}
