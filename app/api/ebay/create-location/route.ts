import { type NextRequest, NextResponse } from "next/server"
import { getValidEbayAccessToken } from "@/lib/ebay/getValidEbayAccessToken"

export async function POST(request: NextRequest) {
  try {
    const token = await getValidEbayAccessToken()
    const merchantLocationKey = "GLENVIEW_WAREHOUSE_002" // your unique key

    const body = {
      name: "BluBerry Home Shipping",
      phone: "847-510-3229",
      location: {
        address: {
          addressLine1: "333 Parkview Road",
          city: "Glenview",
          stateOrProvince: "IL",
          postalCode: "60025",
          country: "US",
        },
      },
      locationTypes: ["WAREHOUSE"],
      merchantLocationStatus: "ENABLED",
    }

    const res = await fetch(
      `https://api.ebay.com/sell/inventory/v1/location/${merchantLocationKey}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      }
    )

    if (res.status === 204) {
      // success returns 204 No Content with empty body
      return NextResponse.json(
        {
          success: true,
          message: "Location created successfully",
        },
        { status: 200 }
      )
    }

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        {
          error: true,
          message: "eBay API request failed",
          status: res.status,
          data,
        },
        { status: res.status }
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: true,
        message: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
