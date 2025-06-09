import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { unlistItemFromEbay } from "@/lib/ebay/unlisting"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    console.log("🚀 Starting eBay unlisting process...")

    const { id } = await request.json()
    if (!id) {
      console.error("❌ No item ID provided")
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 })
    }

    console.log(`📝 Processing item ID for unlisting: ${id}`)

    // Get the item from database to find the eBay offer ID
    const { data: submission, error } = await supabase.from("sell_items").select("*").eq("id", id).single()

    if (error || !submission) {
      console.error("❌ Item not found:", error)
      return NextResponse.json({ error: "Item not found or error fetching data" }, { status: 404 })
    }

    // Check if item has an eBay offer ID
    if (!submission.ebay_offer_id) {
      console.log("ℹ️ Item was not listed on eBay, skipping unlisting")
      return NextResponse.json({
        success: true,
        message: "Item was not listed on eBay",
        skipped: true,
      })
    }

    console.log(`📝 Found eBay offer ID: ${submission.ebay_offer_id}`)

    try {
      // Attempt to unlist from eBay
      await unlistItemFromEbay(submission.ebay_offer_id)
      console.log("✅ Successfully unlisted item from eBay")

      // Update database to reflect unlisting
      const { error: updateError } = await supabase
        .from("sell_items")
        .update({
          listed_on_ebay: false,
          status: "rejected",
          unlisted_date: new Date().toISOString(),
        })
        .eq("id", id)

      if (updateError) {
        console.error("❌ Failed to update database after unlisting:", updateError)
        // Don't fail the request since eBay unlisting succeeded
      }

      return NextResponse.json({
        success: true,
        message: "Item successfully unlisted from eBay and rejected",
        unlisted: true,
      })
    } catch (ebayError) {
      console.error("❌ Failed to unlist from eBay:", ebayError)

      // Still update the database to mark as rejected, even if eBay unlisting failed
      const { error: updateError } = await supabase
        .from("sell_items")
        .update({
          status: "rejected",
          unlisting_error: ebayError instanceof Error ? ebayError.message : "Unknown error",
        })
        .eq("id", id)

      if (updateError) {
        console.error("❌ Failed to update database:", updateError)
      }

      return NextResponse.json(
        {
          success: false,
          error: `Failed to unlist from eBay: ${ebayError instanceof Error ? ebayError.message : "Unknown error"}`,
          partialSuccess: true,
          message: "Item marked as rejected in database, but eBay unlisting failed",
        },
        { status: 207 },
      ) // 207 Multi-Status for partial success
    }
  } catch (err: any) {
    console.error("❌ Unexpected error:", err?.message || err)
    return NextResponse.json(
      {
        error: err?.message || "Unexpected server error",
      },
      { status: 500 },
    )
  }
}
