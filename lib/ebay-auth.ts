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
    return cachedToken.value
  }

  try {
    // Get credentials from environment variables
    const clientId = process.env.EBAY_CLIENT_ID
    const clientSecret = process.env.EBAY_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      throw new Error("eBay API credentials not configured")
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
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("eBay OAuth error:", errorText)
      throw new Error(`eBay OAuth error: ${response.status}`)
    }

    const data = await response.json()

    // Cache the token
    cachedToken = {
      value: data.access_token,
      expires: Date.now() + data.expires_in * 1000 - 60000, // Expire 1 minute early to be safe
    }

    return data.access_token
  } catch (error) {
    console.error("Error getting eBay OAuth token:", error)
    throw error
  }
}
