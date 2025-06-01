import { type NextRequest, NextResponse } from "next/server"
import { getValidEbayAccessToken } from "@/lib/ebay/getValidEbayAccessToken"

export async function POST(request: NextRequest) {
  try {
    // Get valid access token (automatically refreshes if needed)
    const token = await getValidEbayAccessToken()
    const locationKey = "GLENVIEW_WAREHOUSE_001" // Hardcoded location key

    // Payload for creating/updating the location
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

    // Make the PUT request to eBay's API
    const res = await fetch(`https://api.ebay.com/sell/inventory/v1/location/${locationKey}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        // Optional: Add marketplace ID header if needed
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
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

    return NextResponse.json(
      {
        success: true,
        locationKey,
        data,
        message: "Location created/updated successfully",
      },
      { status: 200 },
    )
  } catch (error) {
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
