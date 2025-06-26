// Define your enum mapping from eBay numeric condition IDs to your enum strings
console.log("✅ [LOADED] getAllowedConditionsForCategory.ts")
const ebayIdToEnumCondition: Record<string, string> = {
  "1000": "NEW",
  "1500": "NEW_OTHER",
  "2500": "REFURBISHED",
  "3000": "USED",
  "7000": "FOR_PARTS_OR_NOT_WORKING",
}

type AllowedCondition = {
  id: string // enum-style ID, e.g. "USED"
  name: string // human-readable label, e.g. "used"
}

export async function getAllowedConditionsForCategory(
  categoryId: string,
  accessToken: string,
): Promise<AllowedCondition[]> {
  console.log(`[eBay] Starting fetch of allowed conditions for categoryId: "${categoryId}"`)
  console.log(`[eBay] Access token received (first 10): ${accessToken?.slice?.(0, 10)}...`)
  console.log("[eBay] getAllowedConditionsForCategory was called from:\n", new Error().stack)

  try {
    const url = `https://api.ebay.com/sell/metadata/v1/marketplace/EBAY_US/get_item_condition_policies?category_id=${categoryId}`
    console.log(`[eBay] Request URL: ${url}`)

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    console.log(`[eBay] Response status: ${res.status} ${res.statusText}`)

    if (!res.ok) {
      const errorText = await res.text()
      console.warn(`[eBay] Failed to fetch metadata condition policies for category "${categoryId}": HTTP ${res.status} - ${errorText}`)
      return []
    }

    const json = await res.json()
    console.log(`[eBay] Raw JSON response received: ${JSON.stringify(json).slice(0, 500)}...`)

    if (!json.itemConditionPolicies || !Array.isArray(json.itemConditionPolicies)) {
      console.warn(`[eBay] itemConditionPolicies missing or not an array for category "${categoryId}". Full response: ${JSON.stringify(json)}`)
      return []
    }

    const conditionPolicies = json.itemConditionPolicies
    if (conditionPolicies.length === 0) {
      console.warn(`[eBay] itemConditionPolicies array is empty for category "${categoryId}"`)
      return []
    }

    const firstPolicy = conditionPolicies[0]
    if (!firstPolicy.itemConditions || !Array.isArray(firstPolicy.itemConditions)) {
      console.warn(`[eBay] itemConditions missing or not an array in first itemConditionPolicy for category "${categoryId}". Full firstPolicy: ${JSON.stringify(firstPolicy)}`)
      return []
    }

    const conditions = firstPolicy.itemConditions
    if (conditions.length === 0) {
      console.warn(`[eBay] itemConditions array is empty in first itemConditionPolicy for category "${categoryId}"`)
      return []
    }

    console.log(`[eBay] Found ${conditions.length} condition(s) for category "${categoryId}". Mapping results...`)

    const mapped: AllowedCondition[] = conditions.map((cond: any) => {
      const numericId = cond.conditionId != null ? String(cond.conditionId) : "UNKNOWN_ID"
      const enumId = ebayIdToEnumCondition[numericId] || "UNKNOWN"
      const name = cond.conditionDisplayName ? cond.conditionDisplayName.toLowerCase() : "unknown"

      if (numericId === "UNKNOWN_ID" || name === "unknown") {
        console.warn(`[eBay] Found condition with missing id or name: ${JSON.stringify(cond)}`)
      }

      return { id: enumId, name }
    })

    console.log(`[eBay] Mapped allowed conditions for category "${categoryId}":`, mapped)

    return mapped
  } catch (error) {
    console.error(`[eBay] Unexpected error fetching allowed conditions for category "${categoryId}":`, error)
    return []
  }
}
