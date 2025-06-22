type AllowedCondition = {
  id: string // e.g., "3000"
  name: string // e.g., "Used"
}

export function mapConditionToCategoryConditionId(
  userCondition: string,
  allowedConditions: AllowedCondition[],
): string {
  const normalizedUserCondition = userCondition?.trim().toLowerCase() || ""

  if (!Array.isArray(allowedConditions) || allowedConditions.length === 0) {
    console.warn(
      `mapConditionToCategoryConditionId: No allowed conditions provided for "${userCondition}". Falling back to "Used" (3000).`,
    )
    return "3000"
  }

  // Build condition map from allowed conditions
  const conditionMap: Record<string, string> = {}
  allowedConditions.forEach((cond) => {
    if (cond?.name && typeof cond.name === "string") {
      conditionMap[cond.name.toLowerCase()] = cond.id
    }
  })

  // 1. Exact match
  if (conditionMap[normalizedUserCondition]) {
    return conditionMap[normalizedUserCondition]
  }

  // 2. Fuzzy alias match
  const fuzzyMappings: Record<string, string[]> = {
    "brand new": ["new"],
    "like new": ["like new", "new other", "pre-owned excellent"],
    excellent: ["used excellent", "excellent refurbished", "certified refurbished", "pre-owned excellent"],
    "very good": ["used very good", "very good refurbished"],
    good: ["used good", "good refurbished"],
    fair: ["used acceptable", "pre-owned fair"],
    poor: ["for parts or not working"],
    broken: ["for parts or not working"],
  }

  for (const alias in fuzzyMappings) {
    if (normalizedUserCondition.includes(alias)) {
      for (const ebayTerm of fuzzyMappings[alias]) {
        if (conditionMap[ebayTerm.toLowerCase()]) {
          return conditionMap[ebayTerm.toLowerCase()]
        }
      }
    }
  }

  // 3. Partial match fallback
  for (const allowedCond of allowedConditions) {
    if (
      allowedCond?.name &&
      allowedCond.name.toLowerCase().includes(normalizedUserCondition)
    ) {
      return allowedCond.id
    }
  }

  // 4. Use 'used' if available
  if (conditionMap["used"]) {
    return conditionMap["used"]
  }

  // 5. Fallback to first valid option
  console.warn(
    `mapConditionToCategoryConditionId: Could not map "${userCondition}". Falling back to: ${allowedConditions[0]?.name} (${allowedConditions[0]?.id})`,
  )
  return allowedConditions[0]?.id || "3000"
}
