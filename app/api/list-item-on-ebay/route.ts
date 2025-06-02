import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAccessToken } from '@/lib/ebay-auth'; // Your eBay OAuth logic
import { createOrReplaceInventoryItem, createOffer, publishOffer, getCategoryIdFromEbay } from '@/lib/ebay-api'; // Assuming these exist or are inlined
import { supabaseAdmin } from '@/lib/supabase-admin'; // Service role Supabase client

const conditionMap: Record<string, string> = {
  'New': '1000',
  'Like New': '2750',
  'Very Good': '4000',
  'Good': '5000',
  'Acceptable': '6000',
  'For parts': '7000',
};

export async function POST(req: NextRequest) {
  try {
    const { itemId } = await req.json();
    if (!itemId) return NextResponse.json({ error: 'Missing itemId' }, { status: 400 });

    const { data: item, error: itemError } = await supabaseAdmin
      .from('sell_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      console.error('Item fetch error:', itemError);
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const token = await getAccessToken();
    if (!token) {
      return NextResponse.json({ error: 'Failed to get eBay access token' }, { status: 500 });
    }

    const sku = `sku-${item.id}-${Date.now()}`;
    const conditionCode = conditionMap[item.condition] || '3000';
    const imageUrls = item.image_url ? [item.image_url] : [];

    // 🔍 Get eBay category ID
    const categoryId = await getCategoryIdFromEbay({
      title: item.name,
      description: item.description,
      token,
      headers: {
        'Content-Language': 'en-US',
        'Accept-Language': 'en-US',
      },
    });

    if (!categoryId) {
      return NextResponse.json({ error: 'Failed to fetch category ID' }, { status: 500 });
    }

    // ✅ Create or Replace Inventory Item
    const inventoryRes = await fetch(`https://api.ebay.com/sell/inventory/v1/inventory_item/${sku}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Language': 'en-US',
        'Accept-Language': 'en-US',
      },
      body: JSON.stringify({
        availability: {
          shipToLocationAvailability: { quantity: 1 },
        },
        condition: conditionCode,
        product: {
          title: item.name,
          description: item.description,
          aspects: {},
          imageUrls,
        },
      }),
    });

    if (!inventoryRes.ok) {
      const err = await inventoryRes.json();
      console.error('Inventory error:', err);
      return NextResponse.json({ error: 'Failed to create inventory item', details: err }, { status: 500 });
    }

    // ✅ Required ENV values
    const { EBAY_RETURN_POLICY_ID, EBAY_PAYMENT_POLICY_ID, EBAY_FULFILLMENT_POLICY_ID, EBAY_LOCATION_KEY } = process.env;

    if (!EBAY_RETURN_POLICY_ID || !EBAY_PAYMENT_POLICY_ID || !EBAY_FULFILLMENT_POLICY_ID || !EBAY_LOCATION_KEY) {
      return NextResponse.json({ error: 'Missing eBay environment variables' }, { status: 500 });
    }

    // ✅ Create Offer
    const offerRes = await fetch('https://api.ebay.com/sell/inventory/v1/offer', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Language': 'en-US',
        'Accept-Language': 'en-US',
      },
      body: JSON.stringify({
        sku,
        marketplaceId: 'EBAY_US',
        format: 'FIXED_PRICE',
        listingDescription: item.description,
        availableQuantity: 1,
        pricingSummary: {
          price: {
            value: item.price?.toString() || '20.00',
            currency: 'USD',
          },
        },
        listingPolicies: {
          returnPolicyId: EBAY_RETURN_POLICY_ID,
          fulfillmentPolicyId: EBAY_FULFILLMENT_POLICY_ID,
          paymentPolicyId: EBAY_PAYMENT_POLICY_ID,
        },
        quantityLimitPerBuyer: 1,
        categoryId,
        merchantLocationKey: EBAY_LOCATION_KEY,
      }),
    });

    const offerData = await offerRes.json();
    if (!offerRes.ok) {
      console.error('Offer creation error:', offerData);
      return NextResponse.json({ error: 'Failed to create offer', details: offerData }, { status: 500 });
    }

    const offerId = offerData.offerId;

    // ✅ Publish Offer
    const publishRes = await fetch(`https://api.ebay.com/sell/inventory/v1/offer/${offerId}/publish/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Language': 'en-US',
        'Accept-Language': 'en-US',
      },
    });

    if (!publishRes.ok) {
      const publishErr = await publishRes.json();
      console.error('Publish error:', publishErr);
      return NextResponse.json({ error: 'Failed to publish offer', details: publishErr }, { status: 500 });
    }

    const { listingId } = await publishRes.json();

    // ✅ Update Supabase
    const { error: updateError } = await supabaseAdmin
      .from('sell_items')
      .update({ ebay_listing_id: listingId, listed: true })
      .eq('id', itemId);

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return NextResponse.json({ error: 'eBay listing successful, but failed to update database' }, { status: 500 });
    }

    return NextResponse.json({ success: true, listingId });

  } catch (err) {
    console.error('General error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
