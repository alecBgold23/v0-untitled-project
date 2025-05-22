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
}> {
  try {
    console.log("Calling price estimation API for:", name || description)

    const response = await fetch("/api/estimate-price", {
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
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    console.log("Price estimation API response:", data)

    return {
      price: data.price ? `$${data.price}` : data.priceRange || "$25",
      priceRange: data.priceRange,
      minPrice: data.minPrice ? Number(data.minPrice) : undefined,
      maxPrice: data.maxPrice ? Number(data.maxPrice) : undefined,
      source: data.source,
    }
  } catch (error) {
    console.error("Error estimating price from API:", error)
    return {
      price: "$25",
      source: "fallback",
    }
  }
}
