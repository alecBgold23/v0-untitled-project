import { type NextRequest, NextResponse } from "next/server";
import { getValidEbayAccessToken } from "@/lib/ebay/getValidEbayAccessToken";

export async function POST(request: NextRequest) {
  try {
    const token = await getValidEbayAccessToken();
    const locationKey = "GLENVIEW_WAREHOUSE_001";

    const body = {
      location: {
        address: {
          city: "Glenview",
          stateOrProvince: "IL",
          country: "US"
        }
      },
      name: "BluBerry Home Shipping",
      merchantLocationStatus: "ENABLED",
      locationTypes: ["WAREHOUSE"],
      phone: "847-510-3229"
    };

    const res = await fetch(
      `https://api.ebay.com/sell/inventory/v1/location/${locationKey}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {
          error: true,
          message: "eBay API request failed",
          status: res.status,
          data,
        },
        { status: res.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        locationKey,
        data,
        message: "Location created/updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: true,
        message: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
