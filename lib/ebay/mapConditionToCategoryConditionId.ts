export function mapConditionToCategoryConditionId(
  userCondition: string,
  validConditionsMap: Record<string, number>,
): number {
  const normalized = userCondition.trim().toLowerCase()

  // Try direct match
  if (validConditionsMap[normalized]) {
    return validConditionsMap[normalized]
  }

  // Try fuzzy match
  for (const [label, id] of Object.entries(validConditionsMap)) {
    if (normalized.includes(label)) return id
  }

  // Fallback to 'Used' if available
  if (validConditionsMap["used"]) return validConditionsMap["used"]

  return 3000 // generic fallback
}
