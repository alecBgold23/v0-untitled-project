import { createClient } from "@supabase/supabase-js"
import { refreshEbayAccessToken } from "./refreshAccessToken"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function getValidEbayAccessToken(): Promise<string> {
  try {
    // 1. Fetch tokens and expiry from Supabase
    const { data: tokenRow, error } = await supabase
      .from("ebay_tokens")
      .select("access_token, refresh_token, expires_at, id")
      .eq("id", "singleton")
      .single()

    if (error || !tokenRow) {
      throw new Error(`Failed to fetch tokens from database: ${error?.message || "No token found"}`)
    }

    if (!tokenRow.access_token) {
      throw new Error("No access token found in database")
    }

    const expiresAt = new Date(tokenRow.expires_at)
    const now = new Date()

    // 2. Check if token is expired or expiring soon (buffer 1 minute)
    if (now >= expiresAt || expiresAt.getTime() - now.getTime() < 60 * 1000) {
      console.log("Token expired or expiring soon, refreshing...")

      // Token expired or about to expire → refresh
      try {
        const newAccessToken = await refreshEbayAccessToken()
        if (!newAccessToken) {
          throw new Error("Failed to refresh token - no new token returned")
        }
        console.log("Token refreshed successfully")
        return newAccessToken
      } catch (refreshError) {
        console.error("Failed to refresh eBay token:", refreshError)
        throw new Error(
          `Unable to refresh eBay access token: ${refreshError instanceof Error ? refreshError.message : "Unknown error"}`,
        )
      }
    }

    // 3. Token valid, return current access token
    console.log("Using existing valid token")
    return tokenRow.access_token
  } catch (error) {
    console.error("Error in getValidEbayAccessToken:", error)
    throw new Error(
      `Failed to get valid eBay access token: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}
