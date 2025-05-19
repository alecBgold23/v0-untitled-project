/**
 * Search for items on eBay
 */
export async function searchItems(query: string, limit = 10) {
  try {
    const response = await fetch(`/api/ebay-search?query=${encodeURIComponent(query)}&limit=${limit}`)

    if (!response.ok) {
      throw new Error(`eBay search failed: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error searching eBay:", error)
    return { items: [] }
  }
}

/**
 * Get price estimates for an item
 */
export async function getItemPriceEstimate(title: string) {
  try {
    const response = await fetch(`/api/ebay-price-estimate?title=${encodeURIComponent(title)}`)

    if (!response.ok) {
      throw new Error(`eBay price estimate failed: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting eBay price estimate:", error)
    return {
      averagePrice: null,
      priceRange: null,
      confidence: "low",
      items: [],
    }
  }
}
