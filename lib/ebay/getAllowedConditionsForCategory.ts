// lib/ebay/getAllowedConditionsForCategory.ts

type AllowedCondition = {
  id: string // numeric ID, e.g. "3000"
  name: string // e.g. "Used"
}

export async function getAllowedConditionsForCategory(
  categoryId: string,
  accessToken: string,
): Promise<AllowedCondition[]> {
  console.log(`[eBay] Starting fetch of allowed conditions for categoryId: "${categoryId}"`)

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
    console.log(`[eBay] Raw JSON response received: ${JSON.stringify(json).slice(0, 500)}...`) // Limit output length for readability

    if (!json.conditionPolicies || !Array.isArray(json.conditionPolicies)) {
      console.warn(`[eBay] conditionPolicies field missing or not an array in response for category "${categoryId}". Full response: ${JSON.stringify(json)}`)
      return []
    }

    const conditionPolicies = json.conditionPolicies
    if (conditionPolicies.length === 0) {
      console.warn(`[eBay] conditionPolicies array is empty for category "${categoryId}"`)
      return []
    }

    const firstPolicy = conditionPolicies[0]
    if (!firstPolicy.itemConditions || !Array.isArray(firstPolicy.itemConditions)) {
      console.warn(`[eBay] itemConditions missing or not an array in first conditionPolicy for category "${categoryId}". Full firstPolicy: ${JSON.stringify(firstPolicy)}`)
      return []
    }

    const conditions = firstPolicy.itemConditions
    if (conditions.length === 0) {
      console.warn(`[eBay] itemConditions array is empty in first conditionPolicy for category "${categoryId}"`)
      return []
    }

    console.log(`[eBay] Found ${conditions.length} condition(s) for category "${categoryId}". Mapping results...`)

    const mapped: AllowedCondition[] = conditions.map((cond: any) => {
      const id = cond.conditionId != null ? String(cond.conditionId) : "UNKNOWN_ID"
      const name = cond.conditionDisplayName ? cond.conditionDisplayName.toLowerCase() : "unknown"
      if (id === "UNKNOWN_ID" || name === "unknown") {
        console.warn(`[eBay] Found condition with missing id or name: ${JSON.stringify(cond)}`)
      }
      return { id, name }
    })

    console.log(`[eBay] Mapped allowed conditions for category "${categoryId}":`, mapped)

    return mapped
  } catch (error) {
    console.error(`[eBay] Unexpected error fetching allowed conditions for category "${categoryId}":`, error)
    return []
  }
}
