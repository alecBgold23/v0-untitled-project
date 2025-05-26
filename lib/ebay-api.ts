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
  // Build filter for completed and sold items - Browse API uses different filters
  let filter = "buyingOptions:{AUCTION|FIXED_PRICE}"

  if (condition) {
    filter += `,conditionIds:{${getEbayConditionId(condition)}}`
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
 * Maps a human-readable condition to eBay condition ID with comprehensive mapping
 * @param condition Human-readable condition (e.g., "New", "Used", "Like New")
 * @returns eBay condition ID
 */
export function getEbayConditionId(condition: string): string {
  const conditionLower = condition.toLowerCase().trim()

  // eBay condition IDs - comprehensive mapping
  // https://developer.ebay.com/api-docs/sell/inventory/types/slr:ConditionEnum

  // New conditions
  if (conditionLower.includes("brand new") || conditionLower === "new") {
    return "1000" // New
  }

  if (conditionLower.includes("new with defects") || conditionLower.includes("new other")) {
    return "1500" // New with defects
  }

  if (conditionLower.includes("new without tags") || conditionLower.includes("new no tags")) {
    return "1750" // New without tags
  }

  if (conditionLower.includes("like new") || conditionLower.includes("open box") || conditionLower.includes("mint")) {
    return "1500" // New with defects (closest to like new)
  }

  // Refurbished conditions
  if (conditionLower.includes("certified refurbished") || conditionLower.includes("manufacturer refurbished")) {
    return "2000" // Certified Refurbished
  }

  if (conditionLower.includes("excellent refurbished") || conditionLower.includes("refurbished excellent")) {
    return "2500" // Excellent - Refurbished
  }

  if (conditionLower.includes("very good refurbished") || conditionLower.includes("refurbished very good")) {
    return "2750" // Very Good - Refurbished
  }

  if (conditionLower.includes("good refurbished") || conditionLower.includes("refurbished good")) {
    return "3000" // Good - Refurbished
  }

  // Used conditions
  if (conditionLower.includes("excellent") && !conditionLower.includes("refurbished")) {
    return "4000" // Very Good
  }

  if (conditionLower.includes("very good") && !conditionLower.includes("refurbished")) {
    return "4000" // Very Good
  }

  if (conditionLower.includes("good") && !conditionLower.includes("refurbished")) {
    return "5000" // Good
  }

  if (conditionLower.includes("fair") || conditionLower.includes("acceptable")) {
    return "6000" // Acceptable
  }

  if (conditionLower.includes("poor") || conditionLower.includes("heavily used")) {
    return "7000" // For parts or not working
  }

  if (conditionLower.includes("parts") || conditionLower.includes("not working") || conditionLower.includes("broken")) {
    return "7000" // For parts or not working
  }

  // Default to Good for unspecified used items
  return "5000" // Good
}

/**
 * Get comprehensive condition filter for eBay search
 * @param condition User-specified condition preference
 * @returns eBay condition filter string
 */
export function getConditionFilter(condition?: string): string {
  if (!condition || condition.toLowerCase() === "all") {
    // Include all conditions for maximum sample size
    return "conditionIds:{1000|1500|1750|2000|2500|2750|3000|4000|5000|6000|7000}"
  }

  const conditionLower = condition.toLowerCase()

  if (conditionLower.includes("new")) {
    return "conditionIds:{1000|1500|1750}" // All new conditions
  }

  if (conditionLower.includes("refurbished")) {
    return "conditionIds:{2000|2500|2750|3000}" // All refurbished conditions
  }

  if (conditionLower.includes("used")) {
    return "conditionIds:{4000|5000|6000}" // All used conditions
  }

  // Default to specific condition
  return `conditionIds:{${getEbayConditionId(condition)}}`
}
