import { getValidEbayAccessToken } from "@/lib/ebay/getValidEbayAccessToken"

interface EbayCondition {
  conditionId: string
  conditionDisplayName: string
}

interface ConditionPolicy {
  itemConditions: EbayCondition[]
}

export async function getValidEbayConditionId(categoryId: string, formCondition: string): Promise<string> {
  console.log(`🔍 Getting valid eBay condition for category ${categoryId}, user condition: "${formCondition}"`)

  try {
    const token = await getValidEbayAccessToken()

    const res = await fetch(
      `https://api.ebay.com/sell/metadata/v1/marketplace/EBAY_US/item_condition_policy?category_ids=${categoryId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (!res.ok) {
      console.warn(`eBay metadata API failed: ${res.status}, falling back to default condition`)
      return "3000" // Default to "Used"
    }

    const data = await res.json()
    const ebayConditions: EbayCondition[] = data.itemConditionPolicies?.[0]?.itemConditions ?? []

    console.log(
      `📋 Available eBay conditions for category ${categoryId}:`,
      ebayConditions.map((c) => `${c.conditionId}: ${c.conditionDisplayName}`),
    )

    if (ebayConditions.length === 0) {
      console.warn("No conditions returned from eBay API, using default")
      return "3000"
    }

    const normalized = formCondition.trim().toLowerCase().replace(/[-_]/g, " ")
    console.log(`🔄 Normalized user condition: "${normalized}"`)

    // Enhanced mapping with more comprehensive condition matching
    const conditionMappings: { [key: string]: string[] } = {
      // New conditions
      new: ["1000", "1500", "1750"], // New, Open box, New other
      "brand new": ["1000"],
      "new in box": ["1000"],
      "new with tags": ["1000"],
      "new without tags": ["1500"],
      "open box": ["1500"],
      "new other": ["1750"],

      // Like new conditions
      "like new": ["1500", "1750", "2000", "2500"], // Open box, New other, Manufacturer refurbished, Seller refurbished
      mint: ["1500", "2000"],
      pristine: ["1500", "2000"],

      // Refurbished conditions
      "manufacturer refurbished": ["2000"],
      "seller refurbished": ["2500"],
      refurbished: ["2000", "2500"],
      remanufactured: ["2750"],

      // Used conditions - ordered by quality
      excellent: ["3000", "4000", "5000"], // Used, Very Good, Good
      "very good": ["4000", "3000"],
      good: ["5000", "4000", "3000"],
      used: ["3000", "4000", "5000"],
      acceptable: ["6000", "5000"],
      fair: ["6000", "7000"],

      // Poor/broken conditions
      poor: ["7000"],
      "for parts": ["7000"],
      "not working": ["7000"],
      broken: ["7000"],
      "for parts or not working": ["7000"],
      "does not work": ["7000"],
      "parts only": ["7000"],
    }

    // Find matching condition IDs for the user's input
    const preferredIds = conditionMappings[normalized] ?? ["3000"] // Default to "Used"
    console.log(`🎯 Preferred condition IDs for "${normalized}": [${preferredIds.join(", ")}]`)

    // Try to find the best match from available conditions
    for (const preferredId of preferredIds) {
      const matchingCondition = ebayConditions.find((c) => c.conditionId === preferredId)
      if (matchingCondition) {
        console.log(`✅ Found matching condition: ${preferredId} (${matchingCondition.conditionDisplayName})`)
        return preferredId
      }
    }

    // If no exact match, try to find the closest condition based on condition hierarchy
    const conditionHierarchy = ["1000", "1500", "1750", "2000", "2500", "2750", "3000", "4000", "5000", "6000", "7000"]
    const userPreferredId = preferredIds[0]
    const userIndex = conditionHierarchy.indexOf(userPreferredId)

    if (userIndex !== -1) {
      // Look for conditions near the user's preference
      for (let offset = 0; offset < conditionHierarchy.length; offset++) {
        // Check both directions from user's preference
        const indices = [userIndex + offset, userIndex - offset].filter((i) => i >= 0 && i < conditionHierarchy.length)

        for (const index of indices) {
          const conditionId = conditionHierarchy[index]
          const matchingCondition = ebayConditions.find((c) => c.conditionId === conditionId)
          if (matchingCondition) {
            console.log(
              `🔄 Using closest available condition: ${conditionId} (${matchingCondition.conditionDisplayName})`,
            )
            return conditionId
          }
        }
      }
    }

    // Final fallback: return the first available condition
    const fallbackCondition = ebayConditions[0]
    console.log(
      `⚠️ Using fallback condition: ${fallbackCondition.conditionId} (${fallbackCondition.conditionDisplayName})`,
    )
    return fallbackCondition.conditionId
  } catch (error) {
    console.error("Error getting valid eBay condition:", error)
    console.log("🔄 Falling back to default condition: 3000 (Used)")
    return "3000" // Safe fallback to "Used"
  }
}

// Helper function to get condition display name for logging
export async function getConditionDisplayName(categoryId: string, conditionId: string): Promise<string> {
  try {
    const token = await getValidEbayAccessToken()
    const res = await fetch(
      `https://api.ebay.com/sell/metadata/v1/marketplace/EBAY_US/item_condition_policy?category_ids=${categoryId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (res.ok) {
      const data = await res.json()
      const ebayConditions: EbayCondition[] = data.itemConditionPolicies?.[0]?.itemConditions ?? []
      const condition = ebayConditions.find((c) => c.conditionId === conditionId)
      return condition?.conditionDisplayName || conditionId
    }
  } catch (error) {
    console.error("Error getting condition display name:", error)
  }
  return conditionId
}
