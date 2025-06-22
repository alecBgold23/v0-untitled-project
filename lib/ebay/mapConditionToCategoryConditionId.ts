import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
)

type AllowedCondition = {
  id: string
  item_condition: string
}

// Your mapping function (unchanged from your latest version)
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

  const conditionMap: Record<string, string> = {}
  allowedConditions.forEach((cond) => {
    if (cond?.item_condition && typeof cond.item_condition === "string") {
      conditionMap[cond.item_condition.toLowerCase()] = cond.id
    }
  })

  if (conditionMap[normalizedUserCondition]) {
    return conditionMap[normalizedUserCondition]
  }

  const fuzzyMappings: Record<string, string[]> = {
    "brand new": ["new"],
    "like new": ["like new", "new other", "pre-owned excellent"],
    excellent: [
      "used excellent",
      "excellent refurbished",
      "certified refurbished",
      "pre-owned excellent",
    ],
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

  for (const cond of allowedConditions) {
    if (
      cond?.item_condition &&
      cond.item_condition.toLowerCase().includes(normalizedUserCondition)
    ) {
      return cond.id
    }
  }

  if (conditionMap["used"]) {
    return conditionMap["used"]
  }

  console.warn(
    `mapConditionToCategoryConditionId: Could not map "${userCondition}". Falling back to: ${allowedConditions[0]?.item_condition} (${allowedConditions[0]?.id})`,
  )
  return allowedConditions[0]?.id || "3000"
}

// Example API route handler:
export async function POST(request: Request) {
  try {
    // Assume JSON body contains { userCondition: string, categoryId: string }
    const { userCondition, categoryId } = await request.json()

    // Fetch allowed conditions from Supabase for this category
    // Example table "conditions" with columns: id, item_condition, category_id
    const { data, error } = await supabase
      .from("conditions")
      .select("id, item_condition")
      .eq("category_id", categoryId)

    if (error) {
      console.error("Supabase error fetching allowed conditions:", error)
      return new Response(
        JSON.stringify({ error: "Failed to fetch allowed conditions" }),
        { status: 500 },
      )
    }

    if (!data || data.length === 0) {
      console.warn(`No allowed conditions found for category ${categoryId}`)
      // You can choose a fallback here or return error
    }

    // Defensive check: filter out any invalid items that lack item_condition
    const allowedConditions = (data || []).filter(
      (c) => c?.item_condition && typeof c.item_condition === "string",
    )

    // Use the mapping function safely
    const mappedConditionId = mapConditionToCategoryConditionId(
      userCondition,
      allowedConditions,
    )

    return new Response(
      JSON.stringify({ conditionId: mappedConditionId }),
      { status: 200 },
    )
  } catch (err) {
    console.error("Unexpected error:", err)
    return new Response(
      JSON.stringify({ error: "Unexpected error" }),
      { status: 500 },
    )
  }
}
