import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { extractImageUrls } from "@/lib/image-url-utils"

export async function GET() {
  try {
    // Create Supabase client with admin privileges
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Fetch all records from sell_items table
    const { data: items, error } = await supabase
      .from("sell_items")
      .select("id, image_url, image_urls, image_path, image_paths")

    if (error) {
      throw new Error(`Failed to fetch items: ${error.message}`)
    }

    console.log(`Found ${items.length} items to normalize`)

    // Process each item
    const results = {
      total: items.length,
      updated: 0,
      skipped: 0,
      errors: 0,
    }

    for (const item of items) {
      try {
        // Collect all possible image URLs from various fields
        let allUrls: string[] = []

        // Extract from image_url
        if (item.image_url) {
          const urls = extractImageUrls(item.image_url)
          allUrls = [...allUrls, ...urls]
        }

        // Extract from image_urls
        if (item.image_urls) {
          const urls = extractImageUrls(item.image_urls)
          allUrls = [...allUrls, ...urls]
        }

        // Extract from image_path if it looks like a URL
        if (item.image_path && (item.image_path.startsWith("http://") || item.image_path.startsWith("https://"))) {
          const urls = extractImageUrls(item.image_path)
          allUrls = [...allUrls, ...urls]
        }

        // Extract from image_paths
        if (item.image_paths) {
          const urls = extractImageUrls(item.image_paths)
          allUrls = [...allUrls, ...urls]
        }

        // Remove duplicates
        const uniqueUrls = [...new Set(allUrls)]

        // Skip if no changes needed
        if (uniqueUrls.length === 0) {
          results.skipped++
          continue
        }

        // Update the record with normalized data
        const { error: updateError } = await supabase
          .from("sell_items")
          .update({
            image_urls: uniqueUrls,
            // Set image_url to the first URL for backward compatibility
            image_url: uniqueUrls.length > 0 ? uniqueUrls[0] : null,
          })
          .eq("id", item.id)

        if (updateError) {
          throw new Error(`Failed to update item ${item.id}: ${updateError.message}`)
        }

        results.updated++
      } catch (itemError) {
        console.error(`Error processing item ${item.id}:`, itemError)
        results.errors++
      }
    }

    return NextResponse.json({
      success: true,
      message: "Image URL normalization completed",
      results,
    })
  } catch (error) {
    console.error("Error normalizing image URLs:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
