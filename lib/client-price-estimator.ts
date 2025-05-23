/**
 * Client-side price estimation function
 * This is a simplified version that runs in the browser
 */
export function estimateItemPrice(
  description: string,
  name?: string,
  condition?: string,
  issues?: string,
): {
  price: string
  minPrice?: number
  maxPrice?: number
  error?: string
} {
  console.log("Client-side price estimation called for:", name || description)

  // In a real implementation, this would call the API
  // For now, we'll return a placeholder and let the server handle it
  return {
    price: "Calculating...",
  }
}

/**
 * Server-side price estimation function that calls the API
 */
export async function estimateItemPriceFromAPI(
  description: string,
  name?: string,
  condition?: string,
  issues?: string,
): Promise<{
  price: string
  priceRange?: string
  minPrice?: number
  maxPrice?: number
  source?: string
  error?: string
}> {
  try {
    console.log("Calling price estimation API for:", name || description)

    // Add a timestamp to prevent caching
    const timestamp = new Date().getTime()

    const response = await fetch(`/api/estimate-price?t=${timestamp}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        itemName: name || "",
        briefDescription: description || "",
        condition: condition || "Good",
        issues: issues || "",
      }),
      // Ensure we don't use cached responses
      cache: "no-store",
    })

    const data = await response.json()
    console.log("Price estimation API response:", data)

    // Check for API errors
    if (data.error) {
      return {
        error: data.error,
      }
    }

    // If we have a valid price
    if (data.price || data.priceRange) {
      return {
        price: data.price ? `$${data.price}` : data.priceRange,
        priceRange: data.priceRange,
        minPrice: data.minPrice ? Number(data.minPrice) : undefined,
        maxPrice: data.maxPrice ? Number(data.maxPrice) : undefined,
        source: data.source,
      }
    }

    // If we don't have a price but no error was returned
    return {
      error: "Unable to generate a price estimate. Please try again later.",
    }
  } catch (error) {
    console.error("Error estimating price from API:", error)
    return {
      error: "Failed to connect to pricing service. Please try again later.",
    }
  }
}
