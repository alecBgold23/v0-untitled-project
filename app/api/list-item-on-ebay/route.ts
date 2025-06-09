import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { getValidEbayAccessToken } from "@/lib/ebay/getValidEbayAccessToken"
import { extractImageUrls } from "@/lib/image-url-utils"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

function mapConditionToEbay(condition: string): string {
  const normalized = String(condition || "")
    .trim()
    .toLowerCase()
    .replace(/[-_]/g, " ") // replace hyphens and underscores with spaces

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

interface CategoryAndType {
  categoryId: string;
  typeValue: string | null;
}

async function getSuggestedCategoryIdAndType(
  query: string,
  accessToken: string
): Promise<CategoryAndType> {
  try {
    // Step 1: Get the default category tree ID for the eBay US marketplace
    const treeIdRes = await fetch(
      `https://api.ebay.com/commerce/taxonomy/v1/get_default_category_tree_id?marketplace_id=EBAY_US`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!treeIdRes.ok) {
      throw new Error(`Failed to get default category tree ID: ${treeIdRes.statusText}`);
    }

    const { categoryTreeId } = await treeIdRes.json();

    // Step 2: Get category suggestions based on the provided query
    const res = await fetch(
      `https://api.ebay.com/commerce/taxonomy/v1/category_tree/${categoryTreeId}/get_category_suggestions?q=${encodeURIComponent(
        query
      )}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "Accept-Language": "en-US",
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to get category suggestions: ${res.statusText}`);
    }

    const json = await res.json();
    console.log("📂 Raw category suggestions:", JSON.stringify(json, null, 2));

    const suggestions = json?.categorySuggestions || [];
    if (suggestions.length === 0) {
      console.warn("⚠️ No category suggestions returned. Using fallback categoryId 139971.");
      return { categoryId: "139971", typeValue: null };
    }

    // Sort by confidence score if present
    const sorted = suggestions.sort((a: any, b: any) => {
      const aScore = a?.confidence || 0;
      const bScore = b?.confidence || 0;
      return bScore - aScore;
    });

    const bestCategoryId = sorted[0]?.category?.categoryId;
    if (!bestCategoryId) {
      console.warn("⚠️ No valid category ID found in sorted suggestions. Using fallback categoryId 139971.");
      return { categoryId: "139971", typeValue: null };
    }

    console.log(`🧠 Chosen eBay category ID: ${bestCategoryId} (based on confidence score)`);

    // Step 3: Fetch required 'Type' aspect for the category
    const aspectsRes = await fetch(
      `https://api.ebay.com/commerce/taxonomy/v1/category_tree/${categoryTreeId}/get_item_aspects_for_category?category_id=${bestCategoryId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "Accept-Language": "en-US",
        },
      }
    );

    if (!aspectsRes.ok) {
      console.warn(`⚠️ Failed to get item aspects for category ${bestCategoryId}: ${aspectsRes.statusText}`);
      return { categoryId: bestCategoryId, typeValue: null };
    }

    const aspectsJson = await aspectsRes.json();
    const aspects = aspectsJson?.aspects || [];

    const typeAspect = aspects.find(
      (aspect: any) => aspect.name?.toLowerCase() === "type"
    );

    if (!typeAspect || !typeAspect.values || typeAspect.values.length === 0) {
      console.warn("⚠️ No 'Type' aspect or no valid values found for this category.");
      return { categoryId: bestCategoryId, typeValue: null };
    }

    // Return first valid 'Type' value found
    const typeValue = typeAspect.values[0]?.localizedValue || null;
    console.log(`🔧 Found 'Type' aspect value: ${typeValue}`);

    return { categoryId: bestCategoryId, typeValue };

  } catch (err) {
    console.warn("⚠️ Category suggestion and 'Type' aspect retrieval failed. Using fallback.", err);
    return { categoryId: "139971", typeValue: null };
  }
}


function detectItemType(itemName: string, description: string): string {
  const combined = `${itemName} ${description}`.toLowerCase()

  // Electronics
  if (combined.includes("iphone") || combined.includes("smartphone") || combined.includes("phone")) return "Smartphone"
  if (combined.includes("ipad") || combined.includes("tablet")) return "Tablet"
  if (combined.includes("laptop") || combined.includes("macbook") || combined.includes("notebook")) return "Laptop"
  if (combined.includes("desktop") || combined.includes("computer") || combined.includes("pc"))
    return "Desktop Computer"
  if (combined.includes("monitor") || combined.includes("display") || combined.includes("screen")) return "Monitor"
  if (combined.includes("keyboard")) return "Keyboard"
  if (combined.includes("mouse")) return "Mouse"
  if (combined.includes("headphones") || combined.includes("earbuds") || combined.includes("airpods"))
    return "Headphones"
  if (combined.includes("speaker")) return "Speaker"
  if (combined.includes("camera")) return "Digital Camera"
  if (combined.includes("tv") || combined.includes("television")) return "Television"
  if (
    combined.includes("gaming") ||
    combined.includes("console") ||
    combined.includes("playstation") ||
    combined.includes("xbox")
  )
    return "Video Game Console"

  // Furniture
  if (combined.includes("chair") || combined.includes("seat")) return "Chair"
  if (combined.includes("table") || combined.includes("desk")) return "Table"
  if (combined.includes("sofa") || combined.includes("couch")) return "Sofa"
  if (combined.includes("bed") || combined.includes("mattress")) return "Bed"
  if (combined.includes("dresser") || combined.includes("drawer")) return "Dresser"
  if (combined.includes("bookshelf") || combined.includes("shelf")) return "Bookcase"
  if (combined.includes("lamp") || combined.includes("light")) return "Lamp"

  // Clothing
  if (combined.includes("shirt") || combined.includes("tee") || combined.includes("top")) return "T-Shirt"
  if (combined.includes("jeans") || combined.includes("pants") || combined.includes("trousers")) return "Jeans"
  if (combined.includes("dress")) return "Dress"
  if (combined.includes("jacket") || combined.includes("coat")) return "Jacket"
  if (combined.includes("shoes") || combined.includes("sneakers") || combined.includes("boots")) return "Athletic Shoes"
  if (combined.includes("watch")) return "Watch"
  if (combined.includes("bag") || combined.includes("purse") || combined.includes("backpack")) return "Handbag"

  // Appliances
  if (combined.includes("refrigerator") || combined.includes("fridge")) return "Refrigerator"
  if (combined.includes("microwave")) return "Microwave"
  if (combined.includes("washer") || combined.includes("washing machine")) return "Washing Machine"
  if (combined.includes("dryer")) return "Dryer"
  if (combined.includes("dishwasher")) return "Dishwasher"
  if (combined.includes("vacuum")) return "Vacuum Cleaner"

  // Tools
  if (combined.includes("drill")) return "Drill"
  if (combined.includes("saw")) return "Saw"
  if (combined.includes("hammer")) return "Hammer"
  if (combined.includes("wrench")) return "Wrench"

  // Books & Media
  if (combined.includes("book")) return "Book"
  if (combined.includes("dvd")) return "DVD"
  if (combined.includes("cd") || combined.includes("music")) return "CD"
  if (combined.includes("vinyl") || combined.includes("record")) return "LP Record"

  // Sports & Outdoors
  if (combined.includes("bike") || combined.includes("bicycle")) return "Bicycle"
  if (combined.includes("golf")) return "Golf Club"
  if (combined.includes("tennis")) return "Tennis Racket"
  if (combined.includes("basketball")) return "Basketball"
  if (combined.includes("football")) return "Football"

  // Automotive
  if (combined.includes("tire")) return "Tire"
  if (combined.includes("battery")) return "Battery"
  if (combined.includes("engine")) return "Engine Part"
  if (combined.includes("brake")) return "Brake Part"

  // Jewelry
  if (combined.includes("ring")) return "Ring"
  if (combined.includes("necklace")) return "Necklace"
  if (combined.includes("bracelet")) return "Bracelet"
  if (combined.includes("earrings")) return "Earrings"

  // Default fallback based on common categories
  if (combined.includes("vintage") || combined.includes("antique")) return "Collectible"
  if (combined.includes("art") || combined.includes("painting")) return "Painting"
  if (combined.includes("toy") || combined.includes("game")) return "Game"

  // Generic fallbacks
  return "Other"
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

    const imageUrls = extractImageUrls(submission.image_urls || submission.image_url)

    if (imageUrls.length === 0) {
      console.warn("⚠️ No valid images found for item", submission.id)
    }

    console.log(`🖼️ Prepared ${imageUrls.length} images for listing:`, imageUrls)

    const detectedType = detectItemType(submission.item_name, submission.item_description || "")
    console.log(`🔍 Detected item type: "${detectedType}" for item: "${submission.item_name}"`)

    const inventoryItem = {
      product: {
        title,
        description: submission.item_description,
        aspects: {
          Condition: [submission.item_condition || "Used"],
          Brand: [brand],
          Model: [submission.item_name],
          Type: [detectedType],
          // Add other commonly required fields
          Color: ["Multi-Color"], // Default color
          Material: ["Mixed Materials"], // Default material
          Size: ["One Size"], // Default size
          Country: ["United States"], // Default country
          MPN: ["Does Not Apply"], // Manufacturer Part Number
          UPC: ["Does Not Apply"], // Universal Product Code
        },
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

    console.log("📋 Item aspects being sent to eBay:", JSON.stringify(inventoryItem.product.aspects, null, 2))

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
