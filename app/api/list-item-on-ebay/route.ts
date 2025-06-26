console.log("✅ [LOADED] route.ts - list-item-on-ebay")

import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { getValidEbayAccessToken } from "@/lib/ebay/getValidEbayAccessToken"
import { extractImageUrls } from "@/lib/image-url-utils"
import sharp from "sharp"
import { getAllowedConditionsForCategory } from "@/lib/ebay/getAllowedConditionsForCategory"
import { mapConditionToCategoryConditionId } from "@/lib/ebay/mapConditionToCategoryConditionId"

console.log("✅ Imports complete")
function extractStorageCapacity(text: string | null | undefined): string | null {
  if (!text) return null;
  const match = text.match(/(\d+)\s?(GB|TB)/i);
  if (match) {
    // Normalize: number + space + uppercase unit
    return `${match[1]} ${match[2].toUpperCase()}`;
  }
  return null;
}

// ✅ Add this helper function immediately below:
function matchToAllowedAspectValue(
  input: string | null,
  allowedValues: string[],
): string | null {
  if (!input) return null;
  const normalizedInput = input.toLowerCase().replace(/\s+/g, '');
  for (const allowed of allowedValues) {
    const normalizedAllowed = allowed.toLowerCase().replace(/\s+/g, '');
    if (normalizedInput === normalizedAllowed) {
      return allowed; // Use original casing from eBay
    }
  }
  return null;
}

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

    // Download the original image
    const response = await fetch(imageUrl)
    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.statusText}`)
      return null
    }

    const imageBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(imageBuffer)

    // Resize image to eBay's preferred specifications with proper square cropping
    const resizedImage = await sharp(buffer)
      .resize({
        width: 1600,
        height: 1600,
        fit: "cover", // Changed from "contain" to "cover" for proper square thumbnails
        position: "center", // Center the crop for best product visibility
      })
      .jpeg({
        quality: 95, // High quality for eBay
        progressive: false, // Removed progressive for better eBay compatibility
      })
      .toBuffer()

    // Add this after resizing
    const metadata = await sharp(resizedImage).metadata()
    console.log(`Resized image dimensions: ${metadata.width}x${metadata.height}`)

    // Create a unique filename for the eBay-optimized image
    const timestamp = Date.now()
    const fileName = `ebay-optimized/${itemId}/${timestamp}-${imageIndex}.jpg`

    console.log(`Uploading eBay-optimized image: ${fileName}`)

    // Upload the resized image to Supabase
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("item_images")
      .upload(fileName, resizedImage, {
        cacheControl: "3600",
        upsert: true,
        contentType: "image/jpeg",
      })

    if (uploadError) {
      console.error("Failed to upload resized image:", uploadError)
      return null
    }

    // Get the public URL for the resized image
    const { data: publicUrlData } = supabase.storage.from("item_images").getPublicUrl(fileName)
    const optimizedUrl = publicUrlData.publicUrl

    console.log(`eBay-optimized image uploaded: ${optimizedUrl}`)
    console.log(`Original size: ${imageBuffer.byteLength} bytes, Optimized: ${resizedImage.length} bytes`)

    return optimizedUrl
  } catch (error) {
    console.error(`Error resizing image for eBay:`, error)
    return null
  }
}

// Function to resize all images for eBay listing
async function prepareImagesForEbay(originalImageUrls: string[], itemId: string): Promise<string[]> {
  console.log(`Preparing ${originalImageUrls.length} images for eBay listing...`)

  const resizedImagePromises = originalImageUrls.map((url, index) => resizeImageForEbay(url, itemId, index))

  const resizedImages = await Promise.all(resizedImagePromises)

  // Filter out any failed resizes and return successful ones
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
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
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
      },
    )

    const json = await res.json()
    console.log(`Raw category suggestions: ${JSON.stringify(json, null, 2)}`)

    const suggestions = json?.categorySuggestions || []
    if (suggestions.length === 0) {
      console.warn("No category suggestions returned. Using fallback.")
      return { categoryId: "139971", treeId: categoryTreeId }
    }

    const sorted = suggestions.sort((a: any, b: any) => {
      const aScore = a?.confidence || 0
      const bScore = b?.confidence || 0
      return bScore - aScore
    })

    const best = sorted[0]?.category?.categoryId
    if (!best) {
      console.warn("No valid category ID found in sorted suggestions. Using fallback.")
      return { categoryId: "139971", treeId: categoryTreeId }
    }

    console.log(`Chosen eBay category ID: ${best} (based on confidence score)`)
    return { categoryId: best, treeId: categoryTreeId }
  } catch (err) {
    console.warn("Category suggestion failed. Using fallback.", err)
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
    },
  )

  if (!res.ok) {
    console.warn("Failed to fetch required aspects:", res.statusText)
    return []
  }

  const json = await res.json()
  const requiredAspects = json?.aspects?.filter((a: any) => a.aspectConstraint.aspectRequired) || []
  console.log(
    "Required aspects:",
    requiredAspects.map((a: any) => a.aspectName),
  )
  return requiredAspects
}

// Helper function to sanitize and validate description text
function sanitizeDescription(text: string | null | undefined): string {
  console.log(`Sanitizing description: "${text}"`)

  if (!text) {
    console.warn("Description is empty or undefined, using fallback text")
    return "Contact seller for more details."
  }

  // Trim whitespace
  const trimmed = text.trim()
  console.log(`Trimmed description (${trimmed.length} chars): "${trimmed}"`)

  // Check for HTML tags
  const hasHtmlTags = /<[^>]*>/g.test(trimmed)
  console.log(`Description contains HTML tags: ${hasHtmlTags}`)

  // Check for special characters
  const specialChars = trimmed.match(/[^\w\s.,!?-]/g) || []
  if (specialChars.length > 0) {
    console.log(`Description contains special characters: ${JSON.stringify(specialChars)}`)
  }

  // Check length constraints
  if (trimmed.length < 10) {
    console.warn(`Description is very short (${trimmed.length} chars), might be rejected`)
  } else if (trimmed.length > 4000) {
    console.warn(`Description is very long (${trimmed.length} chars), might be truncated`)
  }

  return trimmed || "Contact seller for more details."
}

// Helper function to create a valid eBay HTML description
function createEbayDescription(itemName: string, condition: string, brand: string, description: string): string {
  console.log(`Creating eBay description for item: "${itemName}"`)

  const sanitizedDescription = sanitizeDescription(description)
  console.log(`Using sanitized description (${sanitizedDescription.length} chars)`)

  const htmlDescription = `
<div>
  <h3>${itemName}</h3>
  <p><strong>Condition:</strong> ${condition || "Used"}</p>
  <p><strong>Brand:</strong> ${brand}</p>
  <div>
    <p>${sanitizedDescription}</p>
  </div>
  <p><em>Please contact seller with any questions before purchasing.</em></p>
</div>`.trim()

  console.log(`Final HTML description (${htmlDescription.length} chars):`)
  console.log(htmlDescription)

  // Check for potential issues
  if (htmlDescription.length > 500000) {
    console.error(`HTML description exceeds eBay's maximum length (${htmlDescription.length} > 500000)`)
  }

  return htmlDescription
}

export async function POST(request: Request) {
  const requestBody = await request.json()
  console.log(`Received request body: ${JSON.stringify(requestBody, null, 2)}`)

  const { id } = requestBody
  if (!id) {
    console.error("No item ID provided")
    return NextResponse.json({ error: "Item ID is required" }, { status: 400 })
  }

  console.log(`Processing item ID: ${id}`)

  const { data: submission, error } = await supabase.from("sell_items").select("*").eq("id", id).single()
  if (error || !submission) {
    console.error("Item not found:", error)
    return NextResponse.json({ error: "Item not found or error fetching data" }, { status: 404 })
  }

  // Update status to indicate listing is in progress
  console.log("Updating item status to 'listing'...")
  const { error: listingStartError } = await supabase
    .from("sell_items")
    .update({
      status: "listing",
      ebay_status: "processing",
    })
    .eq("id", id)

  if (listingStartError) {
    console.warn("Failed to update listing start status:", listingStartError)
  }

  console.log("Item data retrieved from database:")
  console.log(
    JSON.stringify(
      {
        id: submission.id,
        name: submission.item_name,
        condition: submission.item_condition,
        price: submission.estimated_price,
        description: submission.item_description,
        description_length: submission.item_description?.length || 0,
        image_url: submission.image_url,
        image_urls: submission.image_urls,
      },
      null,
      2,
    ),
  )

  // Validate description
  console.log("DESCRIPTION VALIDATION:")
  console.log(`Raw description from database: "${submission.item_description}"`)
  console.log(`Description length: ${submission.item_description?.length || 0} characters`)
  console.log(`Description type: ${typeof submission.item_description}`)

  if (!submission.item_description) {
    console.warn("Item description is empty or null")
  } else if (typeof submission.item_description !== "string") {
    console.error(`Item description is not a string, it's a ${typeof submission.item_description}`)
  }

  // Check for problematic characters
  if (submission.item_description) {
    const problematicChars = submission.item_description.match(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g)
    if (problematicChars) {
      console.error(`Description contains ${problematicChars.length} control characters that may cause issues`)
    }
  }

  let accessToken: string
  try {
    accessToken = await getValidEbayAccessToken()
    console.log("eBay access token obtained")
  } catch (tokenError) {
    console.error("Failed to get eBay access token:", tokenError)
    return NextResponse.json(
      {
        error: `Failed to get eBay access token: ${tokenError instanceof Error ? tokenError.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }

const timestamp = Date.now()
const sku = `ITEM-${submission.id}-${timestamp}`
const title = submission.item_name.substring(0, 80)

const { categoryId, treeId } = await getSuggestedCategoryId(submission.item_name, accessToken)

const allowedConditions = await getAllowedConditionsForCategory(categoryId, accessToken)

// Debug logs for allowed conditions
console.log("📜 Allowed condition IDs for this category:", allowedConditions.map((c) => c.id))

// Map user condition to eBay string enum condition ID (e.g. "USED_GOOD", "NEW")
const mappedCondition = mapConditionToCategoryConditionId(submission.item_condition, allowedConditions || [])
console.log(`🔍 eBay condition mapped: ${mappedCondition} (type: ${typeof mappedCondition})`)

console.log("🔢 Final condition string to send:", mappedCondition)

const brand = extractBrand(submission.item_name)
console.log(`ASPECTS DEBUGGING - Initial brand extraction: "${brand}"`)

const searchQuery = `${submission.item_name} ${submission.item_description}`.trim()
const requiredAspects = await getRequiredAspectsForCategory(treeId, categoryId, accessToken)
console.log(`ASPECTS DEBUGGING - Required aspects from eBay: ${JSON.stringify(requiredAspects, null, 2)}`)
console.log(`ASPECTS DEBUGGING - Number of required aspects: ${requiredAspects.length}`)

console.log(`Suggested eBay category ID: ${categoryId}`)

const originalImageUrls = extractImageUrls(submission.image_urls || submission.image_url)
if (originalImageUrls.length === 0) {
  console.warn("No valid images found for item", submission.id)
}
console.log(`Found ${originalImageUrls.length} original images`)

const ebayOptimizedImageUrls = await prepareImagesForEbay(originalImageUrls, submission.id)
if (ebayOptimizedImageUrls.length === 0) {
  console.warn("No images could be optimized for eBay, falling back to original images")
  ebayOptimizedImageUrls.push(...originalImageUrls)
}
console.log(`Using ${ebayOptimizedImageUrls.length} eBay-optimized square images for listing`)

function autoFillMissingAspects(
  requiredAspects: any[],
  submission: any
): Record<string, string[]> {
  const itemNameSafe = typeof submission.item_name === "string" ? submission.item_name : "";
  const itemDescSafe = typeof submission.item_description === "string" ? submission.item_description : "";
  const userText = `${itemNameSafe} ${itemDescSafe}`.toLowerCase();

  const filled: Record<string, string[]> = {};

  for (const aspect of requiredAspects) {
    const nameRaw = aspect?.aspectName ?? aspect?.localizedAspectName;

    if (!nameRaw || typeof nameRaw !== "string") {
      console.warn("⚠️ Skipping aspect with missing or invalid name:", aspect);
      continue;
    }

    const name = nameRaw.toLowerCase();

    const allowedValues: string[] = Array.isArray(aspect.aspectValues)
      ? aspect.aspectValues
          .map((v: any) => v?.localizedValue || v?.value)
          .filter((v): v is string => typeof v === "string" && v.trim() !== "")
      : [];

    // Special handling for Color
    if (name === "color") {
      const colorMatch = allowedValues.find((color) => {
        if (typeof color !== "string") return false;
        try {
          return new RegExp(`\\b${color.toLowerCase()}\\b`).test(userText);
        } catch (err) {
          console.warn("⚠️ Invalid RegExp for color:", color, err);
          return false;
        }
      });

      if (colorMatch) {
        filled[name] = [colorMatch];
        console.log(`🎨 Auto-matched Color = "${colorMatch}"`);
      } else {
        console.warn(`⚠️ Color not matched. Skipping aspect.`);
      }
      continue;
    }

    // Generic match for all other aspects
    const matched = allowedValues.find(
      (val) => typeof val === "string" && userText.includes(val.toLowerCase())
    );

    if (matched) {
      filled[name] = [matched];
      console.log(`✅ Auto-matched "${name}" = "${matched}"`);
    } else {
      console.warn(`⚠️ Required aspect "${name}" not matched. Skipping aspect.`);
    }
  }

  return filled;
}

// Autofill aspects
const autoFilledAspects = autoFillMissingAspects(requiredAspects, submission);

// Start with autofilled, overwrite Condition always
const aspects: Record<string, string[]> = {
  ...autoFilledAspects,
  Condition: [mappedCondition],
};

// Fill Brand, Model, Type if missing or empty
if (!aspects.Brand || aspects.Brand.length === 0) {
  aspects.Brand = [typeof brand === "string" ? brand : "Not Specified"];
}
if (!aspects.Model || aspects.Model.length === 0) {
  aspects.Model = [submission.item_name || "Not Specified"];
}
if (!aspects.Type || aspects.Type.length === 0) {
  aspects.Type = [submission.item_name || "Not Specified"];
}

// --- Matching helper ---
function matchToAllowedAspectValue(input: string | null, allowedValues: any[]): string | null {
  if (!input) return null;
  const normalizedInput = input.toLowerCase().replace(/\s+/g, "");
  for (const allowed of allowedValues) {
    if (typeof allowed !== "string") continue;
    const normalizedAllowed = allowed.toLowerCase().replace(/\s+/g, "");
    if (normalizedInput === normalizedAllowed) {
      return allowed;
    }
  }
  return null;
}

// --- Match storage capacity ---
const rawStorageCapacity =
  extractStorageCapacity(submission.item_name) ||
  extractStorageCapacity(submission.item_description);

console.log("🔎 Extracted rawStorageCapacity:", rawStorageCapacity);

console.log("🔎 Extracted rawStorageCapacity:", rawStorageCapacity);

if (rawStorageCapacity) {
  const storageAspect = requiredAspects.find((a: any) => {
    if (!a || typeof a !== "object") return false;
    const name = typeof a.aspectName === "string" ? a.aspectName.toLowerCase() : "";
    const localized = typeof a.localizedAspectName === "string" ? a.localizedAspectName.toLowerCase() : "";
    return name === "storage capacity" || localized === "storage capacity";
  });

  console.log("📦 Raw Storage Capacity aspect object:", JSON.stringify(storageAspect, null, 2));

  if (storageAspect && Array.isArray(storageAspect.aspectValues)) {
    console.log("📦 Raw aspectValues for Storage Capacity:", storageAspect.aspectValues);

  const allowedValues = storageAspect.aspectValues
  .map((v: any) => v?.localizedValue || v?.value)
  .filter((v): v is string => typeof v === "string" && v.trim() !== "");


    if (allowedValues.length === 0) {
      console.warn("⚠️ Storage Capacity aspect exists but has no allowed values from eBay.");
      delete aspects["Storage Capacity"];
    } else {
      console.log("📋 Allowed Storage Capacity values:", allowedValues);

      const matchedValue = matchToAllowedAspectValue(rawStorageCapacity, allowedValues);
      console.log("🔗 Matched value (if any):", matchedValue);

      if (matchedValue) {
        aspects["Storage Capacity"] = [matchedValue];
        console.log("✅ Matched Storage Capacity to allowed value:", matchedValue);
      } else {
        console.warn(`⚠️ Could not match extracted "${rawStorageCapacity}" to allowed values:`, allowedValues);
        delete aspects["Storage Capacity"];
      }
    }
  } else {
    console.warn("⚠️ Storage Capacity not required for this category or no allowed values listed");
  }
} else {
  console.log("ℹ️ No Storage Capacity found in title or description");
  delete aspects["Storage Capacity"];
}


// Final cleanup
Object.entries(aspects).forEach(([key, values]) => {
  if (
    !Array.isArray(values) ||
    values.length === 0 ||
    values.some((v) => !v || v.trim() === "")
  ) {
    console.warn(`⚠️ Removing aspect "${key}" due to empty or invalid values:`, values);
    delete aspects[key];
  }
});

console.log("✅ Final aspects object after autofill & cleanup:", JSON.stringify(aspects, null, 2));
Object.entries(aspects).forEach(([key, values]) => {
  console.log(`  - ${key}: [${values.join(", ")}] (${values.length} values)`);
});

// Description processing remains unchanged
const conditionNote = sanitizeDescription(submission.item_description)
const listingDescription = createEbayDescription(
  submission.item_name,
  mappedCondition, // ✅ Use mapped enum here
  brand,
  submission.item_description,
)


// Log any aspects missing 'aspectName' to help debugging
requiredAspects.forEach((aspect: any, index: number) => {
  if (!aspect.aspectName) {
    console.warn(`Warning: aspect at index ${index} is missing aspectName`, aspect);
  }
});


console.log(`ASPECTS DEBUGGING - Final aspects object: ${JSON.stringify(aspects, null, 2)}`);

console.log("FINAL DESCRIPTION DATA:")
console.log(`Condition note (${conditionNote.length} chars): "${conditionNote}"`)
console.log(`Listing description (${listingDescription.length} chars): "${listingDescription}"`)
if (!conditionNote || conditionNote.length < 5) {
  console.error("Condition note is too short or empty, eBay may reject it")
}
if (!listingDescription || listingDescription.length < 20) {
  console.error("Listing description is too short, eBay may reject it")
}

// Inventory item payload with top-level string condition
const inventoryItem = {
  condition: mappedCondition, // Must be string enum, top-level
  product: {
    title: submission.item_name,
    aspects,
    imageUrls: ebayOptimizedImageUrls,
    primaryImage: {
      imageUrl: ebayOptimizedImageUrls[0],
    },
  },
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

console.log("📤 Sending condition as:", typeof inventoryItem.condition, inventoryItem.condition)
console.log("✅ Final inventory item payload (with top-level condition):", JSON.stringify(inventoryItem, null, 2))
console.log("Creating inventory item with eBay-optimized square images...")

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
console.log(`Raw PUT inventory response: ${putText}`)
console.log("PUT inventory response status:", putResponse.status, putResponse.statusText)

if (!putResponse.ok) {
  console.error("PUT inventory item creation failed:", {
    status: putResponse.status,
    statusText: putResponse.statusText,
    response: putText,
  })

  const { error: failedUpdateError } = await supabase
    .from("sell_items")
    .update({
      status: "approved",
      ebay_status: "failed",
      listing_error: putText || "Unknown error",
    })
    .eq("id", submission.id)

  if (failedUpdateError) {
    console.warn("Failed to update failed listing status:", failedUpdateError)
  }

  return NextResponse.json({ error: "Inventory item creation failed", response: putText }, { status: 500 })
}


console.log("Creating offer on eBay...")

console.log(`ASPECTS DEBUGGING - Converting aspects to itemSpecifics...`)
console.log(`ASPECTS DEBUGGING - Processing ${Object.keys(aspects).length} aspect categories`)


// Add this line here:
console.log("Aspects before building itemSpecifics:", JSON.stringify(aspects, null, 2));

// Now build itemSpecifics after Storage Capacity injection
const itemSpecifics = Object.entries(aspects)
  .filter(([name, values]) =>
    Array.isArray(values) &&
    values.length > 0 &&
    values[0] !== "Not Specified" &&
    values[0] !== ""
  )
  .map(([name, values]) => ({
    name,
    value: values,
  }));

console.log("🧪 Final itemSpecifics sent to offer:", JSON.stringify(itemSpecifics, null, 2));

console.log(`ASPECTS DEBUGGING - ItemSpecifics count: ${itemSpecifics.length}`)
itemSpecifics.forEach((spec, index) => {
  console.log(`ItemSpecific ${index + 1}: "${spec.name}" = [${spec.value.join(", ")}]`)
})

// Log the item description for debugging
console.log("OFFER CREATION - DESCRIPTION DATA:")
console.log(`Condition description (${conditionNote.length} chars): "${conditionNote}"`)
console.log(`Listing description (${listingDescription.length} chars): "${listingDescription}"`)

// Check for HTML entities that might cause issues
const htmlEntityCheck = (text: string) => {
  const entities = text.match(/&[a-z]+;/g)
  if (entities) {
    console.warn(`Found HTML entities that might cause issues: ${entities.join(", ")}`)
  }
}

htmlEntityCheck(conditionNote)
htmlEntityCheck(listingDescription)

// 🔹 Ensure priceValue is defined before using it
const rawPrice = submission.estimated_price
const priceValue = typeof rawPrice === "string"
  ? parseFloat(rawPrice.replace(/[^0-9.]+/g, ""))
  : rawPrice || 0.0
const cleanedPrice = priceValue

console.log(`Price: ${priceValue} (original: ${rawPrice}, cleaned: ${cleanedPrice})`)

// ✅ Required eBay policy env vars
const requiredEnvVars = {
  fulfillmentPolicyId: process.env.EBAY_FULFILLMENT_POLICY_ID!,
  paymentPolicyId: process.env.EBAY_PAYMENT_POLICY_ID!,
  returnPolicyId: process.env.EBAY_RETURN_POLICY_ID!,
  locationKey: process.env.EBAY_MERCHANT_LOCATION_KEY!,
}

// Validate all required env vars
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

// 🔹 Construct offerData
console.log("🧪 Creating offerData...");
console.log("Allowed conditions:", allowedConditions);
console.log("Mapped condition:", mappedCondition);
console.log("🧪 Key fields before offerData:");
console.log("SKU:", sku);
console.log("Category ID:", categoryId);
console.log("Condition Note:", conditionNote);
console.log("Listing Description length:", listingDescription.length);

const offerData = {
  sku,
  marketplaceId: "EBAY_US",
  format: "FIXED_PRICE",
  availableQuantity: 1,
  categoryId,
  condition: mappedCondition, // ✅ Required
  conditionDescription: conditionNote,
  listingDescription,
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
  itemSpecifics,
};

console.log("✅ offerData object created successfully");
console.log("Complete offerData:", JSON.stringify(offerData, null, 2));

  console.log(`ASPECTS DEBUGGING - ItemSpecifics being sent to offer: ${JSON.stringify(itemSpecifics, null, 2)}`)

  console.log("COMPLETE OFFER PAYLOAD:")
  console.log(JSON.stringify(offerData, null, 2))

  // Validate offer data before sending
  if (!offerData.conditionDescription || offerData.conditionDescription.length < 1) {
    console.error("CRITICAL: conditionDescription is empty in the final payload")
  }

  if (!offerData.listingDescription || offerData.listingDescription.length < 1) {
    console.error("CRITICAL: listingDescription is empty in the final payload")
  }

  console.log("Sending offer creation request to eBay API...")
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
  console.log(`Raw offer response: ${offerText}`)
  console.log("Offer response status:", offerResponse.status, offerResponse.statusText)

  // Try to parse the response as JSON for better error reporting
  try {
    const offerResponseJson = JSON.parse(offerText)
    console.log(`Parsed offer response: ${JSON.stringify(offerResponseJson, null, 2)}`)

    // Check for specific error codes related to descriptions
    if (offerResponseJson.errors) {
      offerResponseJson.errors.forEach((error: any) => {
        console.error(`eBay API Error: ${error.errorId} - ${error.message}`)
        if (error.message?.includes("description")) {
          console.error("DESCRIPTION ERROR DETECTED in eBay response")
        }
      })
    }
  } catch (e) {
    console.log("Could not parse offer response as JSON")
  }

  if (!offerResponse.ok) {
    console.error("Offer creation failed:", {
      status: offerResponse.status,
      statusText: offerResponse.statusText,
      response: offerText,
    })

    // ADDED: Log the exact data we sent when there's an error
    console.error(`Data that was sent to eBay when error occurred: ${JSON.stringify(offerData, null, 2)}`)

    // Update status to failed if listing process fails
    const { error: failedUpdateError } = await supabase
      .from("sell_items")
      .update({
        status: "approved", // Reset to approved so it can be retried
        ebay_status: "failed",
        listing_error: offerText || "Unknown error",
      })
      .eq("id", id)

    if (failedUpdateError) {
      console.warn("Failed to update failed listing status:", failedUpdateError)
    }

    // Try to create a modified offer with minimal description if the original failed
    if (offerResponse.status === 400 && offerText.includes("description")) {
      console.log("Attempting to create offer with simplified description...")

      // Create a simplified version
      const simplifiedOfferData = {
        ...offerData,
        conditionDescription: "Item in described condition. Contact seller for details.",
        listingDescription: `<div><h3>${submission.item_name}</h3><p>Item for sale. Please contact with questions.</p></div>`,
      }

      console.log(`Simplified offer payload: ${JSON.stringify(simplifiedOfferData, null, 2)}`)

      // Log this attempt but don't actually try it - just showing what could be done
      console.log("This is a simulation of a retry with simplified description - not actually sending")
    }

    return NextResponse.json({ error: "Offer creation failed", response: offerText }, { status: 500 })
  }

  const offerResult = JSON.parse(offerText)

  const offerId = offerResult.offerId
  if (!offerId) {
    console.error("No offer ID returned")

    // Update status to failed if listing process fails
    const { error: failedUpdateError } = await supabase
      .from("sell_items")
      .update({
        status: "approved", // Reset to approved so it can be retried
        ebay_status: "failed",
        listing_error: "No offer ID from eBay" || "Unknown error",
      })
      .eq("id", id)

    if (failedUpdateError) {
      console.warn("Failed to update failed listing status:", failedUpdateError)
    }

    return NextResponse.json({ error: "No offer ID from eBay" }, { status: 500 })
  }

  console.log(`Offer created: ${offerId}`)

  console.log("Publishing offer...")
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
  console.log(`Raw publish response: ${publishText}`)
  console.log("Publish response status:", publishResponse.status, publishResponse.statusText)

  try {
    const publishResult = JSON.parse(publishText)

    if (!publishResponse.ok) {
      console.error("Publishing offer failed:", publishResult)
      if (publishResult.errors) {
        publishResult.errors.forEach((error: any) => {
          console.error(`eBay Publish Error: ${error.errorId} - ${error.message}`)
        })
      }

      // Update status to failed if listing process fails
      const { error: failedUpdateError } = await supabase
        .from("sell_items")
        .update({
          status: "approved", // Reset to approved so it can be retried
          ebay_status: "failed",
          listing_error: publishText || "Unknown error",
        })
        .eq("id", id)

      if (failedUpdateError) {
        console.warn("Failed to update failed listing status:", failedUpdateError)
      }

      return NextResponse.json({ error: "Offer publishing failed", response: publishText }, { status: 500 })
    }

    // Extract listingId (sometimes called itemId)
    const listingId = publishResult.listingId || publishResult.itemId
    if (!listingId) {
      console.warn("No listingId returned by eBay")
    } else {
      console.log(`eBay listingId: ${listingId}`)
    }

    // Update the item status in the database with all eBay information
    console.log("Updating item status in database with complete eBay information...")
    const { error: updateError } = await supabase
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

    if (updateError) {
      console.error("Failed to update item status in database:", updateError)
      return NextResponse.json({
        success: true,
        listingId,
        ebay_listing_id: listingId,
        ebay_offer_id: offerId,
        warning: "Item listed on eBay but status update failed in database",
      })
    }

    console.log("Database updated successfully with complete listing information")

    console.log("Process completed at:", new Date().toISOString())

    return NextResponse.json({
      success: true,
      listingId,
      ebay_listing_id: listingId,
      ebay_offer_id: offerId,
      optimized_images: ebayOptimizedImageUrls, // again, assuming this exists
      message: "Item listed with properly cropped square thumbnails and description for eBay",
    })
  } catch (e) {
    console.log("Could not parse publish response as JSON")

    // Update status to failed if listing process fails
    const { error: failedUpdateError } = await supabase
      .from("sell_items")
      .update({
        status: "approved", // Reset to approved so it can be retried
        ebay_status: "failed",
        listing_error: "Failed to parse publish response" || "Unknown error",
      })
      .eq("id", id)

    if (failedUpdateError) {
      console.warn("Failed to update failed listing status:", failedUpdateError)
    }

    return NextResponse.json({ error: "Failed to parse publish response" }, { status: 500 })
  }
}
