import { getValidEbayAccessToken } from "@/lib/ebay/getValidEbayAccessToken"

export async function getValidEbayConditionId(categoryId: string, formCondition: string): Promise<string> {
  const token = await getValidEbayAccessToken()

  const res = await fetch(
    `https://api.ebay.com/sell/metadata/v1/marketplace/EBAY_US/item_condition_policy?category_ids=${categoryId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  )

  if (!res.ok) {
    throw new Error(`eBay metadata API failed: ${res.status}`)
  }

  const data = await res.json()
  const ebayConditions = data.itemConditionPolicies?.[0]?.itemConditions ?? []

  const normalized = formCondition.trim().toLowerCase()

  const mapping: { [key: string]: string[] } = {
    "like new": ["1000", "1500"], // New, Open box
    excellent: ["1500", "3000"], // Open box, Used
    good: ["3000"], // Used
    fair: ["3000", "7000"], // Used, For parts
    poor: ["7000"], // For parts or not working
  }

  const preferredIds = mapping[normalized] ?? ["3000"] // Default to "Used"

  for (const id of preferredIds) {
    if (ebayConditions.some((c) => c.conditionId === id)) {
      return id
    }
  }

  // Fallback: return first valid condition for category
  return ebayConditions[0]?.conditionId ?? "3000"
}
