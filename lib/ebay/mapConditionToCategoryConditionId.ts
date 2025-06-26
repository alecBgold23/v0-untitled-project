console.log("✅ [LOADED] getAllowedConditionsForCategory.ts")

export type AllowedCondition = {
  id: string   // numeric condition ID as string, e.g. "1000"
  name: string // human-readable label, e.g. "new"
}

/**
 * Fetch allowed numeric condition IDs and descriptions from eBay Metadata API for a given category ID.
 * Requires a valid eBay OAuth access token.
 */
export async function getAllowedConditionsForCategory(
  categoryId: string,
  accessToken: string,
): Promise<AllowedCondition[]> {
  console.log(`[eBay] Fetching allowed conditions for category "${categoryId}"`)

  try {
    const url = `https://api.ebay.com/sell/metadata/v1/marketplace/EBAY_US/get_item_condition_policies?category_id=${categoryId}`
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Failed to fetch conditions: ${res.status} ${res.statusText} - ${errorText}`)
    }

    const json = await res.json()

    const conditions = json.itemConditionPolicies?.[0]?.itemConditions
    if (!Array.isArray(conditions) || conditions.length === 0) {
      throw new Error(`No itemConditions found for category "${categoryId}"`)
    }

    // Map to numeric id and lowercased description
    const allowedConditions: AllowedCondition[] = conditions.map((cond: any) => ({
      id: String(cond.conditionId),  // numeric string ID like "1000"
      name: (cond.conditionDescription ?? "unknown").toLowerCase(),
    }))

    console.log(`[eBay] Allowed conditions for category "${categoryId}":`, allowedConditions)
    return allowedConditions

  } catch (error) {
    console.error(`[eBay] Error fetching allowed conditions for category "${categoryId}":`, error)
    return []
  }
}

/**
 * Normalize condition strings (trim, lowercase, replace dash/underscore with space, remove non-alphanum except space)
 */
function normalizeConditionName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
}

/**
 * Map a user-entered condition string to the closest numeric eBay condition ID from allowed conditions.
 */
export function mapConditionToCategoryConditionId(
  userCondition: string,
  allowedConditions: AllowedCondition[]
): string {
  const normalizedUserCondition = normalizeConditionName(userCondition)
  console.log("📥 Input userCondition:", userCondition)
  console.log("🧹 Normalized condition:", normalizedUserCondition)
  console.log("📦 Allowed eBay conditions:", allowedConditions)

  // Build map: normalized name -> numeric id string
  const conditionMap: Record<string, string> = {}
  allowedConditions.forEach((cond) => {
    const normalizedName = normalizeConditionName(cond.name)
    conditionMap[normalizedName] = cond.id
  })

  // 1. Exact match
  if (conditionMap[normalizedUserCondition]) {
    console.log(`✅ Exact match: "${normalizedUserCondition}" → ${conditionMap[normalizedUserCondition]}`)
    return conditionMap[normalizedUserCondition]
  }

  // 2. Fuzzy alias mapping
  const fuzzyMappings: Record<string, string[]> = {
    "brand new": ["new"],
    "like new": ["new other", "new", "used like new", "used - like new"],
    excellent: ["very good", "good"],
    "very good": ["good"],
    fair: ["acceptable"],
    poor: ["for parts or not working", "parts or not working"],
    broken: ["for parts or not working", "parts or not working"],
  }

  for (const alias in fuzzyMappings) {
    if (normalizedUserCondition.includes(alias)) {
      for (const ebayTerm of fuzzyMappings[alias]) {
        const ebayTermNormalized = normalizeConditionName(ebayTerm)
        if (conditionMap[ebayTermNormalized]) {
          console.log(`~ Fuzzy match: "${normalizedUserCondition}" → "${ebayTermNormalized}" → ${conditionMap[ebayTermNormalized]}`)
          return conditionMap[ebayTermNormalized]
        }
      }
    }
  }

  // 3. Partial substring match (e.g., "good" inside "very good")
  for (const [key, id] of Object.entries(conditionMap)) {
    if (key.includes(normalizedUserCondition) || normalizedUserCondition.includes(key)) {
      console.log(`~ Partial match: "${normalizedUserCondition}" ↔ "${key}" → ${id}`)
      return id
    }
  }

  // 4. Fallback to any condition containing "used"
  for (const [key, id] of Object.entries(conditionMap)) {
    if (key.includes("used")) {
      console.warn(`⚠️ Fallback to 'used' match: ${id} (${key})`)
      return id
    }
  }

  // 5. Fallback to first allowed condition if any
  if (allowedConditions.length > 0) {
    console.warn(`⚠️ Fallback to first allowed condition: ${allowedConditions[0].id} (${allowedConditions[0].name})`)
    return allowedConditions[0].id
  }

  // 6. Hardcoded fallback if nothing else matched
  console.error(`❌ No valid condition match for "${userCondition}". Using hardcoded fallback: "3000" (Used)`)
  return "3000"  // Default to "Used"
}

/**
 * Helper function to fetch allowed conditions and map user input in one call.
 */
export async function mapUserConditionForCategory(
  userCondition: string,
  categoryId: string,
  accessToken: string
): Promise<string> {
  const allowedConditions = await getAllowedConditionsForCategory(categoryId, accessToken)
  return mapConditionToCategoryConditionId(userCondition, allowedConditions)
}
