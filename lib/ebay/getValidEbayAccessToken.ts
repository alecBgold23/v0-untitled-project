import { createClient } from "@supabase/supabase-js"
import { refreshEbayAccessToken } from "./refreshAccessToken"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function getValidEbayAccessToken() {
  // 1. Fetch tokens and expiry from Supabase
  const { data: tokenRow, error } = await supabase
    .from("ebay_tokens")
    .select("access_token, refresh_token, expires_at, id")
    .single()

  if (error || !tokenRow) {
    throw new Error("Failed to fetch tokens from database")
  }

  const expiresAt = new Date(tokenRow.expires_at)
  const now = new Date()

  // 2. Check if token is expired or expiring soon (buffer 1 minute)
  if (now >= expiresAt || expiresAt.getTime() - now.getTime() < 60 * 1000) {
    // Token expired or about to expire → refresh
    try {
      const newAccessToken = await refreshEbayAccessToken()
      return newAccessToken
    } catch (error) {
      console.error("Failed to refresh eBay token:", error)
      throw new Error("Unable to obtain valid eBay access token")
    }
  }

  // 3. Token valid, return current access token
  return tokenRow.access_token
}
