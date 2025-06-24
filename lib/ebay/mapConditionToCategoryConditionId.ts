// Add this at the very top of the file, before any type declarations
console.log("✅ [LOADED] mapConditionToCategoryConditionId.ts")

// Then your type and function can follow
type AllowedCondition = {
  id: string // enum string, e.g. "USED_GOOD"
  name: string // human-readable name, e.g. "used - good"
}

export function mapConditionToCategoryConditionId(
  userCondition: string,
  allowedConditions: AllowedCondition[],
): string {
  const normalizedUserCondition = userCondition.trim().toLowerCase()
  // ...
}

  console.log("📥 Input userCondition:", userCondition)
  console.log("🧹 Normalized condition:", normalizedUserCondition)
  console.log("📦 Allowed eBay conditions:", allowedConditions)

  // Create a map from normalized name → enum ID
  const conditionMap: Record<string, string> = {}
  allowedConditions.forEach((cond) => {
    conditionMap[cond.name.toLowerCase()] = cond.id
  })

  // 1. Exact match
  if (conditionMap[normalizedUserCondition]) {
    console.log(`✅ Exact match: "${normalizedUserCondition}" → ${conditionMap[normalizedUserCondition]}`)
    return conditionMap[normalizedUserCondition]
  }

  // 2. Fuzzy/alias match
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

  // 3. Fallback to 'used' enum if it exists
  for (const [key, id] of Object.entries(conditionMap)) {
    if (key.includes("used")) {
      console.warn(`⚠️ Fallback to 'used' match: ${id} (${key})`)
      return id
    }
  }

  // 4. Fallback to first available
  if (allowedConditions.length > 0) {
    console.warn(`⚠️ Fallback to first allowed condition: ${allowedConditions[0].id} (${allowedConditions[0].name})`)
    return allowedConditions[0].id
  }

  // 5. Hard fallback
  console.error(`❌ No valid condition match for "${userCondition}". Using hardcoded fallback: "USED"`)
  return "USED"
}
