import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function refreshEbayAccessToken() {
  const clientId = process.env.EBAY_CLIENT_ID
  const clientSecret = process.env.EBAY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("Missing eBay client ID or secret")
  }

  // 1. Get current refresh token from Supabase
  const { data: tokenRow, error } = await supabase
    .from('ebay_tokens')
    .select('refresh_token')
    .single()

  if (error || !tokenRow?.refresh_token) {
    throw new Error("Could not retrieve refresh token from database")
  }

  const refreshToken = tokenRow.refresh_token

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    scope: "https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory",
  })

  // 2. Request new tokens from eBay
  const res = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(`Failed to refresh token: ${JSON.stringify(data)}`)
  }

  // 3. Calculate token expiry timestamp (current time + expires_in seconds)
  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString()

  // 4. Update tokens in Supabase
  const { error: updateError } = await supabase
    .from('ebay_tokens')
    .update({
      access_token: data.access_token,
      refresh_token: data.refresh_token || refreshToken, // use new refresh token if provided
      expires_at: expiresAt,
    })
    .match({ id: tokenRow.id })

  if (updateError) {
    throw new Error("Failed to update tokens in database: " + updateError.message)
  }

  // 5. Return fresh access token for use
  return data.access_token
}
