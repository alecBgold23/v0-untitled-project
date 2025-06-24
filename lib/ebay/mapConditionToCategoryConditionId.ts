// Example type for allowed conditions (from getAllowedConditionsForCategory)
type AllowedCondition = {
  id: string // numeric ID as string, e.g. "3000"
  name: string // human-readable name, e.g. "used"
}

export function mapConditionToCategoryConditionId(
  userCondition: string,
  allowedConditions: AllowedCondition[], // Expect array of objects
): string {
  const normalizedUserCondition = userCondition.trim().toLowerCase()

  console.log("📥 Input userCondition:", userCondition)
  console.log("🧹 Normalized condition:", normalizedUserCondition)
  console.log("📦 Allowed eBay conditions:", allowedConditions)

  // Create a map for quick lookup and to normalize names
  const conditionMap: Record<string, string> = {}
  allowedConditions.forEach((cond) => {
    conditionMap[cond.name.toLowerCase()] = cond.id
  })

  // 1. Try exact match first
  if (conditionMap[normalizedUserCondition]) {
    console.log(`✅ Exact match: "${normalizedUserCondition}" → ${conditionMap[normalizedUserCondition]}`)
    return conditionMap[normalizedUserCondition]
  }

  // 2. Try common aliases/fuzzy matches with priority
  const fuzzyMappings: Record<string, string[]> = {
    "brand new": ["new"],
    "like new": ["new with defects", "new other", "used - like new"],
    excellent: ["very good", "good"],
    "very good": ["good"],
    fair: ["acceptable"],
    poor: ["for parts or not working", "parts or not working"],
    broken: ["for parts or not working", "parts or not working"],
  }

  for (const alias in fuzzyMappings) {
    if (normalizedUserCondition.includes(alias)) {
      for (const ebayTerm of fuzzyMappings[alias]) {
        const ebayTermNormalized = ebayTerm.toLowerCase()
        if (conditionMap[ebayTermNormalized]) {
          console.log(`~ Fuzzy match: "${normalizedUserCondition}" → "${ebayTermNormalized}" → ${conditionMap[ebayTermNormalized]}`)
          return conditionMap[ebayTermNormalized]
        }
      }
    }
  }

  // 3. Fallback to 'used' if available
  if (conditionMap["used"]) {
    console.warn(`⚠️ Fallback to "used": ${conditionMap["used"]}`)
    return conditionMap["used"]
  }

  // 4. Fallback to first condition
  if (allowedConditions.length > 0) {
    console.warn(`⚠️ Fallback to first allowed condition: ${allowedConditions[0].id} (${allowedConditions[0].name})`)
    return allowedConditions[0].id
  }

  // 5. Last resort fallback
  console.error(`❌ No valid condition match for "${userCondition}". Using hardcoded fallback: "3000"`)
  return "3000"
}
