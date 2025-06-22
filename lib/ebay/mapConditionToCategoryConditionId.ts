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

  if (!allowedConditions || allowedConditions.length === 0) {
    console.warn(
      `mapConditionToCategoryConditionId: No allowed conditions provided for "${userCondition}". Falling back to generic "Used" (3000). This is risky.`,
    )
    return "3000" // Default to "Used" if no conditions are available
  }

  // Create a map for quick lookup and to normalize names
  const conditionMap: Record<string, string> = {}
  allowedConditions.forEach((cond) => {
    conditionMap[cond.name.toLowerCase()] = cond.id
  })

  // 1. Try exact match first
  if (conditionMap[normalizedUserCondition]) {
    return conditionMap[normalizedUserCondition]
  }

  // 2. Try common aliases/fuzzy matches with priority
  const fuzzyMappings: Record<string, string[]> = {
    "brand new": ["new"],
    "like new": ["new with defects", "new other", "used - like new", "open box"], // Prioritize more specific eBay terms
    excellent: ["very good", "good", "used - excellent"],
    "very good": ["good", "used - very good"],
    good: ["used - good"],
    fair: ["acceptable", "used - acceptable"],
    poor: ["for parts or not working", "parts or not working"],
    broken: ["for parts or not working", "parts or not working"],
  }

  for (const alias in fuzzyMappings) {
    if (normalizedUserCondition.includes(alias)) {
      for (const ebayTerm of fuzzyMappings[alias]) {
        if (conditionMap[ebayTerm]) {
          return conditionMap[ebayTerm]
        }
      }
    }
  }

  // 3. Try a broader search for the user condition string within the allowed condition names
  for (const allowedCond of allowedConditions) {
    if (allowedCond.name.toLowerCase().includes(normalizedUserCondition)) {
      return allowedCond.id
    }
  }

  // 4. Fallback to 'used' if available in the allowed conditions
  if (conditionMap["used"]) {
    return conditionMap["used"]
  }

  // 5. Fallback to the first available condition if 'used' is not an option
  // This is safer than a hardcoded ID if the API provided *some* valid conditions
  console.warn(
    `mapConditionToCategoryConditionId: Could not map "${userCondition}" to a known eBay condition. Falling back to the first available condition: ${allowedConditions[0].name} (${allowedConditions[0].id}).`,
  )
  return allowedConditions[0].id
}
