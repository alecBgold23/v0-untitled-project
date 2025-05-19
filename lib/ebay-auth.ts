// This is a browser-compatible version of the ebay-auth utility

/**
 * Get an OAuth token for the eBay API
 * @returns The OAuth token or null if an error occurs
 */
export async function getEbayOAuthToken(): Promise<string | null> {
  try {
    // In a browser environment, we'll use the API route instead
    const response = await fetch("/api/ebay-auth", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("Error getting eBay OAuth token:", await response.text())
      return null
    }

    const data = await response.json()
    return data.token
  } catch (error: any) {
    console.error("Error getting eBay OAuth token:", error)
    return null
  }
}

/**
 * Check if the eBay API is configured
 * @returns Boolean indicating if the eBay API is configured
 */
export function isEbayConfigured(): boolean {
  return !!(process.env.EBAY_CLIENT_ID && process.env.EBAY_CLIENT_SECRET)
}
