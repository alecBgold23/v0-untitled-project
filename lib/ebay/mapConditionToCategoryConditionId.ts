// Define the allowed condition type
type AllowedCondition = {
  id: string;   // eBay enum, e.g. "USED_GOOD"
  name: string; // human-readable, e.g. "used - good"
}

export function mapConditionToCategoryConditionId(
  userCondition: string,
  allowedConditions: AllowedCondition[],
): string {
  // Normalize input for matching
  const normalizedUserCondition = userCondition.trim().toLowerCase();

  console.log("📥 Input userCondition:", userCondition);
  console.log("🧹 Normalized userCondition:", normalizedUserCondition);
  console.log("📦 Allowed eBay conditions:", allowedConditions);

  // Build quick lookup map: lowercase name -> id
  const conditionMap: Record<string, string> = {};
  allowedConditions.forEach(cond => {
    conditionMap[cond.name.toLowerCase()] = cond.id;
  });

  // Define mapping from form condition to possible eBay condition names (in allowedConditions)
  const mapping: Record<string, string[]> = {
    "like new": ["used - like new", "new other"],           // Adjust if your allowedConditions include "new other"
    "excellent": ["used - very good", "used - good"],
    "good": ["used - good", "used - acceptable"],
    "fair": ["used - acceptable"],
    "poor": ["for parts or not working"]
  };

  // Try exact direct match with eBay condition names first (rare)
  if (conditionMap[normalizedUserCondition]) {
    console.log(`✅ Exact match found for "${normalizedUserCondition}": ${conditionMap[normalizedUserCondition]}`);
    return conditionMap[normalizedUserCondition];
  }

  // Try mapping userCondition (form input) to eBay allowed condition names
  if (mapping[normalizedUserCondition]) {
    for (const ebayName of mapping[normalizedUserCondition]) {
      const ebayNameLower = ebayName.toLowerCase();
      if (conditionMap[ebayNameLower]) {
        console.log(`✅ Mapped "${normalizedUserCondition}" → "${ebayNameLower}" → ${conditionMap[ebayNameLower]}`);
        return conditionMap[ebayNameLower];
      }
    }
  }

  // As fallback, try partial fuzzy match with conditionMap keys
  for (const [name, id] of Object.entries(conditionMap)) {
    if (normalizedUserCondition.includes(name)) {
      console.log(`~ Partial match fallback: "${normalizedUserCondition}" includes "${name}", returning ${id}`);
      return id;
    }
  }

  // Fallback to any allowed condition containing "used" (safe fallback)
  for (const [name, id] of Object.entries(conditionMap)) {
    if (name.includes("used")) {
      console.warn(`⚠️ Fallback to first 'used' condition: ${id} (${name})`);
      return id;
    }
  }

  // Fallback to first allowed condition if present
  if (allowedConditions.length > 0) {
    console.warn(`⚠️ Fallback to first allowed condition: ${allowedConditions[0].id} (${allowedConditions[0].name})`);
    return allowedConditions[0].id;
  }

  // Hard fallback
  console.error(`❌ No valid condition match for "${userCondition}". Using hardcoded fallback "USED"`);
  return "USED";
}
