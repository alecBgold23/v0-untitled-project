// lib/ebay/condition-utils.ts

export function normalizeToEbayCondition(inputCondition: string): string {
  const normalized = inputCondition.trim().toLowerCase().replace(/[-_]/g, " ")

  const mapping: Record<string, string> = {
    "like new": "NEW_OTHER",
    "brand new": "NEW_OTHER",
    new: "NEW_OTHER",
    excellent: "USED_EXCELLENT",
    "used excellent": "USED_EXCELLENT",
    "used-excellent": "USED_EXCELLENT",
    good: "USED_GOOD",
    "used good": "USED_GOOD",
    "used-good": "USED_GOOD",
    fair: "USED_ACCEPTABLE",
    "used fair": "USED_ACCEPTABLE",
    "used-fair": "USED_ACCEPTABLE",
    poor: "FOR_PARTS_OR_NOT_WORKING",
    "for parts or not working": "FOR_PARTS_OR_NOT_WORKING",
    "for parts": "FOR_PARTS_OR_NOT_WORKING",
    "not working": "FOR_PARTS_OR_NOT_WORKING",
  }

  if (mapping[normalized]) return mapping[normalized]

  for (const [key, value] of Object.entries(mapping)) {
    if (normalized.includes(key)) return value
  }

  return "FOR_PARTS_OR_NOT_WORKING"
}

export async function validateEbayConditionForCategory(
  categoryId: string,
  normalizedCondition: string,
  accessToken: string,
): Promise<string> {
  try {
    const res = await fetch(
      `https://api.ebay.com/commerce/metadata/v1/marketplace/EBAY_US/get_item_conditions?category_id=${categoryId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (!res.ok) throw new Error("Condition metadata fetch failed")

    const data = await res.json()
    const allowedConditions: string[] = data.conditionDescriptors.map((c: any) => c.name.toUpperCase())

    const normalizedUpper = normalizedCondition.toUpperCase()
    if (allowedConditions.includes(normalizedUpper)) {
      return normalizedCondition
    }

    console.warn(`⚠️ Condition "${normalizedCondition}" not allowed in category ${categoryId}. Falling back.`)

    // Fallback logic
    if (allowedConditions.includes("USED")) return "USED"
    if (allowedConditions.includes("FOR_PARTS_OR_NOT_WORKING")) return "FOR_PARTS_OR_NOT_WORKING"
    if (allowedConditions.includes("NEW")) return "NEW"
    return allowedConditions[0] // Final fallback
  } catch (err) {
    console.error("❌ Failed to validate condition per category:", err)
    return "FOR_PARTS_OR_NOT_WORKING"
  }
}
