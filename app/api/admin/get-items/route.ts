import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {

  try {
    const body = await req.json();
    const { platform, sku, title, description, price, quantity } = body;

    // Validate input
    if (!platform || !sku || !title || !description || !price || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (platform === "amazon") {
      // Handle Amazon Listing
      return await handleAmazonListing({ sku, title, description, price, quantity });
    } else if (platform === "ebay") {
      // Handle eBay Listing
      return await handleEbayListing({ sku, title, description, price, quantity });
    } else {
      return NextResponse.json(
        { error: "Invalid platform specified" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error processing request:", error.response?.data || error.message);
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}

// Amazon Listing Handler
async function handleAmazonListing({ sku, title, description, price, quantity }: any) {
  
  try {
    // Step 1: Get Access Token
    const tokenResponse = await axios.post(
      "https://api.amazon.com/auth/o2/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: process.env.AMAZON_REFRESH_TOKEN!,
        client_id: process.env.CLIENT_IDENTIFIER!,
        client_secret: process.env.CLIENT_SECRET!,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Step 2: Create Listing
    const apiResponse = await axios.post(
      `${process.env.SP_API_URL}/listings/2021-08-01/items`,
      {
        sku,
        productType: "PRODUCT",
        attributes: {
          title,
          description,
          price: { currencyCode: "USD", amount: price },
          quantity,
        },
        marketplaceId: "ATVPDKIKX0DER",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-amz-access-token": accessToken,
          "Content-Type": "application/json",
        },
      }
    );
    return NextResponse.json({
      message: "Item listed successfully on Amazon",
      data: apiResponse.data,
    });
  } catch (error: any) {
    console.error("Amazon API Error:", error.response?.data || error.message);
    return NextResponse.json(
      {
        error: "Failed to list item on Amazon",
        details: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}

// eBay Listing Handler
async function handleEbayListing({ sku, title, description, price, quantity }: any) {
  try {
    // Step 1: Get Access Token
    const tokenResponse = await axios.post(
      "https://api.ebay.com/identity/v1/oauth2/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        scope: "https://api.ebay.com/oauth/api_scope/sell.inventory",
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        auth: {
          username: process.env.EBAY_CLIENT_ID!,
          password: process.env.EBAY_CLIENT_SECRET!,
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    
console.log('1111accessToken, process.env')
console.log(accessToken)

    // Step 2: Create Inventory Item
    await axios.put(
      `https://api.ebay.com/sell/inventory/v1/inventory_item/${sku}`,
      {
        sku,
        product: {
          title,
          description,
          aspects: {}, // Add item aspects as needed
        },
        availability: {
          shipToLocationAvailability: {
            quantity,
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Step 3: Create Offer
    const offerResponse = await axios.post(
      "https://api.ebay.com/sell/inventory/v1/offer",
      {
        sku,
        marketplaceId: "EBAY_US",
        format: "FIXED_PRICE",
        listingPolicies: {
          paymentPolicyId: "YOUR_PAYMENT_POLICY_ID",
          returnPolicyId: "YOUR_RETURN_POLICY_ID",
          fulfillmentPolicyId: "YOUR_FULFILLMENT_POLICY_ID",
        },
        availableQuantity: quantity,
        price: { value: price, currency: "USD" },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const offerId = offerResponse.data.offerId;

    // Step 4: Publish the Offer
    await axios.post(
      `https://api.ebay.com/sell/inventory/v1/offer/${offerId}/publish`,
      null,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return NextResponse.json({
      message: "Item listed successfully on eBay",
      offerId,
    });
  } catch (error: any) {
    console.error("eBay API Error:", error.response?.data || error.message);
    return NextResponse.json(
      {
        error: "Failed to list item on eBay",
        details: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}
