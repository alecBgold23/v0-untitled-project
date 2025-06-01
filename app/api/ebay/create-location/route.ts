import { type NextRequest, NextResponse } from "next/server"
import { getValidEbayAccessToken } from "@/lib/ebay/getValidEbayAccessToken"

export async function POST(request: NextRequest) {
  try {
    console.log("Starting eBay location creation...")

    // Get valid access token (automatically refreshes if needed)
    const token = await getValidEbayAccessToken()
    console.log("Successfully obtained eBay access token")

    const locationKey = process.env.EBAY_LOCATION_KEY
    if (!locationKey) {
      console.error("EBAY_LOCATION_KEY environment variable is missing")
      return NextResponse.json({ error: "eBay location key not configured" }, { status: 500 })
    }

    // Simplified payload for basic location creation
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

    console.log("Making request to eBay API with location key:", locationKey)
    console.log("Request payload:", JSON.stringify(body, null, 2))

    const res = await fetch(`https://api.ebay.com/sell/inventory/v1/location/${locationKey}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    console.log("eBay API Response Status:", res.status)
    console.log("eBay API Response:", JSON.stringify(data, null, 2))

    if (!res.ok) {
      console.error("eBay API Error Details:", {
        status: res.status,
        statusText: res.statusText,
        data: data,
      })
      return NextResponse.json(
        {
          error: true,
          message: "eBay API request failed",
          status: res.status,
          data,
        },
        { status: res.status },
      )
    }

    console.log("Location created successfully!")
    return NextResponse.json(
      {
        success: true,
        locationKey,
        data,
        message: "Location created successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Unexpected error in create-location:", error)
    return NextResponse.json(
      {
        error: true,
        message: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
