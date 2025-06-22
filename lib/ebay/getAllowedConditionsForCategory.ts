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
    const res = await fetch(
      `https://api.ebay.com/commerce/taxonomy/v1/category_tree/${treeId}/get_item_aspects_for_category?category_id=${categoryId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    )
  
    if (!res.ok) {
      console.warn("Failed to fetch allowed conditions:", await res.text())
      return []
    }
  
    const data = await res.json()
    if (!data.aspects || !Array.isArray(data.aspects)) {
      console.warn("No aspects array in response.")
      return []
    }
  
    // Safely find the "Condition" aspect (case-insensitive)
    const conditionAspect = data.aspects.find(
      (aspect: any) =>
        typeof aspect.aspectName === "string" &&
        aspect.aspectName.toLowerCase() === "condition",
    )
  
    if (!conditionAspect || !Array.isArray(conditionAspect.aspectValues)) {
      console.warn("Condition aspect not found or invalid in response.")
      return []
    }
  
    // Map the allowed conditions safely
    return conditionAspect.aspectValues.map((val: any) => ({
      id: val.valueId != null ? String(val.valueId) : "",
      name: typeof val.displayName === "string" ? val.displayName.toLowerCase() : "",
    })).filter(cond => cond.id && cond.name) // filter out invalid entries
  } catch (error) {
    console.error("Error in getAllowedConditionsForCategory:", error)
    return []
  }
}
