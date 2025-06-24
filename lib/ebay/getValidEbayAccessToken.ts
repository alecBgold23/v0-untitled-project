import { createClient } from "@supabase/supabase-js"
import { refreshEbayAccessToken } from "./refreshAccessToken"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function getValidEbayAccessToken() {
  console.log("[getValidEbayAccessToken] Fetching token from Supabase...")

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

  console.log(`[getValidEbayAccessToken] Token expires at: ${expiresAt.toISOString()} | Current time: ${now.toISOString()}`)

  // 2. Check if token is expired or expiring soon (buffer 1 minute)
  const timeRemainingMs = expiresAt.getTime() - now.getTime()
  const needsRefresh = now >= expiresAt || timeRemainingMs < 60 * 1000

  if (needsRefresh) {
    console.log("[getValidEbayAccessToken] Token expired or expiring soon. Attempting refresh...")

    try {
      const newAccessToken = await refreshEbayAccessToken()
      console.log("[getValidEbayAccessToken] Token refreshed successfully (first 10 chars):", newAccessToken?.slice(0, 10))
      return newAccessToken
    } catch (error) {
      console.error("[getValidEbayAccessToken] Failed to refresh eBay token:", error)
      throw new Error("Unable to obtain valid eBay access token")
    }
  }

  console.log("[getValidEbayAccessToken] Returning cached token (first 10 chars):", tokenRow.access_token?.slice(0, 10))
  return tokenRow.access_token
}
