import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { getValidEbayAccessToken } from "@/lib/ebay/getValidEbayAccessToken"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Map item conditions to eBay condition values
function mapConditionToEbay(condition: string) {
  const conditionMap: { [key: string]: string } = {
    "Like New": "NEW_OTHER",
    Excellent: "USED_EXCELLENT",
    Good: "USED_GOOD",
    Fair: "USED_ACCEPTABLE",
    Poor: "FOR_PARTS_OR_NOT_WORKING",
  }
  return conditionMap[condition] || "USED_GOOD"
}

// Get appropriate category ID based on item name/description
function getCategoryId(itemName: string, description: string): string {
  const text = `${itemName} ${description}`.toLowerCase()

  // Electronics categories
  if (text.includes("phone") || text.includes("iphone") || text.includes("android")) {
    return "9355" // Cell Phones & Smartphones
  }
  if (text.includes("laptop") || text.includes("computer") || text.includes("pc")) {
    return "177" // Laptops & Netbooks
  }
  if (text.includes("tablet") || text.includes("ipad")) {
    return "171485" // Tablets & eBook Readers
  }
  if (text.includes("watch") || text.includes("smartwatch")) {
    return "178893" // Smart Watches
  }
  if (text.includes("headphone") || text.includes("earphone") || text.includes("airpods")) {
    return "15052" // Portable Audio Headphones
  }

  // Default to general electronics
  return "293" // Consumer Electronics
}

export async function POST(request: Request) {
  try {
    console.log("🚀 Starting eBay listing process...")

    // 1. Get submission ID from request body
    const { id } = await request.json()

    if (!id) {
      console.error("❌ No item ID provided")
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 })
    }

    console.log(`📝 Processing item ID: ${id}`)

    // 2. Fetch the full item data from Supabase
    const { data: submission, error } = await supabase.from("sell_items").select("*").eq("id", id).single()

    if (error || !submission) {
      console.error("❌ Item not found:", error)
      return NextResponse.json({ error: "Item not found or error fetching data" }, { status: 404 })
    }

    console.log("✅ Item data retrieved:", {
      name: submission.item_name,
      condition: submission.item_condition,
      price: submission.estimated_price,
    })

    // 3. Get a valid eBay access token (with auto-refresh if needed)
    let accessToken: string
    try {
      accessToken = await getValidEbayAccessToken()
      console.log("✅ eBay access token obtained")
    } catch (tokenError) {
      console.error("❌ Failed to get eBay access token:", tokenError)
      return NextResponse.json(
        {
          error: `Failed to get eBay access token: ${tokenError instanceof Error ? tokenError.message : "Unknown error"}`,
        },
        { status: 500 },
      )
    }

    // 4. Prepare the inventory item data
    const timestamp = Date.now()
    const sku = `ITEM-${submission.id}-${timestamp}`
    const title = submission.item_name.substring(0, 80) // eBay title max length is 80
    const categoryId = getCategoryId(submission.item_name, submission.item_description)
    const ebayCondition = mapConditionToEbay(submission.item_condition)

    console.log("📋 Prepared listing data:", {
      sku,
      title,
      categoryId,
      condition: ebayCondition,
    })

    // Handle multiple images if available
    let imageUrls: string[] = []
    if (submission.image_url) {
      imageUrls.push(submission.image_url)
    }

    if (submission.image_urls) {
      try {
        const parsedUrls = JSON.parse(submission.image_urls)
        if (Array.isArray(parsedUrls)) {
          imageUrls = [...imageUrls, ...parsedUrls]
        }
      } catch {
        const additionalUrls = submission.image_urls.split(",").map((url) => url.trim())
        imageUrls = [...imageUrls, ...additionalUrls]
      }
    }

    imageUrls = [...new Set(imageUrls)].filter((url) => url && url.trim().length > 0)

    console.log(`🖼️ Prepared ${imageUrls.length} images for listing`)

    // 5. Prepare inventory item data
    const inventoryItem = {
      product: {
        title,
        description: submission.item_description,
        aspects: {
          Condition: [submission.item_condition || "Used"],
          Brand: ["Unbranded"], // Default brand
        },
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      },
      condition: ebayCondition,
      availability: {
        shipToLocationAvailability: {
          quantity: 1,
        },
      },
    }

    // 6. Create or replace inventory item
    console.log("📦 Creating inventory item on eBay...")
    const inventoryResponse = await fetch(`https://api.ebay.com/sell/inventory/v1/inventory_item/${sku}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Accept-Language": "en-US",
      },
      body: JSON.stringify(inventoryItem),
    })

    if (!inventoryResponse.ok) {
      const errorData = await inventoryResponse.json()
      console.error("❌ eBay inventory item creation failed:", {
        status: inventoryResponse.status,
        statusText: inventoryResponse.statusText,
        error: errorData,
      })
      return NextResponse.json(
        { error: `Failed to create inventory item: ${JSON.stringify(errorData)}` },
        { status: 500 },
      )
    }

    console.log("✅ Inventory item created successfully")

    // 7. Validate required environment variables
    const requiredEnvVars = {
      fulfillmentPolicyId: process.env.EBAY_FULFILLMENT_POLICY_ID,
      paymentPolicyId: process.env.EBAY_PAYMENT_POLICY_ID,
      returnPolicyId: process.env.EBAY_RETURN_POLICY_ID,
      locationKey: process.env.EBAY_LOCATION_KEY,
    }

    for (const [key, value] of Object.entries(requiredEnvVars)) {
      if (!value) {
        console.error(`❌ Missing environment variable: EBAY_${key.toUpperCase()}`)
        return NextResponse.json({ error: `Missing required eBay configuration: ${key}` }, { status: 500 })
      }
    }

    // 8. Create an offer for the inventory item
    console.log("💰 Creating offer on eBay...")
    const offerData = {
      sku,
      marketplaceId: "EBAY_US",
      format: "FIXED_PRICE",
      availableQuantity: 1,
      categoryId,
      listingDescription: submission.item_description,
      listingPolicies: {
        fulfillmentPolicyId: requiredEnvVars.fulfillmentPolicyId,
        paymentPolicyId: requiredEnvVars.paymentPolicyId,
        returnPolicyId: requiredEnvVars.returnPolicyId,
      },
      pricingSummary: {
        price: {
          currency: "USD",
          value: (submission.estimated_price || 99.99).toString(),
        },
      },
      merchantLocationKey: requiredEnvVars.locationKey,
    }

    const offerResponse = await fetch("https://api.ebay.com/sell/inventory/v1/offer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Accept-Language": "en-US",
      },
      body: JSON.stringify(offerData),
    })

    if (!offerResponse.ok) {
      const errorData = await offerResponse.json()
      console.error("❌ eBay offer creation failed:", {
        status: offerResponse.status,
        statusText: offerResponse.statusText,
        error: errorData,
      })
      return NextResponse.json(
        {
          error: `Failed to create offer: ${JSON.stringify(errorData)}`,
        },
        { status: 500 },
      )
    }

    const offerResult = await offerResponse.json()
    const offerId = offerResult.offerId

    if (!offerId) {
      console.error("❌ No offer ID returned from eBay")
      return NextResponse.json(
        {
          error: "No offer ID returned from eBay API",
        },
        { status: 500 },
      )
    }

    console.log(`✅ Offer created successfully: ${offerId}`)

    // 9. Publish the offer to create the actual listing
    console.log("🚀 Publishing offer on eBay...")
    const publishResponse = await fetch(`https://api.ebay.com/sell/inventory/v1/offer/${offerId}/publish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Accept-Language": "en-US",
      },
    })

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json()
      console.error("❌ eBay offer publishing failed:", {
        status: publishResponse.status,
        statusText: publishResponse.statusText,
        error: errorData,
      })
      return NextResponse.json(
        {
          error: `Failed to publish offer: ${JSON.stringify(errorData)}`,
        },
        { status: 500 },
      )
    }

    const publishResult = await publishResponse.json()
    const listingId = publishResult.listingId

    console.log(`✅ Offer published successfully: ${listingId}`)

    // 10. Update the database with eBay listing information
    const { error: updateError } = await supabase
      .from("sell_items")
      .update({
        status: "listed",
        ebay_offer_id: offerId,
        ebay_listing_id: listingId,
        ebay_sku: sku,
        listed_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (updateError) {
      console.error("❌ Failed to update listing info in DB:", updateError)
      return NextResponse.json(
        { error: "Failed to update listing info in database" },
        { status: 500 },
      )
    }

    console.log("🎉 Listing process complete!")

    return NextResponse.json({
      message: "Item listed successfully on eBay",
      offerId,
      listingId,
      sku,
    })
  } catch (error) {
    console.error("❌ Unexpected error in listing route:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
