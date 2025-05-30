type ConditionCode =
  | 1000 // New
  | 1500 // New other (see details)
  | 2000 // Manufacturer refurbished
  | 2500 // Seller refurbished
  | 3000 // Used
  | 4000 // Very Good
  | 5000 // Good
  | 6000 // Acceptable
  | 7000 // For parts or not working

function mapConditionToCode(condition: string): ConditionCode {
  const normalized = condition.toLowerCase().trim()
  switch (normalized) {
    case "new":
      return 1000
    case "new other":
      return 1500
    case "manufacturer refurbished":
      return 2000
    case "seller refurbished":
      return 2500
    case "very good":
      return 4000
    case "good":
      return 5000
    case "acceptable":
      return 6000
    case "for parts":
    case "not working":
      return 7000
    default:
      return 3000 // Default to "Used"
  }
}

export async function createInventoryItem(
  token: string,
  sku: string,
  data: {
    title: string
    description: string
    condition: string
    imageUrls: string[]
    quantity: number
  },
) {
  const res = await fetch(`https://api.ebay.com/sell/inventory/v1/inventory_item/${sku}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: data.title,
      description: data.description,
      condition: mapConditionToCode(data.condition),
      availability: {
        shipToLocationAvailability: { quantity: data.quantity },
      },
      product: {
        imageUrls: data.imageUrls,
      },
    }),
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.error("❌ Failed to create inventory item:", errorText)
    throw new Error(`createInventoryItem failed: ${res.statusText}`)
  }

  console.log("✅ Inventory item created for SKU:", sku)
}

export async function createOffer(
  token: string,
  sku: string,
  data: {
    price: number
    fulfillmentPolicyId: string
    paymentPolicyId: string
    returnPolicyId: string
    merchantLocationKey: string
  },
): Promise<string> {
  const res = await fetch(`https://api.ebay.com/sell/inventory/v1/offer`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sku,
      marketplaceId: "EBAY_US",
      format: "FIXED_PRICE",
      availableQuantity: 1,
      pricingSummary: {
        price: { value: data.price.toFixed(2), currency: "USD" },
      },
      listingPolicies: {
        fulfillmentPolicyId: data.fulfillmentPolicyId,
        paymentPolicyId: data.paymentPolicyId,
        returnPolicyId: data.returnPolicyId,
      },
      merchantLocationKey: data.merchantLocationKey,
    }),
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.error("❌ Failed to create offer:", errorText)
    throw new Error(`createOffer failed: ${res.statusText}`)
  }

  const json = await res.json()
  console.log("✅ Offer created:", json.offerId)
  return json.offerId
}

export async function publishOffer(token: string, offerId: string): Promise<boolean> {
  const res = await fetch(`https://api.ebay.com/sell/inventory/v1/offer/${offerId}/publish`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.error("❌ Failed to publish offer:", errorText)
    throw new Error(`publishOffer failed: ${res.statusText}`)
  }

  console.log("✅ Offer published:", offerId)
  return true
}
