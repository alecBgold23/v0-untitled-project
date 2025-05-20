import { getEbayOAuthToken } from "@/lib/ebay-auth"

/**
 * Interface for eBay API search parameters
 */
interface SearchParams {
  q: string
  category_ids?: string
  filter?: string
  sort?: string
  limit?: number
  offset?: number
}

/**
 * Interface for eBay API get item parameters
 */
interface GetItemParams {
  itemId: string
  fieldgroups?: string
}

/**
 * Search for items on eBay
 * @param params Search parameters
 * @returns Search results
 */
export async function searchItems(params: SearchParams) {
  const token = await getEbayOAuthToken()

  // Build query string from params
  const queryParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, value.toString())
    }
  })

  const apiEndpoint = process.env.EBAY_BROWSE_API_ENDPOINT || "https://api.ebay.com/buy/browse/v1"
  const response = await fetch(`${apiEndpoint}/item_summary/search?${queryParams.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("eBay API error:", errorText)
    throw new Error(`eBay API error: ${response.status} - ${errorText}`)
  }

  return await response.json()
}

/**
 * Get details for a specific item
 * @param params Item parameters
 * @returns Item details
 */
export async function getItem(params: GetItemParams) {
  const token = await getEbayOAuthToken()

  let url = `${process.env.EBAY_BROWSE_API_ENDPOINT || "https://api.ebay.com/buy/browse/v1"}/item/${params.itemId}`

  if (params.fieldgroups) {
    url += `?fieldgroups=${params.fieldgroups}`
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("eBay API error:", errorText)
    throw new Error(`eBay API error: ${response.status} - ${errorText}`)
  }

  return await response.json()
}

/**
 * Search for similar completed items to get price estimates
 * @param query Item description or keywords
 * @param categoryId Optional category ID to narrow results
 * @param condition Optional condition filter (new, used, etc.)
 * @returns Array of completed items with prices
 */
export async function getPriceEstimates(query: string, categoryId?: string, condition?: string) {
  // Build filter for completed and sold items
  let filter = "soldItems:SOLD_ITEMS"

  if (condition) {
    filter += `,itemFilter.conditionIds:{${condition}}`
  }

  try {
    const results = await searchItems({
      q: query,
      category_ids: categoryId,
      filter,
      sort: "price",
      limit: 10,
    })

    return results.itemSummaries || []
  } catch (error) {
    console.error("Error getting price estimates from eBay:", error)
    return []
  }
}

/**
 * Calculate average price from a set of similar items
 * @param items Array of items with prices
 * @returns Average price or null if no valid prices
 */
export function calculateAveragePrice(items: any[]) {
  if (!items || items.length === 0) {
    return null
  }

  // Filter items with valid prices
  const validItems = items.filter(
    (item) => item.price && item.price.value && !isNaN(Number.parseFloat(item.price.value)),
  )

  if (validItems.length === 0) {
    return null
  }

  // Calculate average price
  const total = validItems.reduce((sum, item) => sum + Number.parseFloat(item.price.value), 0)
  const average = total / validItems.length

  // Get currency from first item
  const currency = validItems[0].price.currency

  return {
    value: average.toFixed(2),
    currency,
  }
}

/**
 * Get a price estimate for an item based on eBay completed listings
 * @param description Item description
 * @param categoryId Optional category ID
 * @param condition Optional condition (NEW, USED, etc.)
 * @returns Estimated price or null if unable to estimate
 */
export async function getItemPriceEstimate(description: string, categoryId?: string, condition?: string) {
  try {
    // Get similar completed items
    const similarItems = await getPriceEstimates(description, categoryId, condition)

    // Calculate average price
    const averagePrice = calculateAveragePrice(similarItems)

    // Return price data along with reference items
    return {
      estimatedPrice: averagePrice,
      referenceItems: similarItems.slice(0, 5), // Include top 5 reference items
      totalReferences: similarItems.length,
    }
  } catch (error) {
    console.error("Error estimating price from eBay:", error)
    return null
  }
}

/**
 * Maps a human-readable condition to eBay condition ID
 * @param condition Human-readable condition (e.g., "New", "Used", "Like New")
 * @returns eBay condition ID
 */
export function getEbayConditionId(condition: string): string {
  const conditionLower = condition.toLowerCase()

  // eBay condition IDs
  // 1000 = New
  // 1500 = New other (see details)
  // 1750 = New with defects
  // 2000 = Certified refurbished
  // 2500 = Seller refurbished
  // 2750 = Like New
  // 3000 = Used
  // 4000 = Very Good
  // 5000 = Good
  // 6000 = Acceptable
  // 7000 = For parts or not working

  if (conditionLower.includes("new") && !conditionLower.includes("like new")) {
    return "1000"
  } else if (conditionLower.includes("like new") || conditionLower.includes("excellent")) {
    return "2750"
  } else if (conditionLower.includes("very good")) {
    return "4000"
  } else if (conditionLower.includes("good")) {
    return "5000"
  } else if (conditionLower.includes("acceptable") || conditionLower.includes("fair")) {
    return "6000"
  } else if (
    conditionLower.includes("parts") ||
    conditionLower.includes("not working") ||
    conditionLower.includes("poor")
  ) {
    return "7000"
  }

  // Default to used if no match
  return "3000"
}
