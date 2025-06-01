import { type NextRequest, NextResponse } from "next/server"
import { getValidEbayAccessToken } from "@/lib/ebay/getValidEbayAccessToken"

export async function POST(request: NextRequest) {
  try {
    console.log("Starting eBay location creation...")

    // Get valid access token (automatically refreshes if needed)
    const token = await getValidEbayAccessToken()
    console.log("Successfully obtained eBay access token")

    // Payload for creating a NEW location
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

    console.log("Making request to eBay API to CREATE new location")
    console.log("Request payload:", JSON.stringify(body, null, 2))

    // POST to create a NEW location (eBay will generate the location key)
    const res = await fetch("https://api.ebay.com/sell/inventory/v1/location", {
      method: "POST",
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

    // Extract the new location key from eBay's response
    const newLocationKey = data.merchantLocationKey || data.locationKey

    console.log("Location created successfully!")
    console.log("New location key:", newLocationKey)

    return NextResponse.json(
      {
        success: true,
        newLocationKey,
        data,
        message: "New location created successfully",
      },
      { status: 201 }, // 201 for resource creation
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
