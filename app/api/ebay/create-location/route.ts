import { NextResponse } from "next/server"
import { getValidEbayAccessToken } from "@/lib/ebay/getValidEbayAccessToken"

export async function POST() {
  try {
    console.log("🏠 Creating eBay merchant location...")
    
    // Get a valid eBay access token
    const accessToken = await getValidEbayAccessToken()
    
    // Generate a unique location key
    const locationKey = `loc_${Date.now()}`
    
    // Create the location with the required fields
    const body = {
      location: {
        address: {
          addressLine1: "123 Main St",
          city: "Glenview",
          stateOrProvince: "IL",
          postalCode: "60025", // Added postal code
          country: "US"
        },
        name: "My Store Location",
        phone: "+1-800-555-1234",
        merchantLocationStatus: "ENABLED"
      },
      locationTypes: ["STORE"],
      merchantLocationKey: locationKey
    }
    
    // Make the API call to create the location
    const response = await fetch("https://api.ebay.com/sell/inventory/v1/location", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json"
      },
      body: JSON.stringify(body)
    })
    
    // Get the response as text first for debugging
    const responseText = await response.text()
    console.log("📝 eBay location creation response:", responseText)
    
    // Check if the request was successful
    if (!response.ok) {
      console.error("❌ Failed to create eBay location:", response.status, responseText)
      return NextResponse.json({ 
        success: false, 
        error: `Failed to create location: ${response.status}`,
        details: responseText
      }, { status: response.status })
    }
    
    // Return success with the location key
    console.log("✅ eBay location created successfully with key:", locationKey)
    return NextResponse.json({ 
      success: true, 
      locationKey,
      message: "Location created successfully"
    })
    
  } catch (error: any) {
    console.error("❌ Error creating eBay location:", error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Unknown error occurred"
    }, { status: 500 })
  }
}
