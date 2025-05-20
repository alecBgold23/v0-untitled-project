/**
 * eBay OAuth authentication utility
 */

// Cache the token to avoid unnecessary requests
let cachedToken: { value: string; expires: number } | null = null

/**
 * Get an OAuth token for eBay API access
 * @returns A valid OAuth token
 */
export async function getEbayOAuthToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && cachedToken.expires > Date.now()) {
    console.log(
      "Using cached eBay OAuth token (expires in " +
        Math.round((cachedToken.expires - Date.now()) / 1000) +
        " seconds)",
    )
    return cachedToken.value
  }

  try {
    console.log("Requesting new eBay OAuth token at " + new Date().toISOString())

    // Get credentials from environment variables
    const clientId = process.env.EBAY_CLIENT_ID
    const clientSecret = process.env.EBAY_CLIENT_SECRET

    if (!clientId) {
      throw new Error("eBay API client ID not configured - check EBAY_CLIENT_ID environment variable")
    }

    if (!clientSecret) {
      throw new Error("eBay API client secret not configured - check EBAY_CLIENT_SECRET environment variable")
    }

    // Create Basic Auth header
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

    // Request a new token
    const response = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("eBay OAuth error response:", errorText)
      throw new Error(`eBay OAuth error ${response.status}: ${errorText}`)
    }

    const data = await response.json()

    if (!data.access_token) {
      throw new Error("eBay OAuth response missing access_token")
    }

    // Cache the token
    cachedToken = {
      value: data.access_token,
      expires: Date.now() + data.expires_in * 1000 - 60000, // Expire 1 minute early to be safe
    }

    console.log(`Successfully obtained eBay OAuth token (expires in ${data.expires_in} seconds)`)
    return data.access_token
  } catch (error) {
    console.error("Error getting eBay OAuth token:", error)
    throw error
  }
}

/**
 * Force refresh the eBay OAuth token
 * @returns A new OAuth token
 */
export async function refreshEbayOAuthToken(): Promise<string> {
  // Clear the cached token
  cachedToken = null
  // Get a new token
  return getEbayOAuthToken()
}
