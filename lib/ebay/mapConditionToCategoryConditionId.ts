// Log immediately when this module is loaded
console.log("✅ [LOADED] mapConditionToCategoryConditionId.ts")

// Define the AllowedCondition type
type AllowedCondition = {
  id: string // enum string, e.g. "USED_GOOD"
  name: string // human-readable name, e.g. "used - good"
}

// Main function to map user condition string to eBay enum condition ID
export function mapConditionToCategoryConditionId(
  userCondition: string,
  allowedConditions: AllowedCondition[],
): string {
  // Normalize input for easier matching
  const normalizedUserCondition = userCondition.trim().toLowerCase()

  // Debug logs for inputs
  console.log("📥 Input userCondition:", userCondition)
  console.log("🧹 Normalized condition:", normalizedUserCondition)
  console.log("📦 Allowed eBay conditions:", allowedConditions)

  // Build a map: condition name (lowercased) → enum id
  const conditionMap: Record<string, string> = {}
  allowedConditions.forEach((cond) => {
    conditionMap[cond.name.toLowerCase()] = cond.id
  })

  // 1. Try exact match first
  if (conditionMap[normalizedUserCondition]) {
    console.log(`✅ Exact match: "${normalizedUserCondition}" → ${conditionMap[normalizedUserCondition]}`)
    return conditionMap[normalizedUserCondition]
  }

  // 2. Try fuzzy/alias matches
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

  // 3. Fallback: If any condition includes "used", return that ID
  for (const [key, id] of Object.entries(conditionMap)) {
    if (key.includes("used")) {
      console.warn(`⚠️ Fallback to 'used' match: ${id} (${key})`)
      return id
    }
  }

  // 4. Fallback: Return first allowed condition if available
  if (allowedConditions.length > 0) {
    console.warn(`⚠️ Fallback to first allowed condition: ${allowedConditions[0].id} (${allowedConditions[0].name})`)
    return allowedConditions[0].id
  }

  // 5. Hard fallback if nothing matches
  console.error(`❌ No valid condition match for "${userCondition}". Using hardcoded fallback: "USED"`)
  return "USED"
}
