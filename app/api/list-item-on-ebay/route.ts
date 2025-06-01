import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import eBayApi from "ebay-api";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize eBay API client (production only)
const eBay = new eBayApi({
  appId: process.env.EBAY_APP_ID!,
  certId: process.env.EBAY_CLIENT_SECRET!,
  sandbox: false, // Production mode
  marketplaceId: eBayApi.MarketplaceId.EBAY_US,
  siteId: eBayApi.SiteId.EBAY_US,
  acceptLanguage: eBayApi.Locale.en_US,
  contentLanguage: eBayApi.Locale.en_US,
  authToken: process.env.EBAY_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    // 1. Get submission ID from request body
    const { id } = await request.json();

    // 2. Fetch the full item data from Supabase
    const { data: submission, error: fetchError } = await supabase
      .from("sell_items")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json(
        { error: "Item not found or error fetching data" },
        { status: 404 }
      );
    }

    // 3. Prepare inventory item payload for eBay
    const inventoryItem = {
      sku: `item-${submission.id}`,
      condition: submission.item_condition || "NEW",
      product: {
        title: submission.item_name,
        description: submission.item_description,
        imageUrls: submission.image_url
          ? submission.image_url.split(',').map(url => url.trim())
          : [],
      },
      // Add more fields as required by eBay
    };

    // 4. Create or replace inventory item
    const inventoryItemResponse = await eBay.sell.inventory.createOrReplaceInventoryItem(
      inventoryItem.sku,
      inventoryItem
    );

    // 5. Prepare offer payload for eBay
    const offer = {
      sku: inventoryItem.sku,
      marketplaceId: eBayApi.MarketplaceId.EBAY_US,
      format: "FIXED_PRICE",
      listingPolicies: {
        fulfillmentPolicyId: process.env.EBAY_FULFILLMENT_POLICY_ID!,
        paymentPolicyId: process.env.EBAY_PAYMENT_POLICY_ID!,
        returnPolicyId: process.env.EBAY_RETURN_POLICY_ID!,
      },
      pricingSummary: {
        price: {
          value: submission.estimated_price,
          currency: "USD",
        },
      },
      // availableQuantity: 1, // Uncomment and set if needed
      // categoryId: "YOUR_CATEGORY_ID", // Uncomment and set if needed
    };

    // 6. Create offer
    const offerResponse = await eBay.sell.inventory.createOffer(offer);

    // 7. Publish offer
    const publishResponse = await eBay.sell.inventory.publishOffer(offerResponse.offerId);

    // 8. Update status in Supabase to "listed"
    const { error: updateError } = await supabase
      .from("sell_items")
      .update({ status: "listed" })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update status in Supabase" },
        { status: 500 }
      );
    }

    // 9. Return success
    return NextResponse.json({
      success: true,
      offerId: offerResponse.offerId,
      listingId: publishResponse.listingId,
    });

  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to list item on eBay: " + (e.message || "Unknown error") },
      { status: 500 }
    );
  }
}
