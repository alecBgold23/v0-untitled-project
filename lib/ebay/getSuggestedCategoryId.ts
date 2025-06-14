export async function getSuggestedCategoryId(query: string, accessToken: string): Promise<string> {
  try {
    // Step 1: Get the default eBay category tree ID
    const treeRes = await fetch(
      `https://api.ebay.com/commerce/taxonomy/v1/get_default_category_tree_id?marketplace_id=EBAY_US`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (!treeRes.ok) throw new Error("Failed to fetch category tree ID")

    const { categoryTreeId } = await treeRes.json()

    // Step 2: Get category suggestions for the item title/description
    const suggestionsRes = await fetch(
      `https://api.ebay.com/commerce/taxonomy/v1/category_tree/${categoryTreeId}/get_category_suggestions?q=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    )

    const json = await suggestionsRes.json()
    const suggestions = json.categorySuggestions || []

    if (suggestions.length === 0) {
      console.warn("⚠️ No category suggestions. Using fallback category ID.")
      return "139971" // Fallback (e.g., "Everything Else")
    }

    return suggestions[0].category.categoryId
  } catch (err) {
    console.error("❌ Error in getSuggestedCategoryId:", err)
    return "139971" // Fallback
  }
}

export async function getCategoryTreeId(accessToken: string): Promise<string> {
  try {
    const treeRes = await fetch(
      `https://api.ebay.com/commerce/taxonomy/v1/get_default_category_tree_id?marketplace_id=EBAY_US`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (!treeRes.ok) throw new Error("Failed to fetch category tree ID")

    const { categoryTreeId } = await treeRes.json()
    return categoryTreeId
  } catch (err) {
    console.error("❌ Error getting category tree ID:", err)
    return "0" // Fallback
  }
}

export async function getRequiredAspectsForCategory(
  categoryTreeId: string,
  categoryId: string,
  accessToken: string,
): Promise<any[]> {
  try {
    const res = await fetch(
      `https://api.ebay.com/commerce/taxonomy/v1/category_tree/${categoryTreeId}/get_item_aspects_for_category?category_id=${categoryId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (!res.ok) {
      console.warn("⚠️ Failed to fetch required aspects:", res.statusText)
      return []
    }

    const json = await res.json()
    const requiredAspects = json?.aspects?.filter((a: any) => a.aspectConstraint.aspectRequired) || []

    console.log(
      "📌 Required aspects:",
      requiredAspects.map((a: any) => a.aspectName),
    )

    return requiredAspects
  } catch (err) {
    console.error("❌ Error fetching required aspects:", err)
    return []
  }
}

export async function getSuggestedCategoryWithTreeId(
  query: string,
  accessToken: string,
): Promise<{ categoryId: string; treeId: string }> {
  try {
    const treeId = await getCategoryTreeId(accessToken)
    const categoryId = await getSuggestedCategoryId(query, accessToken)

    return { categoryId, treeId }
  } catch (err) {
    console.error("❌ Error in getSuggestedCategoryWithTreeId:", err)
    return { categoryId: "139971", treeId: "0" }
  }
}

// Enhanced category suggestion with confidence scoring
export async function getEnhancedCategorySuggestions(
  query: string,
  accessToken: string,
): Promise<{ categoryId: string; treeId: string; confidence?: number }> {
  try {
    const treeId = await getCategoryTreeId(accessToken)

    const suggestionsRes = await fetch(
      `https://api.ebay.com/commerce/taxonomy/v1/category_tree/${treeId}/get_category_suggestions?q=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    )

    const json = await suggestionsRes.json()
    console.log("📂 Raw category suggestions:", JSON.stringify(json, null, 2))

    const suggestions = json?.categorySuggestions || []

    if (suggestions.length === 0) {
      console.warn("⚠️ No category suggestions returned. Using fallback.")
      return { categoryId: "139971", treeId }
    }

    // Sort by confidence score (highest first)
    const sorted = suggestions.sort((a: any, b: any) => {
      const aScore = a?.confidence || 0
      const bScore = b?.confidence || 0
      return bScore - aScore
    })

    const best = sorted[0]
    const categoryId = best?.category?.categoryId
    const confidence = best?.confidence

    if (!categoryId) {
      console.warn("⚠️ No valid category ID found in sorted suggestions. Using fallback.")
      return { categoryId: "139971", treeId }
    }

    console.log(`🧠 Chosen eBay category ID: ${categoryId} (confidence: ${confidence})`)
    return { categoryId, treeId, confidence }
  } catch (err) {
    console.warn("⚠️ Enhanced category suggestion failed. Using fallback.", err)
    return { categoryId: "139971", treeId: "0" }
  }
}
