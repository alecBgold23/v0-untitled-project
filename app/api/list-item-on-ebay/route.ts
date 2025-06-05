import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { getValidEbayAccessToken } from "@/lib/ebay/getValidEbayAccessToken"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

function mapConditionToEbay(condition: string): string {
  const normalized = condition.trim().toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ")
  const conditionMap: { [key: string]: string } = {
    "like new": "NEW_OTHER",
    "excellent": "USED_EXCELLENT",
    "good": "USED_GOOD",
    "fair": "USED_ACCEPTABLE",
    "poor": "FOR_PARTS_OR_NOT_WORKING",
  }
  return conditionMap[normalized] || "FOR_PARTS_OR_NOT_WORKING"
}

function extractBrand(itemName: string): string {
  const knownBrands = ["Apple", "Samsung", "Sony", "Dell", "HP", "Lenovo", "Google", "Microsoft"]
  const brand = knownBrands.find((b) => itemName.toLowerCase().includes(b.toLowerCase()))
  return brand || "Unbranded"
}

async function getSuggestedCategoryId(query: string, accessToken: string): Promise<string> {
  try {
    const res = await fetch(`https://api.ebay.com/commerce/taxonomy/v1_beta/category_tree/0/get_category_suggestions?q=${encodeURIComponent(query)}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Accept-Language": "en-US"
      }
    })
    const json = await res.json()
    const categoryId = json?.categorySuggestions?.[0]?.category?.categoryId

    if (!categoryId) {
      console.warn("⚠️ No category suggestion returned. Using fallback.")
      // You can customize fallback per brand/type later
      return "139971" // e.g., default to 'Virtual Reality Headsets' category
    }

    return categoryId
  } catch (err) {
    console.warn("⚠️ Category suggestion failed. Using fallback.", err)
    return "139971" // same fallback here
  }
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
        { status: 500 },
      )
    }

    const timestamp = Date.now()
    const sku = `ITEM-${submission.id}-${timestamp}`
    const title = submission.item_name.substring(0, 80)
    const ebayCondition = mapConditionToEbay(submission.item_condition)
    const brand = extractBrand(submission.item_name)

    const searchQuery = `${submission.item_name} ${submission.item_description}`.trim()
    const categoryId = await getSuggestedCategoryId(searchQuery, accessToken)
    console.log(`🧠 Suggested eBay category ID: ${categoryId}`)

    let imageUrls: string[] = []
    if (submission.image_url) imageUrls.push(submission.image_url)

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

    const inventoryItem = {
      product: {
        title,
        description: submission.item_description,
        aspects: {
          Condition: [submission.item_condition || "Used"],
          Brand: [brand],
          Model: [submission.item_name], // <-- Added
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

    console.log("📦 Creating inventory item with PUT API...")
    const putResponse = await fetch(
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
      },
    )

    const putText = await putResponse.text()
    console.log("📩 Raw PUT inventory response:", putText)

    if (!putResponse.ok) {
      console.error("❌ PUT inventory item creation failed:", {
        status: putResponse.status,
        statusText: putResponse.statusText,
        response: putText,
      })
      return NextResponse.json({ error: "Inventory item creation failed", response: putText }, { status: 500 })
    }

    console.log("✅ Inventory item created")

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

    const rawPrice = submission.estimated_price
    const cleanedPrice = typeof rawPrice === "string" ? rawPrice.replace(/[^0-9.-]+/g, "") : rawPrice
    const priceValue = Number(cleanedPrice)
    if (isNaN(priceValue) || priceValue <= 0) {
      console.error("❌ Invalid or missing estimated price:", submission.estimated_price)
      return NextResponse.json({ error: "Invalid or missing estimated price" }, { status: 400 })
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
          value: priceValue.toFixed(2),
          currency: "USD",
        },
      },
      merchantLocationKey: requiredEnvVars.locationKey,

      // <<< Added shippingPackageDetails here >>> 
      packageWeightAndSize: {
        packageType: "PACKAGE",
        weight: {
          value: 1,
          unit: "POUND",
        },
      },
    }

    const offerResponse = await fetch("https://api.ebay.com/sell/inventory/v1/offer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Content-Language": "en-US",
        "Accept-Language": "en-US",
      },
      body: JSON.stringify(offerData),
    })

    const offerText = await offerResponse.text()
    console.log("📩 Raw offer response:", offerText)

    if (!offerResponse.ok) {
      console.error("❌ Offer creation failed:", {
        status: offerResponse.status,
        statusText: offerResponse.statusText,
        response: offerText,
      })
      return NextResponse.json({ error: "Offer creation failed", response: offerText }, { status: 500 })
    }

    const offerResult = JSON.parse(offerText)
    const offerId = offerResult.offerId
    if (!offerId) {
      console.error("❌ No offer ID returned")
      return NextResponse.json({ error: "No offer ID from eBay" }, { status: 500 })
    }

    console.log(`✅ Offer created: ${offerId}`)

    console.log("🚀 Publishing offer...")
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
      },
    )

    const publishText = await publishResponse.text()
    console.log("📩 Raw publish response:", publishText)

    if (!publishResponse.ok) {
      console.error("❌ Publishing offer failed:", {
        status: publishResponse.status,
        response: publishText,
      })
      return NextResponse.json({ error: "Offer publishing failed", response: publishText }, { status: 500 })
    }

    const publishResult = JSON.parse(publishText)
    const listingId = publishResult.listingId
    console.log(`✅ Offer published: ${listingId}`)

    return NextResponse.json({ success: true, listingId })
  } catch (err: any) {
    console.error("❌ Unexpected error:", err?.message || err)
    console.error("📛 Stack trace:", err?.stack || "No stack trace")
    return NextResponse.json({ error: err?.message || "Unexpected server error" }, { status: 500 })
  }
}
