import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { getValidEbayAccessToken } from "@/lib/ebay/getValidEbayAccessToken"

// Function to detect item type based on name and description
function detectItemType(itemName: string, description = ""): string {
  const text = (itemName + " " + description).toLowerCase()

  // Electronics
  if (/phone|smartphone|iphone|android|samsung|pixel/i.test(text)) return "Smartphone"
  if (/laptop|notebook|macbook|thinkpad|dell|hp|lenovo/i.test(text)) return "Laptop"
  if (/tablet|ipad|galaxy tab|surface/i.test(text)) return "Tablet"
  if (/tv|television|smart tv|roku|hdtv|4k/i.test(text)) return "Television"
  if (/camera|dslr|mirrorless|canon|nikon|sony/i.test(text)) return "Digital Camera"
  if (/headphone|earphone|earbud|airpod/i.test(text)) return "Headphones"
  if (/speaker|sound bar|bluetooth speaker/i.test(text)) return "Speaker"
  if (/monitor|display|screen/i.test(text)) return "Monitor"
  if (/computer|pc|desktop/i.test(text)) return "Desktop"
  if (/watch|smartwatch|apple watch|fitbit/i.test(text)) return "Smartwatch"

  // Furniture
  if (/sofa|couch|loveseat/i.test(text)) return "Sofa"
  if (/chair|stool|recliner/i.test(text)) return "Chair"
  if (/table|desk|workstation/i.test(text)) return "Table"
  if (/bed|mattress|frame/i.test(text)) return "Bed"
  if (/dresser|drawer|chest/i.test(text)) return "Dresser"
  if (/shelf|bookcase|bookshelf/i.test(text)) return "Bookshelf"

  // Clothing
  if (/shirt|tee|t-shirt|top|blouse/i.test(text)) return "Shirt"
  if (/pant|jean|trouser|slack/i.test(text)) return "Pants"
  if (/shoe|sneaker|boot|sandal/i.test(text)) return "Shoes"
  if (/jacket|coat|hoodie|sweater/i.test(text)) return "Jacket"
  if (/dress|gown/i.test(text)) return "Dress"
  if (/hat|cap|beanie/i.test(text)) return "Hat"

  // Appliances
  if (/refrigerator|fridge/i.test(text)) return "Refrigerator"
  if (/washer|dryer|washing machine/i.test(text)) return "Washer/Dryer"
  if (/microwave|oven/i.test(text)) return "Microwave"
  if (/dishwasher/i.test(text)) return "Dishwasher"
  if (/vacuum|hoover/i.test(text)) return "Vacuum"
  if (/blender|mixer/i.test(text)) return "Blender"
  if (/coffee maker|espresso/i.test(text)) return "Coffee Maker"

  // Tools
  if (/drill|driver/i.test(text)) return "Drill"
  if (/saw|circular saw/i.test(text)) return "Saw"
  if (/hammer|mallet/i.test(text)) return "Hammer"
  if (/wrench|socket/i.test(text)) return "Wrench"
  if (/screwdriver/i.test(text)) return "Screwdriver"
  if (/tool set|toolkit/i.test(text)) return "Tool Set"

  // Books
  if (/book|novel|textbook/i.test(text)) return "Book"

  // Sports Equipment
  if (/bike|bicycle/i.test(text)) return "Bicycle"
  if (/treadmill|elliptical/i.test(text)) return "Exercise Equipment"
  if (/weight|dumbbell|barbell/i.test(text)) return "Weights"
  if (/golf|club|driver/i.test(text)) return "Golf Equipment"
  if (/tennis|racket/i.test(text)) return "Tennis Equipment"

  // Automotive
  if (/car|auto|vehicle/i.test(text)) return "Car"
  if (/tire|wheel/i.test(text)) return "Tire"
  if (/part|engine|transmission/i.test(text)) return "Auto Part"

  // Jewelry
  if (/ring|diamond/i.test(text)) return "Ring"
  if (/necklace|pendant/i.test(text)) return "Necklace"
  if (/bracelet|bangle/i.test(text)) return "Bracelet"
  if (/earring/i.test(text)) return "Earrings"
  if (/watch|timepiece/i.test(text)) return "Watch"

  // Default fallback
  return "Other"
}

// Function to get suggested category ID based on item name and description
async function getSuggestedCategoryId(itemName: string, description = ""): Promise<string> {
  // Default category ID for "Everything Else" category
  const defaultCategoryId = "10290"

  // This would ideally call eBay's getSuggestedCategories API
  // For now, we'll use a simple mapping based on keywords
  const text = (itemName + " " + description).toLowerCase()

  if (/phone|smartphone|iphone|android|samsung|pixel/i.test(text)) return "9355" // Cell Phones & Smartphones
  if (/laptop|notebook|macbook|thinkpad|dell|hp|lenovo/i.test(text)) return "175672" // Laptops & Netbooks
  if (/tablet|ipad|galaxy tab|surface/i.test(text)) return "171485" // Tablets & eReaders
  if (/tv|television|smart tv|roku|hdtv|4k/i.test(text)) return "11071" // Televisions
  if (/camera|dslr|mirrorless|canon|nikon|sony/i.test(text)) return "31388" // Digital Cameras
  if (/headphone|earphone|earbud|airpod/i.test(text)) return "112529" // Headphones
  if (/speaker|sound bar|bluetooth speaker/i.test(text)) return "111694" // Speakers & Subwoofers
  if (/monitor|display|screen/i.test(text)) return "80053" // Monitors
  if (/computer|pc|desktop/i.test(text)) return "179" // Desktop Computers
  if (/watch|smartwatch|apple watch|fitbit/i.test(text)) return "178893" // Smart Watches

  // Furniture
  if (/sofa|couch|loveseat|chair|table|desk|bed|mattress|dresser|shelf/i.test(text)) return "3197" // Furniture

  // Clothing
  if (/shirt|tee|t-shirt|top|blouse|pant|jean|trouser|shoe|sneaker|boot|jacket|coat|dress/i.test(text)) return "11450" // Clothing, Shoes & Accessories

  // Appliances
  if (/refrigerator|fridge|washer|dryer|microwave|oven|dishwasher|vacuum|blender|mixer|coffee/i.test(text))
    return "20710" // Major Appliances

  // Tools
  if (/drill|saw|hammer|wrench|screwdriver|tool set/i.test(text)) return "631" // Tools

  // Books
  if (/book|novel|textbook/i.test(text)) return "267" // Books

  // Sports Equipment
  if (/bike|bicycle|treadmill|elliptical|weight|dumbbell|barbell|golf|tennis/i.test(text)) return "888" // Sporting Goods

  // Automotive
  if (/car|auto|vehicle|tire|wheel|part|engine|transmission/i.test(text)) return "6000" // eBay Motors

  // Jewelry
  if (/ring|diamond|necklace|pendant|bracelet|bangle|earring|watch|timepiece/i.test(text)) return "281" // Jewelry & Watches

  return defaultCategoryId
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const data = await request.json()
    const { submission_id } = data

    if (!submission_id) {
      return NextResponse.json({ error: "Missing submission_id" }, { status: 400 })
    }

    // Get the submission from the database
    const { data: submission, error } = await supabase.from("sell_items").select("*").eq("id", submission_id).single()

    if (error || !submission) {
      console.error("Error fetching submission:", error)
      return NextResponse.json({ error: "Failed to fetch submission", details: error }, { status: 500 })
    }

    // Get a valid eBay access token
    const accessToken = await getValidEbayAccessToken()
    if (!accessToken) {
      return NextResponse.json({ error: "Failed to get valid eBay access token" }, { status: 500 })
    }

    // Prepare the inventory item
    const brand = submission.brand || "Unbranded"
    const description = submission.description || `${submission.item_name} - Listed via BluBerry`
    const price = submission.estimated_price || 9.99

    // Detect item type
    const itemType = detectItemType(submission.item_name, submission.description)

    // Get suggested category ID
    const categoryId = await getSuggestedCategoryId(submission.item_name, submission.description)

    // Create the inventory item
    const inventoryItem = {
      product: {
        title: submission.item_name,
        description: description,
        aspects: {
          Condition: [submission.item_condition || "Used"],
          Brand: [brand],
          Model: [submission.item_name],
          Type: [itemType], // Add the required Type field
          Color: ["Not Specified"],
          Features: ["Gently Used"],
          MPN: ["Does Not Apply"],
        },
        brand: brand,
        imageUrls: submission.image_urls ? JSON.parse(submission.image_urls) : [],
      },
      availability: {
        shipToLocationAvailability: {
          quantity: 1,
        },
      },
      condition: submission.item_condition || "USED_GOOD",
    }

    console.log("Creating inventory item:", JSON.stringify(inventoryItem, null, 2))

    // Create the inventory item on eBay
    const inventoryResponse = await fetch(
      "https://api.ebay.com/sell/inventory/v1/inventory_item/BluBerry-" + submission_id,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(inventoryItem),
      },
    )

    if (!inventoryResponse.ok) {
      const errorText = await inventoryResponse.text()
      console.error("eBay inventory API error:", errorText)
      return NextResponse.json({ error: "Failed to create inventory item", response: errorText }, { status: 500 })
    }

    // Create an offer for the inventory item
    const offer = {
      sku: "BluBerry-" + submission_id,
      marketplaceId: "EBAY_US",
      format: "FIXED_PRICE",
      availableQuantity: 1,
      categoryId: categoryId,
      listingDescription: description,
      listingPolicies: {
        fulfillmentPolicyId: process.env.EBAY_FULFILLMENT_POLICY_ID,
        paymentPolicyId: process.env.EBAY_PAYMENT_POLICY_ID,
        returnPolicyId: process.env.EBAY_RETURN_POLICY_ID,
      },
      pricingSummary: {
        price: {
          currency: "USD",
          value: price.toString(),
        },
      },
      merchantLocationKey: process.env.EBAY_LOCATION_KEY,
    }

    console.log("Creating offer:", JSON.stringify(offer, null, 2))

    // Create the offer on eBay
    const offerResponse = await fetch("https://api.ebay.com/sell/inventory/v1/offer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(offer),
    })

    if (!offerResponse.ok) {
      const errorText = await offerResponse.text()
      console.error("eBay offer API error:", errorText)
      return NextResponse.json({ error: "Failed to create offer", response: errorText }, { status: 500 })
    }

    const offerData = await offerResponse.json()
    const offerId = offerData.offerId

    // Publish the offer
    const publishResponse = await fetch(`https://api.ebay.com/sell/inventory/v1/offer/${offerId}/publish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!publishResponse.ok) {
      const errorText = await publishResponse.text()
      console.error("eBay publish API error:", errorText)
      return NextResponse.json({ error: "Offer publishing failed", response: errorText }, { status: 500 })
    }

    const publishData = await publishResponse.json()

    // Update the submission with the eBay listing ID
    const { error: updateError } = await supabase
      .from("sell_items")
      .update({
        ebay_listing_id: publishData.listingId,
        ebay_offer_id: offerId,
      })
      .eq("id", submission_id)

    if (updateError) {
      console.error("Error updating submission with eBay listing ID:", updateError)
    }

    return NextResponse.json({
      success: true,
      message: "Item listed on eBay successfully",
      listingId: publishData.listingId,
      offerId: offerId,
    })
  } catch (error) {
    console.error("Error listing item on eBay:", error)
    return NextResponse.json({ error: "Failed to list item on eBay", details: error }, { status: 500 })
  }
}
