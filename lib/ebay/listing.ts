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
  await fetch(`https://api.ebay.com/sell/inventory/v1/inventory_item/${sku}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: data.title,
      description: data.description,
      condition: data.condition,
      availability: {
        shipToLocationAvailability: { quantity: data.quantity },
      },
      product: {
        imageUrls: data.imageUrls,
      },
    }),
  })
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
) {
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

  const json = await res.json()
  return json.offerId
}

export async function publishOffer(token: string, offerId: string) {
  const res = await fetch(`https://api.ebay.com/sell/inventory/v1/offer/${offerId}/publish`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.ok
}
