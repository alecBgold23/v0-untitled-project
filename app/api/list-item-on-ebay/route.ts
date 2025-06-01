import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { getValidEbayAccessToken } from "@/lib/ebay/getValidEbayAccessToken"

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    // 1. Get submission ID from request body
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 })
    }

    // 2. Fetch the full item data from Supabase
    const { data: submission, error: fetchError } = await supabase.from("sell_items").select("*").eq("id", id).single()

    if (fetchError || !submission) {
      return NextResponse.json({ error: "Item not found or error fetching data" }, { status: 404 })
    }

    // 3. Get valid eBay access token
    const accessToken = await getValidEbayAccessToken()

    if (!accessToken) {
      return NextResponse.json({ error: "Failed to get valid eBay access token" }, { status: 401 })
    }

    // 4. Prepare data for eBay listing
    const sku = `item-${submission.id}`
    const imageUrls = submission.image_url ? [submission.image_url] : []

    // Map condition to eBay condition codes
    const mapConditionToCode = (condition: string) => {
      const normalized = condition.toLowerCase().trim()
      switch (normalized) {
        case "like new":
          return 1000 // New
        case "excellent":
          return 4000 // Very Good
        case "good":
          return 5000 // Good
        case "fair":
          return 6000 // Acceptable
        case "poor":
          return 7000 // For parts or not working
        default:
          return 3000 // Used
      }
    }

    // 5. Step 1: Create or Replace Inventory Item
    const inventoryItemPayload = {
      condition: mapConditionToCode(submission.item_condition),
      product: {
        title: submission.item_name,
        description: submission.item_description,
        imageUrls: imageUrls,
      },
      availability: {
        shipToLocationAvailability: {
          quantity: 1,
        },
      },
    }

    const inventoryResponse = await fetch(`https://api.ebay.com/sell/inventory/v1/inventory_item/${sku}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inventoryItemPayload),
    })

    if (!inventoryResponse.ok) {
      const errorText = await inventoryResponse.text()
      console.error("❌ Failed to create inventory item:", errorText)
      throw new Error(`Failed to create inventory item: ${inventoryResponse.statusText}`)
    }

    console.log("✅ Inventory item created for SKU:", sku)

    // 6. Step 2: Create Offer
    const offerPayload = {
      sku: sku,
      marketplaceId: "EBAY_US",
      format: "FIXED_PRICE",
      availableQuantity: 1,
      pricingSummary: {
        price: {
          value: submission.estimated_price?.toFixed(2) || "0.00",
          currency: "USD",
        },
      },
      listingPolicies: {
        fulfillmentPolicyId: process.env.EBAY_FULFILLMENT_POLICY_ID!,
        paymentPolicyId: process.env.EBAY_PAYMENT_POLICY_ID!,
        returnPolicyId: process.env.EBAY_RETURN_POLICY_ID!,
      },
      merchantLocationKey: process.env.EBAY_LOCATION_KEY!,
    }

    const offerResponse = await fetch("https://api.ebay.com/sell/inventory/v1/offer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(offerPayload),
    })

    if (!offerResponse.ok) {
      const errorText = await offerResponse.text()
      console.error("❌ Failed to create offer:", errorText)
      throw new Error(`Failed to create offer: ${offerResponse.statusText}`)
    }

    const offerResult = await offerResponse.json()
    const offerId = offerResult.offerId

    console.log("✅ Offer created:", offerId)

    // 7. Step 3: Publish Offer
    const publishResponse = await fetch(`https://api.ebay.com/sell/inventory/v1/offer/${offerId}/publish`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!publishResponse.ok) {
      const errorText = await publishResponse.text()
      console.error("❌ Failed to publish offer:", errorText)
      throw new Error(`Failed to publish offer: ${publishResponse.statusText}`)
    }

    const publishResult = await publishResponse.json()
    const listingId = publishResult.listingId

    console.log("✅ Offer published:", offerId, "Listing ID:", listingId)

    // 8. Update status and store eBay data in Supabase
    const { error: updateError } = await supabase
      .from("sell_items")
      .update({
        status: "listed",
        ebay_offer_id: offerId,
        ebay_listing_id: listingId,
      })
      .eq("id", id)

    if (updateError) {
      console.error("Failed to update database:", updateError)
      return NextResponse.json({ error: "Failed to update status in Supabase" }, { status: 500 })
    }

    // 9. Return success
    return NextResponse.json({
      success: true,
      offerId: offerId,
      listingId: listingId,
      message: "Item successfully listed on eBay",
    })
  } catch (e: any) {
    console.error("Error listing item on eBay:", e)
    return NextResponse.json(
      { error: "Failed to list item on eBay: " + (e.message || "Unknown error") },
      { status: 500 },
    )
  }
}
