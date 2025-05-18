const EBAY_CLIENT_ID = process.env.EBAY_CLIENT_ID!
const EBAY_CLIENT_SECRET = process.env.EBAY_CLIENT_SECRET!

// Store token and expiry in memory
let cachedToken: string | null = null
let tokenExpiresAt = 0

/**
 * Gets a valid OAuth token for eBay API requests
 * Returns cached token if still valid, otherwise requests a new one
 */
export async function getEbayOAuthToken(): Promise<string> {
  const now = Date.now()

  // If cached token is still valid, return it
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken
  }

  // Otherwise request a new token from eBay
  const basicAuth = Buffer.from(`${EBAY_CLIENT_ID}:${EBAY_CLIENT_SECRET}`).toString("base64")

  const res = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Failed to get eBay OAuth token: ${errorText}`)
  }

  const data = await res.json()

  cachedToken = data.access_token
  // data.expires_in is in seconds, convert to ms and add to now
  tokenExpiresAt = now + data.expires_in * 1000 - 60000 // minus 60 seconds to be safe

  return cachedToken
}
