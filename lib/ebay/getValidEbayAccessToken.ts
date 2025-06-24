export async function getValidEbayAccessToken() {
  // 1. Fetch tokens and expiry from Supabase
  const { data: tokenRow, error } = await supabase
    .from("ebay_tokens")
    .select("access_token, refresh_token, expires_at, id")
    .single()

  if (error || !tokenRow) {
    console.error("[getValidEbayAccessToken] Failed to fetch tokens from Supabase:", error)
    throw new Error("Failed to fetch tokens from database")
  }

  const expiresAt = new Date(tokenRow.expires_at)
  const now = new Date()
  console.log(`[getValidEbayAccessToken] Token expires at: ${expiresAt.toISOString()}, now: ${now.toISOString()}`)

  // 2. Check if token is expired or about to expire
  if (now >= expiresAt || expiresAt.getTime() - now.getTime() < 60 * 1000) {
    console.log("[getValidEbayAccessToken] Token expired or near expiry. Refreshing...")

    try {
      const newAccessToken = await refreshEbayAccessToken()
      console.log("[getValidEbayAccessToken] Refreshed access token (first 10):", newAccessToken?.slice(0, 10))
      return newAccessToken
    } catch (error) {
      console.error("[getValidEbayAccessToken] Failed to refresh eBay token:", error)
      throw new Error("Unable to obtain valid eBay access token")
    }
  }

  console.log("[getValidEbayAccessToken] Returning cached token (first 10):", tokenRow.access_token?.slice(0, 10))
  return tokenRow.access_token
}
