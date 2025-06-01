import { NextResponse } from "next/server"

export async function PUT(request: Request) {
  try {
    const locationKey = process.env.EBAY_LOCATION_KEY
    const token = process.env.EBAY_ACCESS_TOKEN

    if (!token) {
      return NextResponse.json({ error: "Missing eBay access token" }, { status: 401 })
    }

    if (!locationKey) {
      return NextResponse.json({ error: "Missing eBay location key" }, { status: 400 })
    }

    const payload = {
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

    const response = await fetch(`https://api.ebay.com/sell/inventory/v1/location/${locationKey}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("eBay API error:", errorText)
      return NextResponse.json(
        { error: `eBay API error: ${response.status}`, details: errorText },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating eBay location:", error)
    return NextResponse.json({ error: "Failed to update eBay location" }, { status: 500 })
  }
}
