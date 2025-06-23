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

    // Extract all known aspect names for debugging
    const aspectNames = aspects.map((a: any) => a?.aspectName ?? a?.localizedAspectName ?? "(undefined)").join(", ")
    console.log(`[eBay] Aspect names: ${aspectNames}`)

    // Find the "Condition" aspect
    const conditionAspect = aspects.find((aspect: any) => {
      const name = aspect?.aspectName ?? aspect?.localizedAspectName
      return typeof name === "string" && name.toLowerCase() === "condition"
    })

    if (!conditionAspect) {
      console.warn(`[eBay] "Condition" aspect not found. Aspects available: ${aspectNames}`)
      return []
    }

    const values = conditionAspect.aspectValues

    if (!Array.isArray(values) || values.length === 0) {
      console.warn(`[eBay] Condition aspect found but no values were returned.`)
      return []
    }

    const results = values.map((val: any) => {
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
