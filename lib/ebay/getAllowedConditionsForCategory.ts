type AllowedCondition = {
  id: string
  name: string
}

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
      const text = await res.text()
      console.warn(`Failed to fetch allowed conditions: ${res.status} - ${text}`)
      return []
    }

    const data = await res.json()
    const aspects = data.aspects || []
    console.log(`DEBUG: All aspects for category ${categoryId}:`, aspects.map((a: any) => a.aspectName))

    // Try to find the "condition" aspect case-insensitively
    const possibleNames = ["condition", "item condition", "condition type"]
    const conditionAspect = aspects.find((aspect: any) =>
      possibleNames.some((name) => aspect.aspectName.toLowerCase() === name)
    )

    if (!conditionAspect) {
      console.warn(
        `Condition aspect not found for category ${categoryId}. Available aspects: ${aspects
          .map((a: any) => a.aspectName)
          .join(", ")}`,
      )
      return []
    }

    return conditionAspect.aspectValues.map((val: any) => ({
      id: String(val.valueId),
      name: String(val.displayName).toLowerCase(),
    }))
  } catch (error) {
    console.error("Error fetching allowed conditions:", error)
    return []
  }
}
