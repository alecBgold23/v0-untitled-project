import { createClient } from "@supabase/supabase-js"

// Get the Supabase project ID from the URL
function getSupabaseProjectId(url: string): string {
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/)
  return match ? match[1] : ""
}

// Function to fix an image URL to the correct format
export function fixImageUrl(url: string): string {
  if (!url) return ""

  // If it already has the correct format with item_images, return it
  if (url.includes("/public/item_images/")) return url

  // Get the Supabase project ID
  const projectId = getSupabaseProjectId(url)
  if (!projectId) return url

  // Extract the file path - get everything after the last slash
  const filePath = url.split("/").pop() || ""

  // Construct the correct URL format
  return `https://${projectId}.supabase.co/storage/v1/object/public/item_images/uploads/${filePath}`
}

// Function to fix all image URLs in the database
export async function fixAllImageUrls() {
  try {
    // Get Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

    if (!supabaseUrl || !supabaseServiceKey) {
      return { success: false, error: "Missing Supabase credentials" }
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get all records with image_url
    const { data, error } = await supabase.from("sell_items").select("id, image_url").not("image_url", "is", null)

    if (error) {
      console.error("Error fetching records:", error)
      return { success: false, error: error.message }
    }

    if (!data || data.length === 0) {
      return { success: true, message: "No records with image URLs found" }
    }

    console.log(`Found ${data.length} records with image URLs to fix`)

    // Fix each record
    let fixedCount = 0
    let errorCount = 0

    for (const record of data) {
      if (!record.image_url) continue

      const fixedUrl = fixImageUrl(record.image_url)

      // Only update if the URL changed
      if (fixedUrl !== record.image_url) {
        const { error: updateError } = await supabase
          .from("sell_items")
          .update({ image_url: fixedUrl })
          .eq("id", record.id)

        if (updateError) {
          console.error(`Error updating record ${record.id}:`, updateError)
          errorCount++
        } else {
          fixedCount++
          console.log(`Fixed URL for record ${record.id}:`, {
            old: record.image_url,
            new: fixedUrl,
          })
        }
      }
    }

    return {
      success: true,
      message: `Fixed ${fixedCount} URLs, ${errorCount} errors, ${data.length - fixedCount - errorCount} already correct`,
      fixed: fixedCount,
      errors: errorCount,
      total: data.length,
    }
  } catch (error) {
    console.error("Error fixing image URLs:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error fixing image URLs",
    }
  }
}
