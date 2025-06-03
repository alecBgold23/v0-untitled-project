import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { getValidEbayAccessToken } from "@/lib/ebay/getValidEbayAccessToken"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function mapConditionToEbay(condition: string): number {
  const conditionMap: { [key: string]: number } = {
    "Like New": 1500,
    "Excellent": 1500,
    "Good": 2500,
    "Fair": 3000,
    "Poor": 7000,
  }

  return conditionMap[condition] || 7000
}

// Get appropriate category ID based on item name/description
function getCategoryId(itemName: string, description: string): string {
  const text = `${itemName} ${description}`.toLowerCase()

  if (text.includes("phone") || text.includes("iphone") || text.includes("android")) return "9355"
  if (text.includes("laptop") || text.includes("computer") || text.includes("pc")) return "177"
  if (text.includes("tablet") || text.includes("ipad")) return "171485"
  if (text.includes("watch") || text.includes("smartwatch")) return "178893"
  if (text.includes("headphone") || text.includes("earphone") || text.includes("airpods")) return "15052"

  return "293"
}

// Extract brand from item name (basic heuristic)
function extractBrand(itemName: string): string {
  const knownBrands = ["Apple", "Samsung", "Sony", "Dell", "HP", "Lenovo", "Google", "Microsoft"]
  const brand = knownBrands.find(b => itemName.toLowerCase().includes(b.toLowerCase()))
  return brand || "Unbranded"
}

export async function POST(request: Request) {
  try {
    console.log("🚀 Starting eBay listing process...")

    const { id } = await request.json()

    if (!id) {
      console.error("❌ No item ID provided")
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 })
    }

    console.log(`📝 Processing item ID: ${id}`)

    const { data: submission, error } = await supabase
      .from("sell_items")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !submission) {
      console.error("❌ Item not found:", error)
      return NextResponse.json({ error: "Item not found or error fetching data" }, { status: 404 })
    }

    console.log("✅ Item data retrieved:", {
      name: submission.item_name,
      condition: submission.item_condition,
      price: submission.estimated_price,
    })

    let accessToken: string
    try {
      accessToken = await getValidEbayAccessToken()
      console.log("✅ eBay access token obtained")
    } catch (tokenError) {
      console.error("❌ Failed to get eBay access token:", tokenError)
      return NextResponse.json(
        {
          error: `Failed to get eBay access token: ${
            tokenError instanceof Error ? tokenError.message : "Unknown error"
          }`,
        },
        { status: 500 }
      )
    }

    const timestamp = Date.now()
    const sku = `ITEM-${submission.id}-${timestamp}`
    const title = submission.item_name.substring(0, 80)
    const categoryId = getCategoryId(submission.item_name, submission.item_description)
    const ebayCondition = mapConditionToEbay(submission.item_condition)
    const brand = extractBrand(submission.item_name)

    console.log("📋 Prepared listing data:", {
      sku,
      title,
      categoryId,
      condition: ebayCondition,
      brand,
    })

    let imageUrls: string[] = []

    if (submission.image_url) imageUrls.push(submission.image_url)

    if (submission.image_urls) {
      try {
        const parsedUrls = JSON.parse(submission.image_urls)
        if (Array.isArray(parsedUrls)) {
          imageUrls = [...imageUrls, ...parsedUrls]
        }
      } catch {
        const additionalUrls = submission.image_urls
          .split(",")
          .map((url) => url.trim())
        imageUrls = [...imageUrls, ...additionalUrls]
      }
    }

    imageUrls = [...new Set(imageUrls)].filter((url) => url && url.trim().length > 0)

    console.log(`🖼️ Prepared ${imageUrls.length} images for listing`)

    const inventoryItem = {
      product: {
        title,
        description: submission.item_description,
        aspects: {
          Condition: [submission.item_condition || "Used"],
          Brand: [brand],
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

    console.log("📦 Creating inventory item on eBay...")
    const inventoryResponse = await fetch(
      `https://api.ebay.com/sell/inventory/v1/inventory_item/${sku}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
        body: JSON.stringify(inventoryItem),
      }
    )

    if (!inventoryResponse.ok) {
      const errorData = await inventoryResponse.json()
      console.error("❌ eBay inventory item creation failed:", {
        status: inventoryResponse.status,
        statusText: inventoryResponse.statusText,
        error: errorData,
      })
      return NextResponse.json(
        { error: `Failed to create inventory item: ${JSON.stringify(errorData)}` },
        { status: 500 }
      )
    }

    console.log("✅ Inventory item created successfully")

    const requiredEnvVars = {
      fulfillmentPolicyId: process.env.EBAY_FULFILLMENT_POLICY_ID,
      paymentPolicyId: process.env.EBAY_PAYMENT_POLICY_ID,
      returnPolicyId: process.env.EBAY_RETURN_POLICY_ID,
      locationKey: process.env.EBAY_LOCATION_KEY,
    }

    for (const [key, value] of Object.entries(requiredEnvVars)) {
      if (!value) {
        console.error(`❌ Missing environment variable: EBAY_${key.toUpperCase()}`)
        return NextResponse.json(
          { error: `Missing required eBay configuration: ${key}` },
          { status: 500 }
        )
      }
    }

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
    value:submission.estimated_price.toFixed(2),
    currency: "USD", // MUST be a string in quotes
  }
},
      merchantLocationKey: requiredEnvVars.locationKey,
    }

    const offerResponse = await fetch(
      "https://api.ebay.com/sell/inventory/v1/offer",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
        body: JSON.stringify(offerData),
      }
    )

    if (!offerResponse.ok) {
      const errorData = await offerResponse.json()
      console.error("❌ eBay offer creation failed:", {
        status: offerResponse.status,
        statusText: offerResponse.statusText,
        error: errorData,
      })
      return NextResponse.json(
        { error: `Failed to create offer: ${JSON.stringify(errorData)}` },
        { status: 500 }
      )
    }

    const offerResult = await offerResponse.json()
    const offerId = offerResult.offerId

    if (!offerId) {
      console.error("❌ No offer ID returned from eBay")
      return NextResponse.json(
        { error: "No offer ID returned from eBay API" },
        { status: 500 }
      )
    }

    console.log(`✅ Offer created successfully: ${offerId}`)

    console.log("🚀 Publishing offer on eBay...")
    const publishResponse = await fetch(
      `https://api.ebay.com/sell/inventory/v1/offer/${offerId}/publish`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
      }
    )

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json()
      console.error("❌ eBay offer publishing failed:", {
        status: publishResponse.status,
        statusText: publishResponse.statusText,
        error: errorData,
      })
      return NextResponse.json(
        { error: `Failed to publish offer: ${JSON.stringify(errorData)}` },
        { status: 500 }
      )
    }

    const publishResult = await publishResponse.json()
    const listingId = publishResult.listingId

    console.log(`✅ Offer published successfully: ${listingId}`)

    return NextResponse.json({ success: true, listingId })
  } catch (err) {
    console.error("❌ Unexpected error:", err)
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 })
  }
}
