import { NextRequest } from "next/server"

async function refreshAccessToken(): Promise<string | null> {
  const clientId = process.env.EBAY_CLIENT_ID
  const clientSecret = process.env.EBAY_CLIENT_SECRET
  const refreshToken = process.env.EBAY_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) return null

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  const res = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      scope: "https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory"
    })
  })

  const data = await res.json()

  if (!res.ok || !data.access_token) {
    console.error("Failed to refresh eBay token:", data)
    return null
  }

  return data.access_token
}

export async function POST(request: NextRequest) {
  let token = process.env.EBAY_ACCESS_TOKEN
  const locationKey = process.env.EBAY_LOCATION_KEY

  // Refresh token if missing
  if (!token) {
    token = await refreshAccessToken()
    if (!token) {
      return new Response(JSON.stringify({ error: "Failed to obtain eBay token" }), { status: 500 })
    }
  }

  const body = {
    name: "BluBerry Home Shipping",
    locationInstructions: "Shipping from Glenview, IL address.",
    locationTypes: ["WAREHOUSE"],
    address: {
      addressLine1: "333 Parkview Road",
      city: "Glenview",
      stateOrProvince: "IL",
      postalCode: "60025",
      country: "US"
    },
    merchantLocationStatus: "ENABLED"
  }

  const res = await fetch(`https://api.ebay.com/sell/inventory/v1/location/${locationKey}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })

  const data = await res.json()

  if (!res.ok) {
    return new Response(JSON.stringify({ error: true, data }), { status: res.status })
  }

  return new Response(JSON.stringify({ success: true, locationKey, data }), { status: 200 })
}
