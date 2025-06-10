import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { getValidEbayAccessToken } from "@/lib/ebay/getValidEbayAccessToken"
import { extractImageUrls } from "@/lib/image-url-utils"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function mapConditionToEbay(condition: string): string {
  const normalized = String(condition || "")
    .trim()
    .toLowerCase()
    .replace(/[-_]/g, " ")

  console.log(`🧪 Mapping condition: "${condition}" → "${normalized}"`)

  const conditionMap: { [key: string]: string } = {
    "like new": "NEW_OTHER",
    excellent: "USED_EXCELLENT",
    good: "USED_GOOD",
    fair: "USED_ACCEPTABLE",
    poor: "FOR_PARTS_OR_NOT_WORKING",
  }

  const mapped = conditionMap[normalized] || "FOR_PARTS_OR_NOT_WORKING"
  console.log(`✅ Mapped condition to eBay: "${mapped}"`)
  return mapped
}

function extractBrand(itemName: string): string {
  const knownBrands = ["Apple", "Samsung", "Sony", "Dell", "HP", "Lenovo", "Google", "Microsoft"]
  const brand = knownBrands.find((b) => itemName.toLowerCase().includes(b.toLowerCase()))
  return brand || "Unbranded"
}

async function getSuggestedCategoryId(query: string, accessToken: string): Promise<{ categoryId: string; treeId: string }> {
  try {
    const treeIdRes = await fetch(
      `https://api.ebay.com/commerce/taxonomy/v1/get_default_category_tree_id?marketplace_id=EBAY_US`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!treeIdRes.ok) {
      throw new Error(`Failed to get default category tree ID: ${treeIdRes.statusText}`)
    }

    const { categoryTreeId } = await treeIdRes.json()

    const res = await fetch(
      `https://api.ebay.com/commerce/taxonomy/v1/category_tree/${categoryTreeId}/get_category_suggestions?q=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "Accept-Language": "en-US",
        },
      }
    )

    const json = await res.json()
    console.log("📂 Raw category suggestions:", JSON.stringify(json, null, 2))

    const suggestions = json?.categorySuggestions || []
    if (suggestions.length === 0) {
      console.warn("⚠️ No category suggestions returned. Using fallback.")
      return { categoryId: "139971", treeId: categoryTreeId }
    }

    const sorted = suggestions.sort((a: any, b: any) => {
      const aScore = a?.confidence || 0
      const bScore = b?.confidence || 0
      return bScore - aScore
    })

    const best = sorted[0]?.category?.categoryId
    if (!best) {
      console.warn("⚠️ No valid category ID found in sorted suggestions. Using fallback.")
      return { categoryId: "139971", treeId: categoryTreeId }
    }

    console.log(`🧠 Chosen eBay category ID: ${best} (based on confidence score)`)
    return { categoryId: best, treeId: categoryTreeId }
  } catch (err) {
    console.warn("⚠️ Category suggestion failed. Using fallback.", err)
    return { categoryId: "139971", treeId: "0" }
  }
}

async function getRequiredAspectsForCategory(categoryTreeId: string, categoryId: string, accessToken: string) {
  const res = await fetch(
    `https://api.ebay.com/commerce/taxonomy/v1/category_tree/${categoryTreeId}/get_item_aspects_for_category?category_id=${categoryId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  )

  if (!res.ok) {
    console.warn("⚠️ Failed to fetch required aspects:", res.statusText)
    return []
  }

  const json = await res.json()
  const requiredAspects = json?.aspects?.filter((a: any) => a.aspectConstraint.aspectRequired) || []
  console.log("📌 Required aspects:", requiredAspects.map((a: any) => a.aspectName))
  return requiredAspects
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
    const ebayCondition = mapConditionToEbay(submission.item_condition)
    const brand = extractBrand(submission.item_name)

    const searchQuery = `${submission.item_name} ${submission.item_description}`.trim()
    const { categoryId, treeId } = await getSuggestedCategoryId(searchQuery, accessToken)
    const requiredAspects = await getRequiredAspectsForCategory(treeId, categoryId, accessToken)

    console.log(`🧠 Suggested eBay category ID: ${categoryId}`)

    const imageUrls = extractImageUrls(submission.image_urls || submission.image_url)
    if (imageUrls.length === 0) {
      console.warn("⚠️ No valid images found for item", submission.id)
    }

    console.log(`🖼️ Prepared ${imageUrls.length} images for listing:`, imageUrls)

    // Prepare aspects for inventory item product
    const aspects: Record<string, string[]> = {
      Condition: [submission.item_condition || "Used"],
      Brand: [brand],
      Model: [submission.item_name],
    }

    // Add Type if required
    if (requiredAspects.some(a => a.aspectName === "Type")) {
      aspects.Type = ["Not Specified"] // TODO: Improve by detecting real Type from item_name or user input
    }

    const inventoryItem = {
      product: {
        title,
        description: submission.item_description,
        aspects,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      },
      condition: ebayCondition,
      availability: {
        shipToLocationAvailability: {
          quantity: 1,
        },
      },
      packageWeightAndSize: {
        packageType: "USPS_LARGE_PACK",
        weight: {
          value: 2.0,
          unit: "POUND",
        },
        dimensions: {
          length: 10,
          width: 7,
          height: 3,
          unit: "INCH",
        },
      },
    }

    console.log("📦 Creating inventory item with PUT API...")
    const putResponse = await fetch(`https://api.ebay.com/sell/inventory/v1/inventory_item/${sku}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Content-Language": "en-US",
        "Accept-Language": "en-US",
      },
      body: JSON.stringify(inventoryItem),
    })

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

    // Prepare item specifics for offer (required by eBay, including "Type")
    const itemSpecifics = Object.entries(aspects).map(([name, values]) => ({
      name,
      value: values,
    }))

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
      itemSpecifics, // <-- This is the key change to add required specifics like "Type"
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
    const publishResponse = await fetch(`https://api.ebay.com/sell/inventory/v1/offer/${offerId}/publish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Content-Language": "en-US",
        "Accept-Language": "en-US",
      },
    })

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
