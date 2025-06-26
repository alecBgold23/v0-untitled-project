// mapConditionToCategoryConditionId.ts

console.log("✅ [LOADED] mapConditionToCategoryConditionId.ts")

export type AllowedCondition = {
  id: string
  name: string
}

/**
 * Fetch allowed conditions from eBay API for a given category ID.
 * Requires EBAY_OAUTH_TOKEN in environment variables.
 */
export async function fetchAllowedConditionsFromEbay(categoryId: string): Promise<AllowedCondition[]> {
  const url = `https://api.ebay.com/commerce/taxonomy/v1/category_tree/0/get_item_aspects_for_category?category_id=${categoryId}`
  const token = process.env.EBAY_OAUTH_TOKEN
  if (!token) throw new Error("Missing eBay OAuth token")

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch eBay conditions: ${res.statusText}`)
  }

  const data = await res.json()

  const conditionAspect = data.aspects?.find(
    (aspect: any) => aspect.name.toLowerCase() === "condition"
  )

  if (!conditionAspect) {
    throw new Error("Condition aspect not found in eBay response")
  }

  const allowedConditions: AllowedCondition[] = conditionAspect.values.map((value: any) => ({
    id: value.expectedValues?.[0]?.value || "UNKNOWN",
    name: value.localizedValues?.[0]?.value || "unknown",
  }))

  console.log(`[eBay] Mapped allowed conditions for category "${categoryId}":`, allowedConditions)

  return allowedConditions
}

/**
 * Normalize string: trim, lowercase, replace dash/underscore with space, remove non-alphanum except space
 */
function normalizeConditionName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
}

/**
 * Map user condition string to closest eBay allowed condition ID.
 */
export function mapConditionToCategoryConditionId(
  userCondition: string,
  allowedConditions: AllowedCondition[]
): string {
  const normalizedUserCondition = normalizeConditionName(userCondition)

  console.log("📥 Input userCondition:", userCondition)
  console.log("🧹 Normalized condition:", normalizedUserCondition)
  console.log("📦 Allowed eBay conditions:", allowedConditions)

  // Build map: normalized name → id
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
  console.error(`❌ No valid condition match for "${userCondition}". Using hardcoded fallback: "USED"`)
  return "USED"
}

/**
 * Async helper to fetch allowed conditions and map user input in one call.
 */
export async function mapUserConditionForCategory(userCondition: string, categoryId: string): Promise<string> {
  const allowedConditions = await fetchAllowedConditionsFromEbay(categoryId)
  return mapConditionToCategoryConditionId(userCondition, allowedConditions)
}
