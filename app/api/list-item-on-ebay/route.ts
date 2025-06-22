import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { getValidEbayAccessToken } from "@/lib/ebay/getValidEbayAccessToken"
import { extractImageUrls } from "@/lib/image-url-utils"
import sharp from "sharp"
import { mapConditionToCategoryConditionId } from "@/lib/ebay/mapConditionToCategoryConditionId"
import { getAllowedConditionsForCategory } from "@/lib/ebay/getAllowedConditionsForCategory"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

function extractBrand(itemName: string): string {
  const knownBrands = ["Apple", "Samsung", "Sony", "Dell", "HP", "Lenovo", "Google", "Microsoft"]
  const brand = knownBrands.find((b) => itemName.toLowerCase().includes(b.toLowerCase()))
  return brand || "Unbranded"
}

// Function to resize images specifically for eBay listings
async function resizeImageForEbay(imageUrl: string, itemId: string, imageIndex: number): Promise<string | null> {
  try {
    console.log(`Resizing image ${imageIndex + 1} for eBay: ${imageUrl}`)
    const response = await fetch(imageUrl)
    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.statusText}`)
      return null
    }
    const imageBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(imageBuffer)
    const resizedImage = await sharp(buffer)
      .resize({ width: 1600, height: 1600, fit: "cover", position: "center" })
      .jpeg({ quality: 95, progressive: false })
      .toBuffer()
    const metadata = await sharp(resizedImage).metadata()
    console.log(`Resized image dimensions: ${metadata.width}x${metadata.height}`)
    const timestamp = Date.now()
    const fileName = `ebay-optimized/${itemId}/${timestamp}-${imageIndex}.jpg`
    console.log(`Uploading eBay-optimized image: ${fileName}`)
    const { error: uploadError } = await supabase.storage
      .from("item_images")
      .upload(fileName, resizedImage, { cacheControl: "3600", upsert: true, contentType: "image/jpeg" })
    if (uploadError) {
      console.error("Failed to upload resized image:", uploadError)
      return null
    }
    const { data: publicUrlData } = supabase.storage.from("item_images").getPublicUrl(fileName)
    const optimizedUrl = publicUrlData.publicUrl
    console.log(`eBay-optimized image uploaded: ${optimizedUrl}`)
    return optimizedUrl
  } catch (error) {
    console.error(`Error resizing image for eBay:`, error)
    return null
  }
}

async function prepareImagesForEbay(originalImageUrls: string[], itemId: string): Promise<string[]> {
  console.log(`Preparing ${originalImageUrls.length} images for eBay listing...`)
  const resizedImagePromises = originalImageUrls.map((url, index) => resizeImageForEbay(url, itemId, index))
  const resizedImages = await Promise.all(resizedImagePromises)
  const validResizedImages = resizedImages.filter((url): url is string => url !== null)
  console.log(`Successfully prepared ${validResizedImages.length}/${originalImageUrls.length} images for eBay`)
  return validResizedImages
}

async function getSuggestedCategoryId(
  query: string,
  accessToken: string,
): Promise<{ categoryId: string; treeId: string }> {
  try {
    const treeIdRes = await fetch(
      `https://api.ebay.com/commerce/taxonomy/v1/get_default_category_tree_id?marketplace_id=EBAY_US`,
      { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } },
    )
    if (!treeIdRes.ok) throw new Error(`Failed to get default category tree ID: ${treeIdRes.statusText}`)
    const { categoryTreeId } = await treeIdRes.json()

    const res = await fetch(
      `https://api.ebay.com/commerce/taxonomy/v1/category_tree/${categoryTreeId}/get_category_suggestions?q=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "Accept-Language": "en-US",
        },
      },
    )
    const json = await res.json()
    console.log(`DEBUG: Raw category suggestions from eBay: ${JSON.stringify(json, null, 2)}`)
    const suggestions = json?.categorySuggestions || []
    if (suggestions.length === 0) {
      console.warn("DEBUG: No category suggestions returned. Using fallback category 139971.")
      return { categoryId: "139971", treeId: categoryTreeId || "0" }
    }
    const sorted = suggestions.sort((a: any, b: any) => (b?.confidence || 0) - (a?.confidence || 0))
    const best = sorted[0]?.category?.categoryId
    if (!best) {
      console.warn("DEBUG: No valid category ID in sorted suggestions. Using fallback category 139971.")
      return { categoryId: "139971", treeId: categoryTreeId || "0" }
    }
    console.log(`DEBUG: Chosen eBay category ID: ${best}, Tree ID: ${categoryTreeId} (based on confidence score)`)
    return { categoryId: best, treeId: categoryTreeId }
  } catch (err) {
    console.warn("DEBUG: Category suggestion failed. Using fallback category 139971.", err)
    return { categoryId: "139971", treeId: "0" } // Ensure treeId is always a string
  }
}

async function getRequiredAspectsForCategory(categoryTreeId: string, categoryId: string, accessToken: string) {
  const res = await fetch(
    `https://api.ebay.com/commerce/taxonomy/v1/category_tree/${categoryTreeId}/get_item_aspects_for_category?category_id=${categoryId}`,
    { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } },
  )
  if (!res.ok) {
    console.warn("Failed to fetch required aspects:", res.statusText)
    return []
  }
  const json = await res.json()
  const requiredAspects = json?.aspects?.filter((a: any) => a.aspectConstraint.aspectRequired) || []
  return requiredAspects
}

function sanitizeDescription(text: string | null | undefined): string {
  if (!text) return "Contact seller for more details."
  const trimmed = text.trim()
  return trimmed || "Contact seller for more details."
}

function createEbayDescription(itemName: string, condition: string, brand: string, description: string): string {
  const sanitizedDescription = sanitizeDescription(description)
  return `
<div>
  <h3>${itemName}</h3>
  <p><strong>Condition:</strong> ${condition || "Used"}</p>
  <p><strong>Brand:</strong> ${brand}</p>
  <div><p>${sanitizedDescription}</p></div>
  <p><em>Please contact seller with any questions before purchasing.</em></p>
</div>`.trim()
}

export async function POST(request: Request) {
  const requestBody = await request.json()
  const { id } = requestBody
  if (!id) return NextResponse.json({ error: "Item ID is required" }, { status: 400 })

  const { data: submission, error: dbError } = await supabase.from("sell_items").select("*").eq("id", id).single()
  if (dbError || !submission) return NextResponse.json({ error: "Item not found" }, { status: 404 })

  await supabase.from("sell_items").update({ status: "listing", ebay_status: "processing" }).eq("id", id)

  let accessToken: string
  try {
    accessToken = await getValidEbayAccessToken()
  } catch (tokenError) {
    console.error("Failed to get eBay access token:", tokenError)
    return NextResponse.json(
      { error: `Token error: ${tokenError instanceof Error ? tokenError.message : "Unknown"}` },
      { status: 500 },
    )
  }

  const timestamp = Date.now()
  const sku = `ITEM-${submission.id}-${timestamp}`

  console.log(`DEBUG: Attempting to get suggested category for item name: "${submission.item_name}"`)
  const { categoryId, treeId } = await getSuggestedCategoryId(submission.item_name, accessToken)
  console.log(`DEBUG: Using Category ID: ${categoryId}, Tree ID: ${treeId}`)

  console.log(`DEBUG: Fetching allowed conditions for Category ID: ${categoryId}, Tree ID: ${treeId}`)
  const allowedConditions = await getAllowedConditionsForCategory(categoryId, treeId, accessToken)
  console.log(
    `DEBUG: Allowed conditions fetched from eBay for category ${categoryId}: ${JSON.stringify(allowedConditions, null, 2)}`,
  )

  const userProvidedCondition = submission.item_condition || "Used" // Default to "Used" if not provided
  console.log(`DEBUG: User provided condition: "${userProvidedCondition}"`)

  // Wrap mapped condition in String() to ensure string type for eBay API
  const numericCondition = String(mapConditionToCategoryConditionId(userProvidedCondition, allowedConditions))

  console.log(
    `DEBUG: Mapped eBay Condition ID: ${numericCondition} (type: ${typeof numericCondition}) for user condition "${userProvidedCondition}"`,
  )

  if (
    !numericCondition ||
    (allowedConditions.length > 0 && !allowedConditions.find((c) => String(c.id) === numericCondition))
  ) {
    console.error(
      `CRITICAL DEBUG: The mapped condition ID "${numericCondition}" is NOT in the list of allowed conditions from eBay for category ${categoryId}. This will likely fail.`,
    )
  }

  const brand = extractBrand(submission.item_name)
  const originalImageUrls = extractImageUrls(submission.image_urls || submission.image_url)
  const ebayOptimizedImageUrls = await prepareImagesForEbay(originalImageUrls, submission.id)
  const aspects: Record<string, string[]> = { Brand: [brand] } // Condition aspect is handled by top-level `condition` field

  const conditionNote = sanitizeDescription(submission.item_description)
  const listingDescription = createEbayDescription(
    submission.item_name,
    userProvidedCondition,
    brand,
    submission.item_description,
  )

  const inventoryItem = {
    product: {
      title: submission.item_name.substring(0, 80),
      aspects, // Simplified, as Condition is top-level
      imageUrls:
        ebayOptimizedImageUrls.length > 0
          ? ebayOptimizedImageUrls
          : originalImageUrls.length > 0
            ? originalImageUrls
            : undefined,
      primaryImage:
        ebayOptimizedImageUrls.length > 0
          ? { imageUrl: ebayOptimizedImageUrls[0] }
          : originalImageUrls.length > 0
            ? { imageUrl: originalImageUrls[0] }
            : undefined,
    },
    condition: numericCondition, // This is the critical field - ensure string type
    availability: { shipToLocationAvailability: { quantity: 1 } },
    packageWeightAndSize: {
      packageType: "USPS_LARGE_PACK",
      weight: { value: 2.0, unit: "POUND" },
      dimensions: { length: 10, width: 7, height: 3, unit: "INCH" },
    },
  }

  console.log(`DEBUG: Inventory item payload being sent to eBay: ${JSON.stringify(inventoryItem, null, 2)}`)

  const putResponse = await fetch(`https://api.ebay.com/sell/inventory/v1/inventory_item/${sku}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "Content-Language": "en-US",
    },
    body: JSON.stringify(inventoryItem),
  })
  const putText = await putResponse.text()
  console.log(`DEBUG: PUT inventory response status: ${putResponse.status}, Text: ${putText}`)

  if (!putResponse.ok) {
    console.error(`DEBUG: Inventory item creation failed. Status: ${putResponse.status}, Response: ${putText}`)
    await supabase
      .from("sell_items")
      .update({
        status: "approved",
        ebay_status: "failed",
        listing_error: `InvFail ${putResponse.status}: ${putText.substring(0, 200)}`,
      })
      .eq("id", id)
    return NextResponse.json(
      { error: "Inventory item creation failed", details: putText },
      { status: putResponse.status },
    )
  }

  const requiredEnvVars = {
    fulfillmentPolicyId: process.env.EBAY_FULFILLMENT_POLICY_ID,
    paymentPolicyId: process.env.EBAY_PAYMENT_POLICY_ID,
    returnPolicyId: process.env.EBAY_RETURN_POLICY_ID,
    locationKey: process.env.EBAY_LOCATION_KEY,
  }
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      await supabase
        .from("sell_items")
        .update({ status: "approved", ebay_status: "failed", listing_error: `Missing env ${key}` })
        .eq("id", id)
      return NextResponse.json({ error: `Missing eBay config: ${key}` }, { status: 500 })
    }
  }

  const rawPrice = submission.estimated_price
  const cleanedPrice = typeof rawPrice === "string" ? rawPrice.replace(/[^0-9.-]+/g, "") : String(rawPrice)
  const priceValue = Number(cleanedPrice)
  if (isNaN(priceValue) || priceValue <= 0) {
    await supabase
      .from("sell_items")
      .update({ status: "approved", ebay_status: "failed", listing_error: "Invalid price" })
      .eq("id", id)
    return NextResponse.json({ error: "Invalid price" }, { status: 400 })
  }

  const offerData = {
    sku,
    marketplaceId: "EBAY_US",
    format: "FIXED_PRICE",
    availableQuantity: 1,
    categoryId,
    conditionDescription: conditionNote,
    listingDescription,
    listingPolicies: {
      fulfillmentPolicyId: requiredEnvVars.fulfillmentPolicyId,
      paymentPolicyId: requiredEnvVars.paymentPolicyId,
      returnPolicyId: requiredEnvVars.returnPolicyId,
    },
    pricingSummary: { price: { value: priceValue.toFixed(2), currency: "USD" } },
    merchantLocationKey: requiredEnvVars.locationKey,
    // itemSpecifics: Object.entries(aspects).map(([name, values]) => ({ name, value: values })), // Aspects are now in product
  }
  console.log(`DEBUG: Offer data payload: ${JSON.stringify(offerData, null, 2)}`)

  const offerResponse = await fetch("https://api.ebay.com/sell/inventory/v1/offer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "Content-Language": "en-US",
    },
    body: JSON.stringify(offerData),
  })
  const offerText = await offerResponse.text()
  console.log(`DEBUG: Offer response status: ${offerResponse.status}, Text: ${offerText}`)

  if (!offerResponse.ok) {
    console.error(`DEBUG: Offer creation failed. Status: ${offerResponse.status}, Response: ${offerText}`)
    await supabase
      .from("sell_items")
      .update({
        status: "approved",
        ebay_status: "failed",
        listing_error: `OfferFail ${offerResponse.status}: ${offerText.substring(0, 200)}`,
      })
      .eq("id", id)
    return NextResponse.json({ error: "Offer creation failed", details: offerText }, { status: offerResponse.status })
  }
  const offerResult = JSON.parse(offerText)
  const offerId = offerResult.offerId
  if (!offerId) {
    await supabase
      .from("sell_items")
      .update({ status: "approved", ebay_status: "failed", listing_error: "No offerId" })
      .eq("id", id)
    return NextResponse.json({ error: "No offer ID from eBay" }, { status: 500 })
  }

  const publishResponse = await fetch(`https://api.ebay.com/sell/inventory/v1/offer/${offerId}/publish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "Content-Language": "en-US",
    },
  })
  const publishText = await publishResponse.text()
  console.log(`DEBUG: Publish response status: ${publishResponse.status}, Text: ${publishText}`)

  try {
    const publishResult = JSON.parse(publishText) // Attempt to parse, even on error, for more details
    if (!publishResponse.ok) {
      console.error(
        `DEBUG: Publishing offer failed. Status: ${publishResponse.status}, Parsed Response: ${JSON.stringify(publishResult, null, 2)}`,
      )
      await supabase
        .from("sell_items")
        .update({
          status: "approved",
          ebay_status: "failed",
          listing_error: `PubFail ${publishResponse.status}: ${publishText.substring(0, 200)}`,
        })
        .eq("id", id)
      return NextResponse.json(
        { error: "Offer publishing failed", details: publishResult || publishText },
        { status: publishResponse.status },
      )
    }

    const listingId = publishResult.listingId || publishResult.itemId
    await supabase
      .from("sell_items")
      .update({
        status: "listed",
        listed_on_ebay: true,
        ebay_status: "active",
        ebay_listing_id: listingId,
        ebay_offer_id: offerId,
        ebay_sku: sku,
        ebay_optimized_images: ebayOptimizedImageUrls,
        listed_at: new Date().toISOString(),
      })
      .eq("id", id)

    return NextResponse.json({ success: true, listingId, ebay_offer_id: offerId, message: "Item listed successfully" })
  } catch (e) {
    console.error(`DEBUG: Error parsing publish response or final DB update. Raw Text: ${publishText}`, e)
    await supabase
      .from("sell_items")
      .update({
        status: "approved",
        ebay_status: "failed",
        listing_error: `PubParseFail: ${publishText.substring(0, 200)}`,
      })
      .eq("id", id)
    return NextResponse.json(
      { error: "Failed to parse publish response or update DB", details: publishText },
      { status: 500 },
    )
  }
}
