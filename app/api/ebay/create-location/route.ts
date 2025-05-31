import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  const token = process.env.EBAY_ACCESS_TOKEN
  const locationKey = "GLENVIEW_HOME_SHIP"

  const body = {
    name: "BluBerry Home Shipping",
    locationInstructions: "Ships from Glenview USPS drop-off.",
    locationTypes: ["STORE"],
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
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  if (!res.ok) {
    return new Response(JSON.stringify({ error: true, data }), { status: res.status })
  }

  return new Response(JSON.stringify({ success: true, locationKey, data }), { status: 200 })
}
