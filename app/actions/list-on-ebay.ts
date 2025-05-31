"use server"

import { createClient } from "@/utils/supabase/server"
import { getValidEbayAccessToken } from "@/lib/ebay/getValidEbayAccessToken"
import { createInventoryItem, createOffer, publishOffer } from "@/lib/ebay/listing"

export async function listItemOnEbay(itemId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("sell_items").select("*").eq("id", itemId).single()

  if (error || !data) throw new Error("Item not found")

  // Get valid token (automatically refreshes if needed)
  const token = await getValidEbayAccessToken()

  const sku = `item-${data.id}`
  const imageUrls = data.image_url ? [data.image_url] : []

  await createInventoryItem(token, sku, {
    title: data.item_name,
    description: data.description,
    condition: "USED_GOOD",
    imageUrls,
    quantity: 1,
  })

  const offerId = await createOffer(token, sku, {
    price: data.price,
    fulfillmentPolicyId: process.env.EBAY_FULFILLMENT_POLICY_ID!,
    paymentPolicyId: process.env.EBAY_PAYMENT_POLICY_ID!,
    returnPolicyId: process.env.EBAY_RETURN_POLICY_ID!,
    merchantLocationKey: process.env.EBAY_LOCATION_KEY!,
  })

  const publishResult = await publishOffer(token, offerId)

  await supabase.from("sell_items").update({ ebay_offer_id: offerId, listed_on_ebay: true }).eq("id", itemId)

  return publishResult
}
