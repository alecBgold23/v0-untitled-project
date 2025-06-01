import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { getValidEbayAccessToken } from "@/lib/ebay/getValidEbayAccessToken"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    // 1. Get submission ID from request body
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 })
    }

    // 2. Fetch the full item data from Supabase
    const { data: submission, error } = await supabase.from("sell_items").select("*").eq("id", id).single()

    if (error || !submission) {
      return NextResponse.json({ error: "Item not found or error fetching data" }, { status: 404 })
    }

    // 3. Get a valid eBay access token (with auto-refresh if needed)
    const { accessToken, error: tokenError } = await getValidEbayAccessToken()

    if (tokenError || !accessToken) {
      return NextResponse.json({ error: `Failed to get eBay access token: ${tokenError}` }, { status: 500 })
    }

    // 4. Prepare the inventory item data
    const sku = `SKU-${submission.id}-${Date.now()}`
    const title = submission.item_name.substring(0, 80) // eBay title max length is 80

    // Handle multiple images if available
    let imageUrls: string[] = []
    if (submission.image_url) {
      imageUrls.push(submission.image_url)
    }

    // Check if there are additional images stored in image_urls field
    if (submission.image_urls) {
      try {
        // Try to parse as JSON
        const parsedUrls = JSON.parse(submission.image_urls)
        if (Array.isArray(parsedUrls)) {
          imageUrls = [...imageUrls, ...parsedUrls]
        }
      } catch {
        // If not JSON, try comma-separated
        const additionalUrls = submission.image_urls.split(",").map((url) => url.trim())
        imageUrls = [...imageUrls, ...additionalUrls]
      }
    }

    // Remove duplicates
    imageUrls = [...new Set(imageUrls)]

    // Prepare inventory item data
    const inventoryItem = {
      product: {
        title,
        description: submission.item_description,
        aspects: {
          Condition: [submission.item_condition || "Used"],
        },
        imageUrls,
      },
      condition: submission.item_condition === "Like New" ? "NEW_OTHER" : "USED_EXCELLENT",
      availability: {
        shipToLocationAvailability: {
          quantity: 1,
        },
      },
    }

    // 5. Create or replace inventory item
    console.log("Creating inventory item on eBay...")
    const inventoryResponse = await fetch(`https://api.ebay.com/sell/inventory/v1/inventory_item/${sku}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(inventoryItem),
    })

    if (!inventoryResponse.ok) {
      const errorData = await inventoryResponse.json()
      console.error("eBay inventory item creation failed:", errorData)
      return NextResponse.json(
        { error: `Failed to create inventory item: ${JSON.stringify(errorData)}` },
        { status: 500 },
      )
    }

    // 6. Create an offer for the inventory item
    console.log("Creating offer on eBay...")
    const offerData = {
      sku,
      marketplaceId: "EBAY_US",
      format: "FIXED_PRICE",
      availableQuantity: 1,
      categoryId: "9355", // Default category - Electronics
      listingDescription: submission.item_description,
      listingPolicies: {
        fulfillmentPolicyId: process.env.EBAY_FULFILLMENT_POLICY_ID,
        paymentPolicyId: process.env.EBAY_PAYMENT_POLICY_ID,
        returnPolicyId: process.env.EBAY_RETURN_POLICY_ID,
      },
      pricingSummary: {
        price: {
          currency: "USD",
          value: submission.estimated_price?.toString() || "99.99",
        },
      },
      merchantLocationKey: process.env.EBAY_LOCATION_KEY,
    }

    const offerResponse = await fetch("https://api.ebay.com/sell/inventory/v1/offer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(offerData),
    })

    if (!offerResponse.ok) {
      const errorData = await offerResponse.json()
      console.error("eBay offer creation failed:", errorData)
      return NextResponse.json({ error: `Failed to create offer: ${JSON.stringify(errorData)}` }, { status: 500 })
    }

    const offerResult = await offerResponse.json()
    const offerId = offerResult.offerId

    // 7. Publish the offer to create the actual listing
    console.log("Publishing offer on eBay...")
    const publishResponse = await fetch(`https://api.ebay.com/sell/inventory/v1/offer/${offerId}/publish`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json()
      console.error("eBay offer publishing failed:", errorData)
      return NextResponse.json({ error: `Failed to publish offer: ${JSON.stringify(errorData)}` }, { status: 500 })
    }

    const publishResult = await publishResponse.json()
    const listingId = publishResult.listingId

    // 8. Update the database with eBay listing information
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
      return NextResponse.json({ error: "Item was listed on eBay but failed to update database" }, { status: 500 })
    }

    // 9. Return success with listing details
    return NextResponse.json({
      success: true,
      message: "Item successfully listed on eBay",
      ebay_offer_id: offerId,
      ebay_listing_id: listingId,
      ebay_listing_url: `https://www.ebay.com/itm/${listingId}`,
    })
  } catch (e) {
    console.error("Error listing item on eBay:", e)
    return NextResponse.json({ error: e instanceof Error ? e.message : "Internal server error" }, { status: 500 })
  }
}
