import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "item_images"

export async function GET() {
  try {
    if (!supabaseServiceKey) {
      return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is required" }, { status: 500 })
    }

    // Create admin client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get all items
    const { data: items, error: itemsError } = await supabase.from("sell_items").select("id, photo_count")

    if (itemsError) {
      return NextResponse.json({ error: `Error fetching items: ${itemsError.message}` }, { status: 500 })
    }

    const results = []

    // Process each item
    for (const item of items || []) {
      try {
        // Get actual photo count from storage
        const { data: files, error: filesError } = await supabase.storage.from(bucketName).list(item.id)

        if (filesError) {
          results.push({
            id: item.id,
            status: "error",
            message: `Error listing files: ${filesError.message}`,
          })
          continue
        }

        // Count actual files (not folders)
        const actualCount = files.filter((f) => !f.id.endsWith("/")).length

        // If count doesn't match, update it
        if (actualCount !== item.photo_count) {
          const { error: updateError } = await supabase
            .from("sell_items")
            .update({
              photo_count: actualCount,
              updated_at: new Date().toISOString(),
            })
            .eq("id", item.id)

          if (updateError) {
            results.push({
              id: item.id,
              status: "error",
              message: `Error updating count: ${updateError.message}`,
            })
          } else {
            results.push({
              id: item.id,
              status: "updated",
              oldCount: item.photo_count,
              newCount: actualCount,
            })
          }
        } else {
          results.push({
            id: item.id,
            status: "unchanged",
            count: actualCount,
          })
        }
      } catch (error) {
        results.push({
          id: item.id,
          status: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    // Summarize results
    const updated = results.filter((r) => r.status === "updated").length
    const unchanged = results.filter((r) => r.status === "unchanged").length
    const errors = results.filter((r) => r.status === "error").length

    return NextResponse.json({
      success: true,
      summary: {
        total: items?.length || 0,
        updated,
        unchanged,
        errors,
      },
      results,
    })
  } catch (error) {
    console.error("Error fixing photo counts:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
