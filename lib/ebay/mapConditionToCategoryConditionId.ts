type AllowedCondition = {
  id: string;
  name: string;
};

function normalizeConditionName(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9 ]/g, "");
}

const fuzzyMappings: Record<string, string[]> = {
  "brand new": ["new"],
  "like new": ["new with defects", "new other", "used - like new"],
  excellent: ["very good", "good"],
  "very good": ["good"],
  fair: ["acceptable"],
  poor: ["for parts or not working", "parts or not working"],
  broken: ["for parts or not working", "parts or not working"],
};

export function mapConditionToCategoryConditionId(
  userCondition: string,
  allowedConditions: AllowedCondition[],
): string {
  const normalizedUserCondition = normalizeConditionName(userCondition);
  console.log("📥 Input userCondition:", userCondition);
  console.log("🧹 Normalized condition:", normalizedUserCondition);
  console.log("📦 Allowed eBay conditions:", allowedConditions);

  const conditionMap: Record<string, string> = {};
  allowedConditions.forEach((cond) => {
    const normalizedName = normalizeConditionName(cond.name);
    conditionMap[normalizedName] = cond.id;
  });

  // 1. Exact match
  if (conditionMap[normalizedUserCondition]) {
    console.log(`✅ Exact match: "${normalizedUserCondition}" → ${conditionMap[normalizedUserCondition]}`);
    return conditionMap[normalizedUserCondition];
  }

  // 2. Fuzzy/alias match
  for (const alias in fuzzyMappings) {
    if (normalizedUserCondition.includes(normalizeConditionName(alias))) {
      for (const ebayTerm of fuzzyMappings[alias]) {
        const ebayTermNormalized = normalizeConditionName(ebayTerm);
        if (conditionMap[ebayTermNormalized]) {
          console.log(`~ Fuzzy match: "${normalizedUserCondition}" → "${ebayTermNormalized}" → ${conditionMap[ebayTermNormalized]}`);
          return conditionMap[ebayTermNormalized];
        }
      }
    }
  }

  // 3. Partial match: try to find any allowed condition name that includes or is included by user input
  for (const [key, id] of Object.entries(conditionMap)) {
    if (key.includes(normalizedUserCondition) || normalizedUserCondition.includes(key)) {
      console.log(`~ Partial match: "${normalizedUserCondition}" ↔ "${key}" → ${id}`);
      return id;
    }
  }

  // 4. Fallback to any condition containing "used"
  for (const [key, id] of Object.entries(conditionMap)) {
    if (key.includes("used")) {
      console.warn(`⚠️ Fallback to 'used' match: ${id} (${key})`);
      return id;
    }
  }

  // 5. Fallback: first allowed condition if any
  if (allowedConditions.length > 0) {
    console.warn(`⚠️ Fallback to first allowed condition: ${allowedConditions[0].id} (${allowedConditions[0].name})`);
    return allowedConditions[0].id;
  }

  // 6. Hard fallback
  console.error(`❌ No valid condition match for "${userCondition}". Using hardcoded fallback: "USED"`);
  return "USED";
}
