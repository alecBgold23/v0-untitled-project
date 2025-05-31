import type { NextRequest } from "next/server"
import { getValidEbayAccessToken } from "@/lib/ebay/getValidEbayAccessToken"

export async function POST(request: NextRequest) {
  try {
    // Get valid token (automatically refreshes if needed)
    const token = await getValidEbayAccessToken()
    const locationKey = process.env.EBAY_LOCATION_KEY

    if (!locationKey) {
      return new Response(JSON.stringify({ error: "Missing EBAY_LOCATION_KEY" }), { status: 500 })
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
        country: "US",
      },
      merchantLocationStatus: "ENABLED",
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
  } catch (error) {
    console.error("Error in create-location:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to create location",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 },
    )
  }
}
