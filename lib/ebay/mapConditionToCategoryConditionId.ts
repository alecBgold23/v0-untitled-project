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
    "like new": ["new with defects", "new other", "used - like new"], // Prioritize more specific eBay terms
    excellent: ["very good", "good"],
    "very good": ["good"],
    fair: ["acceptable"],
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

  // 3. Fallback to 'used' if available in the allowed conditions
  if (conditionMap["used"]) {
    return conditionMap["used"]
  }

  // 4. Fallback to the first available condition if 'used' is not an option
  if (allowedConditions.length > 0) {
    return allowedConditions[0].id
  }

  // 5. Generic hardcoded fallback (should rarely be hit if API provides conditions)
  console.warn(`No suitable eBay condition found for "${userCondition}". Falling back to generic "Used" (3000).`)
  return "3000" // Default to "Used" as a last resort
}
