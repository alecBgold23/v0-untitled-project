// Example type for allowed conditions
type AllowedCondition = {
  id: string // numeric ID as string, e.g. "3000"
  name: string // human-readable name, e.g. "Used"
}

/**
 * Fetch allowed conditions for a given category and tree ID from eBay API.
 * @param categoryId The eBay category ID.
 * @param treeId The eBay category tree ID.
 * @param accessToken The eBay OAuth access token.
 * @returns An array of allowed conditions { id, name }.
 */
export async function getAllowedConditionsForCategory(
  categoryId: string,
  treeId: string,
  accessToken: string,
): Promise<AllowedCondition[]> {
  const endpoint = `https://api.ebay.com/commerce/taxonomy/v1/category_tree/${treeId}/get_item_aspects_for_category?category_id=${categoryId}`

  try {
    console.log(`[eBay] Fetching allowed conditions from: ${endpoint}`)

    const res = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.warn(`[eBay] Failed to fetch condition aspects: ${res.status} - ${errorText}`)
      return []
    }

    const data = await res.json()

    const aspects = data?.aspects || []
    console.log(`[eBay] Total aspects returned: ${aspects.length}`)

    const conditionAspect = aspects.find(
      (aspect: any) =>
        typeof aspect?.aspectName === "string" &&
        aspect.aspectName.toLowerCase() === "condition"
    )

    if (!conditionAspect) {
      const aspectNames = aspects.map((a: any) => a.aspectName).filter(Boolean).join(", ")
      console.warn(`[eBay] "Condition" aspect not found. Aspects available: ${aspectNames}`)
      return []
    }

    if (!Array.isArray(conditionAspect.aspectValues)) {
      console.warn(`[eBay] "Condition" aspect found, but no values present.`)
      return []
    }

    const allowed = conditionAspect.aspectValues.map((val: any) => ({
      id: String(val?.valueId ?? ""), // Ensure fallback to empty string if undefined
      name: String(val?.displayName ?? "").toLowerCase(),
    })).filter((cond) => cond.id && cond.name)

    console.log(`[eBay] Found ${allowed.length} allowed condition(s):`, allowed.map(c => c.name).join(", "))

    return allowed
  } catch (error) {
    console.error(`[eBay] Unexpected error while fetching allowed conditions:`, error)
    return []
  }
}
