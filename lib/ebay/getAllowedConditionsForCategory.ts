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

  // Find the aspect named "Condition" (or similar) and return its values
  const conditionAspect = data.aspects?.find((aspect: any) => aspect.aspectName.toLowerCase() === "condition")

  if (!conditionAspect) {
    console.warn("Condition aspect not found for category.")
    return []
  }

  // Return array of allowed conditions { id, name }
  return conditionAspect.aspectValues.map((val: any) => ({
    id: String(val.valueId), // Ensure ID is a string as per AllowedCondition type
    name: val.displayName.toLowerCase(),
  }))
}
