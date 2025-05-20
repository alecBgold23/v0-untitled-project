import { getEbayOAuthToken, refreshEbayOAuthToken } from "@/lib/ebay-auth"

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
 * Interface for eBay comparable item
 */
export interface EbayComparable {
  title: string
  price: number
  currency: string
  condition: string
  shipping: number | null
  itemId: string
  url: string | null
  imageUrl: string | null
}

/**
 * Search for items on eBay
 * @param params Search parameters
 * @returns Search results
 */
export async function searchItems(params: SearchParams, retryOnAuthError = true) {
  console.log("Searching for eBay items with params:", {
    ...params,
    q: params.q.substring(0, 30) + (params.q.length > 30 ? "..." : ""),
  })

  try {
    const token = await getEbayOAuthToken()

    // Build query string from params
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })

    const apiEndpoint = process.env.EBAY_BROWSE_API_ENDPOINT || "https://api.ebay.com/buy/browse/v1"
    const url = `${apiEndpoint}/item_summary/search?${queryParams.toString()}`

    console.log("eBay API request to:", url.replace(/\?.+/, "?[query-params]")) // Log without the actual query params for security

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
      },
      cache: "no-store",
    })

    // Handle authentication errors by refreshing token and retrying once
    if (response.status === 401 && retryOnAuthError) {
      console.log("eBay API returned 401 Unauthorized, refreshing token and retrying...")
      await refreshEbayOAuthToken()
      return searchItems(params, false) // Retry once with fresh token, but don't retry again
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error("eBay API error response:", errorText)
      throw new Error(`eBay API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log(`eBay search returned ${data.itemSummaries?.length || 0} results`)
    return data
  } catch (error) {
    console.error("Error searching eBay items:", error)
    throw error
  }
}

/**
 * Get details for a specific item
 * @param params Item parameters
 * @returns Item details
 */
export async function getItem(params: GetItemParams, retryOnAuthError = true) {
  try {
    const token = await getEbayOAuthToken()

    let url = `${process.env.EBAY_BROWSE_API_ENDPOINT || "https://api.ebay.com/buy/browse/v1"}/item/${params.itemId}`

    if (params.fieldgroups) {
      url += `?fieldgroups=${params.fieldgroups}`
    }

    console.log("eBay API request for item:", params.itemId)

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
      },
      cache: "no-store",
    })

    // Handle authentication errors by refreshing token and retrying once
    if (response.status === 401 && retryOnAuthError) {
      console.log("eBay API returned 401 Unauthorized, refreshing token and retrying...")
      await refreshEbayOAuthToken()
      return getItem(params, false) // Retry once with fresh token, but don't retry again
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error("eBay API error response:", errorText)
      throw new Error(`eBay API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("Successfully retrieved eBay item:", params.itemId)
    return data
  } catch (error) {
    console.error("Error getting eBay item:", error)
    throw error
  }
}

/**
 * Extract comparable items from eBay search results
 * @param items Array of eBay item summaries
 * @returns Array of comparable items with structured data
 */
export function extractComparables(items: any[]): EbayComparable[] {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return []
  }

  return items.map((item) => {
    // Extract shipping cost if available
    let shippingCost = null
    if (item.shippingOptions && item.shippingOptions.length > 0) {
      const shipping = item.shippingOptions[0]
      if (shipping.shippingCost && shipping.shippingCost.value) {
        shippingCost = Number.parseFloat(shipping.shippingCost.value)
      }
    }

    // Extract condition
    let condition = "Unknown"
    if (item.condition) {
      condition = item.condition
    }

    // Extract price
    let price = 0
    if (item.price && item.price.value) {
      price = Number.parseFloat(item.price.value)
    }

    // Extract URL
    let url = null
    if (item.itemWebUrl) {
      url = item.itemWebUrl
    }

    // Extract image URL
    let imageUrl = null
    if (item.image && item.image.imageUrl) {
      imageUrl = item.image.imageUrl
    }

    return {
      title: item.title || "Unknown Item",
      price,
      currency: item.price?.currency || "USD",
      condition,
      shipping: shippingCost,
      itemId: item.itemId || "unknown",
      url,
      imageUrl,
    }
  })
}

/**
 * Search for similar completed items to get price estimates
 * @param query Item description or keywords
 * @param categoryId Optional category ID to narrow results
 * @param condition Optional condition filter (new, used, etc.)
 * @returns Array of completed items with prices
 */
export async function getPriceEstimates(query: string, categoryId?: string, condition?: string) {
  console.log("Getting eBay price estimates for:", query)

  // Build filter for completed and sold items
  let filter = "soldItems:SOLD_ITEMS"

  if (condition) {
    filter += `,conditionIds:{${condition}}`
  }

  try {
    const results = await searchItems({
      q: query,
      category_ids: categoryId,
      filter,
      sort: "price",
      limit: 10,
    })

    console.log(`Found ${results.itemSummaries?.length || 0} completed items for price estimation`)
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
    console.log("No items provided for price calculation")
    return null
  }

  // Filter items with valid prices
  const validItems = items.filter(
    (item) => item.price && item.price.value && !isNaN(Number.parseFloat(item.price.value)),
  )

  if (validItems.length === 0) {
    console.log("No items with valid prices found")
    return null
  }

  // Calculate average price
  const total = validItems.reduce((sum, item) => sum + Number.parseFloat(item.price.value), 0)
  const average = total / validItems.length

  // Get currency from first item
  const currency = validItems[0].price.currency

  console.log(`Calculated average price: ${average.toFixed(2)} ${currency} from ${validItems.length} items`)

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
    console.log("Estimating price from eBay for:", description)

    // Get similar completed items
    const similarItems = await getPriceEstimates(description, categoryId, condition)

    // Extract structured data for OpenAI
    const comparables = extractComparables(similarItems)

    // Calculate average price
    const averagePrice = calculateAveragePrice(similarItems)

    // Return price data along with reference items
    return {
      estimatedPrice: averagePrice,
      referenceItems: similarItems.slice(0, 5), // Include top 5 reference items
      totalReferences: similarItems.length,
      comparables: comparables.slice(0, 5), // Include structured data for OpenAI
    }
  } catch (error) {
    console.error("Error estimating price from eBay:", error)
    return null
  }
}

/**
 * Map eBay condition IDs to human-readable strings
 */
export const EBAY_CONDITION_MAP = {
  "1000": "New",
  "1500": "New other (see details)",
  "1750": "New with defects",
  "2000": "Certified refurbished",
  "2500": "Seller refurbished",
  "2750": "Like New",
  "3000": "Used",
  "4000": "Very Good",
  "5000": "Good",
  "6000": "Acceptable",
  "7000": "For parts or not working",
}

/**
 * Convert a human-readable condition to eBay condition ID
 * @param condition Human-readable condition
 * @returns eBay condition ID
 */
export function getEbayConditionId(condition: string): string | undefined {
  const conditionLower = condition.toLowerCase()

  if (conditionLower.includes("new") && !conditionLower.includes("like")) {
    return "1000"
  }
  if (conditionLower.includes("like new")) {
    return "2750"
  }
  if (conditionLower.includes("very good")) {
    return "4000"
  }
  if (conditionLower.includes("good")) {
    return "5000"
  }
  if (conditionLower.includes("acceptable") || conditionLower.includes("fair")) {
    return "6000"
  }
  if (conditionLower.includes("parts") || conditionLower.includes("not working") || conditionLower.includes("broken")) {
    return "7000"
  }

  // Default to used
  if (conditionLower.includes("used")) {
    return "3000"
  }

  return undefined
}
