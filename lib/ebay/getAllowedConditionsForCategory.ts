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
  try {
    const url = `https://api.ebay.com/commerce/taxonomy/v1/category_tree/${treeId}/get_item_aspects_for_category?category_id=${categoryId}`
    console.log(`[eBay] Fetching allowed conditions from: ${url}`)

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.warn(`[eBay] Failed to fetch allowed conditions: ${res.status} - ${errorText}`)
      return []
    }

    const data = await res.json()

    const aspects = data?.aspects || []
    console.log(`[eBay] Total aspects returned: ${aspects.length}`)

    // Safely extract aspect names
    const aspectNames = aspects.map((a: any) => a?.aspectName ?? "(undefined)").join(", ")
    console.log(`[eBay] Aspect names: ${aspectNames}`)

    // Try to find the "Condition" aspect
    const conditionAspect = aspects.find(
      (aspect: any) => aspect?.aspectName?.toLowerCase() === "condition"
    )

    if (!conditionAspect) {
      console.warn(`[eBay] "Condition" aspect not found. Aspects available: ${aspectNames}`)
      return []
    }

    if (!Array.isArray(conditionAspect.aspectValues) || conditionAspect.aspectValues.length === 0) {
      console.warn(`[eBay] Condition aspect exists, but has no values.`)
      return []
    }

    const results = conditionAspect.aspectValues.map((val: any) => {
      const id = String(val?.valueId ?? "")
      const name = String(val?.displayName ?? "").toLowerCase()
      return { id, name }
    })

    console.log(`[eBay] Allowed condition values for category ${categoryId}:`, results)

    return results
  } catch (error) {
    console.error("[eBay] Error fetching allowed conditions for category:", error)
    return []
  }
}
